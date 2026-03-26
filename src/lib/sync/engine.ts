import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";

export async function pushToSupabase() {
  const supabase = createClient();
  const queue = await db.syncQueue.orderBy("timestamp").toArray();

  for (const item of queue) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) continue;

      if (item.action === "delete") {
        await supabase
          .from("patients")
          .update({ deleted_at: new Date().toISOString() })
          .eq("local_id", item.localId);
      } else {
        // Upsert by local_id
        const { error } = await supabase.from("patients").upsert(
          {
            ...item.data,
            local_id: item.localId,
            created_by: userData.user.id,
            updated_at: item.timestamp,
          },
          { onConflict: "local_id" }
        );

        if (error) {
          console.error("Sync push error:", error);
          // Increment retries
          await db.syncQueue.update(item.id!, {
            retries: item.retries + 1,
          });
          continue;
        }
      }

      // Update local patient sync status
      const patient = await db.patients.get(item.localId);
      if (patient) {
        await db.patients.update(item.localId, { syncStatus: "synced" });
      }

      // Remove from queue
      await db.syncQueue.delete(item.id!);
    } catch (err) {
      console.error("Sync error for item:", item.localId, err);
      await db.syncQueue.update(item.id!, {
        retries: item.retries + 1,
      });
    }
  }
}

export async function pullFromSupabase() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  // Get the latest updated_at from local DB
  const latestLocal = await db.patients
    .orderBy("updatedAt")
    .reverse()
    .first();
  const since = latestLocal?.updatedAt || "1970-01-01T00:00:00Z";

  const { data: remotePatients, error } = await supabase
    .from("patients")
    .select("*")
    .gt("updated_at", since)
    .is("deleted_at", null);

  if (error) {
    console.error("Pull error:", error);
    return;
  }

  for (const remote of remotePatients || []) {
    const localPatient = await db.patients
      .where("localId")
      .equals(remote.local_id)
      .first();

    if (!localPatient) {
      // New remote record — insert locally
      await db.patients.put({
        localId: remote.local_id,
        remoteId: remote.id,
        data: remote,
        currentStep: 17,
        status: remote.record_status || "complete",
        syncStatus: "synced",
        createdBy: remote.created_by,
        createdAt: remote.created_at,
        updatedAt: remote.updated_at,
      });
    } else if (localPatient.syncStatus === "synced") {
      // Last-write-wins: remote is newer, update local
      if (remote.updated_at > localPatient.updatedAt) {
        await db.patients.update(localPatient.localId, {
          remoteId: remote.id,
          data: remote,
          status: remote.record_status || localPatient.status,
          syncStatus: "synced",
          updatedAt: remote.updated_at,
        });
      }
    }
    // If local has pending changes (syncStatus !== "synced"), don't overwrite
  }
}

export async function syncAll() {
  if (!navigator.onLine) return;

  try {
    await pushToSupabase();
    await pullFromSupabase();
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

// Get pending sync count
export async function getPendingSyncCount(): Promise<number> {
  return db.syncQueue.count();
}

// Force-push ALL local patients to Supabase (one-time bulk upload)
export async function forcePushAll(): Promise<{ pushed: number; errors: number }> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { pushed: 0, errors: 0 };

  const patients = await db.patients.filter((p) => !p.deletedAt).toArray();
  let pushed = 0;
  let errors = 0;

  for (const patient of patients) {
    const { error } = await supabase.from("patients").upsert(
      {
        ...patient.data,
        local_id: patient.localId,
        created_by: userData.user.id,
        updated_at: patient.updatedAt,
        record_status: patient.status,
      },
      { onConflict: "local_id" }
    );

    if (error) {
      console.error("Force push error:", patient.localId, error);
      errors++;
    } else {
      await db.patients.update(patient.localId, { syncStatus: "synced" });
      await db.syncQueue.where("localId").equals(patient.localId).delete();
      pushed++;
    }
  }

  return { pushed, errors };
}

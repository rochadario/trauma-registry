import { NextRequest, NextResponse } from "next/server";

const REDCAP_API_URL = process.env.REDCAP_API_URL!;
const REDCAP_API_TOKEN = process.env.REDCAP_API_TOKEN!;

// Convert boolean → "1" / "0" for REDCap yesno fields
function boolToRedcap(val: unknown): string {
  if (val === true || val === 1 || val === "true") return "1";
  if (val === false || val === 0 || val === "false") return "0";
  return "";
}

// Map our patient record to REDCap field format
// Field names match the Data Dictionary imported into REDCap (same snake_case names)
function mapToRedcap(data: Record<string, unknown>): Record<string, string> {
  const booleanFields = new Set([
    "motorcycle_helmet",
    "rtc_helmet", "rtc_seatbelt", "rtc_alcohol_suspected",
    "violence_alcohol_victim", "violence_reported_police",
    "prehospital_care", "prehospital_airway", "prehospital_iv",
    "prehospital_immobilization", "prehospital_cpr",
    "prehospital_tourniquet", "prehospital_wound_packing",
    "prehospital_notification", "notification_triage_sent",
    "pupil_right_reactive", "pupil_left_reactive", "pupil_equal",
    "diagnostics_xray", "diagnostics_ct", "diagnostics_ultrasound",
    "diagnostics_fast", "diagnostics_labs",
    "procedure_airway", "procedure_chest_tube", "procedure_central_line",
    "procedure_splinting", "procedure_wound_care",
    "procedure_surgery", "surgery_complications",
    // shortened names used in REDCap
    "viol_alcohol_perpetrator", "ph_hemorrhage_needed",
    "ph_direct_pressure", "proc_blood_transfusion",
  ]);

  // Fields to skip (internal/system fields not in REDCap Data Dictionary)
  const skipFields = new Set([
    "sync_status", "remote_id", "created_by", "updated_at",
    "verified_by", "verified_at", "audit_flag", "audit_notes",
    "id", "response_time_minutes", "deleted_at",
  ]);

  // Array fields serialized as JSON
  const arrayFields = new Set(["body_regions_affected", "injuries"]);

  // Fields renamed to fit REDCap's 26-char limit
  const fieldRenames: Record<string, string> = {
    violence_alcohol_perpetrator: "viol_alcohol_perpetrator",
    prehospital_hemorrhage_needed: "ph_hemorrhage_needed",
    prehospital_direct_pressure: "ph_direct_pressure",
    prehospital_tourniquet_correct: "ph_tourniquet_correct",
    procedure_blood_transfusion: "proc_blood_transfusion",
    surgery_complication_details: "surg_complication_dtls",
  };

  // REDCap Data Dictionary uses the same string codes as our schema (no numeric mapping needed)

  const record: Record<string, string> = {
    record_id: String(data.local_id ?? data.registry_number ?? ""),
  };

  // HH:MM time values — REDCap requires HH:MM:SS
  const timeRegex = /^\d{1,2}:\d{2}$/;

  for (const [rawKey, value] of Object.entries(data)) {
    const key = fieldRenames[rawKey] ?? rawKey;
    if (skipFields.has(rawKey) || value === undefined || value === null) continue;

    if (booleanFields.has(key)) {
      record[key] = boolToRedcap(value);
    } else if (arrayFields.has(key)) {
      record[key] = JSON.stringify(value);
    } else {
      const str = String(value);
      record[key] = timeRegex.test(str) ? `${str}:00` : str;
    }
  }

  // REDCap requires a complete_status field per instrument
  record["trauma_registry_complete"] = "2"; // 2 = Complete

  return record;
}

export async function POST(req: NextRequest) {
  if (!REDCAP_API_URL || !REDCAP_API_TOKEN) {
    return NextResponse.json(
      { error: "REDCap not configured" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
    console.log("[REDCap] incoming record_id:", body.local_id ?? body.registry_number);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = mapToRedcap(body);
  console.log("[REDCap] mapped record keys:", Object.keys(record).join(", "));
  console.log("[REDCap] record_id value:", record.record_id);
  console.log("[REDCap] full record:", JSON.stringify(record));

  const params = new URLSearchParams({
    token: REDCAP_API_TOKEN,
    content: "record",
    format: "json",
    type: "flat",
    overwriteBehavior: "overwrite",
    forceAutoNumber: "false",
    data: JSON.stringify([record]),
    returnContent: "count",
    returnFormat: "json",
  });

  try {
    const response = await fetch(REDCAP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const rawText = await response.text();
    let result: Record<string, unknown>;
    try {
      result = JSON.parse(rawText);
    } catch {
      result = { raw: rawText };
    }

    if (!response.ok || (result as Record<string, unknown>).error) {
      console.error("[REDCap] API error (status", response.status, "):", JSON.stringify(result));
      return NextResponse.json(
        { error: (result as Record<string, unknown>).error ?? `REDCap HTTP ${response.status}` },
        { status: 502 }
      );
    }

    console.log("[REDCap] success, count:", (result as Record<string, unknown>).count);
    return NextResponse.json({ success: true, count: result.count });
  } catch (err) {
    console.error("REDCap fetch error:", err);
    return NextResponse.json({ error: "REDCap unreachable" }, { status: 502 });
  }
}

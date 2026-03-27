"use client";

import { useWizardStore } from "@/lib/store/wizard-store";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, User, Hash, RefreshCw, Shield } from "lucide-react";

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function shortId(id: string | undefined): string {
  if (!id) return "—";
  return id.slice(0, 8).toUpperCase();
}

export function RecordInfoStep() {
  const t = useTranslations();
  const formData = useWizardStore((s) => s.formData);

  const status = (formData.record_status as string | undefined) ?? "draft";
  const createdBy = formData.created_by as string | undefined;
  const createdAt = formData.created_at as string | undefined;
  const updatedAt = formData.updated_at as string | undefined;
  const localId = formData.local_id as string | undefined;
  const remoteId = formData.remote_id as string | undefined;
  const syncStatus = formData.sync_status as string | undefined;
  const dataCollectorId = formData.data_collector_id as string | undefined;
  const auditFlag = formData.audit_flag as string | undefined;
  const auditNotes = formData.audit_notes as string | undefined;

  const statusColor =
    status === "verified"
      ? "bg-green-100 text-green-800 border-green-200"
      : status === "submitted"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-yellow-100 text-yellow-800 border-yellow-200";

  return (
    <div className="space-y-4">
      {/* Status badge */}
      <div className="flex items-center gap-3 rounded-xl border p-4">
        <CheckCircle className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
            {t("fields.record_status")}
          </p>
          <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-semibold capitalize ${statusColor}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Sync status */}
      {!!syncStatus && (
        <div className="flex items-center gap-3 rounded-xl border p-4">
          <RefreshCw className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
              {t("fields.sync_status")}
            </p>
            <Badge variant={syncStatus === "synced" ? "default" : "secondary"} className="capitalize">
              {syncStatus}
            </Badge>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              {t("fields.created_at")}
            </p>
          </div>
          <p className="text-sm font-medium">{formatDate(createdAt)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              {t("fields.updated_at")}
            </p>
          </div>
          <p className="text-sm font-medium">{formatDate(updatedAt)}</p>
        </div>
      </div>

      {/* IDs */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Record IDs
          </p>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("fields.local_id")}</span>
          <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{shortId(localId)}</code>
        </div>
        {remoteId && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("fields.remote_id")}</span>
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{shortId(remoteId)}</code>
          </div>
        )}
        {createdBy && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("fields.created_by")}</span>
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{shortId(createdBy)}</code>
          </div>
        )}
      </div>

      {/* Verified by */}
      {!!formData.verified_by && (
        <div className="flex items-center gap-3 rounded-xl border p-4">
          <User className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
              {t("fields.verified_by")}
            </p>
            <p className="text-sm font-medium">{String(formData.verified_by as string)}</p>
          </div>
        </div>
      )}

      {/* Audit Section */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {t("fields.audit_flag")}
          </p>
        </div>

        {/* Audit Flag (color coded) */}
        {auditFlag && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{t("fields.audit_flag")}</span>
            <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-semibold ${
              auditFlag === "audited"
                ? "bg-green-100 text-green-800 border-green-200"
                : auditFlag === "needs_correction"
                ? "bg-red-100 text-red-800 border-red-200"
                : "bg-yellow-100 text-yellow-800 border-yellow-200"
            }`}>
              {t(`fields.${auditFlag}`)}
            </span>
          </div>
        )}

        {/* Data Collector ID */}
        {dataCollectorId && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("fields.data_collector_id")}</span>
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{dataCollectorId}</code>
          </div>
        )}

        {/* Audit Notes */}
        {auditNotes && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">{t("fields.audit_notes")}</p>
            <p className="text-sm bg-muted rounded p-2 whitespace-pre-wrap">{auditNotes}</p>
          </div>
        )}

        {!auditFlag && !dataCollectorId && !auditNotes && (
          <p className="text-sm text-muted-foreground italic">—</p>
        )}
      </div>
    </div>
  );
}

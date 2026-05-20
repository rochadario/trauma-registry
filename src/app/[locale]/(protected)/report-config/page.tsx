"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { db, type LocalPatient } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CompletenessWidget } from "@/components/dashboard/completeness-widget";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Mail, Plus, X, Send, CheckCircle2, Clock, AlertCircle, Loader2,
} from "lucide-react";

const SECTION_IDS = ["summary", "mortality", "avgs", "mechanisms", "iss", "completeness"] as const;

const DEFAULT_SECTIONS = [...SECTION_IDS];

interface ReportConfig {
  id?: string;
  hospital_id: string | null;
  recipient_emails: string[];
  enabled: boolean;
  last_sent_at: string | null;
  report_sections: string[];
}

export default function ReportConfigPage() {
  const t = useTranslations("reportConfig");
  const tCommon = useTranslations("common");
  const [config, setConfig] = useState<ReportConfig>({
    hospital_id: null,
    recipient_emails: [],
    enabled: false,
    last_sent_at: null,
    report_sections: DEFAULT_SECTIONS,
  });
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "sent" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<LocalPatient[]>([]);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [supabaseData, localPatients] = await Promise.all([
      createClient()
        .from("report_configs")
        .select("*")
        .limit(1)
        .maybeSingle(),
      db.patients.filter((p) => !p.deletedAt && p.status !== "draft").toArray(),
    ]);

    if (supabaseData.data) {
      const raw = supabaseData.data as ReportConfig;
      setConfig({
        ...raw,
        report_sections: raw.report_sections?.length ? raw.report_sections : DEFAULT_SECTIONS,
      });
    }
    setPatients(localPatients);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function save(overrideEmails?: string[]) {
    setSaving(true);
    setSaveStatus("idle");
    const supabase = createClient();

    const payload = {
      hospital_id: config.hospital_id,
      recipient_emails: overrideEmails ?? config.recipient_emails,
      enabled: config.enabled,
      report_sections: config.report_sections,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (config.id) {
      ({ error } = await supabase.from("report_configs").update(payload).eq("id", config.id));
    } else {
      const { data, error: insertErr } = await supabase
        .from("report_configs")
        .insert(payload)
        .select()
        .single();
      error = insertErr;
      if (data) setConfig((prev) => ({ ...prev, id: (data as ReportConfig & { id: string }).id }));
    }

    setSaving(false);
    if (error) {
      console.error("Save error:", error);
      setSaveError(error.message);
    }
    setSaveStatus(error ? "error" : "saved");
    setTimeout(() => { setSaveStatus("idle"); setSaveError(null); }, 5000);
  }

  async function sendTestReport() {
    setTesting(true);
    setTestStatus("idle");
    try {
      const res = await fetch("/api/weekly-report?preview=1");
      const json = await res.json();
      const actuallySent = json.ok && json.results?.some((r: { sent: number }) => r.sent > 0);
      setTestStatus(actuallySent ? "sent" : "error");
      if (!actuallySent) console.warn("Weekly report response:", JSON.stringify(json));
    } catch {
      setTestStatus("error");
    }
    setTesting(false);
    setTimeout(() => setTestStatus("idle"), 4000);
  }

  function addEmail() {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (config.recipient_emails.includes(email)) return;
    const updated = [...config.recipient_emails, email];
    setConfig((prev) => ({ ...prev, recipient_emails: updated }));
    setNewEmail("");
    save(updated);
  }

  function confirmRemove(email: string) {
    setPendingRemove(email);
  }

  function doRemove() {
    if (!pendingRemove) return;
    const updated = config.recipient_emails.filter((e) => e !== pendingRemove);
    setConfig((prev) => ({ ...prev, recipient_emails: updated }));
    setPendingRemove(null);
    save(updated);
  }

  function toggleSection(id: string) {
    setConfig((prev) => ({
      ...prev,
      report_sections: prev.report_sections.includes(id)
        ? prev.report_sections.filter((s) => s !== id)
        : [...prev.report_sections, id],
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {/* Status card */}
      <Card className={config.enabled ? "border-green-200 bg-green-50" : "border-gray-200"}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${config.enabled ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
              <div>
                <p className="font-medium text-sm">
                  {config.enabled ? t("reportsActive") : t("reportsDisabled")}
                </p>
                {config.last_sent_at ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {t("lastSent")} {new Date(config.last_sent_at).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">{t("notSentYet")}</p>
                )}
              </div>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => setConfig((prev) => ({ ...prev, enabled: v }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> {t("recipients")}
          </CardTitle>
          <CardDescription>{t("recipientsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            {config.recipient_emails.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noRecipients")}</p>
            ) : (
              config.recipient_emails.map((email) => (
                <Badge key={email} variant="secondary" className="pl-3 pr-1 py-1 gap-1 text-sm">
                  {email}
                  <button
                    onClick={() => confirmRemove(email)}
                    className="ml-1 hover:text-destructive rounded-full"
                    title="Quitar recipient"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="doctor@hospital.org"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEmail()}
              className="flex-1"
            />
            <Button variant="outline" onClick={addEmail} disabled={!newEmail}>
              <Plus className="h-4 w-4 mr-1" /> {t("add")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report sections — interactive checkboxes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("sectionsTitle")}</CardTitle>
          <CardDescription>{t("sectionsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SECTION_IDS.map((id) => (
              <div key={id} className="flex items-start gap-3">
                <Checkbox
                  id={`section-${id}`}
                  checked={config.report_sections.includes(id)}
                  onCheckedChange={() => toggleSection(id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={`section-${id}`} className="text-sm font-medium cursor-pointer">
                    {t(`section${id.charAt(0).toUpperCase() + id.slice(1)}Label` as never)}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t(`section${id.charAt(0).toUpperCase() + id.slice(1)}Desc` as never)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Completeness preview */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          {t("completenessTitle")}
        </h2>
        <CompletenessWidget patients={patients} />
      </div>

      {/* Schedule info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3 text-sm">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-900">{t("scheduleTitle")}</p>
              <p className="text-blue-700 mt-1">{t("scheduleDesc")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={() => save()} disabled={saving} className="min-w-28">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {saving ? t("saving") : t("saveSettings")}
        </Button>

        <Button
          variant="outline"
          onClick={sendTestReport}
          disabled={testing || config.recipient_emails.length === 0 || !config.enabled}
          title={config.recipient_emails.length === 0 ? "Add at least one recipient first" : ""}
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          {testing ? t("sending") : t("sendTest")}
        </Button>

        {saveStatus === "saved" && (
          <span className="flex items-center gap-1 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" /> {t("saved")}
          </span>
        )}
        {saveStatus === "error" && (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" /> {t("errorSaving")}{saveError ? `: ${saveError}` : ""}
          </span>
        )}
        {testStatus === "sent" && (
          <span className="flex items-center gap-1 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" /> {t("testSent")}
          </span>
        )}
        {testStatus === "error" && (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" /> {t("sendFailed")}
          </span>
        )}
      </div>
      <AlertDialog open={!!pendingRemove} onOpenChange={(open) => { if (!open) setPendingRemove(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeDescription", { email: pendingRemove ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={doRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("confirmRemove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

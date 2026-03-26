"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { db, type LocalPatient } from "@/lib/db";
import { getAllFieldNames } from "@/lib/form/sections";
import { forcePushAll } from "@/lib/sync/engine";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, CloudUpload } from "lucide-react";

export default function ExportPage() {
  const t = useTranslations("export");
  const tf = useTranslations("fields");
  const [patients, setPatients] = useState<LocalPatient[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [format, setFormat] = useState<"csv" | "xlsx">("xlsx");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ pushed: number; errors: number } | null>(null);
  const allFields = getAllFieldNames();

  async function handleForcePush() {
    setSyncing(true);
    setSyncResult(null);
    const result = await forcePushAll();
    setSyncResult(result);
    setSyncing(false);
  }

  useEffect(() => {
    setSelectedFields(allFields);
    db.patients
      .filter((p) => !p.deletedAt)
      .toArray()
      .then(setPatients);
  }, []);

  function toggleField(field: string) {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  }

  function selectAll() {
    setSelectedFields([...allFields]);
  }

  function deselectAll() {
    setSelectedFields([]);
  }

  function getFilteredPatients() {
    return patients.filter((p) => {
      const admDate = p.data.admission_date as string;
      if (dateFrom && admDate < dateFrom) return false;
      if (dateTo && admDate > dateTo) return false;
      return true;
    });
  }

  function handleExport() {
    const filtered = getFilteredPatients();
    if (filtered.length === 0) return;

    const headers = selectedFields.map((f) =>
      tf.has(f) ? tf(f) : f
    );

    const rows = filtered.map((p) =>
      selectedFields.map((f) => {
        const val = p.data[f];
        if (val === null || val === undefined) return "";
        if (Array.isArray(val)) return JSON.stringify(val);
        return String(val);
      })
    );

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");

    const filename = `trauma_registry_export_${new Date().toISOString().slice(0, 10)}`;

    if (format === "xlsx") {
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } else {
      XLSX.writeFile(wb, `${filename}.csv`, { bookType: "csv" });
    }
  }

  const filteredCount = getFilteredPatients().length;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Sync to Cloud */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sync All to Cloud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Upload all local patients to Supabase so teammates with the same institution can see them.
          </p>
          <div className="flex items-center gap-4">
            <Button onClick={handleForcePush} disabled={syncing} variant="outline">
              <CloudUpload className="h-4 w-4 mr-2" />
              {syncing ? "Uploading…" : `Push all ${patients.length} patients to cloud`}
            </Button>
            {syncResult && (
              <span className="text-sm">
                {syncResult.errors === 0
                  ? <span className="text-green-600">{syncResult.pushed} patients uploaded successfully</span>
                  : <span className="text-red-600">{syncResult.pushed} uploaded, {syncResult.errors} errors</span>
                }
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            New users must register with the same institution name to see shared patients.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("dateRange")}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="space-y-1 flex-1">
            <Label>From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1 flex-1">
            <Label>To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("fields")}</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                {t("selectAll")}
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                {t("deselectAll")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {allFields.map((field) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={`export-${field}`}
                  checked={selectedFields.includes(field)}
                  onCheckedChange={() => toggleField(field)}
                />
                <Label
                  htmlFor={`export-${field}`}
                  className="text-xs font-normal cursor-pointer"
                >
                  {tf.has(field) ? tf(field) : field}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("format")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={format}
            onValueChange={(v) => setFormat(v as "csv" | "xlsx")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="xlsx" id="format-xlsx" />
              <Label htmlFor="format-xlsx">{t("xlsx")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="format-csv" />
              <Label htmlFor="format-csv">{t("csv")}</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("recordCount", { count: filteredCount })}
        </span>
        <Button
          onClick={handleExport}
          disabled={filteredCount === 0 || selectedFields.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("download")}
        </Button>
      </div>
    </div>
  );
}

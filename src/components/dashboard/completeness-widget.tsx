"use client";

import { useMemo } from "react";
import type { LocalPatient } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle } from "lucide-react";

const FIELDS = [
  { key: "admission_date", label: "Admission Date" },
  { key: "patient_age", label: "Age" },
  { key: "patient_sex", label: "Sex" },
  { key: "injury_mechanism", label: "Injury Mechanism" },
  { key: "injury_date", label: "Injury Date" },
  { key: "arrival_gcs_total", label: "GCS Total" },
  { key: "iss_score", label: "ISS Score" },
  { key: "outcome", label: "Outcome" },
  { key: "los_days", label: "Length of Stay" },
  { key: "injury_lat", label: "GPS Location" },
];

interface Props {
  patients: LocalPatient[];
  compact?: boolean;
}

export function CompletenessWidget({ patients, compact = false }: Props) {
  const stats = useMemo(() => {
    if (patients.length === 0) return null;
    return FIELDS.map(({ key, label }) => {
      const filled = patients.filter((p) => {
        const v = p.data[key];
        return v !== null && v !== undefined && v !== "";
      }).length;
      const pct = Math.round((filled / patients.length) * 100);
      return { key, label, filled, total: patients.length, pct };
    });
  }, [patients]);

  const overall = stats
    ? Math.round(stats.reduce((s, f) => s + f.pct, 0) / stats.length)
    : 0;

  const overallColor =
    overall >= 80 ? "text-green-600" : overall >= 60 ? "text-yellow-600" : "text-red-600";

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground text-center py-4">No patients recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Overall completeness</span>
          <span className={`text-sm font-bold ${overallColor}`}>{overall}%</span>
        </div>
        <Progress value={overall} className="h-2" />
        <p className="text-xs text-muted-foreground">{patients.length} patients · 10 key variables</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>Data Completeness</span>
          <span className={`text-lg font-bold ${overallColor}`}>{overall}%</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Key clinical variables across {patients.length} patient{patients.length !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {stats.map(({ key, label, pct, filled, total }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {pct >= 80 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500 shrink-0" />
                  )}
                  {label}
                </span>
                <span className="text-xs font-medium tabular-nums">
                  {filled}/{total} ({pct}%)
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

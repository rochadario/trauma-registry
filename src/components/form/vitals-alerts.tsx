"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface Alert {
  field: string;
  level: "warning" | "critical";
  messageKey: string;
}

function getAlerts(vals: Record<string, unknown>): Alert[] {
  const alerts: Alert[] = [];

  const sbp = vals.arrival_systolic_bp as number;
  const dbp = vals.arrival_diastolic_bp as number;
  const hr = vals.arrival_heart_rate as number;
  const rr = vals.arrival_respiratory_rate as number;
  const spo2 = vals.arrival_spo2 as number;
  const temp = vals.arrival_temperature as number;
  const gcs = vals.arrival_gcs_total as number;
  const avpu = vals.arrival_avpu as string;

  // Systolic BP
  if (sbp > 0) {
    if (sbp < 70) alerts.push({ field: "arrival_systolic_bp", level: "critical", messageKey: "vitals.sbp_critical_low" });
    else if (sbp < 90) alerts.push({ field: "arrival_systolic_bp", level: "warning", messageKey: "vitals.sbp_low" });
    else if (sbp > 200) alerts.push({ field: "arrival_systolic_bp", level: "critical", messageKey: "vitals.sbp_critical_high" });
    else if (sbp > 180) alerts.push({ field: "arrival_systolic_bp", level: "warning", messageKey: "vitals.sbp_high" });
  }

  // Diastolic BP
  if (dbp > 0) {
    if (dbp > 120) alerts.push({ field: "arrival_diastolic_bp", level: "critical", messageKey: "vitals.dbp_critical_high" });
    else if (dbp > 100) alerts.push({ field: "arrival_diastolic_bp", level: "warning", messageKey: "vitals.dbp_high" });
  }

  // Shock index
  if (sbp > 0 && hr > 0) {
    const si = hr / sbp;
    if (si > 1.5) alerts.push({ field: "arrival_systolic_bp", level: "critical", messageKey: "vitals.shock_index_critical" });
    else if (si > 1.0) alerts.push({ field: "arrival_systolic_bp", level: "warning", messageKey: "vitals.shock_index_high" });
  }

  // Heart rate
  if (hr > 0) {
    if (hr < 40) alerts.push({ field: "arrival_heart_rate", level: "critical", messageKey: "vitals.hr_critical_low" });
    else if (hr < 50) alerts.push({ field: "arrival_heart_rate", level: "warning", messageKey: "vitals.hr_low" });
    else if (hr > 150) alerts.push({ field: "arrival_heart_rate", level: "critical", messageKey: "vitals.hr_critical_high" });
    else if (hr > 120) alerts.push({ field: "arrival_heart_rate", level: "warning", messageKey: "vitals.hr_high" });
  }

  // Respiratory rate
  if (rr > 0) {
    if (rr < 8) alerts.push({ field: "arrival_respiratory_rate", level: "critical", messageKey: "vitals.rr_critical_low" });
    else if (rr < 10) alerts.push({ field: "arrival_respiratory_rate", level: "warning", messageKey: "vitals.rr_low" });
    else if (rr > 35) alerts.push({ field: "arrival_respiratory_rate", level: "critical", messageKey: "vitals.rr_critical_high" });
    else if (rr > 25) alerts.push({ field: "arrival_respiratory_rate", level: "warning", messageKey: "vitals.rr_high" });
  }

  // SpO2
  if (spo2 > 0) {
    if (spo2 < 85) alerts.push({ field: "arrival_spo2", level: "critical", messageKey: "vitals.spo2_critical" });
    else if (spo2 < 94) alerts.push({ field: "arrival_spo2", level: "warning", messageKey: "vitals.spo2_low" });
  }

  // Temperature
  if (temp > 0) {
    if (temp < 32) alerts.push({ field: "arrival_temperature", level: "critical", messageKey: "vitals.temp_critical_low" });
    else if (temp < 35) alerts.push({ field: "arrival_temperature", level: "warning", messageKey: "vitals.temp_low" });
    else if (temp > 40) alerts.push({ field: "arrival_temperature", level: "critical", messageKey: "vitals.temp_critical_high" });
    else if (temp > 38.5) alerts.push({ field: "arrival_temperature", level: "warning", messageKey: "vitals.temp_high" });
  }

  // GCS
  if (gcs > 0) {
    if (gcs <= 8) alerts.push({ field: "arrival_gcs_total", level: "critical", messageKey: "vitals.gcs_critical" });
    else if (gcs <= 12) alerts.push({ field: "arrival_gcs_total", level: "warning", messageKey: "vitals.gcs_low" });
  }

  // AVPU
  if (avpu === "unresponsive") alerts.push({ field: "arrival_avpu", level: "critical", messageKey: "vitals.avpu_unresponsive" });
  else if (avpu === "pain") alerts.push({ field: "arrival_avpu", level: "warning", messageKey: "vitals.avpu_pain" });

  return alerts;
}

export function VitalsAlerts() {
  const t = useTranslations();
  const { watch } = useFormContext();

  const vals = watch([
    "arrival_systolic_bp", "arrival_diastolic_bp", "arrival_heart_rate",
    "arrival_respiratory_rate", "arrival_spo2", "arrival_temperature",
    "arrival_gcs_total", "arrival_avpu",
  ]);

  const formVals = {
    arrival_systolic_bp: vals[0],
    arrival_diastolic_bp: vals[1],
    arrival_heart_rate: vals[2],
    arrival_respiratory_rate: vals[3],
    arrival_spo2: vals[4],
    arrival_temperature: vals[5],
    arrival_gcs_total: vals[6],
    arrival_avpu: vals[7],
  };

  const alerts = getAlerts(formVals);
  if (alerts.length === 0) return null;

  const criticals = alerts.filter((a) => a.level === "critical");
  const warnings = alerts.filter((a) => a.level === "warning");

  return (
    <div className="space-y-2 pt-2 border-t">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {t("vitals.alerts_title")}
      </p>
      {criticals.map((a, i) => (
        <div key={i} className="flex items-start gap-2 rounded-md bg-red-50 border border-red-300 px-3 py-2 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
          <span>{t(a.messageKey)}</span>
        </div>
      ))}
      {warnings.map((a, i) => (
        <div key={i} className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-300 px-3 py-2 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-yellow-600" />
          <span>{t(a.messageKey)}</span>
        </div>
      ))}
    </div>
  );
}

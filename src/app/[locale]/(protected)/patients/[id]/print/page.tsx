"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, type LocalPatient } from "@/lib/db";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "" || value === undefined) return null;
  return (
    <div className="flex py-1 border-b border-gray-100 last:border-0 text-sm">
      <span className="w-48 shrink-0 text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900">{String(value)}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-white bg-gray-700 px-3 py-1.5 mb-2 print:bg-gray-700">
        {title}
      </h2>
      <div className="px-2">{children}</div>
    </div>
  );
}

export default function PrintPatientPage() {
  const params = useParams();
  const [patient, setPatient] = useState<LocalPatient | null>(null);

  useEffect(() => {
    db.patients.get(params.id as string).then((p) => setPatient(p ?? null));
  }, [params.id]);

  if (!patient) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
  );

  const d = patient.data;
  const v = (key: string) => d[key] as string | number | undefined;

  const gcsTotal = v("arrival_gcs_total");
  const iss = v("iss_score");
  const issCategory = v("iss_category");

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">

      {/* Print button — hidden on print */}
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={() => window.print()} size="sm">
          <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
        </Button>
      </div>

      {/* Header */}
      <div className="border-2 border-gray-800 p-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">RESPOND Guatemala</h1>
            <p className="text-sm text-gray-500">Trauma Registry — Patient Summary</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono font-bold text-lg">{String(v("registry_number") ?? "—")}</p>
            <p className="text-gray-500">Registry #</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm border-t pt-3">
          <div><span className="text-gray-500">Hospital: </span><strong>{String(v("hospital_id") ?? "—")}</strong></div>
          <div><span className="text-gray-500">Admission: </span><strong>{String(v("admission_date") ?? "—")} {String(v("admission_time") ?? "")}</strong></div>
          <div><span className="text-gray-500">Status: </span>
            <span className={`font-semibold ${patient.status === "complete" ? "text-green-700" : "text-yellow-700"}`}>
              {patient.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Key metrics bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "GCS Total", value: gcsTotal, danger: (gcsTotal as number) < 9 },
          { label: "ISS Score", value: iss, danger: (iss as number) >= 16 },
          { label: "ISS Category", value: String(issCategory ?? "—").toUpperCase() },
          { label: "Outcome", value: String(v("outcome") ?? "—").replace(/_/g, " ").toUpperCase() },
        ].map((m, i) => (
          <div key={i} className={`border rounded p-2 text-center ${m.danger ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
            <p className="text-xs text-gray-500">{m.label}</p>
            <p className={`text-xl font-bold ${m.danger ? "text-red-700" : "text-gray-900"}`}>{String(m.value ?? "—")}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <Section title="Patient Demographics">
        <Row label="Age" value={v("patient_age") ? `${v("patient_age")} ${v("patient_age_unit") ?? "years"}` : undefined} />
        <Row label="Sex" value={v("patient_sex")} />
        <Row label="Ethnicity" value={v("patient_ethnicity")} />
        <Row label="Department" value={v("patient_department")} />
        <Row label="Municipality" value={v("patient_municipality")} />
        <Row label="Referral Source" value={v("patient_referral_source")} />
      </Section>

      <Section title="Injury Event">
        <Row label="Injury Date" value={v("injury_date")} />
        <Row label="Injury Time" value={v("injury_time")} />
        <Row label="Response Time" value={v("response_time_minutes") ? `${v("response_time_minutes")} minutes` : undefined} />
        <Row label="Mechanism" value={v("injury_mechanism")} />
        <Row label="Intent" value={v("injury_intent")} />
        <Row label="Setting" value={v("injury_setting")} />
        <Row label="Location Type" value={v("injury_location_type")} />
        <Row label="Activity" value={v("injury_activity")} />
        <Row label="GPS Coordinates" value={d.injury_lat && d.injury_lng ? `${(d.injury_lat as number).toFixed(5)}, ${(d.injury_lng as number).toFixed(5)}` : undefined} />
      </Section>

      <Section title="Arrival Assessment">
        <Row label="GCS Eye" value={v("arrival_gcs_eye")} />
        <Row label="GCS Verbal" value={v("arrival_gcs_verbal")} />
        <Row label="GCS Motor" value={v("arrival_gcs_motor")} />
        <Row label="GCS Total" value={v("arrival_gcs_total")} />
        <Row label="Systolic BP" value={v("arrival_systolic_bp") ? `${v("arrival_systolic_bp")} mmHg` : undefined} />
        <Row label="Diastolic BP" value={v("arrival_diastolic_bp") ? `${v("arrival_diastolic_bp")} mmHg` : undefined} />
        <Row label="Heart Rate" value={v("arrival_heart_rate") ? `${v("arrival_heart_rate")} bpm` : undefined} />
        <Row label="Respiratory Rate" value={v("arrival_respiratory_rate") ? `${v("arrival_respiratory_rate")} /min` : undefined} />
        <Row label="SpO₂" value={v("arrival_spo2") ? `${v("arrival_spo2")}%` : undefined} />
      </Section>

      <Section title="Injury Severity (AIS / ISS)">
        <Row label="AIS Head/Neck" value={v("ais_head_neck")} />
        <Row label="AIS Face" value={v("ais_face")} />
        <Row label="AIS Chest" value={v("ais_chest")} />
        <Row label="AIS Abdomen" value={v("ais_abdomen")} />
        <Row label="AIS Extremities" value={v("ais_extremities")} />
        <Row label="AIS External" value={v("ais_external")} />
        <Row label="ISS Score" value={v("iss_score")} />
        <Row label="ISS Category" value={v("iss_category")} />
      </Section>

      <Section title="Procedures">
        <Row label="Airway Management" value={(d.procedure_airway as boolean) ? "Yes" : undefined} />
        <Row label="Chest Tube" value={(d.procedure_chest_tube as boolean) ? "Yes" : undefined} />
        <Row label="Central Line" value={(d.procedure_central_line as boolean) ? "Yes" : undefined} />
        <Row label="Blood Transfusion" value={(d.procedure_blood_transfusion as boolean) ? "Yes" : undefined} />
        <Row label="Surgery" value={(d.procedure_surgery as boolean) ? "Yes" : undefined} />
        <Row label="Surgery Type" value={v("procedure_surgery_type")} />
      </Section>

      <Section title="Outcome">
        <Row label="Disposition" value={v("disposition")} />
        <Row label="Outcome" value={v("outcome")} />
        <Row label="Length of Stay" value={v("los_days") != null ? `${v("los_days")} days` : undefined} />
        <Row label="ICU Days" value={v("icu_days") != null ? `${v("icu_days")} days` : undefined} />
        <Row label="Ventilator Days" value={v("ventilator_days") != null ? `${v("ventilator_days")} days` : undefined} />
        <Row label="Death Date" value={v("death_date")} />
        <Row label="Cause of Death" value={v("death_cause")} />
      </Section>

      {/* Footer */}
      <div className="border-t pt-4 mt-6 text-xs text-gray-400 flex justify-between">
        <span>RESPOND Guatemala Trauma Registry</span>
        <span>Generated: {new Date().toLocaleString()}</span>
        <span>ID: {patient.localId.slice(0, 8)}</span>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { font-size: 12px; }
          .print\\:hidden { display: none !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}

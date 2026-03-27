"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { fieldMetadata } from "@/lib/form/schema";
import { FormFieldRenderer } from "./form-field-renderer";
import { ConditionalField } from "./conditional-field";
import { BodyMapStep } from "./body-map-step";
import { InjuryListField } from "./injury-list-field";
import { RecordInfoStep } from "./record-info-step";

import { useWizardStore } from "@/lib/store/wizard-store";
import { VitalsAlerts } from "./vitals-alerts";

function ResponseTimeDisplay() {
  const formData = useWizardStore((s) => s.formData);
  const updateField = useWizardStore((s) => s.updateField);

  const injuryDate = formData.injury_date as string | undefined;
  const injuryTime = formData.injury_time as string | undefined;
  const admDate = formData.admission_date as string | undefined;
  const admTime = formData.admission_time as string | undefined;

  if (!injuryDate || !injuryTime || !admDate || !admTime) return null;

  try {
    const injuryDt = new Date(`${injuryDate}T${injuryTime}:00`);
    const admDt = new Date(`${admDate}T${admTime}:00`);
    const diffMin = Math.round((admDt.getTime() - injuryDt.getTime()) / 60000);
    if (isNaN(diffMin) || diffMin < 0) return null;

    // Save to store so it persists
    if (formData.response_time_minutes !== diffMin) {
      updateField("response_time_minutes", diffMin);
    }

    const hrs = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    const label = hrs > 0 ? `${hrs}h ${mins}min` : `${mins} min`;

    return (
      <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm">
        <span className="text-blue-600">⏱️</span>
        <span className="text-blue-800 font-medium">Response time: {label}</span>
        <span className="text-blue-500 text-xs">(injury → admission)</span>
      </div>
    );
  } catch {
    return null;
  }
}

// Dynamic import — Leaflet requires browser APIs, cannot SSR
const LocationPickerMap = dynamic(
  () => import("./location-picker-map").then((m) => m.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-[320px] rounded-lg bg-gray-100 animate-pulse" /> }
);

interface StepContentProps {
  step: number;
  fields: string[];
}

export function StepContent({ step, fields }: StepContentProps) {
  const t = useTranslations();
  // Step 10 has the body map — render it specially
  if (step === 10) {
    return <BodyMapStep />;
  }

  // Step 16 (Record Info) — read-only metadata panel
  if (step === 16) {
    return <RecordInfoStep />;
  }

  return (
    <div className="space-y-4">
      {fields.map((fieldName) => {
        const meta = fieldMetadata[fieldName];

        // Skip fields that are handled specially
        if (!meta) return null;
        if (meta.type === "body_map" || meta.type === "injury_list") return null;

        return (
          <ConditionalField key={fieldName} fieldName={fieldName}>
            {step === 6 && fieldName === "prehospital_airway" && (
              <p className="text-sm font-medium text-muted-foreground pt-2 pb-1 border-t">
                {t("form.sections.prehospital_care.interventions_label")}
              </p>
            )}
            {step === 6 && fieldName === "prehospital_hemorrhage_needed" && (
              <p className="text-sm font-medium text-muted-foreground pt-2 pb-1 border-t">
                {t("form.sections.prehospital_care.hemorrhage_label")}
              </p>
            )}
            {step === 6 && fieldName === "prehospital_tourniquet_correct" && (
              <p className="text-sm font-medium text-muted-foreground pt-2 pb-1 border-t">
                {t("form.sections.prehospital_care.quality_label")}
              </p>
            )}
            <FormFieldRenderer field={meta} />
          </ConditionalField>
        );
      })}

      {/* Step 3 — response time display + location picker */}
      {step === 3 && <ResponseTimeDisplay />}
      {step === 3 && <LocationPickerMap />}

      {/* Step 8 — clinical alerts for abnormal vitals */}
      {step === 8 && <VitalsAlerts />}
    </div>
  );
}

"use client";

import { fieldMetadata } from "@/lib/form/schema";
import { FormFieldRenderer } from "./form-field-renderer";
import { ConditionalField } from "./conditional-field";
import { BodyMapStep } from "./body-map-step";
import { InjuryListField } from "./injury-list-field";

interface StepContentProps {
  step: number;
  fields: string[];
}

export function StepContent({ step, fields }: StepContentProps) {
  // Step 9 has the body map — render it specially
  if (step === 9) {
    return <BodyMapStep />;
  }

  return (
    <div className="space-y-4">
      {fields.map((fieldName) => {
        const meta = fieldMetadata[fieldName];

        // Skip fields that are handled specially
        if (!meta) return null;
        if (meta.type === "body_map" || meta.type === "injury_list") return null;

        // Hidden system fields on step 16
        if (
          step === 16 &&
          ["created_by", "created_at", "local_id", "remote_id"].includes(
            fieldName
          )
        ) {
          return null;
        }

        return (
          <ConditionalField key={fieldName} fieldName={fieldName}>
            <FormFieldRenderer field={meta} />
          </ConditionalField>
        );
      })}
    </div>
  );
}

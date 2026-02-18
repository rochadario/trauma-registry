export interface PrefillRule {
  field: string;
  dependsOn: string;
  prefill: (value: unknown) => unknown;
}

export const prefillRules: PrefillRule[] = [
  // 1. AVPU to GCS mapping
  //    alert -> 15, voice -> 12, pain -> 8, unresponsive -> 3
  {
    field: "arrival_gcs_total",
    dependsOn: "arrival_avpu",
    prefill: (value) => {
      const mapping: Record<string, number> = {
        alert: 15,
        voice: 12,
        pain: 8,
        unresponsive: 3,
      };
      return typeof value === "string" ? mapping[value] ?? undefined : undefined;
    },
  },
  // Also prefill individual GCS components from AVPU
  {
    field: "arrival_gcs_eye",
    dependsOn: "arrival_avpu",
    prefill: (value) => {
      const mapping: Record<string, number> = {
        alert: 4,
        voice: 3,
        pain: 2,
        unresponsive: 1,
      };
      return typeof value === "string" ? mapping[value] ?? undefined : undefined;
    },
  },
  {
    field: "arrival_gcs_verbal",
    dependsOn: "arrival_avpu",
    prefill: (value) => {
      const mapping: Record<string, number> = {
        alert: 5,
        voice: 4,
        pain: 2,
        unresponsive: 1,
      };
      return typeof value === "string" ? mapping[value] ?? undefined : undefined;
    },
  },
  {
    field: "arrival_gcs_motor",
    dependsOn: "arrival_avpu",
    prefill: (value) => {
      const mapping: Record<string, number> = {
        alert: 6,
        voice: 5,
        pain: 4,
        unresponsive: 1,
      };
      return typeof value === "string" ? mapping[value] ?? undefined : undefined;
    },
  },

  // 2. Copy pupil_right to pupil_left (bilateral suggestion)
  {
    field: "pupil_left_size",
    dependsOn: "pupil_right_size",
    prefill: (value) => value,
  },
  {
    field: "pupil_left_reactive",
    dependsOn: "pupil_right_reactive",
    prefill: (value) => value,
  },

  // 3. injury_date defaults to admission_date
  {
    field: "injury_date",
    dependsOn: "admission_date",
    prefill: (value) =>
      typeof value === "string" && value.length > 0 ? value : undefined,
  },

  // 4. injury_time defaults to admission_time
  {
    field: "injury_time",
    dependsOn: "admission_time",
    prefill: (value) =>
      typeof value === "string" && value.length > 0 ? value : undefined,
  },

  // 5. disposition_date defaults to today's date
  {
    field: "disposition_date",
    dependsOn: "admission_date",
    prefill: () => {
      const now = new Date();
      return now.toISOString().slice(0, 10);
    },
  },

  // 6. outcome_date defaults to disposition_date
  {
    field: "outcome_date",
    dependsOn: "disposition_date",
    prefill: (value) =>
      typeof value === "string" && value.length > 0 ? value : undefined,
  },

  // 7. rtc_counterpart filters / suggests based on rtc_role
  //    Provides a sensible default counterpart based on the user's role
  {
    field: "rtc_counterpart",
    dependsOn: "rtc_role",
    prefill: (value) => {
      const mapping: Record<string, string> = {
        driver: "car",
        passenger: "car",
        pedestrian: "car",
        cyclist: "car",
        motorcyclist: "car",
      };
      return typeof value === "string" ? mapping[value] ?? undefined : undefined;
    },
  },
];

/**
 * Returns all prefill rules for a given target field.
 */
export function getPrefillsForField(field: string): PrefillRule[] {
  return prefillRules.filter((r) => r.field === field);
}

/**
 * Returns all prefill rules that depend on a given source field.
 * Useful for determining which fields to prefill when a value changes.
 */
export function getDependentPrefills(sourceField: string): PrefillRule[] {
  return prefillRules.filter((r) => r.dependsOn === sourceField);
}

/**
 * Computes all prefill suggestions based on current form values.
 * Returns a map of field -> suggested value. Only includes fields
 * where the suggestion is non-undefined.
 *
 * Note: Prefills are suggestions, not overrides. The form should only
 * apply them when the target field is empty/untouched.
 */
export function computePrefills(
  values: Record<string, unknown>
): Record<string, unknown> {
  const suggestions: Record<string, unknown> = {};

  for (const rule of prefillRules) {
    const sourceValue = values[rule.dependsOn];
    const suggested = rule.prefill(sourceValue);
    if (suggested !== undefined) {
      suggestions[rule.field] = suggested;
    }
  }

  return suggestions;
}

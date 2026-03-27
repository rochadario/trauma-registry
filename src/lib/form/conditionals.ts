export interface ConditionalRule {
  field: string;
  dependsOn: string;
  condition: (value: unknown) => boolean;
}

export const conditionalRules: ConditionalRule[] = [
  // ---- Step 1: Hospital Identification ----
  {
    field: "hospital_other",
    dependsOn: "hospital_id",
    condition: (value) => value === "other",
  },

  // ---- Step 3: Injury Event ----
  {
    field: "motorcycle_helmet",
    dependsOn: "injury_mechanism",
    condition: (value) => value === "motorcycle",
  },

  // ---- Step 4: Road Traffic Details ----
  // All RTC fields shown when injury_mechanism is road_traffic or motorcycle
  {
    field: "rtc_role",
    dependsOn: "injury_mechanism",
    condition: (value) => value === "road_traffic" || value === "motorcycle",
  },
  {
    field: "rtc_vehicle_type",
    dependsOn: "injury_mechanism",
    condition: (value) => value === "road_traffic" || value === "motorcycle",
  },
  {
    field: "rtc_counterpart",
    dependsOn: "injury_mechanism",
    condition: (value) => value === "road_traffic" || value === "motorcycle",
  },
  {
    field: "rtc_alcohol_suspected",
    dependsOn: "injury_mechanism",
    condition: (value) => value === "road_traffic" || value === "motorcycle",
  },
  // rtc_helmet: only for motorcyclist or cyclist
  {
    field: "rtc_helmet",
    dependsOn: "rtc_role",
    condition: (value) =>
      value === "motorcyclist" || value === "cyclist",
  },
  // rtc_seatbelt: only for driver or passenger
  {
    field: "rtc_seatbelt",
    dependsOn: "rtc_role",
    condition: (value) =>
      value === "driver" || value === "passenger",
  },

  // ---- Step 5: Violence Details ----
  // All violence fields shown when injury_intent is assault or self_harm
  {
    field: "violence_weapon",
    dependsOn: "injury_intent",
    condition: (value) =>
      value === "assault" || value === "self_harm",
  },
  {
    field: "violence_relationship",
    dependsOn: "injury_intent",
    condition: (value) =>
      value === "assault" || value === "self_harm",
  },
  {
    field: "violence_location",
    dependsOn: "injury_intent",
    condition: (value) =>
      value === "assault" || value === "self_harm",
  },
  {
    field: "violence_alcohol_victim",
    dependsOn: "injury_intent",
    condition: (value) =>
      value === "assault" || value === "self_harm",
  },
  {
    field: "violence_reported_police",
    dependsOn: "injury_intent",
    condition: (value) =>
      value === "assault" || value === "self_harm",
  },
  // violence_alcohol_perpetrator: only for assault (not self_harm)
  {
    field: "violence_alcohol_perpetrator",
    dependsOn: "injury_intent",
    condition: (value) => value === "assault",
  },

  // ---- Step 6: Pre-Hospital Care ----
  // All prehospital detail fields shown when prehospital_care === true
  {
    field: "prehospital_provider",
    dependsOn: "prehospital_care",
    condition: (value) => value === true,
  },
  {
    field: "prehospital_time_minutes",
    dependsOn: "prehospital_care",
    condition: (value) => value === true,
  },
  {
    field: "prehospital_airway",
    dependsOn: "prehospital_care",
    condition: (value) => value === true,
  },
  {
    field: "prehospital_iv",
    dependsOn: "prehospital_care",
    condition: (value) => value === true,
  },
  {
    field: "prehospital_immobilization",
    dependsOn: "prehospital_care",
    condition: (value) => value === true,
  },
  {
    field: "prehospital_cpr",
    dependsOn: "prehospital_care",
    condition: (value) => value === true,
  },
  // Hemorrhage needed — shown when prehospital_care === true
  {
    field: "prehospital_hemorrhage_needed",
    dependsOn: "prehospital_care",
    condition: (value) => value === true,
  },
  // Hemorrhage control checkboxes — shown when hemorrhage_needed === true
  {
    field: "prehospital_tourniquet",
    dependsOn: "prehospital_hemorrhage_needed",
    condition: (value) => value === true,
  },
  {
    field: "prehospital_wound_packing",
    dependsOn: "prehospital_hemorrhage_needed",
    condition: (value) => value === true,
  },
  {
    field: "prehospital_direct_pressure",
    dependsOn: "prehospital_hemorrhage_needed",
    condition: (value) => value === true,
  },
  // Quality fields — only shown when the intervention was performed
  {
    field: "prehospital_tourniquet_correct",
    dependsOn: "prehospital_tourniquet",
    condition: (value) => value === true,
  },
  {
    field: "prehospital_spinal_correct",
    dependsOn: "prehospital_immobilization",
    condition: (value) => value === true,
  },
  // Notification detail fields — shown when hospital was notified
  {
    field: "notification_method",
    dependsOn: "prehospital_notification",
    condition: (value) => value === true,
  },
  {
    field: "notification_time",
    dependsOn: "prehospital_notification",
    condition: (value) => value === true,
  },
  {
    field: "notification_triage_sent",
    dependsOn: "prehospital_notification",
    condition: (value) => value === true,
  },
  // Bombero company — shown when transport is bombero
  {
    field: "transport_bombero_company",
    dependsOn: "transport_type",
    condition: (value) =>
      value === "bombero_voluntario" || value === "bombero_municipal",
  },
  // Time fields — shown when the corresponding procedure was performed
  {
    field: "time_blood_transfusion",
    dependsOn: "procedure_blood_transfusion",
    condition: (value) => value === true,
  },
  {
    field: "time_airway_intervention",
    dependsOn: "procedure_airway",
    condition: (value) => value === true,
  },
  // Transfusion units — shown when transfusion time is entered
  {
    field: "blood_transfusion_units",
    dependsOn: "time_blood_transfusion",
    condition: (value) => typeof value === "string" && value.length > 0,
  },
  // 30-day destination — shown only when alive at 30 days
  {
    field: "followup_30day_destination",
    dependsOn: "followup_30day_status",
    condition: (value) => value === "alive",
  },

  // ---- Step 7: Arrival Assessment ----
  // arrival_shock_index shown when both heart_rate and systolic_bp are available
  // (handled as a calculation, but we still gate its display)
  {
    field: "arrival_shock_index",
    dependsOn: "arrival_systolic_bp",
    condition: (value) =>
      typeof value === "number" && value > 0,
  },

  // ---- Step 12: Procedures ----
  {
    field: "procedure_surgery_type",
    dependsOn: "procedure_surgery",
    condition: (value) => value === true,
  },

  // ---- Step 13: Disposition ----
  {
    field: "disposition_department",
    dependsOn: "disposition",
    condition: (value) => value === "admitted",
  },
  {
    field: "disposition_transfer_to",
    dependsOn: "disposition",
    condition: (value) => value === "transferred",
  },

  // ---- Step 14: Surgery Details ----
  // All surgery detail fields shown when procedure_surgery === true
  {
    field: "surgery_date",
    dependsOn: "procedure_surgery",
    condition: (value) => value === true,
  },
  {
    field: "surgery_time",
    dependsOn: "procedure_surgery",
    condition: (value) => value === true,
  },
  {
    field: "surgery_type",
    dependsOn: "procedure_surgery",
    condition: (value) => value === true,
  },
  {
    field: "surgery_findings",
    dependsOn: "procedure_surgery",
    condition: (value) => value === true,
  },
  {
    field: "surgery_complications",
    dependsOn: "procedure_surgery",
    condition: (value) => value === true,
  },
  // surgery_complication_details only when complications === true
  {
    field: "surgery_complication_details",
    dependsOn: "surgery_complications",
    condition: (value) => value === true,
  },

  // ---- Step 15: Outcome ----
  {
    field: "death_date",
    dependsOn: "outcome",
    condition: (value) =>
      typeof value === "string" && value.startsWith("died"),
  },
  {
    field: "death_time",
    dependsOn: "outcome",
    condition: (value) =>
      typeof value === "string" && value.startsWith("died"),
  },
  {
    field: "death_cause",
    dependsOn: "outcome",
    condition: (value) =>
      typeof value === "string" && value.startsWith("died"),
  },

  // ---- Step 16: Record Info ----
  {
    field: "verified_by",
    dependsOn: "record_status",
    condition: (value) => value === "verified",
  },
  {
    field: "verified_at",
    dependsOn: "record_status",
    condition: (value) => value === "verified",
  },
  {
    field: "remote_id",
    dependsOn: "sync_status",
    condition: (value) => value === "synced",
  },

  // ---- Step 11: Diagnostics ----
  {
    field: "diagnostics_other",
    dependsOn: "diagnostics_labs",
    condition: () => true, // always visible as an open text field; kept for consistency
  },

  // ---- Step 15: Outcome auxiliary ----
  {
    field: "icu_days",
    dependsOn: "disposition_department",
    condition: (value) => value === "icu",
  },
  {
    field: "ventilator_days",
    dependsOn: "disposition_department",
    condition: (value) => value === "icu",
  },
];

/**
 * Checks whether a specific field should be visible given current form values.
 * A field with no conditional rule is always visible.
 * If a field has multiple rules (e.g. rtc_helmet depends on both
 * injury_mechanism and rtc_role), ALL rules must be satisfied.
 */
export function isFieldVisible(
  fieldName: string,
  values: Record<string, unknown>
): boolean {
  const rules = conditionalRules.filter((r) => r.field === fieldName);

  // No rules means the field is always visible
  if (rules.length === 0) return true;

  // All applicable rules must pass
  return rules.every((rule) => rule.condition(values[rule.dependsOn]));
}

/**
 * Returns all currently visible fields given the form values.
 */
export function getVisibleFields(
  allFields: string[],
  values: Record<string, unknown>
): string[] {
  return allFields.filter((field) => isFieldVisible(field, values));
}

export interface FormSection {
  id: string;
  step: number;
  titleKey: string;
  descriptionKey: string;
  fields: string[];
  conditional?: {
    field: string;
    value: unknown;
    operator: "equals" | "includes" | "not_equals";
  };
}

export const formSections: FormSection[] = [
  {
    id: "hospital_identification",
    step: 1,
    titleKey: "form.sections.hospital_identification.title",
    descriptionKey: "form.sections.hospital_identification.description",
    fields: [
      "hospital_id",
      "hospital_other",
      "registry_number",
      "admission_date",
      "admission_time",
    ],
  },
  {
    id: "patient_demographics",
    step: 2,
    titleKey: "form.sections.patient_demographics.title",
    descriptionKey: "form.sections.patient_demographics.description",
    fields: [
      "patient_age",
      "patient_age_unit",
      "patient_sex",
      "patient_ethnicity",
      "patient_municipality",
      "patient_department",
      "patient_referral_source",
    ],
  },
  {
    id: "injury_event",
    step: 3,
    titleKey: "form.sections.injury_event.title",
    descriptionKey: "form.sections.injury_event.description",
    fields: [
      "injury_date",
      "injury_time",
      "injury_setting",
      "injury_location_type",
      "injury_intent",
      "injury_mechanism",
      "injury_activity",
    ],
  },
  {
    id: "road_traffic_details",
    step: 4,
    titleKey: "form.sections.road_traffic_details.title",
    descriptionKey: "form.sections.road_traffic_details.description",
    fields: [
      "rtc_role",
      "rtc_vehicle_type",
      "rtc_counterpart",
      "rtc_helmet",
      "rtc_seatbelt",
      "rtc_alcohol_suspected",
    ],
    conditional: {
      field: "injury_mechanism",
      value: "road_traffic",
      operator: "equals",
    },
  },
  {
    id: "violence_details",
    step: 5,
    titleKey: "form.sections.violence_details.title",
    descriptionKey: "form.sections.violence_details.description",
    fields: [
      "violence_weapon",
      "violence_relationship",
      "violence_location",
      "violence_alcohol_victim",
      "violence_alcohol_perpetrator",
      "violence_reported_police",
    ],
    conditional: {
      field: "injury_intent",
      value: ["assault", "self_harm"],
      operator: "includes",
    },
  },
  {
    id: "prehospital_care",
    step: 6,
    titleKey: "form.sections.prehospital_care.title",
    descriptionKey: "form.sections.prehospital_care.description",
    fields: [
      "prehospital_care",
      "prehospital_provider",
      "prehospital_time_minutes",
      "prehospital_airway",
      "prehospital_iv",
      "prehospital_immobilization",
      "prehospital_cpr",
    ],
  },
  {
    id: "arrival_assessment",
    step: 7,
    titleKey: "form.sections.arrival_assessment.title",
    descriptionKey: "form.sections.arrival_assessment.description",
    fields: [
      "arrival_gcs_eye",
      "arrival_gcs_verbal",
      "arrival_gcs_motor",
      "arrival_gcs_total",
      "arrival_avpu",
      "arrival_systolic_bp",
      "arrival_diastolic_bp",
      "arrival_heart_rate",
      "arrival_respiratory_rate",
      "arrival_spo2",
      "arrival_temperature",
      "arrival_shock_index",
    ],
  },
  {
    id: "pupil_assessment",
    step: 8,
    titleKey: "form.sections.pupil_assessment.title",
    descriptionKey: "form.sections.pupil_assessment.description",
    fields: [
      "pupil_right_size",
      "pupil_right_reactive",
      "pupil_left_size",
      "pupil_left_reactive",
      "pupil_equal",
    ],
  },
  {
    id: "body_region_injuries",
    step: 9,
    titleKey: "form.sections.body_region_injuries.title",
    descriptionKey: "form.sections.body_region_injuries.description",
    fields: [
      "body_regions_affected",
      "injuries",
      "number_of_injuries",
    ],
  },
  {
    id: "ais_iss_scoring",
    step: 10,
    titleKey: "form.sections.ais_iss_scoring.title",
    descriptionKey: "form.sections.ais_iss_scoring.description",
    fields: [
      "ais_head_neck",
      "ais_face",
      "ais_chest",
      "ais_abdomen",
      "ais_extremities",
      "ais_external",
      "iss_score",
      "iss_category",
    ],
  },
  {
    id: "diagnostics",
    step: 11,
    titleKey: "form.sections.diagnostics.title",
    descriptionKey: "form.sections.diagnostics.description",
    fields: [
      "diagnostics_xray",
      "diagnostics_ct",
      "diagnostics_ultrasound",
      "diagnostics_fast",
      "diagnostics_labs",
      "diagnostics_other",
    ],
  },
  {
    id: "procedures",
    step: 12,
    titleKey: "form.sections.procedures.title",
    descriptionKey: "form.sections.procedures.description",
    fields: [
      "procedure_airway",
      "procedure_chest_tube",
      "procedure_central_line",
      "procedure_blood_transfusion",
      "procedure_splinting",
      "procedure_wound_care",
      "procedure_surgery",
      "procedure_surgery_type",
      "procedure_other",
    ],
  },
  {
    id: "disposition",
    step: 13,
    titleKey: "form.sections.disposition.title",
    descriptionKey: "form.sections.disposition.description",
    fields: [
      "disposition",
      "disposition_department",
      "disposition_transfer_to",
      "disposition_date",
      "disposition_time",
    ],
  },
  {
    id: "surgery_details",
    step: 14,
    titleKey: "form.sections.surgery_details.title",
    descriptionKey: "form.sections.surgery_details.description",
    fields: [
      "surgery_date",
      "surgery_time",
      "surgery_type",
      "surgery_findings",
      "surgery_complications",
      "surgery_complication_details",
    ],
    conditional: {
      field: "procedure_surgery",
      value: true,
      operator: "equals",
    },
  },
  {
    id: "outcome",
    step: 15,
    titleKey: "form.sections.outcome.title",
    descriptionKey: "form.sections.outcome.description",
    fields: [
      "outcome",
      "outcome_date",
      "death_date",
      "death_time",
      "death_cause",
      "los_days",
      "icu_days",
      "ventilator_days",
    ],
  },
  {
    id: "record_info",
    step: 16,
    titleKey: "form.sections.record_info.title",
    descriptionKey: "form.sections.record_info.description",
    fields: [
      "record_status",
      "created_by",
      "created_at",
      "updated_at",
      "verified_by",
      "verified_at",
      "sync_status",
      "local_id",
      "remote_id",
    ],
  },
];

/**
 * Returns the section for a given step number.
 */
export function getSectionByStep(step: number): FormSection | undefined {
  return formSections.find((s) => s.step === step);
}

/**
 * Returns all field names across all sections.
 */
export function getAllFieldNames(): string[] {
  return formSections.flatMap((s) => s.fields);
}

/**
 * Evaluates whether a conditional section should be displayed
 * based on the current form values.
 */
export function isSectionVisible(
  section: FormSection,
  values: Record<string, unknown>
): boolean {
  if (!section.conditional) return true;

  const { field, value, operator } = section.conditional;
  const currentValue = values[field];

  switch (operator) {
    case "equals":
      return currentValue === value;
    case "not_equals":
      return currentValue !== value;
    case "includes":
      if (Array.isArray(value)) {
        return value.includes(currentValue as string);
      }
      return false;
    default:
      return true;
  }
}

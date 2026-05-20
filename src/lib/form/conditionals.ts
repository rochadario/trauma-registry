export interface ConditionalRule {
  field: string;
  dependsOn: string;
  condition: (value: unknown) => boolean;
}

// Human-readable descriptions shown in review mode, keyed by `dependsOn` field name
export const conditionNotes: Record<string, { en: string; es: string }> = {
  hospital_id: {
    en: "Only shown when Hospital = 'Other'",
    es: "Solo aparece cuando Hospital = 'Otro'",
  },
  injury_mechanism: {
    en: "Only shown when Injury Mechanism = Road Traffic or Motorcycle",
    es: "Solo aparece cuando Mecanismo de lesión = Tráfico vial o Motocicleta",
  },
  rtc_role: {
    en: "Only shown when RTC Role = Motorcyclist/Cyclist (helmet) or Driver/Passenger (seatbelt)",
    es: "Solo aparece cuando Rol = Motociclista/Ciclista (casco) o Conductor/Pasajero (cinturón)",
  },
  injury_intent: {
    en: "Only shown when Injury Intent = Assault or Self-harm",
    es: "Solo aparece cuando Intención de lesión = Agresión o Autolesión",
  },
  prehospital_care: {
    en: "Only shown when Pre-hospital Care = Yes",
    es: "Solo aparece cuando Atención prehospitalaria = Sí",
  },
  prehospital_hemorrhage_needed: {
    en: "Only shown when Hemorrhage Control Needed = Yes",
    es: "Solo aparece cuando Control de hemorragia necesario = Sí",
  },
  prehospital_tourniquet: {
    en: "Only shown when Tourniquet = Yes",
    es: "Solo aparece cuando Torniquete = Sí",
  },
  prehospital_immobilization: {
    en: "Only shown when Immobilization = Yes",
    es: "Solo aparece cuando Inmovilización = Sí",
  },
  prehospital_notification: {
    en: "Only shown when Pre-hospital Notification = Yes",
    es: "Solo aparece cuando Notificación prehospitalaria = Sí",
  },
  transport_type: {
    en: "Only shown when Transport Type = Bombero Voluntario or Bombero Municipal",
    es: "Solo aparece cuando Tipo de transporte = Bombero Voluntario o Bombero Municipal",
  },
  procedure_blood_transfusion: {
    en: "Only shown when Blood Transfusion = Yes",
    es: "Solo aparece cuando Transfusión de sangre = Sí",
  },
  procedure_airway: {
    en: "Only shown when Airway Procedure = Yes",
    es: "Solo aparece cuando Procedimiento de vía aérea = Sí",
  },
  time_blood_transfusion: {
    en: "Only shown when Time of Blood Transfusion is recorded",
    es: "Solo aparece cuando el tiempo de transfusión está registrado",
  },
  followup_30day_status: {
    en: "Only shown when 30-Day Follow-up Status = Alive",
    es: "Solo aparece cuando Estado a 30 días = Vivo",
  },
  arrival_systolic_bp: {
    en: "Calculated automatically from systolic BP and heart rate",
    es: "Se calcula automáticamente a partir de la PA sistólica y la frecuencia cardíaca",
  },
  procedure_surgery: {
    en: "Only shown when Surgery = Yes",
    es: "Solo aparece cuando Cirugía = Sí",
  },
  surgery_complications: {
    en: "Only shown when Surgery Complications = Yes",
    es: "Solo aparece cuando Complicaciones quirúrgicas = Sí",
  },
  disposition: {
    en: "Only shown when Disposition = Admitted (department) or Transferred (destination)",
    es: "Solo aparece cuando Disposición = Hospitalizado (departamento) o Transferido (destino)",
  },
  outcome: {
    en: "Only shown when Outcome = Died in Hospital or Died in OR",
    es: "Solo aparece cuando Resultado = Muerte en hospital o en quirófano",
  },
  record_status: {
    en: "Only shown when Record Status = Verified",
    es: "Solo aparece cuando Estado del registro = Verificado",
  },
  sync_status: {
    en: "Only shown when record is synced (remote ID assigned)",
    es: "Solo aparece cuando el registro está sincronizado (ID remoto asignado)",
  },
  diagnostics_labs: {
    en: "Only shown when Labs = Yes",
    es: "Solo aparece cuando Laboratorios = Sí",
  },
  disposition_department: {
    en: "Only shown when admitted to ICU",
    es: "Solo aparece cuando el paciente es admitido a UCI",
  },
};

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

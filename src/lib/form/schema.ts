import { z } from "zod";

// ============================================================================
// Step 1: Hospital Identification
// ============================================================================

const hospitalIdentificationSchema = z.object({
  hospital_id: z.enum([
    "hospital_roosevelt",
    "hospital_san_juan",
    "igss_zona_9",
    "other",
  ]),
  hospital_other: z.string().optional(),
  registry_number: z.string(),
  admission_date: z.string(), // ISO date
  admission_time: z.string(), // HH:mm
});

// ============================================================================
// Step 2: Patient Demographics
// ============================================================================

const patientDemographicsSchema = z.object({
  patient_age: z.coerce.number().min(0).max(120),
  patient_age_unit: z.enum(["years", "months", "days"]),
  patient_sex: z.enum(["male", "female", "other"]),
  patient_ethnicity: z.enum([
    "ladino",
    "maya",
    "garifuna",
    "xinca",
    "other",
  ]),
  patient_municipality: z.string(),
  patient_department: z.string(),
  patient_referral_source: z.enum([
    "self",
    "ambulance",
    "bomberos",
    "police",
    "other_hospital",
    "other",
  ]),
});

// ============================================================================
// Step 3: Injury Event
// ============================================================================

const injuryEventSchema = z.object({
  injury_date: z.string(),
  injury_time: z.string(),
  injury_setting: z.enum(["urban", "rural"]),
  injury_location_type: z.enum([
    "home",
    "road",
    "workplace",
    "school",
    "recreation",
    "public_place",
    "other",
  ]),
  injury_intent: z.enum([
    "unintentional",
    "assault",
    "self_harm",
    "legal_intervention",
    "conflict",
    "unknown",
  ]),
  injury_mechanism: z.enum([
    "road_traffic",
    "fall",
    "burn",
    "firearm",
    "sharp_object",
    "blunt_object",
    "poisoning",
    "drowning",
    "hanging",
    "animal_bite",
    "other",
  ]),
  injury_activity: z.enum([
    "working",
    "traveling",
    "sports",
    "leisure",
    "sleeping",
    "other",
  ]),
});

// ============================================================================
// Step 4: Road Traffic Details (conditional: injury_mechanism === "road_traffic")
// ============================================================================

const roadTrafficDetailsSchema = z.object({
  rtc_role: z.enum([
    "driver",
    "passenger",
    "pedestrian",
    "cyclist",
    "motorcyclist",
    "other",
  ]).optional(),
  rtc_vehicle_type: z.enum([
    "car",
    "pickup",
    "bus",
    "motorcycle",
    "bicycle",
    "heavy_vehicle",
    "other",
  ]).optional(),
  rtc_counterpart: z.enum([
    "car",
    "pickup",
    "bus",
    "motorcycle",
    "bicycle",
    "heavy_vehicle",
    "pedestrian",
    "fixed_object",
    "none",
    "other",
  ]).optional(),
  rtc_helmet: z.boolean().optional(),
  rtc_seatbelt: z.boolean().optional(),
  rtc_alcohol_suspected: z.boolean().optional(),
});

// ============================================================================
// Step 5: Violence Details (conditional: injury_intent in ["assault", "self_harm"])
// ============================================================================

const violenceDetailsSchema = z.object({
  violence_weapon: z.enum([
    "firearm",
    "knife",
    "machete",
    "blunt_object",
    "body_parts",
    "other",
  ]).optional(),
  violence_relationship: z.enum([
    "stranger",
    "acquaintance",
    "family",
    "intimate_partner",
    "gang",
    "unknown",
  ]).optional(),
  violence_location: z.enum([
    "home",
    "street",
    "bar",
    "workplace",
    "other",
  ]).optional(),
  violence_alcohol_victim: z.boolean().optional(),
  violence_alcohol_perpetrator: z.boolean().optional(),
  violence_reported_police: z.boolean().optional(),
});

// ============================================================================
// Step 6: Pre-Hospital Care
// ============================================================================

const preHospitalCareSchema = z.object({
  prehospital_care: z.boolean(),
  prehospital_provider: z.enum([
    "bomberos",
    "cruz_roja",
    "private_ambulance",
    "military",
    "bystander",
    "other",
  ]).optional(),
  prehospital_time_minutes: z.coerce.number().min(0).optional(),
  prehospital_airway: z.boolean().optional(),
  prehospital_iv: z.boolean().optional(),
  prehospital_immobilization: z.boolean().optional(),
  prehospital_cpr: z.boolean().optional(),
});

// ============================================================================
// Step 7: Arrival Assessment
// ============================================================================

const arrivalAssessmentSchema = z.object({
  arrival_gcs_eye: z.coerce.number().min(1).max(4),
  arrival_gcs_verbal: z.coerce.number().min(1).max(5),
  arrival_gcs_motor: z.coerce.number().min(1).max(6),
  arrival_gcs_total: z.coerce.number().min(3).max(15),
  arrival_avpu: z.enum(["alert", "voice", "pain", "unresponsive"]),
  arrival_systolic_bp: z.coerce.number().min(0).optional(),
  arrival_diastolic_bp: z.coerce.number().min(0).optional(),
  arrival_heart_rate: z.coerce.number().min(0).optional(),
  arrival_respiratory_rate: z.coerce.number().min(0).optional(),
  arrival_spo2: z.coerce.number().min(0).max(100).optional(),
  arrival_temperature: z.coerce.number().min(20).max(45).optional(),
  arrival_shock_index: z.coerce.number().min(0).optional(),
});

// ============================================================================
// Step 8: Pupil Assessment
// ============================================================================

const pupilAssessmentSchema = z.object({
  pupil_right_size: z.enum(["small", "medium", "large"]),
  pupil_right_reactive: z.boolean(),
  pupil_left_size: z.enum(["small", "medium", "large"]),
  pupil_left_reactive: z.boolean(),
  pupil_equal: z.boolean(),
});

// ============================================================================
// Step 9: Body Region Injuries
// ============================================================================

const bodyRegionEnum = z.enum([
  "head_neck",
  "face",
  "chest",
  "abdomen",
  "extremities",
  "external",
]);

const injuryEntrySchema = z.object({
  region: bodyRegionEnum,
  description: z.string(),
  ais_severity: z.coerce.number().min(1).max(6),
});

const bodyRegionInjuriesSchema = z.object({
  body_regions_affected: z.array(bodyRegionEnum),
  injuries: z.array(injuryEntrySchema),
  number_of_injuries: z.coerce.number().min(0),
});

// ============================================================================
// Step 10: AIS/ISS Scoring
// ============================================================================

const aisIssSchema = z.object({
  ais_head_neck: z.coerce.number().min(0).max(6).optional(),
  ais_face: z.coerce.number().min(0).max(6).optional(),
  ais_chest: z.coerce.number().min(0).max(6).optional(),
  ais_abdomen: z.coerce.number().min(0).max(6).optional(),
  ais_extremities: z.coerce.number().min(0).max(6).optional(),
  ais_external: z.coerce.number().min(0).max(6).optional(),
  iss_score: z.coerce.number().min(0).max(75),
  iss_category: z.enum([
    "minor",
    "moderate",
    "serious",
    "severe",
    "critical",
    "unsurvivable",
  ]),
});

// ============================================================================
// Step 11: Diagnostics
// ============================================================================

const diagnosticsSchema = z.object({
  diagnostics_xray: z.boolean(),
  diagnostics_ct: z.boolean(),
  diagnostics_ultrasound: z.boolean(),
  diagnostics_fast: z.boolean(),
  diagnostics_labs: z.boolean(),
  diagnostics_other: z.string().optional(),
});

// ============================================================================
// Step 12: Procedures / Treatment
// ============================================================================

const proceduresSchema = z.object({
  procedure_airway: z.boolean(),
  procedure_chest_tube: z.boolean(),
  procedure_central_line: z.boolean(),
  procedure_blood_transfusion: z.boolean(),
  procedure_splinting: z.boolean(),
  procedure_wound_care: z.boolean(),
  procedure_surgery: z.boolean(),
  procedure_surgery_type: z.string().optional(),
  procedure_other: z.string().optional(),
});

// ============================================================================
// Step 13: Disposition
// ============================================================================

const dispositionSchema = z.object({
  disposition: z.enum([
    "admitted",
    "discharged",
    "transferred",
    "died_er",
    "left_ama",
    "left_absconded",
  ]),
  disposition_department: z.enum([
    "surgery",
    "orthopedics",
    "neurosurgery",
    "icu",
    "pediatrics",
    "other",
  ]).optional(),
  disposition_transfer_to: z.string().optional(),
  disposition_date: z.string(),
  disposition_time: z.string(),
});

// ============================================================================
// Step 14: Surgery Details (conditional: procedure_surgery === true)
// ============================================================================

const surgeryDetailsSchema = z.object({
  surgery_date: z.string().optional(),
  surgery_time: z.string().optional(),
  surgery_type: z.enum([
    "exploratory_laparotomy",
    "craniotomy",
    "thoracotomy",
    "orif",
    "amputation",
    "debridement",
    "other",
  ]).optional(),
  surgery_findings: z.string().optional(),
  surgery_complications: z.boolean().optional(),
  surgery_complication_details: z.string().optional(),
});

// ============================================================================
// Step 15: Outcome
// ============================================================================

const outcomeSchema = z.object({
  outcome: z.enum([
    "alive_discharge",
    "alive_transferred",
    "died_hospital",
    "died_or",
  ]),
  outcome_date: z.string().optional(),
  death_date: z.string().optional(),
  death_time: z.string().optional(),
  death_cause: z.string().optional(),
  los_days: z.coerce.number().min(0).optional(),
  icu_days: z.coerce.number().min(0).optional(),
  ventilator_days: z.coerce.number().min(0).optional(),
});

// ============================================================================
// Step 16: Record Info
// ============================================================================

const recordInfoSchema = z.object({
  record_status: z.enum(["draft", "complete", "verified"]),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  verified_by: z.string().optional(),
  verified_at: z.string().optional(),
  sync_status: z.enum(["pending", "synced", "conflict"]),
  local_id: z.string(),
  remote_id: z.string().optional(),
});

// ============================================================================
// Full Patient Schema
// ============================================================================

export const patientSchema = z.object({
  // Step 1: Hospital Identification
  ...hospitalIdentificationSchema.shape,
  // Step 2: Patient Demographics
  ...patientDemographicsSchema.shape,
  // Step 3: Injury Event
  ...injuryEventSchema.shape,
  // Step 4: Road Traffic Details
  ...roadTrafficDetailsSchema.shape,
  // Step 5: Violence Details
  ...violenceDetailsSchema.shape,
  // Step 6: Pre-Hospital Care
  ...preHospitalCareSchema.shape,
  // Step 7: Arrival Assessment
  ...arrivalAssessmentSchema.shape,
  // Step 8: Pupil Assessment
  ...pupilAssessmentSchema.shape,
  // Step 9: Body Region Injuries
  ...bodyRegionInjuriesSchema.shape,
  // Step 10: AIS/ISS Scoring
  ...aisIssSchema.shape,
  // Step 11: Diagnostics
  ...diagnosticsSchema.shape,
  // Step 12: Procedures / Treatment
  ...proceduresSchema.shape,
  // Step 13: Disposition
  ...dispositionSchema.shape,
  // Step 14: Surgery Details
  ...surgeryDetailsSchema.shape,
  // Step 15: Outcome
  ...outcomeSchema.shape,
  // Step 16: Record Info
  ...recordInfoSchema.shape,
});

export type PatientRecord = z.infer<typeof patientSchema>;

// Partial schema for draft records — all fields become optional
export const partialPatientSchema = patientSchema.partial();

export type PartialPatientRecord = z.infer<typeof partialPatientSchema>;

// Re-export sub-schemas for per-step validation
export const stepSchemas = {
  1: hospitalIdentificationSchema,
  2: patientDemographicsSchema,
  3: injuryEventSchema,
  4: roadTrafficDetailsSchema,
  5: violenceDetailsSchema,
  6: preHospitalCareSchema,
  7: arrivalAssessmentSchema,
  8: pupilAssessmentSchema,
  9: bodyRegionInjuriesSchema,
  10: aisIssSchema,
  11: diagnosticsSchema,
  12: proceduresSchema,
  13: dispositionSchema,
  14: surgeryDetailsSchema,
  15: outcomeSchema,
  16: recordInfoSchema,
} as const;

// Export the injury entry schema for reuse
export { injuryEntrySchema, bodyRegionEnum };

// ============================================================================
// Field Metadata for dynamic rendering
// ============================================================================

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "time"
  | "select"
  | "checkbox"
  | "radio"
  | "textarea"
  | "body_map"
  | "injury_list"
  | "computed";

export interface FieldMeta {
  name: string;
  type: FieldType;
  step: number;
  required: boolean;
  options?: { value: string; labelKey: string }[];
  min?: number;
  max?: number;
  computed?: boolean;
  inputMode?: "numeric" | "decimal" | "text";
}

function opts(values: string[], prefix = "fields"): { value: string; labelKey: string }[] {
  return values.map((v) => ({ value: v, labelKey: `${prefix}.${v}` }));
}

export const fieldMetadata: Record<string, FieldMeta> = {
  // Step 1
  hospital_id: { name: "hospital_id", type: "select", step: 1, required: true, options: opts(["hospital_roosevelt", "hospital_san_juan", "igss_zona_9", "other"]) },
  hospital_other: { name: "hospital_other", type: "text", step: 1, required: false },
  registry_number: { name: "registry_number", type: "text", step: 1, required: true },
  admission_date: { name: "admission_date", type: "date", step: 1, required: true },
  admission_time: { name: "admission_time", type: "time", step: 1, required: true },

  // Step 2
  patient_age: { name: "patient_age", type: "number", step: 2, required: true, min: 0, max: 120, inputMode: "numeric" },
  patient_age_unit: { name: "patient_age_unit", type: "select", step: 2, required: true, options: opts(["years", "months", "days"]) },
  patient_sex: { name: "patient_sex", type: "radio", step: 2, required: true, options: opts(["male", "female", "other"]) },
  patient_ethnicity: { name: "patient_ethnicity", type: "select", step: 2, required: true, options: opts(["ladino", "maya", "garifuna", "xinca", "other"]) },
  patient_municipality: { name: "patient_municipality", type: "text", step: 2, required: true },
  patient_department: { name: "patient_department", type: "text", step: 2, required: true },
  patient_referral_source: { name: "patient_referral_source", type: "select", step: 2, required: true, options: opts(["self", "ambulance", "bomberos", "police", "other_hospital", "other"]) },

  // Step 3
  injury_date: { name: "injury_date", type: "date", step: 3, required: true },
  injury_time: { name: "injury_time", type: "time", step: 3, required: true },
  injury_setting: { name: "injury_setting", type: "radio", step: 3, required: true, options: opts(["urban", "rural"]) },
  injury_location_type: { name: "injury_location_type", type: "select", step: 3, required: true, options: opts(["home", "road", "workplace", "school", "recreation", "public_place", "other"]) },
  injury_intent: { name: "injury_intent", type: "select", step: 3, required: true, options: opts(["unintentional", "assault", "self_harm", "legal_intervention", "conflict", "unknown"]) },
  injury_mechanism: { name: "injury_mechanism", type: "select", step: 3, required: true, options: opts(["road_traffic", "fall", "burn", "firearm", "sharp_object", "blunt_object", "poisoning", "drowning", "hanging", "animal_bite", "other"]) },
  injury_activity: { name: "injury_activity", type: "select", step: 3, required: true, options: opts(["working", "traveling", "sports", "leisure", "sleeping", "other"]) },

  // Step 4
  rtc_role: { name: "rtc_role", type: "select", step: 4, required: false, options: opts(["driver", "passenger", "pedestrian", "cyclist", "motorcyclist", "other"]) },
  rtc_vehicle_type: { name: "rtc_vehicle_type", type: "select", step: 4, required: false, options: opts(["car", "pickup", "bus", "motorcycle", "bicycle", "heavy_vehicle", "other"]) },
  rtc_counterpart: { name: "rtc_counterpart", type: "select", step: 4, required: false, options: opts(["car", "pickup", "bus", "motorcycle", "bicycle", "heavy_vehicle", "pedestrian", "fixed_object", "none", "other"]) },
  rtc_helmet: { name: "rtc_helmet", type: "checkbox", step: 4, required: false },
  rtc_seatbelt: { name: "rtc_seatbelt", type: "checkbox", step: 4, required: false },
  rtc_alcohol_suspected: { name: "rtc_alcohol_suspected", type: "checkbox", step: 4, required: false },

  // Step 5
  violence_weapon: { name: "violence_weapon", type: "select", step: 5, required: false, options: opts(["firearm", "knife", "machete", "blunt_object", "body_parts", "other"]) },
  violence_relationship: { name: "violence_relationship", type: "select", step: 5, required: false, options: opts(["stranger", "acquaintance", "family", "intimate_partner", "gang", "unknown"]) },
  violence_location: { name: "violence_location", type: "select", step: 5, required: false, options: opts(["home", "street", "bar", "workplace", "other"]) },
  violence_alcohol_victim: { name: "violence_alcohol_victim", type: "checkbox", step: 5, required: false },
  violence_alcohol_perpetrator: { name: "violence_alcohol_perpetrator", type: "checkbox", step: 5, required: false },
  violence_reported_police: { name: "violence_reported_police", type: "checkbox", step: 5, required: false },

  // Step 6
  prehospital_care: { name: "prehospital_care", type: "checkbox", step: 6, required: true },
  prehospital_provider: { name: "prehospital_provider", type: "select", step: 6, required: false, options: opts(["bomberos", "cruz_roja", "private_ambulance", "military", "bystander", "other"]) },
  prehospital_time_minutes: { name: "prehospital_time_minutes", type: "number", step: 6, required: false, min: 0, inputMode: "numeric" },
  prehospital_airway: { name: "prehospital_airway", type: "checkbox", step: 6, required: false },
  prehospital_iv: { name: "prehospital_iv", type: "checkbox", step: 6, required: false },
  prehospital_immobilization: { name: "prehospital_immobilization", type: "checkbox", step: 6, required: false },
  prehospital_cpr: { name: "prehospital_cpr", type: "checkbox", step: 6, required: false },

  // Step 7
  arrival_gcs_eye: { name: "arrival_gcs_eye", type: "select", step: 7, required: true, options: [
    { value: "1", labelKey: "fields.gcs_eye_1" }, { value: "2", labelKey: "fields.gcs_eye_2" },
    { value: "3", labelKey: "fields.gcs_eye_3" }, { value: "4", labelKey: "fields.gcs_eye_4" },
  ] },
  arrival_gcs_verbal: { name: "arrival_gcs_verbal", type: "select", step: 7, required: true, options: [
    { value: "1", labelKey: "fields.gcs_verbal_1" }, { value: "2", labelKey: "fields.gcs_verbal_2" },
    { value: "3", labelKey: "fields.gcs_verbal_3" }, { value: "4", labelKey: "fields.gcs_verbal_4" },
    { value: "5", labelKey: "fields.gcs_verbal_5" },
  ] },
  arrival_gcs_motor: { name: "arrival_gcs_motor", type: "select", step: 7, required: true, options: [
    { value: "1", labelKey: "fields.gcs_motor_1" }, { value: "2", labelKey: "fields.gcs_motor_2" },
    { value: "3", labelKey: "fields.gcs_motor_3" }, { value: "4", labelKey: "fields.gcs_motor_4" },
    { value: "5", labelKey: "fields.gcs_motor_5" }, { value: "6", labelKey: "fields.gcs_motor_6" },
  ] },
  arrival_gcs_total: { name: "arrival_gcs_total", type: "computed", step: 7, required: false, computed: true },
  arrival_avpu: { name: "arrival_avpu", type: "select", step: 7, required: true, options: opts(["alert", "voice", "pain", "unresponsive"]) },
  arrival_systolic_bp: { name: "arrival_systolic_bp", type: "number", step: 7, required: false, min: 0, max: 300, inputMode: "numeric" },
  arrival_diastolic_bp: { name: "arrival_diastolic_bp", type: "number", step: 7, required: false, min: 0, max: 200, inputMode: "numeric" },
  arrival_heart_rate: { name: "arrival_heart_rate", type: "number", step: 7, required: false, min: 0, max: 300, inputMode: "numeric" },
  arrival_respiratory_rate: { name: "arrival_respiratory_rate", type: "number", step: 7, required: false, min: 0, max: 80, inputMode: "numeric" },
  arrival_spo2: { name: "arrival_spo2", type: "number", step: 7, required: false, min: 0, max: 100, inputMode: "numeric" },
  arrival_temperature: { name: "arrival_temperature", type: "number", step: 7, required: false, min: 25, max: 45, inputMode: "decimal" },
  arrival_shock_index: { name: "arrival_shock_index", type: "computed", step: 7, required: false, computed: true },

  // Step 8
  pupil_right_size: { name: "pupil_right_size", type: "select", step: 8, required: true, options: opts(["small", "medium", "large"]) },
  pupil_right_reactive: { name: "pupil_right_reactive", type: "checkbox", step: 8, required: true },
  pupil_left_size: { name: "pupil_left_size", type: "select", step: 8, required: true, options: opts(["small", "medium", "large"]) },
  pupil_left_reactive: { name: "pupil_left_reactive", type: "checkbox", step: 8, required: true },
  pupil_equal: { name: "pupil_equal", type: "computed", step: 8, required: false, computed: true },

  // Step 9
  body_regions_affected: { name: "body_regions_affected", type: "body_map", step: 9, required: true },
  injuries: { name: "injuries", type: "injury_list", step: 9, required: true },
  number_of_injuries: { name: "number_of_injuries", type: "computed", step: 9, required: false, computed: true },

  // Step 10
  ais_head_neck: { name: "ais_head_neck", type: "select", step: 10, required: false, options: [
    { value: "0", labelKey: "fields.ais_0" }, { value: "1", labelKey: "fields.ais_1" }, { value: "2", labelKey: "fields.ais_2" },
    { value: "3", labelKey: "fields.ais_3" }, { value: "4", labelKey: "fields.ais_4" }, { value: "5", labelKey: "fields.ais_5" },
    { value: "6", labelKey: "fields.ais_6" },
  ] },
  ais_face: { name: "ais_face", type: "select", step: 10, required: false, options: [
    { value: "0", labelKey: "fields.ais_0" }, { value: "1", labelKey: "fields.ais_1" }, { value: "2", labelKey: "fields.ais_2" },
    { value: "3", labelKey: "fields.ais_3" }, { value: "4", labelKey: "fields.ais_4" }, { value: "5", labelKey: "fields.ais_5" },
    { value: "6", labelKey: "fields.ais_6" },
  ] },
  ais_chest: { name: "ais_chest", type: "select", step: 10, required: false, options: [
    { value: "0", labelKey: "fields.ais_0" }, { value: "1", labelKey: "fields.ais_1" }, { value: "2", labelKey: "fields.ais_2" },
    { value: "3", labelKey: "fields.ais_3" }, { value: "4", labelKey: "fields.ais_4" }, { value: "5", labelKey: "fields.ais_5" },
    { value: "6", labelKey: "fields.ais_6" },
  ] },
  ais_abdomen: { name: "ais_abdomen", type: "select", step: 10, required: false, options: [
    { value: "0", labelKey: "fields.ais_0" }, { value: "1", labelKey: "fields.ais_1" }, { value: "2", labelKey: "fields.ais_2" },
    { value: "3", labelKey: "fields.ais_3" }, { value: "4", labelKey: "fields.ais_4" }, { value: "5", labelKey: "fields.ais_5" },
    { value: "6", labelKey: "fields.ais_6" },
  ] },
  ais_extremities: { name: "ais_extremities", type: "select", step: 10, required: false, options: [
    { value: "0", labelKey: "fields.ais_0" }, { value: "1", labelKey: "fields.ais_1" }, { value: "2", labelKey: "fields.ais_2" },
    { value: "3", labelKey: "fields.ais_3" }, { value: "4", labelKey: "fields.ais_4" }, { value: "5", labelKey: "fields.ais_5" },
    { value: "6", labelKey: "fields.ais_6" },
  ] },
  ais_external: { name: "ais_external", type: "select", step: 10, required: false, options: [
    { value: "0", labelKey: "fields.ais_0" }, { value: "1", labelKey: "fields.ais_1" }, { value: "2", labelKey: "fields.ais_2" },
    { value: "3", labelKey: "fields.ais_3" }, { value: "4", labelKey: "fields.ais_4" }, { value: "5", labelKey: "fields.ais_5" },
    { value: "6", labelKey: "fields.ais_6" },
  ] },
  iss_score: { name: "iss_score", type: "computed", step: 10, required: false, computed: true },
  iss_category: { name: "iss_category", type: "computed", step: 10, required: false, computed: true },

  // Step 11
  diagnostics_xray: { name: "diagnostics_xray", type: "checkbox", step: 11, required: true },
  diagnostics_ct: { name: "diagnostics_ct", type: "checkbox", step: 11, required: true },
  diagnostics_ultrasound: { name: "diagnostics_ultrasound", type: "checkbox", step: 11, required: true },
  diagnostics_fast: { name: "diagnostics_fast", type: "checkbox", step: 11, required: true },
  diagnostics_labs: { name: "diagnostics_labs", type: "checkbox", step: 11, required: true },
  diagnostics_other: { name: "diagnostics_other", type: "text", step: 11, required: false },

  // Step 12
  procedure_airway: { name: "procedure_airway", type: "checkbox", step: 12, required: true },
  procedure_chest_tube: { name: "procedure_chest_tube", type: "checkbox", step: 12, required: true },
  procedure_central_line: { name: "procedure_central_line", type: "checkbox", step: 12, required: true },
  procedure_blood_transfusion: { name: "procedure_blood_transfusion", type: "checkbox", step: 12, required: true },
  procedure_splinting: { name: "procedure_splinting", type: "checkbox", step: 12, required: true },
  procedure_wound_care: { name: "procedure_wound_care", type: "checkbox", step: 12, required: true },
  procedure_surgery: { name: "procedure_surgery", type: "checkbox", step: 12, required: true },
  procedure_surgery_type: { name: "procedure_surgery_type", type: "text", step: 12, required: false },
  procedure_other: { name: "procedure_other", type: "text", step: 12, required: false },

  // Step 13
  disposition: { name: "disposition", type: "select", step: 13, required: true, options: opts(["admitted", "discharged", "transferred", "died_er", "left_ama", "left_absconded"]) },
  disposition_department: { name: "disposition_department", type: "select", step: 13, required: false, options: opts(["surgery", "orthopedics", "neurosurgery", "icu", "pediatrics", "other"]) },
  disposition_transfer_to: { name: "disposition_transfer_to", type: "text", step: 13, required: false },
  disposition_date: { name: "disposition_date", type: "date", step: 13, required: true },
  disposition_time: { name: "disposition_time", type: "time", step: 13, required: true },

  // Step 14
  surgery_date: { name: "surgery_date", type: "date", step: 14, required: false },
  surgery_time: { name: "surgery_time", type: "time", step: 14, required: false },
  surgery_type: { name: "surgery_type", type: "select", step: 14, required: false, options: opts(["exploratory_laparotomy", "craniotomy", "thoracotomy", "orif", "amputation", "debridement", "other"]) },
  surgery_findings: { name: "surgery_findings", type: "textarea", step: 14, required: false },
  surgery_complications: { name: "surgery_complications", type: "checkbox", step: 14, required: false },
  surgery_complication_details: { name: "surgery_complication_details", type: "textarea", step: 14, required: false },

  // Step 15
  outcome: { name: "outcome", type: "select", step: 15, required: true, options: opts(["alive_discharge", "alive_transferred", "died_hospital", "died_or"]) },
  outcome_date: { name: "outcome_date", type: "date", step: 15, required: false },
  death_date: { name: "death_date", type: "date", step: 15, required: false },
  death_time: { name: "death_time", type: "time", step: 15, required: false },
  death_cause: { name: "death_cause", type: "textarea", step: 15, required: false },
  los_days: { name: "los_days", type: "computed", step: 15, required: false, computed: true },
  icu_days: { name: "icu_days", type: "number", step: 15, required: false, min: 0, inputMode: "numeric" },
  ventilator_days: { name: "ventilator_days", type: "number", step: 15, required: false, min: 0, inputMode: "numeric" },

  // Step 16
  record_status: { name: "record_status", type: "select", step: 16, required: true, options: opts(["draft", "complete", "verified"]) },
  created_by: { name: "created_by", type: "text", step: 16, required: true },
  created_at: { name: "created_at", type: "text", step: 16, required: true },
  updated_at: { name: "updated_at", type: "text", step: 16, required: true },
  verified_by: { name: "verified_by", type: "text", step: 16, required: false },
  verified_at: { name: "verified_at", type: "text", step: 16, required: false },
  sync_status: { name: "sync_status", type: "computed", step: 16, required: true },
  local_id: { name: "local_id", type: "text", step: 16, required: true },
  remote_id: { name: "remote_id", type: "text", step: 16, required: false },
};

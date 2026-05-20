import { NextRequest, NextResponse } from "next/server";

const REDCAP_API_URL = process.env.REDCAP_API_URL!;
const REDCAP_API_TOKEN = process.env.REDCAP_API_TOKEN!;

// Convert boolean → "1" / "0" for REDCap yesno fields
function boolToRedcap(val: unknown): string {
  if (val === true || val === 1 || val === "true") return "1";
  if (val === false || val === 0 || val === "false") return "0";
  return "";
}

// REDCap uses numeric codes for all dropdown/radio fields
const valueMap: Record<string, Record<string, string>> = {
  hospital_id: { hospital: "1", health_center: "2", trauma_center: "3", other: "4" },
  patient_age_unit: { years: "1", months: "2", days: "3" },
  patient_sex: { male: "1", female: "2", other: "3" },
  patient_ethnicity: { ladino: "1", maya: "2", garifuna: "3", xinca: "4", other: "5" },
  patient_referral_source: { self: "1", ambulance: "2", bomberos: "3", police: "4", other_hospital: "5", other: "6" },
  injury_setting: { urban: "1", rural: "2" },
  injury_location_type: { home: "1", road: "2", workplace: "3", school: "4", recreation: "5", public_place: "6", other: "7" },
  injury_intent: { unintentional: "1", assault: "2", self_harm: "3", legal_intervention: "4", conflict: "5", unknown: "6" },
  injury_mechanism: { road_traffic: "1", motorcycle: "2", fall: "3", burn: "4", firearm: "5", sharp_object: "6", blunt_object: "7", poisoning: "8", drowning: "9", hanging: "10", animal_bite: "11", other: "12" },
  injury_activity: { working: "1", traveling: "2", sports: "3", leisure: "4", sleeping: "5", other: "6" },
  rtc_role: { driver: "1", passenger: "2", pedestrian: "3", cyclist: "4", motorcyclist: "5", other: "6" },
  rtc_vehicle_type: { car: "1", pickup: "2", bus: "3", motorcycle: "4", bicycle: "5", heavy_vehicle: "6", other: "7" },
  rtc_counterpart: { car: "1", pickup: "2", bus: "3", motorcycle: "4", bicycle: "5", heavy_vehicle: "6", pedestrian: "7", fixed_object: "8", none: "9", other: "10" },
  violence_weapon: { firearm: "1", knife: "2", machete: "3", blunt_object: "4", body_parts: "5", other: "6" },
  violence_relationship: { stranger: "1", acquaintance: "2", family: "3", intimate_partner: "4", gang: "5", unknown: "6" },
  violence_location: { home: "1", street: "2", bar: "3", workplace: "4", other: "5" },
  prehospital_provider: { bomberos: "1", cruz_roja: "2", private_ambulance: "3", military: "4", bystander: "5", other: "6" },
  ph_tourniquet_correct: { yes: "1", no: "2", not_applicable: "3" },
  prehospital_spinal_correct: { yes: "1", no: "2", not_applicable: "3" },
  transport_type: { bombero_voluntario: "1", bombero_municipal: "2", private_vehicle: "3", ambulance: "4", police: "5", other: "6" },
  transport_respond_trained: { yes: "1", no: "2", unknown: "3" },
  notification_method: { respond_app: "1", phone: "2", radio: "3", none: "4" },
  triage_bombero: { red: "1", yellow: "2", green: "3", black: "4", none: "5" },
  triage_expert: { red: "1", yellow: "2", green: "3", black: "4" },
  triage_accuracy: { correct: "1", over_triage: "2", under_triage: "3" },
  arrival_avpu: { alert: "1", voice: "2", pain: "3", unresponsive: "4" },
  pupil_right_size: { small: "1", medium: "2", large: "3" },
  pupil_left_size: { small: "1", medium: "2", large: "3" },
  iss_category: { minor: "1", moderate: "2", serious: "3", severe: "4", critical: "5", unsurvivable: "6" },
  surgery_type: { exploratory_laparotomy: "1", craniotomy: "2", thoracotomy: "3", orif: "4", amputation: "5", debridement: "6", other: "7" },
  outcome: { alive_discharge: "1", alive_transferred: "2", died_hospital: "3", died_or: "4" },
  followup_30day_status: { alive: "1", dead: "2", lost_to_followup: "3" },
  followup_30day_destination: { home: "1", rehab: "2", other_hospital: "3", unknown: "4" },
  disposition: { admitted: "1", discharged: "2", transferred: "3", died_er: "4", left_ama: "5", left_absconded: "6" },
  disposition_department: { surgery: "1", orthopedics: "2", neurosurgery: "3", icu: "4", pediatrics: "5", other: "6" },
  record_status: { draft: "1", complete: "2", verified: "3" },
};

// Map our patient record to REDCap field format
// Field names match the Data Dictionary imported into REDCap (same snake_case names)
function mapToRedcap(data: Record<string, unknown>): Record<string, string> {
  const booleanFields = new Set([
    "motorcycle_helmet",
    "rtc_helmet", "rtc_seatbelt", "rtc_alcohol_suspected",
    "violence_alcohol_victim", "violence_reported_police",
    "prehospital_care", "prehospital_airway", "prehospital_iv",
    "prehospital_immobilization", "prehospital_cpr",
    "prehospital_tourniquet", "prehospital_wound_packing",
    "prehospital_notification", "notification_triage_sent",
    "pupil_right_reactive", "pupil_left_reactive", "pupil_equal",
    "diagnostics_xray", "diagnostics_ct", "diagnostics_ultrasound",
    "diagnostics_fast", "diagnostics_labs",
    "procedure_airway", "procedure_chest_tube", "procedure_central_line",
    "procedure_splinting", "procedure_wound_care",
    "procedure_surgery", "surgery_complications",
    // shortened names used in REDCap
    "viol_alcohol_perpetrator", "ph_hemorrhage_needed",
    "ph_direct_pressure", "proc_blood_transfusion",
  ]);

  // Fields to skip (internal/system fields not in REDCap Data Dictionary)
  const skipFields = new Set([
    "sync_status", "remote_id", "created_by", "updated_at",
    "verified_by", "verified_at", "audit_flag", "audit_notes",
    "id", "response_time_minutes", "deleted_at",
  ]);

  // Array fields serialized as JSON
  const arrayFields = new Set(["body_regions_affected", "injuries"]);

  // Fields renamed to fit REDCap's 26-char limit
  const fieldRenames: Record<string, string> = {
    violence_alcohol_perpetrator: "viol_alcohol_perpetrator",
    prehospital_hemorrhage_needed: "ph_hemorrhage_needed",
    prehospital_direct_pressure: "ph_direct_pressure",
    prehospital_tourniquet_correct: "ph_tourniquet_correct",
    procedure_blood_transfusion: "proc_blood_transfusion",
    surgery_complication_details: "surg_complication_dtls",
  };

  const record: Record<string, string> = {
    record_id: String(data.local_id ?? data.registry_number ?? ""),
  };

  // HH:MM time values — REDCap requires HH:MM:SS
  const timeRegex = /^\d{1,2}:\d{2}$/;

  for (const [rawKey, value] of Object.entries(data)) {
    const key = fieldRenames[rawKey] ?? rawKey;
    if (skipFields.has(rawKey) || value === undefined || value === null) continue;

    if (booleanFields.has(key)) {
      record[key] = boolToRedcap(value);
    } else if (arrayFields.has(key)) {
      record[key] = JSON.stringify(value);
    } else if (valueMap[key]) {
      const str = String(value);
      record[key] = valueMap[key][str] ?? str;
    } else {
      const str = String(value);
      record[key] = timeRegex.test(str) ? `${str}:00` : str;
    }
  }

  // REDCap requires a complete_status field per instrument
  record["trauma_registry_complete"] = "2"; // 2 = Complete

  return record;
}

export async function POST(req: NextRequest) {
  if (!REDCAP_API_URL || !REDCAP_API_TOKEN) {
    return NextResponse.json(
      { error: "REDCap not configured" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
    console.log("[REDCap] incoming record_id:", body.local_id ?? body.registry_number);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = mapToRedcap(body);
  console.log("[REDCap] mapped record keys:", Object.keys(record).join(", "));
  console.log("[REDCap] record_id value:", record.record_id);
  console.log("[REDCap] full record:", JSON.stringify(record));

  const params = new URLSearchParams({
    token: REDCAP_API_TOKEN,
    content: "record",
    format: "json",
    type: "flat",
    overwriteBehavior: "overwrite",
    forceAutoNumber: "false",
    data: JSON.stringify([record]),
    returnContent: "count",
    returnFormat: "json",
  });

  try {
    const response = await fetch(REDCAP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const rawText = await response.text();
    let result: Record<string, unknown>;
    try {
      result = JSON.parse(rawText);
    } catch {
      result = { raw: rawText };
    }

    if (!response.ok || (result as Record<string, unknown>).error) {
      console.error("[REDCap] API error (status", response.status, "):", JSON.stringify(result));
      return NextResponse.json(
        { error: (result as Record<string, unknown>).error ?? `REDCap HTTP ${response.status}` },
        { status: 502 }
      );
    }

    console.log("[REDCap] success, count:", (result as Record<string, unknown>).count);
    return NextResponse.json({ success: true, count: result.count });
  } catch (err) {
    console.error("REDCap fetch error:", err);
    return NextResponse.json({ error: "REDCap unreachable" }, { status: 502 });
  }
}

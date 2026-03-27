import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL = "https://sulpjbpwowijsvcovkdu.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bHBqYnB3b3dpanN2Y292a2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTQxNTEsImV4cCI6MjA4NjMzMDE1MX0.Bn8MVHzocq1PTefMIwT5sljjxOIhWijGAaXO8QeJuqY";

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.warn("⚠️  SUPABASE_SERVICE_KEY not set — using anon key (will fail if RLS is enabled)");
  console.warn("   Get it from: Supabase → Settings → API → service_role key");
  console.warn("   Run as: SUPABASE_SERVICE_KEY=\"your-key\" node scripts/seed-patients.mjs\n");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helpers ────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const maybe = (val, prob = 0.7) => Math.random() < prob ? val : undefined;
const isoDate = (daysAgo) => {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};
const timeStr = (h, m) => `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
const randTime = () => timeStr(rand(0, 23), rand(0, 59));

// Guatemala departments & municipalities with approximate GPS center
const locations = [
  { dept: "Guatemala", muni: "Guatemala City",          lat: 14.641, lng: -90.513 },
  { dept: "Guatemala", muni: "Mixco",                   lat: 14.631, lng: -90.604 },
  { dept: "Guatemala", muni: "Villa Nueva",             lat: 14.524, lng: -90.588 },
  { dept: "Guatemala", muni: "San Juan Sacatepéquez",   lat: 14.718, lng: -90.640 },
  { dept: "Sacatepéquez", muni: "Antigua Guatemala",   lat: 14.559, lng: -90.734 },
  { dept: "Chimaltenango", muni: "Chimaltenango",       lat: 14.661, lng: -90.820 },
  { dept: "Escuintla", muni: "Escuintla",               lat: 14.304, lng: -90.785 },
  { dept: "Quetzaltenango", muni: "Quetzaltenango",     lat: 14.835, lng: -91.518 },
  { dept: "Huehuetenango", muni: "Huehuetenango",       lat: 15.319, lng: -91.471 },
  { dept: "Alta Verapaz", muni: "Cobán",                lat: 15.470, lng: -90.379 },
];

// ISS calculation
function calcISS(regions) {
  const scores = Object.values(regions).filter(s => s > 0).sort((a,b) => b-a);
  if (scores.length === 0) return 0;
  if (scores[0] === 6) return 75;
  return scores.slice(0,3).reduce((s,v) => s + v*v, 0);
}
function issCategory(iss) {
  if (iss >= 75) return "unsurvivable";
  if (iss >= 50) return "critical";
  if (iss >= 25) return "severe";
  if (iss >= 16) return "serious";
  if (iss >= 9)  return "moderate";
  if (iss >= 1)  return "minor";
  return "minor";
}

// ── Patient generator ──────────────────────────────────────────────────────
function generatePatient(index, isComplete) {
  const daysAgo = rand(1, 180);
  const loc = pick(locations);
  const mechanism = pick(["road_traffic","motorcycle","motorcycle","road_traffic","fall","firearm","sharp_object","blunt_object","road_traffic","motorcycle"]);
  const isMotorcycle = mechanism === "motorcycle";
  const isRTC = mechanism === "road_traffic" || isMotorcycle;
  const intent = pick(["unintentional","unintentional","unintentional","assault","unintentional","self_harm"]);
  const age = rand(15, 72);
  const sex = pick(["male","male","male","female","male"]);
  const admDate = isoDate(daysAgo);
  const injDate = isoDate(daysAgo + rand(0,1));
  const responseTimeMinutes = rand(10, 90);
  const admTime = randTime();
  const injTime = randTime();

  // Vitals
  const sbp = rand(70, 170);
  const hr = rand(55, 145);
  const rr = rand(10, 35);
  const spo2 = rand(82, 100);
  const temp = randFloat(35.5, 39.5);
  const gcsEye = rand(1,4);
  const gcsVerbal = rand(1,5);
  const gcsMotor = rand(1,6);
  const gcsTotal = gcsEye + gcsVerbal + gcsMotor;

  // Injuries
  const injuryRegions = pick([
    ["extremities"],["head_neck","extremities"],["chest","extremities"],
    ["abdomen"],["head_neck"],["chest"],["extremities","external"],
    ["head_neck","chest","extremities"],
  ]);
  const aisMap = {};
  const injuries = [];
  for (const r of injuryRegions) {
    const sev = rand(1,4);
    aisMap[`ais_${r}`] = sev;
    injuries.push({ region: r, description: pick(["laceration","fracture","contusion","hematoma","abrasion"]), ais_severity: sev });
  }
  const issScore = calcISS(aisMap);
  const issCategory_ = issCategory(issScore);
  const los = rand(0, 21);
  const outcome = issScore >= 50 ? "died_hospital" : pick(["alive_discharge","alive_discharge","alive_discharge","alive_transferred","died_hospital"]);
  const died = outcome.startsWith("died");

  // RESPOND variables
  const transportType = pick(["bombero_voluntario","bombero_voluntario","bombero_voluntario","bombero_municipal","private_vehicle","ambulance"]);
  const isBombero = transportType.includes("bombero");
  const respondTrained = isBombero ? pick(["yes","yes","yes","no","unknown"]) : "no";
  const notified = isBombero ? pick([true,true,true,false]) : pick([false,false,true]);
  const triageBombero = notified ? pick(["red","yellow","green","black"]) : undefined;
  const triageExpert = pick(["red","yellow","green"]);
  let triageAccuracy;
  if (triageBombero && triageExpert) {
    const sev = {green:1,yellow:2,red:3,black:4};
    const b = sev[triageBombero]??0, e = sev[triageExpert]??0;
    triageAccuracy = b===e ? "correct" : b>e ? "over_triage" : "under_triage";
  }

  const traumaTeamTime = timeStr(parseInt(admTime.split(":")[0]), parseInt(admTime.split(":")[1]) + rand(5,45));
  const timeToTeamMin = rand(5,45);

  const hasTourniquet = injuries.some(i => i.region === "extremities") && Math.random() > 0.3;
  const hemorrhageNeeded = hasTourniquet || Math.random() > 0.6;

  // Surgery
  const hadSurgery = issScore >= 9 && Math.random() > 0.4;
  const surgDate = isoDate(daysAgo - rand(0,2));

  // Outcome date
  const outcomeDate = isoDate(daysAgo - los);

  // Base complete patient
  const base = {
    local_id: randomUUID(),
    record_status: "complete",
    created_by: null,
    created_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    sync_status: "synced",

    // Step 1
    hospital_id: "hospital_roosevelt",
    registry_number: `RR-2026-${String(index).padStart(4,"0")}`,
    admission_date: admDate,
    admission_time: admTime,

    // Step 2
    patient_age: age,
    patient_age_unit: "years",
    patient_sex: sex,
    patient_ethnicity: pick(["ladino","maya","ladino","ladino","maya","garifuna"]),
    patient_municipality: loc.muni,
    patient_department: loc.dept,
    patient_referral_source: isBombero ? "bomberos" : pick(["self","ambulance","other_hospital"]),

    // Step 3
    injury_date: injDate,
    injury_time: injTime,
    injury_setting: loc.dept === "Guatemala" ? "urban" : pick(["urban","rural"]),
    injury_lat: parseFloat((loc.lat + (Math.random() - 0.5) * 0.05).toFixed(5)),
    injury_lng: parseFloat((loc.lng + (Math.random() - 0.5) * 0.05).toFixed(5)),
    response_time_minutes: responseTimeMinutes,
    injury_location_type: pick(["road","road","road","home","workplace","public_place"]),
    injury_intent: intent,
    injury_mechanism: mechanism,
    injury_activity: pick(["traveling","working","leisure","traveling","traveling"]),
    motorcycle_helmet: isMotorcycle ? pick([true,false,false]) : undefined,

    // Step 4 – RTC
    ...(isRTC ? {
      rtc_role: isMotorcycle ? "motorcyclist" : pick(["driver","passenger","pedestrian","motorcyclist"]),
      rtc_vehicle_type: isMotorcycle ? "motorcycle" : pick(["car","pickup","motorcycle","bus"]),
      rtc_counterpart: pick(["car","motorcycle","fixed_object","pedestrian","bus"]),
      rtc_alcohol_suspected: Math.random() > 0.7,
      rtc_helmet: isMotorcycle ? pick([true,false,false]) : undefined,
      rtc_seatbelt: !isMotorcycle ? pick([true,false]) : undefined,
    } : {}),

    // Step 5 – Violence
    ...(intent === "assault" || intent === "self_harm" ? {
      violence_weapon: pick(["firearm","knife","machete","blunt_object","body_parts"]),
      violence_relationship: pick(["stranger","acquaintance","family","gang"]),
      violence_location: pick(["street","home","bar","workplace"]),
      violence_alcohol_victim: Math.random() > 0.5,
      violence_alcohol_perpetrator: intent === "assault" ? Math.random() > 0.5 : undefined,
      violence_reported_police: Math.random() > 0.4,
    } : {}),

    // Step 6 – Prehospital
    prehospital_care: true,
    prehospital_provider: isBombero ? transportType : "private_ambulance",
    prehospital_time_minutes: rand(5, 60),
    prehospital_airway: gcsTotal < 9 && Math.random() > 0.3,
    prehospital_iv: Math.random() > 0.4,
    prehospital_immobilization: isRTC && Math.random() > 0.3,
    prehospital_cpr: died && Math.random() > 0.7,
    prehospital_hemorrhage_needed: hemorrhageNeeded,
    prehospital_tourniquet: hemorrhageNeeded && hasTourniquet,
    prehospital_wound_packing: hemorrhageNeeded && Math.random() > 0.5,
    prehospital_direct_pressure: hemorrhageNeeded && Math.random() > 0.4,
    prehospital_tourniquet_correct: hasTourniquet ? pick(["yes","yes","no"]) : undefined,
    prehospital_spinal_correct: isRTC ? pick(["yes","yes","no","not_applicable"]) : undefined,

    // Step 7 – Transport & Notification
    transport_type: transportType,
    transport_respond_trained: respondTrained,
    transport_bombero_company: isBombero ? pick(["Compañía 1","Compañía 4","Compañía 7","Compañía 11","Compañía 15"]) : undefined,
    prehospital_notification: notified,
    notification_method: notified ? pick(["respond_app","phone","respond_app","radio"]) : undefined,
    notification_time: notified ? randTime() : undefined,
    notification_triage_sent: notified ? Math.random() > 0.4 : undefined,
    triage_bombero: triageBombero,
    triage_expert: triageExpert,
    triage_accuracy: triageAccuracy,

    // Step 8 – Arrival Assessment
    arrival_gcs_eye: gcsEye,
    arrival_gcs_verbal: gcsVerbal,
    arrival_gcs_motor: gcsMotor,
    arrival_gcs_total: gcsTotal,
    arrival_avpu: gcsTotal >= 14 ? "alert" : gcsTotal >= 10 ? "voice" : gcsTotal >= 6 ? "pain" : "unresponsive",
    arrival_systolic_bp: sbp,
    arrival_diastolic_bp: rand(40, sbp-10),
    arrival_heart_rate: hr,
    arrival_respiratory_rate: rr,
    arrival_spo2: spo2,
    arrival_temperature: temp,
    arrival_shock_index: parseFloat((hr/sbp).toFixed(2)),
    time_trauma_team: traumaTeamTime,
    time_to_trauma_team_min: timeToTeamMin,

    // Step 9 – Pupils
    pupil_right_size: pick(["small","medium","large"]),
    pupil_right_reactive: Math.random() > 0.15,
    pupil_left_size: pick(["small","medium","large"]),
    pupil_left_reactive: Math.random() > 0.15,

    // Step 10 – Body/Injuries/ISS
    body_regions_affected: injuryRegions,
    injuries: injuries,
    number_of_injuries: injuries.length,
    ...aisMap,
    iss_score: issScore,
    iss_category: issCategory_,

    // Step 11 – Diagnostics
    diagnostics_xray: Math.random() > 0.2,
    diagnostics_ct: issScore >= 9 && Math.random() > 0.3,
    diagnostics_ultrasound: Math.random() > 0.5,
    diagnostics_fast: Math.random() > 0.4,
    diagnostics_labs: Math.random() > 0.3,
    diagnostics_other: Math.random() > 0.8 ? "Angiography" : undefined,

    // Step 12 – Procedures
    procedure_airway: gcsTotal < 9,
    procedure_chest_tube: injuries.some(i=>i.region==="chest") && Math.random() > 0.5,
    procedure_central_line: Math.random() > 0.6,
    procedure_blood_transfusion: (sbp < 90 || issScore >= 16) && Math.random() > 0.3,
    procedure_splinting: injuries.some(i=>i.region==="extremities"),
    procedure_wound_care: Math.random() > 0.4,
    procedure_surgery: hadSurgery,
    procedure_surgery_type: hadSurgery ? pick(["exploratory_laparotomy","craniotomy","orif","debridement","thoracotomy"]) : undefined,

    // Step 13 – Surgery details
    ...(hadSurgery ? {
      surgery_date: surgDate,
      surgery_time: randTime(),
      surgery_type: pick(["exploratory_laparotomy","craniotomy","orif","debridement"]),
      surgery_findings: pick(["Hemoperitoneum","Epidural hematoma","Femur fracture","Laceration hepática","Multiple rib fractures"]),
      surgery_complications: Math.random() > 0.7,
    } : {}),

    // Step 14 – Outcome
    outcome: outcome,
    outcome_date: outcomeDate,
    ...(died ? { death_date: outcomeDate, death_time: randTime(), death_cause: pick(["hemorrhagic shock","traumatic brain injury","sepsis","multiple organ failure"]) } : {}),
    los_days: los,
    icu_days: issScore >= 16 ? rand(0, los) : 0,
    ventilator_days: gcsTotal < 9 ? rand(0, 5) : 0,
    time_blood_transfusion: (sbp < 90 || issScore >= 16) ? randTime() : undefined,
    time_to_transfusion_min: (sbp < 90 || issScore >= 16) ? rand(15, 120) : undefined,
    time_airway_intervention: gcsTotal < 9 ? randTime() : undefined,
    time_to_airway_min: gcsTotal < 9 ? rand(5, 30) : undefined,
    followup_30day_status: Math.random() > 0.2 ? (died ? "dead" : "alive") : "lost_to_followup",
    followup_30day_destination: !died ? pick(["home","home","rehab","other_hospital"]) : undefined,

    // Step 15 – Disposition
    disposition: died ? "died_er" : pick(["admitted","admitted","discharged","transferred"]),
    disposition_department: !died ? pick(["surgery","orthopedics","icu","neurosurgery"]) : undefined,
    disposition_date: admDate,
    disposition_time: randTime(),

    // Step 16 – Record Info
    audit_flag: pick(["pending","pending","audited","audited","needs_correction"]),
    data_collector_id: pick(["DC-001","DC-002","DC-003"]),
  };

  if (isComplete) return base;

  // ── Incomplete patients: randomly drop 30–60% of non-essential fields ──
  const droppable = [
    "patient_ethnicity","patient_municipality","patient_department",
    "injury_time","injury_setting","injury_activity",
    "prehospital_time_minutes","prehospital_iv","prehospital_cpr",
    "prehospital_hemorrhage_needed","prehospital_tourniquet","prehospital_wound_packing",
    "transport_respond_trained","transport_bombero_company",
    "prehospital_notification","notification_method","notification_triage_sent",
    "triage_bombero","triage_expert","triage_accuracy",
    "arrival_gcs_eye","arrival_gcs_verbal","arrival_gcs_motor","arrival_gcs_total",
    "arrival_spo2","arrival_temperature","arrival_shock_index",
    "pupil_right_size","pupil_right_reactive","pupil_left_size","pupil_left_reactive",
    "diagnostics_ct","diagnostics_fast","diagnostics_labs",
    "time_trauma_team","time_to_trauma_team_min",
    "followup_30day_status","followup_30day_destination",
    "audit_flag","data_collector_id",
    "iss_score","iss_category",
  ];
  const dropCount = rand(Math.floor(droppable.length*0.3), Math.floor(droppable.length*0.6));
  const toDrop = [...droppable].sort(() => Math.random()-0.5).slice(0, dropCount);
  const partial = { ...base, record_status: "draft" };
  for (const k of toDrop) delete partial[k];
  return partial;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Generating 100 test patients for RESPOND Guatemala...\n");

  const patients = [];
  for (let i = 1; i <= 75; i++) patients.push(generatePatient(i, true));
  for (let i = 76; i <= 100; i++) patients.push(generatePatient(i, false));

  console.log(`✓ Generated: 75 complete + 25 incomplete patients`);
  console.log(`  Pushing to Supabase...\n`);

  let pushed = 0, errors = 0;
  for (const patient of patients) {
    const { error } = await supabase.from("patients").upsert(patient, { onConflict: "local_id" });
    if (error) {
      console.error(`  ✗ Error on ${patient.registry_number}:`, error.message);
      errors++;
    } else {
      pushed++;
      if (pushed % 10 === 0) console.log(`  ✓ ${pushed}/100 pushed...`);
    }
  }

  console.log(`\n✅ Done! ${pushed} patients pushed to Supabase. ${errors} errors.`);
  if (errors > 0) console.log("  (Errors may be due to missing columns — run the updated migration.sql first)");
}

main().catch(console.error);

import { v4 as uuidv4 } from "uuid";
import type { LocalPatient } from "@/lib/db";

// Guatemala City center + surrounding zones
const GC_CENTER = { lat: 14.6349, lng: -90.5069 };

function randCoord() {
  // Normally distributed around city center, ~8km radius
  const r = Math.abs(gauss()) * 0.06;
  const angle = Math.random() * 2 * Math.PI;
  return {
    lat: parseFloat((GC_CENTER.lat + r * Math.cos(angle)).toFixed(6)),
    lng: parseFloat((GC_CENTER.lng + r * Math.sin(angle)).toFixed(6)),
  };
}

function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString().slice(0, 10);
}

function randTime(): string {
  const h = randInt(0, 23).toString().padStart(2, "0");
  const m = randInt(0, 59).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function addMinutes(date: string, time: string, mins: number): { date: string; time: string } {
  const dt = new Date(`${date}T${time}:00`);
  dt.setMinutes(dt.getMinutes() + mins);
  return {
    date: dt.toISOString().slice(0, 10),
    time: dt.toISOString().slice(11, 16),
  };
}

const HOSPITALS = ["hospital_roosevelt", "hospital_san_juan", "igss_zona_9"];
const MECHANISMS = [
  "road_traffic", "road_traffic", "road_traffic", "road_traffic", // 40%
  "fall", "fall", "fall",                                          // 20% (approx)
  "firearm", "firearm",                                            // ~13%
  "sharp_object", "sharp_object",                                  // ~13%
  "blunt_object",                                                  // ~7%
  "burn",                                                          // ~7%
];
const INTENTS = [
  "unintentional", "unintentional", "unintentional", "unintentional", "unintentional",
  "assault", "assault", "assault",
  "self_harm",
  "unknown",
];
const ACTIVITIES = ["working", "traveling", "sports", "leisure", "other"];
const LOCATIONS = ["road", "home", "workplace", "public_place", "recreation"];
const SETTINGS = ["urban", "urban", "urban", "rural"];
const DEPARTMENTS = ["Guatemala", "Guatemala", "Guatemala", "Escuintla", "Sacatepéquez", "Quetzaltenango"];
const ETHNICITIES = ["ladino", "ladino", "ladino", "maya", "maya", "garifuna", "xinca"];
const REFERRALS = ["ambulance", "bomberos", "self", "police", "other_hospital"];
const DISPOSITIONS = ["ward", "ward", "icu", "icu", "home", "transfer", "operating_room"];
const OUTCOMES = [
  "discharged", "discharged", "discharged", "discharged", "discharged",
  "discharged", "discharged", "discharged", "discharged",
  "died_ed", "died_ward",
  "transferred",
];

function calcISS(regions: number[]): number {
  const top3 = regions.sort((a, b) => b - a).slice(0, 3);
  return top3.reduce((s, v) => s + v * v, 0);
}

export function generateFakePatients(count = 100, userId = "demo-user"): LocalPatient[] {
  const patients: LocalPatient[] = [];

  for (let i = 0; i < count; i++) {
    const localId = uuidv4();
    const injuryDate = randDate(365);
    const injuryTime = randTime();
    const responseMinutes = randInt(15, 180);
    const { date: admDate, time: admTime } = addMinutes(injuryDate, injuryTime, responseMinutes);

    const age = randInt(15, 75);
    const sex = Math.random() < 0.75 ? "male" : "female";
    const mechanism = pick(MECHANISMS);
    const intent = pick(INTENTS);
    const coords = randCoord();

    // AIS scores per region
    const aisHead = pick([0, 0, 1, 2, 3, 4]);
    const aisFace = pick([0, 0, 1, 2]);
    const aisChest = pick([0, 0, 1, 2, 3]);
    const aisAbdomen = pick([0, 0, 1, 2, 3]);
    const aisExtremities = pick([0, 0, 1, 2, 3, 4]);
    const aisExternal = pick([0, 0, 1]);
    const iss = calcISS([aisHead, aisFace, aisChest, aisAbdomen, aisExtremities, aisExternal]);
    const issCategory =
      iss <= 8 ? "minor" : iss <= 15 ? "moderate" : iss <= 24 ? "severe" : "critical";

    const gcsEye = pick([1, 2, 3, 3, 4, 4, 4]);
    const gcsVerbal = pick([1, 2, 3, 4, 5, 5, 5]);
    const gcsMotor = pick([1, 2, 3, 4, 5, 6, 6, 6]);
    const gcsTotal = gcsEye + gcsVerbal + gcsMotor;

    const outcome = pick(OUTCOMES);
    const losDays = outcome.startsWith("died") ? randInt(0, 5) : randInt(1, 21);
    const icuDays = ["icu"].includes(pick(DISPOSITIONS)) ? randInt(1, 10) : 0;

    const hasSurgery = Math.random() < 0.25;
    const registryNumber = `GT-${String(i + 1).padStart(4, "0")}`;
    const createdAt = new Date(`${admDate}T${admTime}:00`).toISOString();

    const data: Record<string, unknown> = {
      local_id: localId,
      created_by: userId,
      created_at: createdAt,
      updated_at: createdAt,
      record_status: "complete",
      sync_status: "pending",

      // Step 1
      hospital_id: pick(HOSPITALS),
      registry_number: registryNumber,
      admission_date: admDate,
      admission_time: admTime,

      // Step 2
      patient_age: age,
      patient_age_unit: "years",
      patient_sex: sex,
      patient_ethnicity: pick(ETHNICITIES),
      patient_municipality: "Guatemala",
      patient_department: pick(DEPARTMENTS),
      patient_referral_source: pick(REFERRALS),

      // Step 3
      injury_date: injuryDate,
      injury_time: injuryTime,
      injury_setting: pick(SETTINGS),
      injury_location_type: pick(LOCATIONS),
      injury_intent: intent,
      injury_mechanism: mechanism,
      injury_activity: pick(ACTIVITIES),
      injury_lat: coords.lat,
      injury_lng: coords.lng,
      response_time_minutes: responseMinutes,

      // Step 7 — vitals
      arrival_gcs_eye: gcsEye,
      arrival_gcs_verbal: gcsVerbal,
      arrival_gcs_motor: gcsMotor,
      arrival_gcs_total: gcsTotal,
      arrival_systolic_bp: randInt(80, 160),
      arrival_diastolic_bp: randInt(50, 100),
      arrival_heart_rate: randInt(55, 130),
      arrival_respiratory_rate: randInt(12, 30),
      arrival_spo2: randInt(88, 100),

      // Step 10 — ISS
      ais_head_neck: aisHead,
      ais_face: aisFace,
      ais_chest: aisChest,
      ais_abdomen: aisAbdomen,
      ais_extremities: aisExtremities,
      ais_external: aisExternal,
      iss_score: iss,
      iss_category: issCategory,

      // Step 12 — procedures
      procedure_surgery: hasSurgery,

      // Step 13 — disposition
      disposition: pick(DISPOSITIONS),

      // Step 15 — outcome
      outcome,
      los_days: losDays,
      icu_days: icuDays,
      ventilator_days: icuDays > 0 ? randInt(0, icuDays) : 0,
    };

    patients.push({
      localId,
      data,
      currentStep: 16,
      status: "complete",
      syncStatus: "pending",
      createdBy: userId,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return patients;
}

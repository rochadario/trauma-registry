export interface Calculation {
  field: string;
  dependencies: string[];
  calculate: (values: Record<string, unknown>) => unknown;
}


/**
 * Returns the difference in whole minutes between two HH:mm strings on the same date.
 */
function diffMinutes(dateStr: unknown, startTime: unknown, endTime: unknown): number | null {
  if (typeof dateStr !== "string" || typeof startTime !== "string" || typeof endTime !== "string") return null;
  if (!dateStr || !startTime || !endTime) return null;
  const start = new Date(`${dateStr}T${startTime}:00`);
  const end = new Date(`${dateStr}T${endTime}:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const diff = Math.round((end.getTime() - start.getTime()) / 60000);
  return diff >= 0 ? diff : null;
}

/**
 * Returns the difference in whole days between two ISO date strings.
 */
function diffDays(startDate: unknown, endDate: unknown): number | null {
  if (typeof startDate !== "string" || typeof endDate !== "string") return null;
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}




export const calculations: Calculation[] = [
  // 1. GCS Total = Eye + Verbal + Motor
  {
    field: "arrival_gcs_total",
    dependencies: [
      "arrival_gcs_eye",
      "arrival_gcs_verbal",
      "arrival_gcs_motor",
    ],
    calculate: (values) => {
      const eye = Number(values.arrival_gcs_eye);
      const verbal = Number(values.arrival_gcs_verbal);
      const motor = Number(values.arrival_gcs_motor);
      if (isNaN(eye) || isNaN(verbal) || isNaN(motor)) return undefined;
      const total = eye + verbal + motor;
      return total >= 3 && total <= 15 ? total : undefined;
    },
  },

  // 2. Shock Index = Heart Rate / Systolic BP
  {
    field: "arrival_shock_index",
    dependencies: ["arrival_heart_rate", "arrival_systolic_bp"],
    calculate: (values) => {
      const hr = Number(values.arrival_heart_rate);
      const sbp = Number(values.arrival_systolic_bp);
      if (isNaN(hr) || isNaN(sbp) || sbp === 0) return undefined;
      return Math.round((hr / sbp) * 100) / 100;
    },
  },

  // 3. Pupil Equality
  {
    field: "pupil_equal",
    dependencies: [
      "pupil_right_size",
      "pupil_right_reactive",
      "pupil_left_size",
      "pupil_left_reactive",
    ],
    calculate: (values) => {
      const rightSize = values.pupil_right_size;
      const leftSize = values.pupil_left_size;
      const rightReactive = values.pupil_right_reactive;
      const leftReactive = values.pupil_left_reactive;
      if (
        rightSize === undefined ||
        leftSize === undefined ||
        rightReactive === undefined ||
        leftReactive === undefined
      ) {
        return undefined;
      }
      return rightSize === leftSize && rightReactive === leftReactive;
    },
  },

  // 4. Number of Injuries
  {
    field: "number_of_injuries",
    dependencies: ["injuries"],
    calculate: (values) => {
      const injuries = values.injuries;
      if (!Array.isArray(injuries)) return 0;
      return injuries.length;
    },
  },

  // 5a–5e. Auto-populate AIS per region from max injury AIS severity
  ...["head_neck", "chest", "abdomen", "extremities", "external"].map((region) => ({
    field: `ais_${region}`,
    dependencies: ["injuries"],
    calculate: (values: Record<string, unknown>) => {
      const injuries = values.injuries as { region: string; ais_severity: number }[] | undefined;
      if (!Array.isArray(injuries)) return 0;
      const regionInjuries = injuries.filter((inj) => inj.region === region);
      if (regionInjuries.length === 0) return 0;
      return Math.max(...regionInjuries.map((inj) => Number(inj.ais_severity) || 0));
    },
  })),

  // 5. ISS Score = sum of squares of the 3 highest AIS region scores
  {
    field: "iss_score",
    dependencies: [
      "ais_head_neck",
      "ais_face",
      "ais_chest",
      "ais_abdomen",
      "ais_extremities",
      "ais_external",
    ],
    calculate: (values) => {
      const aisFields = [
        "ais_head_neck",
        "ais_face",
        "ais_chest",
        "ais_abdomen",
        "ais_extremities",
        "ais_external",
      ];
      const scores = aisFields
        .map((f) => Number(values[f]))
        .filter((n) => !isNaN(n) && n > 0)
        .sort((a, b) => b - a);

      if (scores.length === 0) return 0;

      // If any region has AIS 6 (unsurvivable), ISS is automatically 75
      if (scores[0] === 6) return 75;

      const top3 = scores.slice(0, 3);
      return top3.reduce((sum, score) => sum + score * score, 0);
    },
  },

  // 6. ISS Category
  {
    field: "iss_category",
    dependencies: ["iss_score"],
    calculate: (values) => {
      const iss = Number(values.iss_score);
      if (isNaN(iss)) return undefined;
      if (iss >= 75) return "unsurvivable";
      if (iss >= 50) return "critical";
      if (iss >= 25) return "severe";
      if (iss >= 16) return "serious";
      if (iss >= 9) return "moderate";
      if (iss >= 1) return "minor";
      return undefined;
    },
  },

  // 7. Length of Stay (days)
  {
    field: "los_days",
    dependencies: ["admission_date", "outcome_date"],
    calculate: (values) => {
      const days = diffDays(values.admission_date, values.outcome_date);
      return days !== null && days >= 0 ? days : undefined;
    },
  },

  // 8. Triage Accuracy (bombero vs expert)
  {
    field: "triage_accuracy",
    dependencies: ["triage_bombero", "triage_expert"],
    calculate: (values) => {
      const bombero = values.triage_bombero as string | undefined;
      const expert = values.triage_expert as string | undefined;
      if (!bombero || !expert || bombero === "none") return undefined;
      const severity: Record<string, number> = { green: 1, yellow: 2, red: 3, black: 4 };
      const bScore = severity[bombero] ?? 0;
      const eScore = severity[expert] ?? 0;
      if (bScore === eScore) return "correct";
      if (bScore > eScore) return "over_triage";
      return "under_triage";
    },
  },

  // 9. Time to Trauma Team (minutes from admission)
  {
    field: "time_to_trauma_team_min",
    dependencies: ["admission_date", "admission_time", "time_trauma_team"],
    calculate: (values) => {
      const m = diffMinutes(values.admission_date, values.admission_time, values.time_trauma_team);
      return m !== null ? m : undefined;
    },
  },

  // 10. Time to Transfusion (minutes from admission)
  {
    field: "time_to_transfusion_min",
    dependencies: ["admission_date", "admission_time", "time_blood_transfusion"],
    calculate: (values) => {
      const m = diffMinutes(values.admission_date, values.admission_time, values.time_blood_transfusion);
      return m !== null ? m : undefined;
    },
  },

  // 11. Time to Airway Intervention (minutes from admission)
  {
    field: "time_to_airway_min",
    dependencies: ["admission_date", "admission_time", "time_airway_intervention"],
    calculate: (values) => {
      const m = diffMinutes(values.admission_date, values.admission_time, values.time_airway_intervention);
      return m !== null ? m : undefined;
    },
  },

];

/**
 * Returns the calculation definition for a given target field, if any.
 */
export function getCalculation(field: string): Calculation | undefined {
  return calculations.find((c) => c.field === field);
}

/**
 * Returns all calculations that depend on a given source field.
 * Useful for determining which fields to recalculate when a value changes.
 */
export function getDependentCalculations(sourceField: string): Calculation[] {
  return calculations.filter((c) => c.dependencies.includes(sourceField));
}

/**
 * Runs all calculations against the current values and returns an object
 * containing only the computed fields and their new values.
 */
export function runAllCalculations(
  values: Record<string, unknown>
): Record<string, unknown> {
  const results: Record<string, unknown> = {};

  for (const calc of calculations) {
    const result = calc.calculate({ ...values, ...results });
    if (result !== undefined) {
      results[calc.field] = result;
    }
  }

  return results;
}

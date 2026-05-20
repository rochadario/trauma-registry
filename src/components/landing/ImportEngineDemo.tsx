"use client";

import { useState } from "react";
import { Upload, ArrowRight, BarChart2, CheckCircle2, FileSpreadsheet } from "lucide-react";

const MAPPING_ROWS = [
  { your: "age", standard: "Age", mapped: true },
  { your: "gcs", standard: "GCS Total", mapped: true },
  { your: "mechanism", standard: "Injury Mechanism", mapped: true },
  { your: "outcome", standard: "Outcome", mapped: true },
  { your: "sbp", standard: "Systolic BP", mapped: true },
  { your: "iss_score", standard: "ISS", mapped: true },
];

function UploadStep({ isEs }: { isEs: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Drop zone */}
      <div className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center transition-colors hover:border-red-300 hover:bg-red-50/30">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
          <FileSpreadsheet className="h-7 w-7 text-red-500" />
        </div>
        <p className="mb-1 text-sm font-semibold text-slate-800">
          {isEs ? "Arrastra tu archivo aquí" : "Drop your file here"}
        </p>
        <p className="text-xs text-slate-500">
          {isEs ? "CSV, Excel o exportación de REDCap" : "CSV, Excel, or REDCap export"}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {["CSV", "XLSX", "REDCap", "SPSS"].map((fmt) => (
            <span
              key={fmt}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Example file badge */}
      <div className="flex w-full items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">trauma_data_legacy_2019_2024.xlsx</p>
          <p className="text-xs text-slate-500">2.4 MB · 847 rows · 34 columns</p>
        </div>
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
    </div>
  );
}

function MapStep({ isEs }: { isEs: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {isEs ? "Mapeo de columnas — coincidencia automática" : "Column mapping — auto-matched"}
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <span>{isEs ? "Tu columna" : "Your column"}</span>
          <span />
          <span>{isEs ? "Campo estándar" : "Standard field"}</span>
        </div>
        {MAPPING_ROWS.map((row) => (
          <div
            key={row.your}
            className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-slate-50 px-4 py-2.5 last:border-0"
          >
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
              {row.your}
            </span>
            <ArrowRight className="mx-2 h-3.5 w-3.5 shrink-0 text-red-400" />
            <span className="text-xs font-medium text-slate-800">{row.standard}</span>
          </div>
        ))}
      </div>

      {/* Match summary */}
      <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-4 py-3">
        <span className="text-xs text-slate-600">
          {isEs ? "Columnas mapeadas automáticamente" : "Auto-matched columns"}
        </span>
        <span className="text-sm font-bold text-green-700">28 / 34</span>
      </div>
    </div>
  );
}

function AnalyticsStep({ isEs }: { isEs: boolean }) {
  const stats = isEs
    ? [
        { value: "847", label: "Pacientes importados", color: "text-red-600", bg: "bg-red-50 border-red-100" },
        { value: "94%", label: "Cobertura O/E", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
        { value: "3", label: "Centros comparando", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
      ]
    : [
        { value: "847", label: "patients imported", color: "text-red-600", bg: "bg-red-50 border-red-100" },
        { value: "94%", label: "O/E coverage", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
        { value: "3", label: "centers comparing", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
      ];

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`flex flex-col items-center rounded-xl border p-4 ${s.bg}`}>
            <span className={`text-2xl font-black leading-none ${s.color}`}>{s.value}</span>
            <span className="mt-1.5 text-center text-[10px] font-medium leading-snug text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Completeness bars */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {isEs ? "Completitud por campo" : "Field completeness"}
        </p>
        {[
          { label: isEs ? "Mecanismo" : "Mechanism", pct: 98 },
          { label: isEs ? "Signos vitales" : "Vitals", pct: 91 },
          { label: "GCS", pct: 87 },
          { label: "ISS", pct: 76 },
        ].map((f) => (
          <div key={f.label} className="mb-2 last:mb-0">
            <div className="mb-0.5 flex justify-between">
              <span className="text-[11px] text-slate-500">{f.label}</span>
              <span className={`text-[11px] font-bold ${f.pct >= 90 ? "text-green-600" : f.pct >= 80 ? "text-amber-600" : "text-red-500"}`}>
                {f.pct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${f.pct >= 90 ? "bg-green-500" : f.pct >= 80 ? "bg-amber-400" : "bg-red-500"}`}
                style={{ width: `${f.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Export ready */}
      <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">
            {isEs ? "Listo para comparación multicéntrica" : "Ready for multicenter comparison"}
          </span>
        </div>
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
      </div>
    </div>
  );
}

const STEPS = [
  { id: "upload", icon: Upload },
  { id: "map", icon: ArrowRight },
  { id: "analytics", icon: BarChart2 },
];

interface ImportEngineDemoProps {
  isEs: boolean;
}

export function ImportEngineDemo({ isEs }: ImportEngineDemoProps) {
  const [active, setActive] = useState(0);

  const stepLabels = isEs
    ? ["Subir archivo", "Mapear columnas", "Ver análisis"]
    : ["Upload", "Map", "Analytics"];

  const stepDescs = isEs
    ? [
        "Arrastra un CSV, Excel o exportación de REDCap",
        "Las columnas se mapean automáticamente al estándar OTR",
        "Visualiza completitud y compara con otros centros",
      ]
    : [
        "Drag in a CSV, Excel, or REDCap export",
        "Columns are auto-matched to the OTR standard",
        "See completeness and compare across centers",
      ];

  return (
    <section id="import-engine" className="bg-[#f2f2f4] py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-red-600">
            {isEs ? "Motor de importación" : "Import Engine"}
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {isEs
              ? "Importa cualquier base de datos existente en minutos."
              : "Import any existing dataset in minutes."}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500 leading-relaxed">
            {isEs
              ? "Trae exportaciones de REDCap, archivos Excel o registros heredados. El motor de importación mapea tus columnas automáticamente al estándar OpenTrauma."
              : "Bring REDCap exports, Excel files, or legacy registries. The import engine automatically maps your columns to the OpenTrauma standard."}
          </p>
        </div>

        {/* Interactive showcase */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-[280px_1fr]">
          {/* Left — step selector */}
          <div className="divide-y divide-slate-100 border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActive(i)}
                  className={`flex w-full items-start gap-4 px-6 py-5 text-left transition-colors ${
                    active === i
                      ? "bg-white"
                      : "hover:bg-white/60"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      active === i
                        ? "bg-red-600 text-white"
                        : i < active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {i < active ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold leading-snug transition-colors ${
                        active === i ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {isEs ? `Paso ${i + 1}` : `Step ${i + 1}`} — {stepLabels[i]}
                    </p>
                    <p
                      className={`mt-0.5 text-xs leading-relaxed transition-colors ${
                        active === i ? "text-slate-500" : "text-slate-300"
                      }`}
                    >
                      {stepDescs[i]}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 px-6 py-4">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    active === i ? "w-6 bg-red-500" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right — visual panel */}
          <div className="p-6 sm:p-8">
            {active === 0 && <UploadStep isEs={isEs} />}
            {active === 1 && <MapStep isEs={isEs} />}
            {active === 2 && <AnalyticsStep isEs={isEs} />}

            {/* Next step button */}
            {active < STEPS.length - 1 && (
              <button
                onClick={() => setActive(active + 1)}
                className="mt-6 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                {isEs ? "Siguiente paso" : "Next step"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {active === STEPS.length - 1 && (
              <button
                onClick={() => setActive(0)}
                className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {isEs ? "Reiniciar demo" : "Restart demo"}
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, WifiOff, Download } from "lucide-react";

export interface FeatureItem {
  title: string;
  desc: string;
}

function OfflineVisual() {
  return (
    <div className="w-full max-w-[280px] space-y-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-amber-400">Offline — 3 records pending</span>
        </div>
        {["Trauma case #247", "Trauma case #248", "Trauma case #249"].map((c) => (
          <div key={c} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
            <span className="text-xs text-slate-400">{c}</span>
            <span className="rounded-full border border-amber-700/50 bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium text-amber-400">pending</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 rounded-full border border-green-700/50 bg-green-900/30 px-4 py-2">
        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-semibold text-green-400">Back online — syncing…</span>
      </div>
    </div>
  );
}

function WorkflowVisual() {
  const steps = ["Mechanism", "Vitals", "Airway", "Injuries", "Procedures", "Outcomes"];
  const active = 3;
  return (
    <div className="w-full max-w-[280px]">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Case entry — step {active + 1} of {steps.length}
      </p>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
              i < active
                ? "border border-white/5 bg-white/5"
                : i === active
                ? "border border-red-500 bg-red-600"
                : "border border-white/5 bg-white/[0.02] opacity-40"
            }`}
          >
            <div className={`h-2 w-2 shrink-0 rounded-full ${i < active ? "bg-green-400" : i === active ? "bg-white" : "bg-white/20"}`} />
            <span className={`text-sm font-medium ${i === active ? "text-white" : i < active ? "text-slate-400" : "text-slate-600"}`}>
              {step}
            </span>
            {i < active && <CheckCircle2 className="ml-auto h-4 w-4 text-green-400" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoringVisual() {
  return (
    <div className="w-full max-w-[280px]">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Auto-calculated scores</p>
      <div className="space-y-3">
        {[
          { label: "GCS", value: "14", sub: "E4 V4 M6", color: "text-green-400" },
          { label: "Shock Index", value: "0.82", sub: "HR 98 / SBP 120", color: "text-amber-400" },
          { label: "ISS", value: "22", sub: "Moderate–Severe", color: "text-red-400" },
          { label: "TRISS Ps", value: "0.87", sub: "87% survival probability", color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-slate-400">{s.label}</p>
              <p className="text-[10px] text-slate-600">{s.sub}</p>
            </div>
            <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardVisual() {
  const fields = [
    { label: "Mechanism", pct: 98 },
    { label: "Vitals", pct: 94 },
    { label: "GCS", pct: 91 },
    { label: "Procedures", pct: 76 },
    { label: "Disposition", pct: 88 },
  ];
  return (
    <div className="w-full max-w-[280px]">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Data completeness</p>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.label}>
            <div className="mb-1 flex justify-between">
              <span className="text-xs text-slate-400">{f.label}</span>
              <span className={`text-xs font-bold ${f.pct >= 90 ? "text-green-400" : f.pct >= 80 ? "text-amber-400" : "text-red-400"}`}>
                {f.pct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${f.pct >= 90 ? "bg-green-500" : f.pct >= 80 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${f.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-xs text-slate-400">Overall completeness</span>
        <span className="text-xl font-black text-green-400">89%</span>
      </div>
    </div>
  );
}

function ConfigVisual() {
  const fields = [
    { label: "Trauma score (ISS)", on: true },
    { label: "TRISS calculation", on: true },
    { label: "Transfer destination", on: false },
    { label: "Operative time", on: true },
    { label: "ICU admission", on: false },
  ];
  return (
    <div className="w-full max-w-[280px]">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Center configuration</p>
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-slate-300">{f.label}</span>
            <div className={`relative h-5 w-9 rounded-full transition-colors ${f.on ? "bg-red-600" : "bg-white/10"}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${f.on ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportVisual() {
  return (
    <div className="w-full max-w-[280px] space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Export ready</p>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-xs text-slate-300">247 cases ready to export</span>
        </div>
        {[
          { fmt: "CSV", name: "trauma_data_2026.csv", size: "48 KB" },
          { fmt: "XLSX", name: "trauma_data_2026.xlsx", size: "112 KB" },
        ].map((f) => (
          <div key={f.fmt} className="mb-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 last:mb-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">{f.fmt}</span>
              <span className="text-xs text-slate-400">{f.name}</span>
            </div>
            <span className="text-[10px] text-slate-500">{f.size}</span>
          </div>
        ))}
      </div>
      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white">
        <Download className="h-4 w-4" /> Download export
      </button>
    </div>
  );
}

const VISUALS = [OfflineVisual, WorkflowVisual, ScoringVisual, DashboardVisual, ConfigVisual, ExportVisual];

export function FeatureShowcase({ items }: { items: FeatureItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:grid lg:grid-cols-[1fr_1.3fr]">
      {/* Left — feature list */}
      <div className="divide-y divide-slate-100 bg-white">
        {items.map((item, i) => (
          <button
            key={item.title}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`w-full px-8 py-5 text-left transition-colors duration-150 ${active === i ? "bg-slate-50" : "hover:bg-slate-50/60"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${active === i ? "bg-red-500" : "bg-slate-200"}`} />
              <span className={`text-sm font-semibold transition-colors ${active === i ? "text-slate-900" : "text-slate-400"}`}>
                {item.title}
              </span>
            </div>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: active === i ? 80 : 0, opacity: active === i ? 1 : 0, marginTop: active === i ? 8 : 0, paddingLeft: "calc(0.375rem + 0.75rem)" }}
            >
              <p className="pl-3 text-xs leading-relaxed text-slate-500">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Right — visual panel */}
      <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-slate-900 lg:min-h-0">
        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/10 blur-3xl" />

        {items.map((item, i) => {
          const Visual = VISUALS[i];
          return (
            <div
              key={item.title}
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
              style={{ opacity: active === i ? 1 : 0, pointerEvents: active === i ? "auto" : "none" }}
            >
              {Visual && <Visual />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

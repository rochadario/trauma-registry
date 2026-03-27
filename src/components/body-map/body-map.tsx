"use client";

import { useTranslations } from "next-intl";

interface BodyMapProps {
  selectedRegions: string[];
  onToggleRegion: (region: string) => void;
}

const REGIONS = [
  { id: "head_neck",    labelKey: "headNeck",    color: "#ef4444", light: "#fee2e2" },
  { id: "chest",        labelKey: "chest",        color: "#3b82f6", light: "#dbeafe" },
  { id: "abdomen",      labelKey: "abdomen",      color: "#22c55e", light: "#dcfce7" },
  { id: "extremities",  labelKey: "extremities",  color: "#a855f7", light: "#f3e8ff" },
  { id: "external",     labelKey: "external",     color: "#f59e0b", light: "#fef3c7" },
] as const;

export function BodyMap({ selectedRegions, onToggleRegion }: BodyMapProps) {
  const t = useTranslations("bodyMap");

  function isActive(id: string) { return selectedRegions.includes(id); }
  function fill(id: string) {
    const r = REGIONS.find(r => r.id === id);
    if (!r) return "#e5e7eb";
    return isActive(id) ? r.color : "#f3f4f6";
  }
  function stroke(id: string) { return isActive(id) ? "#1f2937" : "#d1d5db"; }
  function sw(id: string) { return isActive(id) ? "2" : "1"; }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* SVG Figure */}
      <svg viewBox="0 0 200 400" className="w-full max-w-[200px] h-auto drop-shadow-sm">

        {/* HEAD / NECK */}
        <g onClick={() => onToggleRegion("head_neck")} className="cursor-pointer" role="button" tabIndex={0}
          onKeyDown={e => e.key === "Enter" && onToggleRegion("head_neck")}>
          <title>{t("headNeck")}</title>
          {/* Head */}
          <ellipse cx="100" cy="36" rx="26" ry="30"
            fill={fill("head_neck")} stroke={stroke("head_neck")} strokeWidth={sw("head_neck")} />
          {/* Neck */}
          <rect x="92" y="64" width="16" height="16" rx="3"
            fill={fill("head_neck")} stroke={stroke("head_neck")} strokeWidth={sw("head_neck")} />
        </g>

        {/* CHEST */}
        <g onClick={() => onToggleRegion("chest")} className="cursor-pointer" role="button" tabIndex={0}
          onKeyDown={e => e.key === "Enter" && onToggleRegion("chest")}>
          <title>{t("chest")}</title>
          <path d="M 70 80 Q 72 78 100 78 Q 128 78 130 80 L 134 158 Q 100 162 66 158 Z"
            fill={fill("chest")} stroke={stroke("chest")} strokeWidth={sw("chest")} />
        </g>

        {/* ABDOMEN */}
        <g onClick={() => onToggleRegion("abdomen")} className="cursor-pointer" role="button" tabIndex={0}
          onKeyDown={e => e.key === "Enter" && onToggleRegion("abdomen")}>
          <title>{t("abdomen")}</title>
          <path d="M 66 158 Q 100 162 134 158 L 130 222 Q 100 226 70 222 Z"
            fill={fill("abdomen")} stroke={stroke("abdomen")} strokeWidth={sw("abdomen")} />
        </g>

        {/* EXTREMITIES — arms + legs */}
        <g onClick={() => onToggleRegion("extremities")} className="cursor-pointer" role="button" tabIndex={0}
          onKeyDown={e => e.key === "Enter" && onToggleRegion("extremities")}>
          <title>{t("extremities")}</title>
          {/* Left arm */}
          <path d="M 70 82 L 54 88 Q 34 110 26 170 Q 22 192 22 210 L 36 210 Q 38 192 42 170 Q 50 116 66 94 Z"
            fill={fill("extremities")} stroke={stroke("extremities")} strokeWidth={sw("extremities")} />
          {/* Left hand */}
          <ellipse cx="29" cy="216" rx="9" ry="11"
            fill={fill("extremities")} stroke={stroke("extremities")} strokeWidth={sw("extremities")} />
          {/* Right arm */}
          <path d="M 130 82 L 146 88 Q 166 110 174 170 Q 178 192 178 210 L 164 210 Q 162 192 158 170 Q 150 116 134 94 Z"
            fill={fill("extremities")} stroke={stroke("extremities")} strokeWidth={sw("extremities")} />
          {/* Right hand */}
          <ellipse cx="171" cy="216" rx="9" ry="11"
            fill={fill("extremities")} stroke={stroke("extremities")} strokeWidth={sw("extremities")} />
          {/* Left leg */}
          <path d="M 70 222 L 88 222 Q 88 270 86 320 Q 84 355 82 388 L 64 388 Q 66 355 68 320 Q 70 270 70 222 Z"
            fill={fill("extremities")} stroke={stroke("extremities")} strokeWidth={sw("extremities")} />
          {/* Left foot */}
          <ellipse cx="73" cy="393" rx="12" ry="7"
            fill={fill("extremities")} stroke={stroke("extremities")} strokeWidth={sw("extremities")} />
          {/* Right leg */}
          <path d="M 112 222 L 130 222 Q 130 270 132 320 Q 134 355 136 388 L 118 388 Q 116 355 114 320 Q 112 270 112 222 Z"
            fill={fill("extremities")} stroke={stroke("extremities")} strokeWidth={sw("extremities")} />
          {/* Right foot */}
          <ellipse cx="127" cy="393" rx="12" ry="7"
            fill={fill("extremities")} stroke={stroke("extremities")} strokeWidth={sw("extremities")} />
        </g>

        {/* Shoulder connectors (decorative) */}
        <path d="M 70 80 Q 60 80 54 88" fill="none"
          stroke={stroke("chest")} strokeWidth="1" />
        <path d="M 130 80 Q 140 80 146 88" fill="none"
          stroke={stroke("chest")} strokeWidth="1" />
      </svg>

      {/* Region buttons — large tap targets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
        {REGIONS.map((region) => {
          const active = isActive(region.id);
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onToggleRegion(region.id)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all active:scale-95"
              style={{
                borderColor: active ? region.color : "#e5e7eb",
                backgroundColor: active ? region.light : "#f9fafb",
                color: active ? region.color : "#6b7280",
              }}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: active ? region.color : "#d1d5db" }}
              />
              <span className="text-left leading-tight">{t(region.labelKey)}</span>
              {active && (
                <span className="ml-auto text-xs font-bold">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

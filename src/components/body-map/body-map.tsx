"use client";

import { useTranslations } from "next-intl";

interface BodyMapProps {
  selectedRegions: string[];
  onToggleRegion: (region: string) => void;
}

const REGIONS = [
  {
    id: "head_neck",
    labelKey: "headNeck",
    activeColor: "#f87171",
    hoverColor: "#fecaca",
  },
  {
    id: "chest",
    labelKey: "chest",
    activeColor: "#60a5fa",
    hoverColor: "#bfdbfe",
  },
  {
    id: "abdomen",
    labelKey: "abdomen",
    activeColor: "#4ade80",
    hoverColor: "#bbf7d0",
  },
  {
    id: "extremities",
    labelKey: "extremities",
    activeColor: "#c084fc",
    hoverColor: "#e9d5ff",
  },
  {
    id: "external",
    labelKey: "external",
    activeColor: "#facc15",
    hoverColor: "#fef9c3",
  },
] as const;

export function BodyMap({ selectedRegions, onToggleRegion }: BodyMapProps) {
  const t = useTranslations("bodyMap");

  function getFill(regionId: string) {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return "#e5e7eb";
    return selectedRegions.includes(regionId) ? region.activeColor : "#e5e7eb";
  }

  function getStroke(regionId: string) {
    return selectedRegions.includes(regionId) ? "#374151" : "#9ca3af";
  }

  function getStrokeWidth(regionId: string) {
    return selectedRegions.includes(regionId) ? "2" : "1.5";
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 420"
        className="w-52 h-auto"
        aria-label={t("title")}
      >
        {/* Head/Neck region */}
        <g
          onClick={() => onToggleRegion("head_neck")}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
          onKeyDown={(e) => e.key === "Enter" && onToggleRegion("head_neck")}
        >
          <title>{t("headNeck")}</title>
          {/* Head */}
          <ellipse
            cx="100"
            cy="38"
            rx="24"
            ry="28"
            fill={getFill("head_neck")}
            stroke={getStroke("head_neck")}
            strokeWidth={getStrokeWidth("head_neck")}
          />
          {/* Neck */}
          <rect
            x="91"
            y="64"
            width="18"
            height="18"
            fill={getFill("head_neck")}
            stroke={getStroke("head_neck")}
            strokeWidth={getStrokeWidth("head_neck")}
          />
          <text x="100" y="42" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">
            {t("headNeck")}
          </text>
        </g>

        {/* Chest / Thorax region */}
        <g
          onClick={() => onToggleRegion("chest")}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
          onKeyDown={(e) => e.key === "Enter" && onToggleRegion("chest")}
        >
          <title>{t("chest")}</title>
          <path
            d="M 72 82 L 128 82 L 132 160 L 68 160 Z"
            fill={getFill("chest")}
            stroke={getStroke("chest")}
            strokeWidth={getStrokeWidth("chest")}
          />
          <text x="100" y="128" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">
            {t("chest")}
          </text>
        </g>

        {/* Abdomen / Pelvis region */}
        <g
          onClick={() => onToggleRegion("abdomen")}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
          onKeyDown={(e) => e.key === "Enter" && onToggleRegion("abdomen")}
        >
          <title>{t("abdomen")}</title>
          <path
            d="M 68 160 L 132 160 L 128 220 L 72 220 Z"
            fill={getFill("abdomen")}
            stroke={getStroke("abdomen")}
            strokeWidth={getStrokeWidth("abdomen")}
          />
          <text x="100" y="195" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">
            {t("abdomen")}
          </text>
        </g>

        {/* Left Arm */}
        <g
          onClick={() => onToggleRegion("extremities")}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
          onKeyDown={(e) => e.key === "Enter" && onToggleRegion("extremities")}
        >
          <title>{t("extremities")}</title>
          {/* Left arm */}
          <path
            d="M 72 84 L 58 84 Q 38 90 30 145 Q 26 175 24 210 L 36 210 Q 40 175 46 145 Q 52 110 68 90 Z"
            fill={getFill("extremities")}
            stroke={getStroke("extremities")}
            strokeWidth={getStrokeWidth("extremities")}
          />
          {/* Left hand */}
          <ellipse cx="30" cy="215" rx="8" ry="10"
            fill={getFill("extremities")}
            stroke={getStroke("extremities")}
            strokeWidth={getStrokeWidth("extremities")}
          />
          {/* Right arm */}
          <path
            d="M 128 84 L 142 84 Q 162 90 170 145 Q 174 175 176 210 L 164 210 Q 160 175 154 145 Q 148 110 132 90 Z"
            fill={getFill("extremities")}
            stroke={getStroke("extremities")}
            strokeWidth={getStrokeWidth("extremities")}
          />
          {/* Right hand */}
          <ellipse cx="170" cy="215" rx="8" ry="10"
            fill={getFill("extremities")}
            stroke={getStroke("extremities")}
            strokeWidth={getStrokeWidth("extremities")}
          />
          {/* Left leg */}
          <path
            d="M 72 220 L 88 220 Q 85 275 82 320 Q 80 350 78 390 L 62 390 Q 64 350 66 320 Q 68 275 72 220 Z"
            fill={getFill("extremities")}
            stroke={getStroke("extremities")}
            strokeWidth={getStrokeWidth("extremities")}
          />
          {/* Left foot */}
          <ellipse cx="70" cy="396" rx="10" ry="6"
            fill={getFill("extremities")}
            stroke={getStroke("extremities")}
            strokeWidth={getStrokeWidth("extremities")}
          />
          {/* Right leg */}
          <path
            d="M 112 220 L 128 220 Q 132 275 134 320 Q 136 350 138 390 L 122 390 Q 120 350 118 320 Q 115 275 112 220 Z"
            fill={getFill("extremities")}
            stroke={getStroke("extremities")}
            strokeWidth={getStrokeWidth("extremities")}
          />
          {/* Right foot */}
          <ellipse cx="130" cy="396" rx="10" ry="6"
            fill={getFill("extremities")}
            stroke={getStroke("extremities")}
            strokeWidth={getStrokeWidth("extremities")}
          />
        </g>
      </svg>

      {/* Region buttons for easy selection + External */}
      <div className="flex flex-wrap justify-center gap-2">
        {REGIONS.map((region) => {
          const isActive = selectedRegions.includes(region.id);
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onToggleRegion(region.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? "text-white border-transparent"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
              style={isActive ? { backgroundColor: region.activeColor } : undefined}
            >
              {t(region.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

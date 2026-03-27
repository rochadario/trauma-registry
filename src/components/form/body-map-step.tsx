"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { BodyMap } from "@/components/body-map/body-map";
import { InjuryListField } from "./injury-list-field";

interface InjuryEntry {
  region: string;
  description: string;
  ais_severity: number;
}

export function BodyMapStep() {
  const t = useTranslations();
  const { watch, setValue } = useFormContext();
  const selectedRegions: string[] = watch("body_regions_affected") || [];
  const injuries: InjuryEntry[] = watch("injuries") || [];

  function toggleRegion(region: string) {
    const current = [...selectedRegions];
    const currentInjuries = [...injuries];
    const idx = current.indexOf(region);

    if (idx >= 0) {
      // Remove region and its injuries
      current.splice(idx, 1);
      const filtered = currentInjuries.filter((inj) => inj.region !== region);
      setValue("injuries", filtered, { shouldDirty: true });
    } else {
      // Add region and auto-add an injury entry
      current.push(region);
      currentInjuries.push({
        region,
        description: "",
        ais_severity: 1,
      });
      setValue("injuries", currentInjuries, { shouldDirty: true });
    }
    setValue("body_regions_affected", current, { shouldDirty: true });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {t("bodyMap.instruction")}
      </p>

      <BodyMap
        selectedRegions={selectedRegions}
        onToggleRegion={toggleRegion}
      />

      <InjuryListField regions={selectedRegions} />

      <ISSummary />
    </div>
  );
}

function ISSummary() {
  const t = useTranslations();
  const { watch } = useFormContext();
  const issScore = watch("iss_score") as number | undefined;
  const issCategory = watch("iss_category") as string | undefined;

  if (!issScore) return null;

  const color =
    issScore >= 75 ? "bg-red-900 text-white" :
    issScore >= 50 ? "bg-red-600 text-white" :
    issScore >= 25 ? "bg-orange-500 text-white" :
    issScore >= 16 ? "bg-yellow-500 text-white" :
    issScore >= 9  ? "bg-yellow-200 text-yellow-900" :
                     "bg-green-100 text-green-800";

  return (
    <div className={`rounded-xl p-4 flex items-center justify-between ${color}`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {t("fields.iss_score")}
        </p>
        <p className="text-3xl font-bold leading-none mt-1">{issScore}</p>
      </div>
      {issCategory && (
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
            {t("fields.iss_category")}
          </p>
          <p className="text-lg font-semibold mt-1">
            {t.has(`fields.${issCategory}`) ? t(`fields.${issCategory}`) : issCategory}
          </p>
        </div>
      )}
    </div>
  );
}

function regionToKey(region: string): string {
  const map: Record<string, string> = {
    head_neck: "headNeck",
    face: "face",
    chest: "chest",
    abdomen: "abdomen",
    extremities: "extremities",
    external: "external",
  };
  return map[region] || region;
}

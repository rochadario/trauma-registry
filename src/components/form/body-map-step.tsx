"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { BodyMap } from "@/components/body-map/body-map";
import { InjuryListField } from "./injury-list-field";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

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
      <div>
        <Label className="text-base font-medium">
          {t("bodyMap.title")}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          {t("bodyMap.instruction")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <BodyMap
            selectedRegions={selectedRegions}
            onToggleRegion={toggleRegion}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <Label className="text-sm font-medium">
              {t("bodyMap.selectedRegions")}
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedRegions.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  {t("bodyMap.noRegionsSelected")}
                </span>
              ) : (
                selectedRegions.map((region) => (
                  <Badge
                    key={region}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleRegion(region)}
                  >
                    {t(`bodyMap.${regionToKey(region)}`)}
                    <span className="ml-1">&times;</span>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <InjuryListField regions={selectedRegions} />
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

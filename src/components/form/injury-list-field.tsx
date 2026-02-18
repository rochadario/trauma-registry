"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface InjuryEntry {
  region: string;
  description: string;
  ais_severity: number;
}

interface InjuryListFieldProps {
  regions: string[];
}

export function InjuryListField({ regions }: InjuryListFieldProps) {
  const t = useTranslations();
  const { watch, setValue } = useFormContext();
  const injuries: InjuryEntry[] = watch("injuries") || [];

  function addInjury() {
    const newInjury: InjuryEntry = {
      region: regions[0] || "head_neck",
      description: "",
      ais_severity: 1,
    };
    setValue("injuries", [...injuries, newInjury], { shouldDirty: true });
  }

  function removeInjury(index: number) {
    const updated = injuries.filter((_, i) => i !== index);
    setValue("injuries", updated, { shouldDirty: true });
  }

  function updateInjury(index: number, field: keyof InjuryEntry, value: string | number) {
    const updated = [...injuries];
    updated[index] = { ...updated[index], [field]: value };
    setValue("injuries", updated, { shouldDirty: true });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{t("fields.injuries")}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addInjury}>
          <Plus className="h-4 w-4 mr-1" />
          {t("bodyMap.addInjury")}
        </Button>
      </div>

      {injuries.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          {t("bodyMap.noRegionsSelected")}
        </p>
      )}

      {injuries.map((injury, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_100px_40px] gap-2 items-end border rounded-lg p-3"
        >
          <div className="space-y-1">
            <Label className="text-xs">{t("fields.injury_region")}</Label>
            <Select
              value={injury.region}
              onValueChange={(v) => updateInjury(index, "region", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`fields.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("bodyMap.description")}</Label>
            <Input
              value={injury.description}
              onChange={(e) => updateInjury(index, "description", e.target.value)}
              placeholder={t("fields.injury_detail_description")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("bodyMap.severity")}</Label>
            <Select
              value={String(injury.ais_severity)}
              onValueChange={(v) => updateInjury(index, "ais_severity", parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeInjury(index)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

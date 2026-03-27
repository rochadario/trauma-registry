"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FieldMeta } from "@/lib/form/schema";
import { MunicipalityCombobox } from "./municipality-combobox";
import { DepartmentCombobox } from "./department-combobox";

interface FormFieldRendererProps {
  field: FieldMeta;
  disabled?: boolean;
}

export function FormFieldRenderer({ field, disabled }: FormFieldRendererProps) {
  const t = useTranslations();
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const value = watch(field.name);
  const error = errors[field.name];
  const label = t(`fields.${field.name}`);

  if (field.name === "triage_accuracy" && field.computed) {
    const accuracy = value as string | undefined;
    if (!accuracy) return null;
    const config = {
      correct:      { bg: "bg-green-500",  icon: "✓", text: "text-white" },
      over_triage:  { bg: "bg-yellow-400", icon: "▲", text: "text-yellow-900" },
      under_triage: { bg: "bg-red-600",    icon: "▼", text: "text-white" },
    }[accuracy] ?? { bg: "bg-muted", icon: "?", text: "text-muted-foreground" };

    return (
      <div className={`rounded-xl p-4 flex items-center gap-4 ${config.bg} ${config.text}`}>
        <span className="text-3xl font-bold leading-none">{config.icon}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
          <p className="text-xl font-bold mt-0.5">
            {t.has(`fields.${accuracy}`) ? t(`fields.${accuracy}`) : accuracy}
          </p>
        </div>
      </div>
    );
  }

  if (field.computed) {
    const isBool = typeof value === "boolean";
    return (
      <div className="space-y-1">
        <Label className="text-muted-foreground">{label}</Label>
        <div className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
          isBool
            ? value
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
            : "bg-muted font-mono"
        }`}>
          {isBool ? (value ? "✓ " + t("common.yes") : "✗ " + t("common.no")) : (value !== undefined && value !== null ? (t.has(`fields.${value}`) ? t(`fields.${value}` as never) : String(value)) : "—")}
        </div>
      </div>
    );
  }

  if (field.name === "patient_department") {
    return (
      <div className="space-y-1">
        <Label htmlFor={field.name}>
          {label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <DepartmentCombobox
          value={(value as string) || ""}
          onChange={(v) => setValue(field.name, v, { shouldDirty: true })}
          disabled={disabled}
        />
        {error && (
          <p className="text-xs text-destructive">{String(error.message)}</p>
        )}
      </div>
    );
  }

  if (field.name === "patient_municipality") {
    return (
      <div className="space-y-1">
        <Label htmlFor={field.name}>
          {label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <MunicipalityCombobox
          value={(value as string) || ""}
          onChange={(v) => setValue(field.name, v, { shouldDirty: true })}
          disabled={disabled}
        />
        {error && (
          <p className="text-xs text-destructive">{String(error.message)}</p>
        )}
      </div>
    );
  }

  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1">
          <Label htmlFor={field.name}>
            {label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.name}
            {...register(field.name)}
            disabled={disabled}
            readOnly={field.name === "registry_number"}
            className={field.name === "registry_number" ? "bg-muted text-muted-foreground cursor-default" : undefined}
            placeholder={t.has(`fields.${field.name}_placeholder`) ? t(`fields.${field.name}_placeholder`) : undefined}
          />
          {error && (
            <p className="text-xs text-destructive">{String(error.message)}</p>
          )}
        </div>
      );

    case "number":
      return (
        <div className="space-y-1">
          <Label htmlFor={field.name}>
            {label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.name}
            type="number"
            inputMode={field.inputMode || "numeric"}
            min={field.min}
            max={field.max}
            {...register(field.name, {
              setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
            })}
            disabled={disabled}
          />
          {error && (
            <p className="text-xs text-destructive">{String(error.message)}</p>
          )}
        </div>
      );

    case "date":
      return (
        <div className="space-y-1">
          <Label htmlFor={field.name}>
            {label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.name}
            type="date"
            {...register(field.name)}
            disabled={disabled}
          />
          {error && (
            <p className="text-xs text-destructive">{String(error.message)}</p>
          )}
        </div>
      );

    case "time":
      return (
        <div className="space-y-1">
          <Label htmlFor={field.name}>
            {label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.name}
            type="time"
            {...register(field.name)}
            disabled={disabled}
          />
          {error && (
            <p className="text-xs text-destructive">{String(error.message)}</p>
          )}
        </div>
      );

    case "select":
      return (
        <div className="space-y-1">
          <Label>
            {label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={value || ""}
            onValueChange={(v) => setValue(field.name, v, { shouldDirty: true })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("common.selectOption")} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t.has(opt.labelKey) ? t(opt.labelKey) : opt.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-xs text-destructive">{String(error.message)}</p>
          )}
        </div>
      );

    case "radio":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <RadioGroup
            value={value || ""}
            onValueChange={(v) => setValue(field.name, v, { shouldDirty: true })}
            disabled={disabled}
            className="flex flex-wrap gap-4"
          >
            {field.options?.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`${field.name}-${opt.value}`} />
                <Label htmlFor={`${field.name}-${opt.value}`} className="font-normal cursor-pointer">
                  {t.has(opt.labelKey) ? t(opt.labelKey) : opt.value}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {error && (
            <p className="text-xs text-destructive">{String(error.message)}</p>
          )}
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={!!value}
            onCheckedChange={(checked) =>
              setValue(field.name, !!checked, { shouldDirty: true })
            }
            disabled={disabled}
          />
          <Label htmlFor={field.name} className="font-normal cursor-pointer">
            {label}
          </Label>
          {error && (
            <p className="text-xs text-destructive ml-6">{String(error.message)}</p>
          )}
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1">
          <Label htmlFor={field.name}>
            {label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Textarea
            id={field.name}
            {...register(field.name)}
            disabled={disabled}
            placeholder={t.has(`fields.${field.name}_placeholder`) ? t(`fields.${field.name}_placeholder`) : undefined}
            rows={3}
          />
          {error && (
            <p className="text-xs text-destructive">{String(error.message)}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}

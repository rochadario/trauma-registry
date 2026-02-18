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

  if (field.computed) {
    return (
      <div className="space-y-1">
        <Label className="text-muted-foreground">{label}</Label>
        <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
          {value !== undefined && value !== null ? String(value) : "—"}
        </div>
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
            {...register(field.name, { valueAsNumber: true })}
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

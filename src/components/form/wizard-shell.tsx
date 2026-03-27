"use client";

import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizardStore } from "@/lib/store/wizard-store";
import { formSections, isSectionVisible } from "@/lib/form/sections";
import { partialPatientSchema, type PartialPatientRecord } from "@/lib/form/schema";
import { calculations } from "@/lib/form/calculations";
import { prefillRules } from "@/lib/form/prefills";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepContent } from "./step-content";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Save, Send, Eraser } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WizardShell() {
  const t = useTranslations();
  const {
    currentStep,
    formData,
    setStep,
    nextStep,
    prevStep,
    updateFields,
    saveToIndexedDB,
    submitRecord,
  } = useWizardStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<PartialPatientRecord>({
    resolver: zodResolver(partialPatientSchema) as any,
    defaultValues: formData as PartialPatientRecord,
    mode: "onBlur",
  });

  const { watch, reset, getValues } = methods;

  // Sync store data to form when loading a record
  useEffect(() => {
    reset(formData as PartialPatientRecord);
  }, [formData, reset]);

  // Watch all values for auto-calculations
  const watchAll = watch();

  // Run auto-calculations
  useEffect(() => {
    const updates: Record<string, unknown> = {};
    let hasUpdates = false;

    for (const calc of calculations) {
      const result = calc.calculate(watchAll as Record<string, unknown>);
      if (result !== undefined && result !== watchAll[calc.field as keyof typeof watchAll]) {
        updates[calc.field] = result;
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      Object.entries(updates).forEach(([key, val]) => {
        methods.setValue(key as keyof PartialPatientRecord, val as PartialPatientRecord[keyof PartialPatientRecord], { shouldDirty: false });
      });
    }
  }, [watchAll, methods]);

  // Run prefill rules
  useEffect(() => {
    for (const rule of prefillRules) {
      const depValue = watchAll[rule.dependsOn as keyof typeof watchAll];
      const currentValue = watchAll[rule.field as keyof typeof watchAll];
      if (depValue !== undefined && (currentValue === undefined || currentValue === "")) {
        const prefillValue = rule.prefill(depValue);
        if (prefillValue !== undefined) {
          methods.setValue(rule.field as keyof PartialPatientRecord, prefillValue as PartialPatientRecord[keyof PartialPatientRecord], { shouldDirty: false });
        }
      }
    }
  }, [watchAll, methods]);

  // Get visible sections (skip conditional sections that don't apply)
  const visibleSections = formSections.filter((section) =>
    isSectionVisible(section, watchAll as Record<string, unknown>)
  );

  const currentSection = formSections.find((s) => s.step === currentStep);
  const currentVisibleIndex = visibleSections.findIndex((s) => s.step === currentStep);
  const totalVisible = visibleSections.length;
  const progress = totalVisible > 0 ? ((currentVisibleIndex + 1) / totalVisible) * 100 : 0;

  // Find next/prev visible steps
  const currentIdx = visibleSections.findIndex((s) => s.step === currentStep);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < visibleSections.length - 1;
  const isLast = currentIdx === visibleSections.length - 1;

  const handleSave = useCallback(async () => {
    const values = getValues();
    updateFields(values as Record<string, unknown>);
    await saveToIndexedDB();
    toast.success(t("notifications.autoSaved"));
  }, [getValues, updateFields, saveToIndexedDB, t]);

  const handleNext = useCallback(async () => {
    const values = getValues();
    updateFields(values as Record<string, unknown>);
    await saveToIndexedDB();

    if (hasNext) {
      const nextSection = visibleSections[currentIdx + 1];
      setStep(nextSection.step);
    }
  }, [getValues, updateFields, saveToIndexedDB, hasNext, visibleSections, currentIdx, setStep]);

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      const prevSection = visibleSections[currentIdx - 1];
      setStep(prevSection.step);
    }
  }, [hasPrev, visibleSections, currentIdx, setStep]);

  // Fields that are auto-managed and must never be manually cleared
  const SYSTEM_FIELDS = new Set([
    "created_by", "created_at", "updated_at", "local_id", "remote_id",
    "sync_status", "record_status", "verified_by", "verified_at",
  ]);

  const handleClearStep = useCallback(() => {
    if (!currentSection) return;
    const cleared: Partial<PartialPatientRecord> = {};
    for (const fieldName of currentSection.fields) {
      if (!SYSTEM_FIELDS.has(fieldName)) {
        (cleared as Record<string, unknown>)[fieldName] = undefined;
      }
    }
    methods.reset({ ...getValues(), ...cleared });
    updateFields({ ...getValues(), ...cleared });
  }, [currentSection, methods, getValues, updateFields]);

  const handleSubmit = useCallback(async () => {
    const values = getValues();
    updateFields(values as Record<string, unknown>);
    await submitRecord();
    toast.success(t("notifications.recordSaved"));
  }, [getValues, updateFields, submitRecord, t]);

  // Auto-save on step transition
  useEffect(() => {
    const values = getValues();
    updateFields(values as Record<string, unknown>);
  }, [currentStep, getValues, updateFields]);

  if (!currentSection) return null;

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t("patientList.step", {
                step: currentVisibleIndex + 1,
                total: totalVisible,
              })}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step navigation pills */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {visibleSections.map((section, idx) => (
            <button
              key={section.step}
              onClick={() => {
                const values = getValues();
                updateFields(values as Record<string, unknown>);
                setStep(section.step);
              }}
              className={`shrink-0 h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                section.step === currentStep
                  ? "bg-primary text-primary-foreground"
                  : idx < currentVisibleIndex
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Step content */}
        <Card>
          <CardHeader className="relative">
            <CardTitle>
              {t(currentSection.titleKey)}
            </CardTitle>
            <CardDescription>
              {t(currentSection.descriptionKey)}
            </CardDescription>
            {currentSection.id !== "record_info" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 text-muted-foreground hover:text-destructive h-7 w-7"
                      onClick={handleClearStep}
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("common.clearStep")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardHeader>
          <CardContent>
            <StepContent step={currentStep} fields={currentSection.fields} />
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={!hasPrev}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </Button>

          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            {t("common.saveDraft")}
          </Button>

          {isLast ? (
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-1" />
              {t("common.submitRecord")}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!hasNext}>
              {t("common.next")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}

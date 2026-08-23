"use client";

import { useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizardStore } from "@/lib/store/wizard-store";
import { db } from "@/lib/db";
import { formSections, isSectionVisible } from "@/lib/form/sections";
import { conditionNotes } from "@/lib/form/conditionals";
import { partialPatientSchema, type PartialPatientRecord } from "@/lib/form/schema";
import { calculations } from "@/lib/form/calculations";
import { prefillRules } from "@/lib/form/prefills";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepContent } from "./step-content";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Save, Send, Eraser, ClipboardList } from "lucide-react";
import { useReview } from "@/lib/context/review-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WizardShell() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const review = useReview();
  const {
    currentStep,
    localId,
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
  // In review mode show all sections; in normal mode filter by conditions
  const visibleSections = review
    ? formSections
    : formSections.filter((section) =>
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

    // Await REDCap before navigating to ensure it completes
    const completeData = useWizardStore.getState().formData;
    try {
      const res = await fetch("/api/redcap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...completeData, record_status: "complete" }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        console.error("[REDCap] submit failed:", result);
        toast.warning(`REDCap: ${result.error ?? "sync failed (status " + res.status + ")"}`);
      } else {
        console.log("[REDCap] submit ok:", result);
        if (localId) await db.patients.update(localId, { redcapSynced: true });
      }
    } catch (err) {
      console.warn("[REDCap] error:", err);
      toast.warning("REDCap sync failed — record saved locally");
    }

    toast.success(t("notifications.recordSaved"));
    router.push(`/${locale}/patients`);
  }, [getValues, updateFields, submitRecord, t, router, locale]);

  // Auto-save on step transition
  useEffect(() => {
    const values = getValues();
    updateFields(values as Record<string, unknown>);
  }, [currentStep, getValues, updateFields]);

  if (!currentSection) return null;

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Review mode banner */}
        {review && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <ClipboardList className="h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold">{t("common.reviewMode")}</span>
                {" — "}{review.reviewerName}
                {" · "}{review.totalCount} {review.totalCount !== 1 ? t("common.comments") : t("common.comment")}
              </span>
            </div>
            <a
              href={`/${locale}/review`}
              className="shrink-0 text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
            >
              {t("common.viewSummary")} →
            </a>
          </div>
        )}
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
            {/* Review mode: note explaining when this step normally appears */}
            {review && currentSection.conditional && (() => {
              const note = conditionNotes[currentSection.conditional.field];
              const text = note ? (locale === "es" ? note.es : note.en) : null;
              return text ? (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1 leading-tight">
                  ⚠️ {text}
                </p>
              ) : null;
            })()}
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
            review ? (
              <a href={`/${locale}/review`}>
                <Button type="button" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  {t("common.viewReviewSummary")}
                </Button>
              </a>
            ) : (
              <Button onClick={handleSubmit}>
                <Send className="h-4 w-4 mr-1" />
                {t("common.submitRecord")}
              </Button>
            )
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

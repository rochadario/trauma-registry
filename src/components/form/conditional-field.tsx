"use client";

import { useFormContext } from "react-hook-form";
import { useLocale } from "next-intl";
import { conditionalRules, conditionNotes } from "@/lib/form/conditionals";
import { useReview } from "@/lib/context/review-context";

interface ConditionalFieldProps {
  fieldName: string;
  children: React.ReactNode;
}

export function ConditionalField({ fieldName, children }: ConditionalFieldProps) {
  const { watch } = useFormContext();
  const review = useReview();
  const locale = useLocale();

  const rules = conditionalRules.filter((r) => r.field === fieldName);

  // In review mode — always show every field, with a note explaining its condition
  if (review) {
    if (rules.length === 0) return <>{children}</>;

    // Build the condition note from the first rule's dependsOn
    const note = conditionNotes[rules[0].dependsOn];
    const noteText = note ? (locale === "es" ? note.es : note.en) : null;

    return (
      <div>
        {noteText && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-1 leading-tight">
            ⚠️ {noteText}
          </p>
        )}
        {children}
      </div>
    );
  }

  // Normal mode — hide if condition not met
  if (rules.length === 0) return <>{children}</>;

  const isVisible = rules.some((rule) => {
    const depValue = watch(rule.dependsOn);
    return rule.condition(depValue);
  });

  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
      {children}
    </div>
  );
}

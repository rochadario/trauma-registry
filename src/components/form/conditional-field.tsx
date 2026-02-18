"use client";

import { useFormContext } from "react-hook-form";
import { conditionalRules } from "@/lib/form/conditionals";

interface ConditionalFieldProps {
  fieldName: string;
  children: React.ReactNode;
}

export function ConditionalField({ fieldName, children }: ConditionalFieldProps) {
  const { watch } = useFormContext();

  const rules = conditionalRules.filter((r) => r.field === fieldName);

  // If no rules exist for this field, always show it
  if (rules.length === 0) return <>{children}</>;

  // Check all rules — the field is visible if ANY rule is satisfied
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

"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useWizardStore } from "@/lib/store/wizard-store";
import { WizardShell } from "@/components/form/wizard-shell";
import { ReviewProvider } from "@/lib/context/review-context";

function NewPatientInner() {
  const { startNewRecord, localId } = useWizardStore();
  const searchParams = useSearchParams();

  const isReview = searchParams.get("review") === "true";
  const reviewerName = searchParams.get("reviewer") ?? "Revisora";

  useEffect(() => {
    if (localId) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        startNewRecord(data.user.id);
      }
    });
  }, [localId, startNewRecord]);

  if (!localId) return null;

  if (isReview) {
    return (
      <ReviewProvider reviewerName={reviewerName}>
        <WizardShell />
      </ReviewProvider>
    );
  }

  return <WizardShell />;
}

export default function NewPatientPage() {
  return (
    <Suspense>
      <NewPatientInner />
    </Suspense>
  );
}

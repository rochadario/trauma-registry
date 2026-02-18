"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWizardStore } from "@/lib/store/wizard-store";
import { WizardShell } from "@/components/form/wizard-shell";

export default function NewPatientPage() {
  const { startNewRecord, localId } = useWizardStore();

  useEffect(() => {
    if (localId) return; // Already started

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        startNewRecord(data.user.id);
      }
    });
  }, [localId, startNewRecord]);

  if (!localId) return null;

  return <WizardShell />;
}

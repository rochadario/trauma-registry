"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWizardStore } from "@/lib/store/wizard-store";
import { WizardShell } from "@/components/form/wizard-shell";

export default function EditPatientPage() {
  const params = useParams();
  const { loadRecord, localId, isLoading } = useWizardStore();
  const id = params.id as string;

  useEffect(() => {
    if (id && id !== localId) {
      loadRecord(id);
    }
  }, [id, localId, loadRecord]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!localId) return null;

  return <WizardShell />;
}

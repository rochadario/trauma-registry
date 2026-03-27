"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db, type LocalPatient } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Printer } from "lucide-react";
import Link from "next/link";
import { pullFromSupabase } from "@/lib/sync/engine";

export default function PatientsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [patients, setPatients] = useState<LocalPatient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    pullFromSupabase().then(() => loadPatients()).catch(() => loadPatients());
  }, []);

  async function loadPatients() {
    const all = await db.patients
      .filter((p) => !p.deletedAt)
      .reverse()
      .sortBy("updatedAt");
    setPatients(all);
  }

  async function handleDelete(localId: string) {
    if (!confirm(t("patientList.deleteConfirm"))) return;
    await db.patients.update(localId, {
      deletedAt: new Date().toISOString(),
    });
    loadPatients();
  }

  const filtered = patients.filter((p) => {
    const matchesSearch =
      !search ||
      (p.data.registry_number as string)?.toLowerCase().includes(search.toLowerCase()) ||
      (p.data.patient_municipality as string)?.toLowerCase().includes(search.toLowerCase()) ||
      (p.data.hospital_id as string)?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function getStatusBadge(status: string) {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">{t("common.draft")}</Badge>;
      case "complete":
        return <Badge variant="default">{t("common.complete")}</Badge>;
      case "verified":
        return <Badge className="bg-green-600">{t("common.verified")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function getSyncBadge(syncStatus: string) {
    switch (syncStatus) {
      case "synced":
        return <Badge variant="outline" className="text-green-600">{t("common.synced")}</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-yellow-600">{t("sync.pending")}</Badge>;
      case "conflict":
        return <Badge variant="destructive">{t("sync.conflict")}</Badge>;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("patientList.title")}</h1>
        <Link href={`/${locale}/patients/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("common.newPatient")}
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("patientList.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("patientList.all")}</SelectItem>
            <SelectItem value="draft">{t("patientList.drafts")}</SelectItem>
            <SelectItem value="complete">{t("patientList.completed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("patientList.noPatients")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((patient) => (
            <Card key={patient.localId}>
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {(patient.data.registry_number as string) || patient.localId.slice(0, 8)}
                    </span>
                    {getStatusBadge(patient.status)}
                    {getSyncBadge(patient.syncStatus)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {patient.data.hospital_id ? t(`fields.${patient.data.hospital_id as string}`) : null}
                    {patient.data.admission_date ? ` - ${String(patient.data.admission_date)}` : null}
                    {" · "}
                    {t("patientList.step", { step: patient.currentStep })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/${locale}/patients/${patient.localId}/print`}>
                    <Button variant="ghost" size="icon" title="Print summary">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/${locale}/patients/${patient.localId}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(patient.localId)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

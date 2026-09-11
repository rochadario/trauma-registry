"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Send, Timer, Bell, GraduationCap } from "lucide-react";

interface BomberoRow {
  id: string;
  name: string | null;
  email: string | null;
  photoUrl: string | null;
  lastSeenAt: string;
  active: boolean;
  trainingsCompleted: number;
  patientsSent: number;
}

interface DashboardData {
  ok: boolean;
  error?: string;
  summary?: {
    totalBomberos: number;
    activeBomberos: number;
    totalPatientsSent: number;
    avgResponseTimeMin: number | null;
    colorCounts: Record<string, number>;
    lastSuccessfulAlert: string | null;
    alertSuccessRate: number | null;
    alertsChecked: number;
  };
  bomberos?: BomberoRow[];
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminBomberosPage() {
  const t = useTranslations("adminBomberos");
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/bombero-dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ ok: false, error: "network" }));
  }, []);

  if (!data) return <p className="text-sm text-muted-foreground">{t("loading")}</p>;

  if (!data.ok) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-red-600">{t("accessDenied")}</p>
        </CardContent>
      </Card>
    );
  }

  const s = data.summary!;
  const bomberos = data.bomberos!;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Users} label={t("totalBomberos")} value={s.totalBomberos} />
        <StatCard icon={UserCheck} label={t("activeBomberos")} value={s.activeBomberos} sub={t("activeSub")} />
        <StatCard icon={Send} label={t("patientsSent")} value={s.totalPatientsSent} />
        <StatCard
          icon={Timer}
          label={t("avgResponseTime")}
          value={s.avgResponseTimeMin !== null ? `${s.avgResponseTimeMin} min` : "—"}
        />
        <StatCard
          icon={Bell}
          label={t("alertHealth")}
          value={s.alertSuccessRate !== null ? `${s.alertSuccessRate}%` : "—"}
          sub={s.lastSuccessfulAlert ? t("lastAlertAt", { date: new Date(s.lastSuccessfulAlert).toLocaleString() }) : t("noAlertsYet")}
        />
        <StatCard icon={GraduationCap} label={t("colorBreakdown")} value={`🔴${s.colorCounts.red ?? 0} 🟡${s.colorCounts.yellow ?? 0} 🟢${s.colorCounts.green ?? 0}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("bomberosListTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {bomberos.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noBomberos")}</p>
          ) : (
            <div className="space-y-2">
              {bomberos.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {b.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.name || t("unnamed")}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">{t("trainingsCount", { n: b.trainingsCompleted })}</Badge>
                    <Badge variant="outline">{t("patientsCount", { n: b.patientsSent })}</Badge>
                    <Badge variant={b.active ? "default" : "secondary"}>
                      {b.active ? t("activeNow") : t("inactive")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

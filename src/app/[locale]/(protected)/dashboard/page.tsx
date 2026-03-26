"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { db, type LocalPatient } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { Users, TrendingDown, Activity, Clock, Timer } from "lucide-react";
import { CompletenessWidget } from "@/components/dashboard/completeness-widget";

const InjuryMapWidget = dynamic(
  () => import("@/components/dashboard/injury-map-widget").then((m) => m.InjuryMapWidget),
  { ssr: false, loading: () => <div className="h-[340px] rounded-lg bg-gray-100 animate-pulse" /> }
);

const MECH_COLORS: Record<string, string> = {
  road_traffic: "#2563eb", fall: "#16a34a", firearm: "#dc2626",
  sharp_object: "#ea580c", blunt_object: "#9333ea", burn: "#ca8a04",
  poisoning: "#0891b2", other: "#6b7280",
};
const PIE_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ea580c", "#9333ea", "#ca8a04"];

function StatCard({ icon: Icon, label, value, sub, danger = false }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-3xl font-bold ${danger ? "text-red-600" : ""}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tf = useTranslations("fields");
  const [patients, setPatients] = useState<LocalPatient[]>([]);
  const load = useCallback(async () => {
    const all = await db.patients.filter((p) => !p.deletedAt && p.status !== "draft").toArray();
    setPatients(all);
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = patients.length;
  const deaths = patients.filter((p) => (p.data.outcome as string)?.startsWith("died")).length;
  const mortalityRate = total > 0 ? ((deaths / total) * 100).toFixed(1) : "0";

  const avgISS = useMemo(() => {
    const vals = patients.map((p) => p.data.iss_score as number).filter((v) => v > 0);
    return vals.length ? (vals.reduce((a, b) => a + b) / vals.length).toFixed(1) : "—";
  }, [patients]);

  const avgLOS = useMemo(() => {
    const vals = patients.map((p) => p.data.los_days as number).filter((v) => v >= 0);
    return vals.length ? (vals.reduce((a, b) => a + b) / vals.length).toFixed(1) : "—";
  }, [patients]);

  const avgResponse = useMemo(() => {
    const vals = patients.map((p) => p.data.response_time_minutes as number).filter((v) => v > 0);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b) / vals.length) : null;
  }, [patients]);

  const mechanismData = useMemo(() => {
    const c: Record<string, number> = {};
    patients.forEach((p) => { const m = (p.data.injury_mechanism as string) || "other"; c[m] = (c[m] || 0) + 1; });
    return Object.entries(c).map(([key, value]) => ({
      name: tf.has(key) ? tf(key) : key, key, value,
    })).sort((a, b) => b.value - a.value);
  }, [patients, tf]);

  const monthlyData = useMemo(() => {
    const c: Record<string, { admissions: number; deaths: number }> = {};
    patients.forEach((p) => {
      const d = p.data.admission_date as string; if (!d) return;
      const m = d.slice(0, 7);
      if (!c[m]) c[m] = { admissions: 0, deaths: 0 };
      c[m].admissions++;
      if ((p.data.outcome as string)?.startsWith("died")) c[m].deaths++;
    });
    return Object.entries(c).sort(([a], [b]) => a.localeCompare(b)).map(([month, d]) => ({
      month: month.slice(2), ...d,
      mortalityPct: d.admissions > 0 ? parseFloat(((d.deaths / d.admissions) * 100).toFixed(1)) : 0,
    }));
  }, [patients]);

  const ageData = useMemo(() => {
    const bins: Record<string, number> = { "0–14": 0, "15–24": 0, "25–34": 0, "35–44": 0, "45–54": 0, "55–64": 0, "65+": 0 };
    patients.forEach((p) => {
      const a = p.data.patient_age as number; if (!a) return;
      if (a <= 14) bins["0–14"]++;
      else if (a <= 24) bins["15–24"]++;
      else if (a <= 34) bins["25–34"]++;
      else if (a <= 44) bins["35–44"]++;
      else if (a <= 54) bins["45–54"]++;
      else if (a <= 64) bins["55–64"]++;
      else bins["65+"]++;
    });
    return Object.entries(bins).map(([age, count]) => ({ age, count }));
  }, [patients]);

  const issDistData = useMemo(() => {
    const cats = { minor: 0, moderate: 0, severe: 0, critical: 0 };
    patients.forEach((p) => { const c = p.data.iss_category as string; if (c in cats) cats[c as keyof typeof cats]++; });
    return [
      { name: "Minor (1–8)", value: cats.minor, fill: "#16a34a" },
      { name: "Moderate (9–15)", value: cats.moderate, fill: "#ca8a04" },
      { name: "Severe (16–24)", value: cats.severe, fill: "#ea580c" },
      { name: "Critical (≥25)", value: cats.critical, fill: "#dc2626" },
    ].filter((d) => d.value > 0);
  }, [patients]);

  const sexData = useMemo(() => {
    const m = patients.filter((p) => p.data.patient_sex === "male").length;
    const f = patients.filter((p) => p.data.patient_sex === "female").length;
    return [{ name: "Male", value: m, fill: "#2563eb" }, { name: "Female", value: f, fill: "#e11d48" }].filter((d) => d.value > 0);
  }, [patients]);

  const mapPoints = useMemo(() =>
    patients.filter((p) => p.data.injury_lat && p.data.injury_lng).map((p) => ({
      lat: p.data.injury_lat as number, lng: p.data.injury_lng as number,
      outcome: p.data.outcome as string,
    })), [patients]);

  const outcomData = useMemo(() => {
    const c: Record<string, number> = {};
    patients.forEach((p) => { const o = (p.data.outcome as string) || "unknown"; c[o] = (c[o] || 0) + 1; });
    return Object.entries(c).map(([key, value]) => ({
      name: tf.has(key) ? tf(key) : key, value,
    })).sort((a, b) => b.value - a.value);
  }, [patients, tf]);

  const noData = <p className="text-sm text-muted-foreground text-center py-10">{t("noData")}</p>;

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Total Patients" value={total} />
        <StatCard icon={TrendingDown} label="Mortality Rate" value={`${mortalityRate}%`}
          sub={`${deaths} deaths`} danger={parseFloat(mortalityRate) > 5} />
        <StatCard icon={Activity} label="Avg ISS" value={avgISS} sub="injury severity score" />
        <StatCard icon={Clock} label="Avg LOS" value={avgLOS !== "—" ? `${avgLOS}d` : "—"} sub="length of stay" />
        <StatCard icon={Timer} label="Avg Response" value={avgResponse ? `${avgResponse} min` : "—"} sub="injury → admission" />
      </div>

      {/* Mechanism + Monthly */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Injury Mechanism</CardTitle></CardHeader>
          <CardContent>
            {mechanismData.length === 0 ? noData : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={mechanismData} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <XAxis type="number" fontSize={11} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={100} />
                  <Tooltip formatter={(v) => [`${v} patients`]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {mechanismData.map((e) => <Cell key={e.key} fill={MECH_COLORS[e.key] ?? "#6b7280"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Monthly Admissions & Mortality %</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? noData : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis yAxisId="l" fontSize={11} />
                  <YAxis yAxisId="r" orientation="right" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="l" dataKey="admissions" fill="#2563eb" name="Admissions" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="r" type="monotone" dataKey="mortalityPct" stroke="#dc2626" strokeWidth={2} dot={false} name="Mortality %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Age + ISS + Sex */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Age Distribution</CardTitle></CardHeader>
          <CardContent>
            {ageData.every((d) => d.count === 0) ? noData : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="age" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip formatter={(v) => [`${v} patients`]} />
                  <Bar dataKey="count" fill="#2563eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">ISS Severity</CardTitle></CardHeader>
          <CardContent>
            {issDistData.length === 0 ? noData : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={issDistData} dataKey="value" cx="50%" cy="44%" innerRadius={45} outerRadius={75} label={({ value }) => value}>
                    {issDistData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Sex</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
            {sexData.length === 0 ? noData : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={sexData} dataKey="value" cx="50%" cy="50%" outerRadius={65} label={({ name, value }) => `${name}: ${value}`}>
                      {sexData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                  {sexData.map((d) => (
                    <span key={d.name} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.fill }} />
                      {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Injury Locations — Guatemala City
            <Badge variant="outline" className="text-xs font-normal">
              {mapPoints.length} / {total} with GPS
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mapPoints.length === 0
            ? <div className="h-[340px] flex items-center justify-center text-muted-foreground text-sm">No GPS data yet. Enable location picker in Step 3 of the form.</div>
            : <InjuryMapWidget points={mapPoints} />
          }
        </CardContent>
      </Card>

      {/* Outcomes */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Outcome Distribution</CardTitle></CardHeader>
        <CardContent>
          {outcomData.length === 0 ? noData : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={outcomData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v) => [`${v} patients`]} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {outcomData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Data Completeness */}
      <CompletenessWidget patients={patients} />

    </div>
  );
}

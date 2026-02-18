"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { db, type LocalPatient } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#0891b2",
  "#ca8a04",
  "#e11d48",
  "#4f46e5",
  "#059669",
];

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tf = useTranslations("fields");
  const [patients, setPatients] = useState<LocalPatient[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    db.patients
      .filter((p) => !p.deletedAt && p.status !== "draft")
      .toArray()
      .then(setPatients);
  }, []);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const admDate = p.data.admission_date as string;
      if (dateFrom && admDate < dateFrom) return false;
      if (dateTo && admDate > dateTo) return false;
      return true;
    });
  }, [patients, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const deaths = filtered.filter(
      (p) =>
        (p.data.outcome as string)?.startsWith("died")
    ).length;
    const mortalityRate = total > 0 ? ((deaths / total) * 100).toFixed(1) : "0";
    const issScores = filtered
      .map((p) => p.data.iss_score as number)
      .filter((v) => v != null && !isNaN(v));
    const avgISS =
      issScores.length > 0
        ? (issScores.reduce((a, b) => a + b, 0) / issScores.length).toFixed(1)
        : "—";
    const losValues = filtered
      .map((p) => p.data.los_days as number)
      .filter((v) => v != null && !isNaN(v));
    const avgLOS =
      losValues.length > 0
        ? (losValues.reduce((a, b) => a + b, 0) / losValues.length).toFixed(1)
        : "—";
    return { total, mortalityRate, avgISS, avgLOS };
  }, [filtered]);

  const mechanismData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((p) => {
      const mech = (p.data.injury_mechanism as string) || "unknown";
      counts[mech] = (counts[mech] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: tf.has(name) ? tf(name) : name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered, tf]);

  const monthlyData = useMemo(() => {
    const counts: Record<string, { total: number; deaths: number }> = {};
    filtered.forEach((p) => {
      const date = p.data.admission_date as string;
      if (!date) return;
      const month = date.slice(0, 7); // YYYY-MM
      if (!counts[month]) counts[month] = { total: 0, deaths: 0 };
      counts[month].total++;
      if ((p.data.outcome as string)?.startsWith("died")) {
        counts[month].deaths++;
      }
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Date filter */}
      <div className="flex gap-4 items-end">
        <div className="space-y-1">
          <Label>{t("from")}</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>{t("to")}</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("totalPatients")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("mortalityRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.mortalityRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("avgISS")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgISS}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("avgLOS")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgLOS}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("mechanismDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mechanismData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("noData")}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mechanismData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {mechanismData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("mortalityTrend")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("noData")}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total"
                    fill="#2563eb"
                    name={t("totalPatients")}
                  />
                  <Bar
                    dataKey="deaths"
                    fill="#dc2626"
                    name={t("mortalityRate")}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

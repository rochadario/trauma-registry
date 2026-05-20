"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Trash2, RefreshCw } from "lucide-react";
import type { ReviewComment, ReviewAction } from "@/lib/context/review-context";

const ACTION_BADGE: Record<ReviewAction, { label: string; className: string }> = {
  modify:     { label: "Modificar",          className: "bg-blue-100 text-blue-700 border-blue-200" },
  remove:     { label: "Eliminar",           className: "bg-red-100 text-red-700 border-red-200" },
  add_option: { label: "Agregar opción",     className: "bg-purple-100 text-purple-700 border-purple-200" },
  keep:       { label: "Está bien así",      className: "bg-green-100 text-green-700 border-green-200" },
};

interface Session {
  session_id: string;
  reviewer_name: string;
  created_at: string;
  comments: ReviewComment[];
}

export default function ReviewSummaryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("field_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) {
      setLoading(false);
      return;
    }

    // Group by session_id
    const map = new Map<string, Session>();
    for (const row of data as ReviewComment[]) {
      if (!map.has(row.session_id)) {
        map.set(row.session_id, {
          session_id: row.session_id,
          reviewer_name: row.reviewer_name,
          created_at: row.created_at ?? "",
          comments: [],
        });
      }
      map.get(row.session_id)!.comments.push(row);
    }

    const grouped = Array.from(map.values());
    setSessions(grouped);
    if (grouped.length > 0 && !selectedSessionId) {
      setSelectedSessionId(grouped[0].session_id);
    }
    setLoading(false);
  }, [selectedSessionId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const selected = sessions.find((s) => s.session_id === selectedSessionId);

  const handleDeleteSession = async (sessionId: string) => {
    const supabase = createClient();
    await supabase.from("field_reviews").delete().eq("session_id", sessionId);
    setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(sessions[0]?.session_id ?? null);
    }
  };

  const handleExportJSON = () => {
    if (!selected) return;

    const grouped: Record<string, ReviewComment[]> = {};
    for (const c of selected.comments) {
      const key = c.step_label ?? c.step_id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    }

    const output = {
      session_id: selected.session_id,
      reviewer: selected.reviewer_name,
      date: selected.created_at
        ? new Date(selected.created_at).toLocaleDateString("es-GT")
        : "—",
      total_comments: selected.comments.length,
      by_step: Object.entries(grouped).map(([step, comments]) => ({
        step,
        fields: comments.map((c) => ({
          field_name: c.field_name,
          field_label: c.field_label,
          action: c.action,
          comment: c.comment === "—" ? "" : c.comment,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revision_${selected.reviewer_name.replace(/\s+/g, "_")}_${selected.session_id.replace("review_", "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!selected) return;

    const header = ["Paso", "Campo (técnico)", "Campo (label)", "Tipo de cambio", "Comentario"];
    const rows = selected.comments.map((c) => [
      c.step_label ?? c.step_id,
      c.field_name,
      c.field_label,
      ACTION_BADGE[c.action]?.label ?? c.action,
      c.comment === "—" ? "" : c.comment,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revision_${selected.reviewer_name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group selected session's comments by step
  const commentsByStep: Record<string, ReviewComment[]> = {};
  if (selected) {
    for (const c of selected.comments) {
      const key = c.step_label ?? c.step_id;
      if (!commentsByStep[key]) commentsByStep[key] = [];
      commentsByStep[key].push(c);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resumen de revisión</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Comentarios de las revisoras sobre las variables del formulario
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReviews} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {loading && (
        <div className="text-center py-16 text-muted-foreground">Cargando...</div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium">Sin revisiones todavía</p>
          <p className="text-sm mt-1">
            Abre el formulario con <code className="bg-muted px-1 rounded">?review=true&amp;reviewer=Tu+Nombre</code> para empezar.
          </p>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-[240px_1fr] gap-6 items-start">
          {/* Session list */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-1">
              Sesiones
            </p>
            {sessions.map((s) => (
              <button
                key={s.session_id}
                type="button"
                onClick={() => setSelectedSessionId(s.session_id)}
                className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors ${
                  s.session_id === selectedSessionId
                    ? "bg-primary/5 border-primary/30"
                    : "hover:bg-muted border-transparent"
                }`}
              >
                <p className="font-medium text-sm truncate">{s.reviewer_name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.comments.length} comentario{s.comments.length !== 1 ? "s" : ""}
                </p>
                {s.created_at && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {new Date(s.created_at).toLocaleDateString("es-GT")}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Selected session detail */}
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{selected.reviewer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.comments.length} campo{selected.comments.length !== 1 ? "s" : ""} comentado{selected.comments.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleExportCSV}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportJSON}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteSession(selected.session_id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {Object.entries(commentsByStep).map(([stepLabel, comments]) => (
                <Card key={stepLabel}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      {stepLabel}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {comments.map((c) => (
                      <div
                        key={c.field_name}
                        className="flex gap-3 items-start border-b last:border-0 pb-3 last:pb-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{c.field_label}</span>
                            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {c.field_name}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                                ACTION_BADGE[c.action]?.className ?? ""
                              }`}
                            >
                              {ACTION_BADGE[c.action]?.label ?? c.action}
                            </span>
                          </div>
                          {c.comment && c.comment !== "—" && (
                            <p className="text-sm text-muted-foreground mt-1">{c.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

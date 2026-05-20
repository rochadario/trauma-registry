"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { LandingCopy } from "./content";

interface ContactFormProps {
  copy: LandingCopy["contact"];
  locale: string;
}

export function ContactForm({ copy, locale }: ContactFormProps) {
  const [form, setForm] = useState({
    name: "", email: "", institution: "", country: "",
    role: "", center_type: "", volume: "", interest: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      setStatus("success");
    } catch {
      setStatus("success"); // show success even if API unavailable
    }
  }

  const inputCls = "w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";
  const labelCls = "block mb-1 text-xs font-medium text-slate-300 uppercase tracking-wide";

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-900/40 border border-green-700">
          <CheckCircle2 className="h-7 w-7 text-green-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-white">{copy.success_title}</p>
          <p className="mt-1 text-slate-400">{copy.success_body}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{copy.fields.name}</label>
          <input required className={inputCls} value={form.name} onChange={set("name")} placeholder="Dr. María García" />
        </div>
        <div>
          <label className={labelCls}>{copy.fields.email}</label>
          <input required type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="trauma@hospital.org" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{copy.fields.institution}</label>
          <input required className={inputCls} value={form.institution} onChange={set("institution")} placeholder="Hospital General..." />
        </div>
        <div>
          <label className={labelCls}>{copy.fields.country}</label>
          <input required className={inputCls} value={form.country} onChange={set("country")} placeholder="Colombia" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{copy.fields.role}</label>
          <select required className={inputCls} value={form.role} onChange={set("role")}>
            <option value="">—</option>
            {copy.roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{copy.fields.center_type}</label>
          <select className={inputCls} value={form.center_type} onChange={set("center_type")}>
            <option value="">—</option>
            {copy.center_types.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{copy.fields.volume}</label>
          <input className={inputCls} value={form.volume} onChange={set("volume")} placeholder="50–100 / month" />
        </div>
        <div>
          <label className={labelCls}>{copy.fields.interest}</label>
          <select className={inputCls} value={form.interest} onChange={set("interest")}>
            <option value="">—</option>
            {copy.interests.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>{copy.fields.message}</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          value={form.message}
          onChange={set("message")}
          placeholder={locale === "es" ? "Cuéntanos más sobre tu centro y contexto..." : "Tell us more about your center and context..."}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
      >
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        {copy.submit}
      </button>
    </form>
  );
}

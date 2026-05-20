import type { Metadata } from "next";
import Link from "next/link";
import {
  WifiOff, Clock, LayoutDashboard, Smartphone, Users,
  Wifi, ListChecks, Languages, Calculator, Settings2, BarChart2, Download,
  Building2, Network, Globe, TrendingUp, AlertTriangle, Layers,
  BookOpen, LogIn, ArrowRight, CheckCircle2, Activity,
} from "lucide-react";
import { CONTENT, TEAM_MEMBERS, type Locale } from "@/components/landing/content";
import { LandingNav } from "@/components/landing/LandingNav";
import { ContactForm } from "@/components/landing/ContactForm";
import { TypewriterHeadline } from "@/components/landing/TypewriterHeadline";
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { ImportEngineDemo } from "@/components/landing/ImportEngineDemo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";
  return {
    title: "Open Trauma Registry | " + (isEs ? "Plataforma de registro de trauma de código abierto" : "Open-source trauma registry platform"),
    description: isEs
      ? "Plataforma de registro de trauma gratuita, sin conexión y bilingüe para la captura estandarizada de datos de trauma, monitoreo de calidad de datos, mejora de calidad e investigación multicéntrica."
      : "Free, offline-capable, bilingual trauma registry platform for standardized trauma data capture, quality improvement, and multicenter research.",
    openGraph: {
      title: "Open Trauma Registry",
      description: isEs
        ? "Plataforma de registro de trauma de código abierto para captura de datos sin conexión, scores automatizados, dashboards y exportación de datos."
        : "Open-source trauma registry platform for offline data capture, automated trauma scoring, dashboards, and data export.",
      url: "https://opentraumaregistry.org",
      siteName: "Open Trauma Registry",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Open Trauma Registry",
      description: isEs
        ? "Plataforma de registro de trauma de código abierto para captura de datos sin conexión, scores automatizados y exportación."
        : "Open-source trauma registry platform for offline data capture, automated trauma scoring, and data export.",
    },
  };
}

// ── Icon map ─────────────────────────────────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  WifiOff: <WifiOff className="h-5 w-5" />,
  Clock: <Clock className="h-5 w-5" />,
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Smartphone: <Smartphone className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Wifi: <Wifi className="h-5 w-5" />,
  ListChecks: <ListChecks className="h-5 w-5" />,
  Languages: <Languages className="h-5 w-5" />,
  Calculator: <Calculator className="h-5 w-5" />,
  Settings2: <Settings2 className="h-5 w-5" />,
  BarChart2: <BarChart2 className="h-5 w-5" />,
  Download: <Download className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
  Network: <Network className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  AlertTriangle: <AlertTriangle className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  Activity: <Activity className="h-5 w-5" />,
};

// ── Shared primitives ─────────────────────────────────────────────────────────
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-red-600">
      {children}
    </span>
  );
}

function SectionTagDark({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-red-400">
      {children}
    </span>
  );
}

function GroupDivider({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function TeamCard({ m, isEs }: { m: (typeof TEAM_MEMBERS)[number]; isEs: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:border-slate-200 hover:shadow-sm transition-all h-full">
      <div className="mb-3 flex items-center gap-3">
        {m.photo ? (
          <img src={m.photo} alt={m.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${m.color} text-sm font-bold text-white`}>
            {m.initials}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold leading-snug text-slate-900">
            {m.name}{m.flag && <span className="ml-1.5">{m.flag}</span>}
          </p>
          <p className="text-xs text-red-600 font-medium leading-snug">{isEs ? m.role_es : m.role_en}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{isEs ? m.bio_es : m.bio_en}</p>
    </div>
  );
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale === "es";
  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  const otherLocale = isEs ? "en" : "es";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <LandingNav copy={c.nav} locale={locale as Locale} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 pt-24 pb-36 sm:pt-32 sm:pb-52">
        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Red glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/20 blur-3xl" />
        {/* Bottom fade into next section */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-[#f2f2f4]" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            <TypewriterHeadline text={c.hero.headline} />
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
            {c.hero.subheadline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#demo"
              className="flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-900/40 hover:bg-red-700 transition-colors"
            >
              {c.hero.cta_demo}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {c.hero.cta_register}
            </a>
          </div>

        </div>
      </section>

      {/* ── CONTEXT ──────────────────────────────────────────────────────────── */}
      <section id="about" className="bg-[#f2f2f4] pt-10 pb-20 sm:pt-14 sm:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-12">
            <SectionTag>{c.context.tag}</SectionTag>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl max-w-3xl mx-auto">{c.context.title}</h2>
            <div className="mx-auto mt-6 max-w-2xl space-y-3 text-base text-slate-500 leading-relaxed">
              <p>{c.context.body1}</p>
              <p>{c.context.body2}</p>
            </div>
          </AnimateOnScroll>

          {/* Flow cards */}
          <div className="relative">
            {/* Connector line — desktop only */}
            <div className="pointer-events-none absolute top-8 left-[12.5%] right-[12.5%] hidden h-px bg-gradient-to-r from-transparent via-red-300 to-transparent lg:block" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.context.flow.map((step, i) => (
                <AnimateOnScroll key={step.num} delay={i * 80}>
                  <div className="relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center hover:shadow-sm hover:border-red-200 transition-all">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-500">
                      {ICONS[step.icon]}
                    </div>
                    <p className="mb-1 text-sm font-bold text-slate-900">{step.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AnimateOnScroll className="mb-12 text-center">
            <span className="inline-block rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-400">
              {c.problem.tag}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl max-w-3xl mx-auto">{c.problem.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 leading-relaxed">{c.problem.body}</p>
          </AnimateOnScroll>
          <div className="grid gap-6 sm:grid-cols-3">
            {c.problem.cards.map((card, i) => (
              <AnimateOnScroll key={card.title} delay={i * 100}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-7 h-full flex flex-col">
                  <div className="mb-4 text-5xl font-black text-red-500/30 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mb-2 text-base font-bold text-white leading-snug">{card.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{card.desc}</p>
                  {card.blockers.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {card.blockers.map((b) => (
                        <span key={b} className="inline-flex items-center gap-1 rounded-md border border-red-900/50 bg-red-950/50 px-2 py-0.5 text-[10px] font-medium text-red-400">
                          <span className="h-1 w-1 rounded-full bg-red-500 shrink-0" />
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </AnimateOnScroll>
            ))}
          </div>
          <AnimateOnScroll delay={350} className="mt-10 text-center">
            <p className="text-base font-semibold text-slate-300">
              <span className="text-red-400">→</span>{" "}{c.problem.closing}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── OUR SOLUTION ─────────────────────────────────────────────────────── */}
      <section className="bg-[#f2f2f4] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Left: copy + features + workflow */}
              <AnimateOnScroll className="p-8 lg:p-10 flex flex-col">
                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-red-500">{c.our_solution.tag}</div>
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{c.our_solution.title}</h2>
                <p className="mb-6 text-sm text-slate-500 leading-relaxed">{c.our_solution.body}</p>

                {/* Feature chips */}
                <div className="mb-8 flex flex-wrap gap-2">
                  {c.our_solution.features.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-red-500" />
                      {f}
                    </span>
                  ))}
                </div>

                {/* Workflow steps */}
                <div className="mt-auto border-t border-slate-100 pt-6 space-y-3">
                  {c.our_solution.workflow.map((w, i) => (
                    <div key={w.step} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-900">{w.step}</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{w.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>

              {/* Right: decorative mini dashboard */}
              <AnimateOnScroll delay={120} className="bg-slate-900 p-8 lg:p-10 flex flex-col gap-4">
                {/* Header bar */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      {isEs ? "Registro activo" : "Registry active"}
                    </span>
                  </div>
                  <span className="rounded-full border border-green-700/50 bg-green-900/40 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                    {isEs ? "Sincronizado" : "Synced"}
                  </span>
                </div>

                {/* Stat cards row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: isEs ? "Casos" : "Cases", value: "247", sub: isEs ? "este mes" : "this month" },
                    { label: isEs ? "Completitud" : "Completeness", value: "94%", sub: isEs ? "promedio" : "average" },
                    { label: isEs ? "Mortalidad" : "Mortality", value: "8.2%", sub: isEs ? "observada" : "observed" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                      <p className="text-lg font-black text-white leading-none">{s.value}</p>
                      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
                      <p className="text-[9px] text-slate-500">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Mechanism bar chart */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {isEs ? "Mecanismo de lesión" : "Mechanism of injury"}
                  </p>
                  {[
                    { label: isEs ? "Accidente vial" : "Road traffic", pct: 42 },
                    { label: isEs ? "Caída" : "Fall", pct: 28 },
                    { label: isEs ? "Violencia" : "Violence", pct: 18 },
                    { label: isEs ? "Otro" : "Other", pct: 12 },
                  ].map((row) => (
                    <div key={row.label} className="mb-2 last:mb-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-slate-400">{row.label}</span>
                        <span className="text-[10px] font-semibold text-slate-300">{row.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Export ready pill */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-300">{isEs ? "Exportación lista" : "Export ready"}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">CSV · Excel</span>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24 overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AnimateOnScroll className="mb-10 text-center">
            <SectionTag>{isEs ? "Véalo en acción" : "See It in Action"}</SectionTag>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {isEs ? "Del ingreso del paciente a datos útiles en minutos." : "The registry on your phone."}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500 leading-relaxed">
              {isEs
                ? "Una demostración rápida de cómo registrar un caso de trauma, revisar la calidad de los datos, calcular scores y exportar información."
                : "Capture trauma cases from any device, online or offline."}
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100} className="flex justify-center">
            {/* iPhone 14/15 frame */}
            <div className="relative" style={{ width: 272 }}>
              {/* Outer shell */}
              <div
                className="relative bg-slate-900 shadow-2xl shadow-slate-900/50"
                style={{ borderRadius: 44, padding: "10px 6px" }}
              >
                {/* Side buttons — volume */}
                <div className="absolute -left-[3px] top-20 w-[3px] h-8 rounded-l-full bg-slate-700" />
                <div className="absolute -left-[3px] top-32 w-[3px] h-8 rounded-l-full bg-slate-700" />
                {/* Side button — power */}
                <div className="absolute -right-[3px] top-24 w-[3px] h-12 rounded-r-full bg-slate-700" />

                {/* Screen area */}
                <div
                  className="relative overflow-hidden bg-black"
                  style={{ borderRadius: 36 }}
                >
                  {/* Video — screen recording already includes the status bar */}
                  <video
                    src="/demo-iphone.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="block w-full"
                    style={{ aspectRatio: "390/844" }}
                  />
                </div>

                {/* Home indicator */}
                <div className="mt-2 flex justify-center">
                  <div className="h-1 w-24 rounded-full bg-slate-600" />
                </div>
              </div>

              {/* Glow under the phone */}
              <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 h-12 w-48 rounded-full bg-red-600/20 blur-2xl" />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── SOLUTION ─────────────────────────────────────────────────────────── */}
      <section id="platform" className="bg-white pb-0 pt-16 sm:pt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AnimateOnScroll className="mb-12 text-center">
            <SectionTag>{c.solution.tag}</SectionTag>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{c.solution.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 leading-relaxed">{c.solution.body}</p>
          </AnimateOnScroll>
          <FeatureShowcase items={c.solution.features.map((f) => ({ title: f.title, desc: f.desc }))} />
        </div>
      </section>

      {/* ── PLATFORM ─────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <SectionTag>{c.platform.tag}</SectionTag>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{c.platform.title}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.platform.cards.map((card) => (
              <div key={card.icon} className="flex gap-4 rounded-2xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-sm transition-all">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  {ICONS[card.icon]}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">{card.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUATEMALA ────────────────────────────────────────────────────────── */}
      <section id="guatemala" className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTagDark>{c.guatemala.tag}</SectionTagDark>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {c.guatemala.title}
              </h2>
              <p className="mt-4 text-base text-slate-300 leading-relaxed">{c.guatemala.body}</p>
              <a
                href="#contact"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                {c.nav.cta_register}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Timeline */}
            <div className="relative pl-6">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-red-600 via-red-800 to-transparent" />
              <div className="space-y-8">
                {c.guatemala.timeline.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[25px] top-1.5 h-3 w-3 rounded-full border-2 border-red-500 bg-slate-900" />
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-red-400">{item.year}</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVIDENCE ─────────────────────────────────────────────────────────── */}
      <section id="evidence" className="bg-[#f2f2f4] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <SectionTag>{c.evidence.tag}</SectionTag>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{c.evidence.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 leading-relaxed">{c.evidence.subtitle}</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {isEs ? "Resumen presentado" : "Submitted abstract"}
                </span>
              </div>
            </div>
            <div className="px-6 py-6">
              <h3 className="mb-3 text-lg font-bold leading-snug text-slate-900">{c.evidence.abstract_title}</h3>
              <p className="mb-5 flex items-center gap-1.5 text-sm font-medium text-red-600">
                <Activity className="h-3.5 w-3.5 shrink-0" />
                {c.evidence.event}
              </p>
              <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {isEs ? "Hallazgos clave" : "Key findings"}
                </p>
                {c.evidence.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-sm text-slate-700 leading-snug">{f}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {c.evidence.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────────── */}
      <section id="team" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <SectionTag>{c.team.tag}</SectionTag>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{c.team.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">{c.team.subtitle}</p>
          </div>

          {/* Core team — single card, centered */}
          <div className="mx-auto max-w-sm">
            {TEAM_MEMBERS.filter((m) => m.group === "core").map((m) => (
              <TeamCard key={m.name} m={m} isEs={isEs} />
            ))}
          </div>

          {/* Research team */}
          <div className="mt-10">
            <GroupDivider label={c.team.research_title} />
            <div className="grid gap-4 sm:grid-cols-2">
              {TEAM_MEMBERS.filter((m) => m.group === "research").map((m) => (
                <TeamCard key={m.name} m={m} isEs={isEs} />
              ))}
            </div>
          </div>

          {/* Faculty advisors */}
          <div className="mt-10">
            <GroupDivider label={c.team.advisors_title} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM_MEMBERS.filter((m) => m.group === "advisors").map((m) => (
                <TeamCard key={m.name} m={m} isEs={isEs} />
              ))}
            </div>
          </div>

          {/* Guatemala implementation team */}
          <div className="mt-10">
            <GroupDivider label={c.team.guatemala_title} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM_MEMBERS.filter((m) => m.group === "guatemala").map((m) => (
                <TeamCard key={m.name} m={m} isEs={isEs} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ─────────────────────────────────────────────────────────── */}
      <section id="partners" className="bg-[#f2f2f4] py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <SectionTag>{c.partners.tag}</SectionTag>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{c.partners.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">{c.partners.subtitle}</p>
          </div>

          {/* Partner logos — no cards, just centered logos */}
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-10 sm:grid-cols-3 items-center justify-items-center">
              <img
                src="/logos/hospital-roosevelt.png"
                alt="Hospital Roosevelt, Guatemala"
                className="h-20 w-full object-contain"
              />
              <img
                src="/logos/brigham.png"
                alt="Brigham and Women's Hospital"
                className="h-14 w-full object-contain"
              />
              <img
                src="/logos/pgssc.png"
                alt="Program in Global Surgery and Social Change, Harvard Medical School"
                className="h-14 w-full object-contain"
              />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            {c.partners.future}{" "}
            <a href="#contact" className="font-semibold text-red-600 hover:text-red-700">
              {c.partners.future_cta} →
            </a>
          </p>
        </div>
      </section>

      {/* ── DEMO ─────────────────────────────────────────────────────────────── */}
      <section id="demo" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="mb-10 text-center">
            <SectionTag>{c.demo.tag}</SectionTag>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{c.demo.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">{c.demo.subtitle}</p>
          </div>

          {/* Single demo card — International */}
          <div className="rounded-2xl border border-red-200 bg-white p-6 ring-1 ring-red-200 shadow-lg shadow-red-50">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">🌎</span>
              <div>
                <p className="font-semibold text-slate-900">{isEs ? "Demo internacional" : "Sample registry demo"}</p>
                <p className="text-xs text-slate-500">Open Trauma Registry</p>
              </div>
              <span className="ml-auto rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                {isEs ? "Acceso directo" : "No registration needed"}
              </span>
            </div>

            <p className="mb-5 text-sm text-slate-600 leading-relaxed">
              {c.demo.note}
            </p>

            <div className="mb-5 grid grid-cols-2 gap-2 text-sm text-slate-600">
              {[
                isEs ? "16 pasos ATLS" : "ATLS-informed case form",
                isEs ? "Scores automáticos" : "Automatic score calculation",
                isEs ? "Panel de calidad de datos" : "Data quality checks",
                isEs ? "Exportación a Excel" : "CSV and Excel export",
              ].map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span className="text-xs text-slate-600">{f}</span>
                </div>
              ))}
            </div>

            <Link
              href={`/${locale}/demo`}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
            >
              <LogIn className="h-4 w-4" />
              {isEs ? "Probar la demo" : "Enter demo"}
            </Link>

            <p className="mt-3 text-center text-xs text-slate-400">
              {isEs ? "Sin registro · Acceso inmediato" : "No registration required · Instant access"}
            </p>
          </div>
        </div>
      </section>

      {/* ── IMPORT ENGINE DEMO ──────────────────────────────────────────────── */}
      <ImportEngineDemo isEs={isEs} />

      {/* ── IMPLEMENTATION ───────────────────────────────────────────────────── */}
      <section className="bg-[#f2f2f4] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <SectionTag>{c.implementation.tag}</SectionTag>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{c.implementation.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 leading-relaxed">{c.implementation.body}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.implementation.cards.map((card) => (
              <div key={card.icon} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  {ICONS[card.icon]}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-900/10 hover:bg-red-700 transition-colors"
            >
              {c.implementation.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────────── */}
      <section id="contact" className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <SectionTagDark>{c.contact.tag}</SectionTagDark>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {c.contact.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-400 leading-relaxed">{c.contact.subtitle}</p>
          </div>
          <ContactForm copy={c.contact} locale={locale} />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">Open Trauma Registry</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-end">
              {c.footer.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                  {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="border-t border-slate-800 pt-6">
            <p className="mb-3 max-w-2xl text-xs leading-relaxed text-slate-500">{c.footer.description}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-600">{c.footer.copyright}</p>
              <div className="flex items-center gap-3">
                <Link href={`/${locale === "en" ? "es" : "en"}`} className="text-xs text-slate-500 hover:text-white transition-colors">
                  {locale === "en" ? "Español" : "English"}
                </Link>
                <Link href={`/${locale}/login`} className="text-xs text-slate-500 hover:text-white transition-colors">
                  {isEs ? "Iniciar sesión" : "Log in"}
                </Link>
                <Link href={`/${locale}/register`} className="text-xs text-slate-500 hover:text-white transition-colors">
                  {isEs ? "Registrarse" : "Sign up"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

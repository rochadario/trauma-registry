"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Activity, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

const DEMO_EMAIL = "demo@respondtraumaregistry.com";
const DEMO_PASSWORD = "RESPOND2026!";

export default function DemoPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
  const isEs = locale === "es";
  const [error, setError] = useState(false);

  useEffect(() => {
    async function autoLogin() {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (error) {
        setError(true);
      } else {
        router.replace(`/${locale}/patients`);
      }
    }
    autoLogin();
  }, [locale, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-slate-900">
          {isEs ? "Error al iniciar demo" : "Demo login failed"}
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          {isEs
            ? "No se pudo iniciar sesión automáticamente. Ingresa las credenciales manualmente."
            : "Could not auto-login. Please enter credentials manually."}
        </p>
        <div className="mb-4 rounded-xl bg-white border border-slate-200 p-4 text-left font-mono text-xs space-y-1.5 w-full max-w-xs">
          <div><span className="text-slate-400">Email: </span><span className="select-all text-slate-800">{DEMO_EMAIL}</span></div>
          <div><span className="text-slate-400">{isEs ? "Contraseña: " : "Password: "}</span><span className="select-all text-slate-800">{DEMO_PASSWORD}</span></div>
        </div>
        <Link
          href={`/${locale}/login`}
          className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          {isEs ? "Ir al login" : "Go to login"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 gap-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600">
        <Activity className="h-6 w-6 text-white" />
      </div>
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-red-400" />
        <span className="text-base font-medium text-slate-300">
          {isEs ? "Cargando demo..." : "Loading demo..."}
        </span>
      </div>
    </div>
  );
}

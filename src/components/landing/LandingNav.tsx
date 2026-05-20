"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { LandingCopy, Locale } from "./content";

interface LandingNavProps {
  copy: LandingCopy["nav"];
  locale: Locale;
}

export function LandingNav({ copy, locale }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const otherLocale = locale === "en" ? "es" : "en";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-slate-200" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm overflow-hidden p-0.5">
            <img src="/logo-icon.png" alt="OpenTrauma Registry" className="h-full w-full object-contain" />
          </div>
          <div className="leading-none">
            <span className={`block text-xs font-semibold leading-tight ${scrolled ? "text-slate-500" : "text-white/60"}`}>
              Open
            </span>
            <span className={`block text-sm font-bold leading-tight ${scrolled ? "text-slate-900" : "text-white"}`}>
              <span className="text-red-500">Trauma</span>{" "}Registry
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {copy.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                scrolled
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={`/${otherLocale}`}
            className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
              scrolled ? "text-slate-500 hover:text-slate-900" : "text-white/70 hover:text-white"
            }`}
          >
            {copy.lang_toggle}
          </Link>
          <a
            href="#demo"
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              scrolled
                ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                : "border-white/30 text-white hover:bg-white/10"
            }`}
          >
            {copy.cta_demo}
          </a>
          <a
            href="#contact"
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            {copy.cta_register}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className={`rounded-md p-2 lg:hidden ${scrolled ? "text-slate-700" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {copy.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <Link
              href={`/${otherLocale}`}
              className="rounded-md px-3 py-2 text-center text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              {copy.lang_toggle}
            </Link>
            <a
              href="#demo"
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {copy.cta_demo}
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="rounded-md bg-red-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-red-700"
            >
              {copy.cta_register}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

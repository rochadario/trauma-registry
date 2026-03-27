"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { GUATEMALA_MUNICIPALITIES } from "@/lib/data/guatemala-municipalities";

interface MunicipalityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function MunicipalityCombobox({ value, onChange, disabled }: MunicipalityComboboxProps) {
  const t = useTranslations();
  const { setValue: setFormValue } = useFormContext();
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered =
    query.length < 1
      ? []
      : GUATEMALA_MUNICIPALITIES.filter((m) =>
          normalize(m.name).includes(normalize(query)) ||
          normalize(m.department).includes(normalize(query))
        ).slice(0, 8);

  function handleSelect(name: string, department: string) {
    setQuery(name);
    onChange(name);
    setFormValue("patient_department", department, { shouldDirty: true });
    setOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 1 && setOpen(true)}
        placeholder={t("fields.patient_municipality_placeholder")}
        disabled={disabled}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md overflow-hidden">
          {filtered.map((m) => (
            <button
              key={`${m.name}-${m.department}`}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center justify-between"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(m.name, m.department)}
            >
              <span>{m.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{m.department}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

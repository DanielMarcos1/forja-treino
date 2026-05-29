import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale, isLocale } from "@/i18n";
import { useLocale } from "@/i18n/useLocale";

const LABELS: Record<Locale, { country: string; code: string; name: string }> = {
  pt: { country: "br", code: "PT", name: "Português" },
  en: { country: "us", code: "EN", name: "English" },
  es: { country: "es", code: "ES", name: "Español" },
  fr: { country: "fr", code: "FR", name: "Français" },
};

function Flag({ country, className = "" }: { country: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${country}.png`}
      srcSet={`https://flagcdn.com/w80/${country}.png 2x`}
      alt=""
      aria-hidden
      className={`inline-block h-4 w-6 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${className}`}
      loading="lazy"
    />
  );
}

const LOCALE_KEY = "forja.locale";

function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(en|es|fr)(\/.*)?$/);
  if (!m) return pathname || "/";
  return m[2] || "/";
}

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const current = useLocale();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function onChange(next: Locale) {
    try {
      localStorage.setItem(LOCALE_KEY, next);
    } catch {
      // ignore
    }
    setOpen(false);
    if (!isLocale(next)) return;
    const base = stripLocale(pathname);
    const target = next === DEFAULT_LOCALE ? base : `/${next}${base === "/" ? "" : base}`;
    navigate({ to: target });
  }

  const cur = LABELS[current];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("switcher.label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:border-primary/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Flag country={cur.country} />
        <span className="tracking-wide">{cur.code}</span>
        <svg
          className={`h-3 w-3 text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("switcher.label")}
          className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-1 shadow-lg backdrop-blur"
        >
          {SUPPORTED_LOCALES.map((l) => {
            const item = LABELS[l];
            const active = l === current;
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onChange(l)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Flag country={item.country} />
                  <span className="flex-1 text-left">{item.name}</span>
                  <span className="text-xs font-semibold tracking-wide text-foreground/50">{item.code}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export { LOCALE_KEY };

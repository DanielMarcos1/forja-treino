import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale, isLocale } from "@/i18n";
import { useLocale } from "@/i18n/useLocale";

const LABELS: Record<Locale, string> = {
  pt: "🇧🇷 PT",
  en: "🇺🇸 EN",
  es: "🇪🇸 ES",
  fr: "🇫🇷 FR",
};

const LOCALE_KEY = "forja.locale";

/** Strip any leading /en, /es, /fr from a pathname; PT is at root. */
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

  function onChange(next: Locale) {
    try {
      localStorage.setItem(LOCALE_KEY, next);
    } catch {
      // ignore
    }
    const base = stripLocale(pathname);
    const target = next === DEFAULT_LOCALE ? base : `/${next}${base === "/" ? "" : base}`;
    navigate({ to: target });
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("switcher.label")}</span>
      <select
        aria-label={t("switcher.label")}
        value={current}
        onChange={(e) => {
          const v = e.target.value;
          if (isLocale(v)) onChange(v);
        }}
        className="cursor-pointer appearance-none rounded-full border border-border bg-background px-3 py-1.5 pr-7 text-xs font-semibold text-foreground/80 transition hover:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l} value={l}>
            {LABELS[l]}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2 h-3 w-3 text-foreground/60" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

export { LOCALE_KEY };

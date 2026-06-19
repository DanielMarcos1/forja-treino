import type { Locale } from "@/i18n";

const QUERY_TEMPLATES: Record<Locale, (name: string) => string> = {
  pt: (n) => `como fazer ${n} exercício técnica`,
  en: (n) => `how to do ${n} exercise proper form`,
  es: (n) => `cómo hacer ${n} ejercicio técnica`,
  fr: (n) => `comment faire ${n} exercice technique`,
};

export function youtubeSearchUrl(name: string, locale: Locale): string {
  const tpl = QUERY_TEMPLATES[locale] ?? QUERY_TEMPLATES.pt;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(tpl(name))}`;
}

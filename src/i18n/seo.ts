import i18n, { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n";

const BASE_URL = "https://forjatreino.com";

/** Build absolute URL for a given locale + base path (e.g. "/", "/gerar"). */
export function urlFor(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return `${BASE_URL}${clean === "/" ? "" : clean}` || BASE_URL;
  return `${BASE_URL}/${locale}${clean === "/" ? "" : clean}`;
}

type Keys = {
  titleKey: string;
  descKey: string;
  ogTitleKey?: string;
  ogDescKey?: string;
};

/**
 * Build a per-route head() object with translated title/description,
 * canonical, og:url, and hreflang alternates for all supported locales.
 */
export function localizedHead(locale: Locale, path: string, keys: Keys) {
  // Ensure i18next can read the requested locale's resources synchronously.
  const tr = (k: string) => i18n.getFixedT(locale)(k);

  const title = tr(keys.titleKey);
  const desc = tr(keys.descKey);
  const ogTitle = tr(keys.ogTitleKey ?? keys.titleKey);
  const ogDesc = tr(keys.ogDescKey ?? keys.descKey);
  const url = urlFor(locale, path);

  const alternates = SUPPORTED_LOCALES.map((l) => ({
    rel: "alternate" as const,
    hrefLang: l,
    href: urlFor(l, path),
  }));

  return {
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDesc },
      { property: "og:url", content: url },
      { property: "og:locale", content: ogLocale(locale) },
    ],
    links: [
      { rel: "canonical", href: url },
      ...alternates,
      { rel: "alternate", hrefLang: "x-default", href: urlFor(DEFAULT_LOCALE, path) },
    ],
  };
}

function ogLocale(l: Locale): string {
  switch (l) {
    case "pt": return "pt_BR";
    case "en": return "en_US";
    case "es": return "es_ES";
    case "fr": return "fr_FR";
  }
}

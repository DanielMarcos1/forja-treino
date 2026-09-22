import i18n, { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n";
import socialShareImage from "@/assets/forja-social-share.jpg.asset.json";

const BASE_URL = "https://forjatreino.com";
const SOCIAL_SHARE_IMAGE_URL = `${BASE_URL}${socialShareImage.url}`;

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
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:locale", content: ogLocale(locale) },
      { property: "og:image", content: SOCIAL_SHARE_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Forja — Treinos personalizados por IA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: ogTitle },
      { name: "twitter:description", content: ogDesc },
      { name: "twitter:image", content: SOCIAL_SHARE_IMAGE_URL },
      { name: "twitter:image:alt", content: "Forja — Treinos personalizados por IA" },
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

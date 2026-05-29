import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import i18n, { DEFAULT_LOCALE, isLocale, type Locale } from "./index";

/** Returns the active locale parsed from the URL (defaults to PT when absent). */
export function useLocale(): Locale {
  const params = useParams({ strict: false }) as { locale?: string };
  const raw = params.locale;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  return locale;
}

/** Convert a Locale to the value used in <Link params={{ locale }}>. PT → undefined (root). */
export function localeParam(locale: Locale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale;
}

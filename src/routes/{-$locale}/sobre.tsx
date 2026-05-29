import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useLocale } from "@/i18n/useLocale";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { localizedHead } from "@/i18n/seo";

export const Route = createFileRoute("/{-$locale}/sobre")({
  head: ({ params }) => {
    const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    return localizedHead(locale, "/sobre", {
      titleKey: "meta.sobre_title",
      descKey: "meta.sobre_desc",
      ogDescKey: "meta.sobre_og_desc",
    });
  },
  component: Sobre,
});

function Sobre() {
  const { t } = useTranslation();
  useLocale();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-4xl md:text-5xl">{t("sobre.h1")}</h1>
        <p className="mt-6 text-lg text-muted-foreground">{t("sobre.intro")}</p>

        <h2 className="mt-12 text-2xl">{t("sobre.how_h2")}</h2>
        <ol className="mt-4 space-y-3 text-foreground/90">
          <li><span className="font-semibold text-primary">1.</span> {t("sobre.step1")}</li>
          <li><span className="font-semibold text-primary">2.</span> {t("sobre.step2")}</li>
          <li><span className="font-semibold text-primary">3.</span> {t("sobre.step3")}</li>
        </ol>

        <h2 className="mt-12 text-2xl">{t("sobre.warn_h2")}</h2>
        <p className="mt-4 text-muted-foreground">{t("sobre.warn")}</p>
      </main>
      <SiteFooter />
    </div>
  );
}

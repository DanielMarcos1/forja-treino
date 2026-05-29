import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Sparkles, Dumbbell, Clock, Target } from "lucide-react";
import { useLocale, localeParam } from "@/i18n/useLocale";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { localizedHead } from "@/i18n/seo";

export const Route = createFileRoute("/{-$locale}/")({
  head: ({ params }) => {
    const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    return localizedHead(locale, "/", {
      titleKey: "meta.home_title",
      descKey: "meta.home_desc",
      ogTitleKey: "meta.home_og_title",
      ogDescKey: "meta.home_og_desc",
    });
  },
  component: Index,
});

function Index() {
  const { t } = useTranslation();
  const locale = useLocale();
  const lp = localeParam(locale);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-16 h-72 w-72 diamond bg-secondary/40 blur-3xl" />
          <div className="absolute top-32 -right-20 h-80 w-80 diamond bg-primary/30 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> {t("home.badge")}
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
              {t("home.h1_part1")} <span className="text-primary">{t("home.h1_highlight")}</span> {t("home.h1_part2")}
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              {t("home.lede")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/{-$locale}/login"
                params={{ locale: lp }}
                preload="intent"
                className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition hover:brightness-95"
              >
                {t("home.cta_primary")}
              </Link>
              <Link
                to="/{-$locale}/sobre"
                params={{ locale: lp }}
                className="inline-flex items-center justify-center rounded-full border border-foreground/15 px-7 py-3.5 text-base font-semibold transition hover:bg-foreground/5"
              >
                {t("home.cta_secondary")}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-10 aspect-square w-[78%] max-w-[420px] md:mt-0 md:w-full">
            <div className="absolute inset-0 diamond bg-secondary" />
            <div className="absolute inset-[10%] diamond bg-primary" />
            <div className="absolute inset-[24%] diamond bg-navy" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell className="h-14 w-14 text-cream sm:h-16 sm:w-16" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: t("home.features.personalized_title"), desc: t("home.features.personalized_desc") },
            { icon: Clock, title: t("home.features.fast_title"), desc: t("home.features.fast_desc") },
            { icon: Dumbbell, title: t("home.features.structured_title"), desc: t("home.features.structured_desc") },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl bg-card p-7 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl">{f.title}</h2>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-navy p-8 text-cream sm:p-10 md:p-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 diamond bg-primary/40" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 diamond bg-secondary/40" />
          <h2 className="relative font-display text-2xl sm:text-3xl md:text-4xl">{t("home.cta_strip_title")}</h2>
          <p className="relative mt-3 max-w-xl text-cream/80">{t("home.cta_strip_lede")}</p>
          <Link
            to="/{-$locale}/login"
            params={{ locale: lp }}
            preload="intent"
            className="relative mt-6 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition hover:brightness-95"
          >
            {t("home.cta_strip_button")}
          </Link>
        </div>
      </section>
      </main>

      <SiteFooter />
    </div>
  );
}

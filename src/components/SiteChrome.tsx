import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import faviconUrl from "@/assets/favicon.svg?url";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/i18n/useLocale";
import { localeParam } from "@/i18n/useLocale";

export function Logo({ className = "" }: { className?: string }) {
  const locale = useLocale();
  return (
    <Link
      to="/{-$locale}"
      params={{ locale: localeParam(locale) }}
      className={`flex items-center gap-2 font-display font-extrabold text-xl text-foreground ${className}`}
    >
      <img src={faviconUrl} alt="Forja" className="h-8 w-8" />
      Forja
    </Link>
  );
}

export function SiteHeader() {
  const { t } = useTranslation();
  const locale = useLocale();
  const lp = localeParam(locale);
  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link to="/{-$locale}" params={{ locale: lp }} activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">{t("nav.home")}</Link>
          <Link to="/{-$locale}/gerar" params={{ locale: lp }} activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">{t("nav.generate")}</Link>
          <Link to="/{-$locale}/meus-treinos" params={{ locale: lp }} activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">{t("nav.my_workouts")}</Link>
          <Link to="/{-$locale}/sobre" params={{ locale: lp }} activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">{t("nav.about")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/{-$locale}/login"
            params={{ locale: lp }}
            preload="intent"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
          >
            {t("nav.start")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="no-print mt-24 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center">
        <Logo />
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Forja — {t("footer.rights")}</p>
      </div>
    </footer>
  );
}

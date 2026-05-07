import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display font-extrabold text-xl text-foreground ${className}`}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <span className="absolute inset-0 diamond bg-primary" />
        <span className="absolute inset-1 diamond bg-secondary" />
      </span>
      Forja
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link to="/" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">Início</Link>
          <Link to="/gerar" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">Montar treino</Link>
          <Link to="/sobre" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">Sobre</Link>
        </nav>
        <Link
          to="/login"
          preload="intent"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
        >
          Começar
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center">
        <Logo />
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Forja — Treinos por IA</p>
      </div>
    </footer>
  );
}

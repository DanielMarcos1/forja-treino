import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Sparkles, Dumbbell, Clock, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forja — Seu treino, montado por IA" },
      { name: "description", content: "Monte um treino personalizado em segundos com base no seu perfil, objetivo e tempo disponível." },
      { property: "og:title", content: "Forja — Seu treino, montado por IA" },
      { property: "og:description", content: "Treinos personalizados, gerados por IA, prontos em segundos." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-16 h-72 w-72 diamond bg-secondary/40 blur-3xl" />
          <div className="absolute top-32 -right-20 h-80 w-80 diamond bg-primary/30 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Potencializado por IA
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-6xl">
              Seu treino, <span className="text-primary">forjado</span> sob medida.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Conte seu objetivo, nível e tempo disponível. Em segundos, a IA monta um plano completo com séries, repetições e descanso.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                preload="intent"
                className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition hover:brightness-95"
              >
                Montar meu treino
              </Link>
              <Link
                to="/sobre"
                className="inline-flex items-center justify-center rounded-full border border-foreground/15 px-7 py-3.5 text-base font-semibold transition hover:bg-foreground/5"
              >
                Como funciona
              </Link>
            </div>
          </div>

          {/* Diamond composition */}
          <div className="relative mx-auto h-[420px] w-[420px] max-w-full">
            <div className="absolute inset-0 diamond bg-secondary" />
            <div className="absolute inset-10 diamond bg-primary" />
            <div className="absolute inset-24 diamond bg-navy" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell className="h-16 w-16 text-cream" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Personalizado", desc: "Adaptado ao seu nível, objetivo e equipamentos disponíveis." },
            { icon: Clock, title: "Rápido", desc: "Pronto em segundos — pare de improvisar na academia." },
            { icon: Dumbbell, title: "Estruturado", desc: "Séries, reps, descanso, aquecimento e alongamento." },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl bg-card p-7 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-navy p-10 text-cream md:p-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 diamond bg-primary/40" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 diamond bg-secondary/40" />
          <h2 className="relative font-display text-3xl md:text-4xl">Pronto para forjar seu treino?</h2>
          <p className="relative mt-3 max-w-xl text-cream/80">Leva menos de um minuto. Sem cadastro.</p>
          <Link
            to="/gerar"
            className="relative mt-6 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition hover:brightness-95"
          >
            Começar agora
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

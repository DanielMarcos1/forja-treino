import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Forja — Treinos personalizados por IA" },
      { name: "description", content: "Conheça a Forja: como usamos IA para montar planos de treino personalizados em segundos." },
      { property: "og:title", content: "Sobre a Forja — Treinos personalizados por IA" },
      { property: "og:description", content: "Como a Forja monta seu treino com IA — metodologia, etapas e cuidados antes de começar." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-4xl md:text-5xl">Sobre a Forja</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Forja é um montador de treinos que usa inteligência artificial para criar planos
          personalizados em segundos. Você responde algumas perguntas sobre seu perfil, objetivo
          e tempo disponível — e recebe um treino estruturado, com séries, repetições, descanso,
          aquecimento e alongamento.
        </p>

        <h2 className="mt-12 text-2xl">Como funciona</h2>
        <ol className="mt-4 space-y-3 text-foreground/90">
          <li><span className="font-semibold text-primary">1.</span> Conte seu perfil: idade, sexo, nível e objetivo.</li>
          <li><span className="font-semibold text-primary">2.</span> Indique onde treina, quantos dias por semana e quanto tempo por sessão.</li>
          <li><span className="font-semibold text-primary">3.</span> A IA monta seu plano e você pode imprimir, copiar ou refazer.</li>
        </ol>

        <h2 className="mt-12 text-2xl">Aviso importante</h2>
        <p className="mt-4 text-muted-foreground">
          O Forja gera sugestões de treino. Antes de iniciar qualquer programa de exercícios,
          consulte um profissional de saúde, especialmente se você tiver lesões ou condições médicas.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

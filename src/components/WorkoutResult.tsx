import { useTranslation } from "react-i18next";
import { Copy, Printer, RefreshCcw, Dumbbell, Clock, PlayCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { youtubeSearchUrl } from "@/lib/exerciseVideo";
import { useLocale } from "@/i18n/useLocale";

export type Exercicio = { nome: string; series: number; reps: string; descanso: string; observacao?: string };
export type Dia = { nome: string; aquecimento: string; exercicios: Exercicio[]; alongamento: string };
export type Treino = { titulo: string; resumo: string; diasPorSemana: number; duracaoMin: number; dias: Dia[]; dicas: string[] };

type Props = {
  treino: Treino;
  activeDay: number;
  setActiveDay: (n: number) => void;
  onRestart?: () => void;
  backLabel?: string;
  onBack?: () => void;
};

export function WorkoutResult({ treino, activeDay, setActiveDay, onRestart, onBack, backLabel }: Props) {
  const { t } = useTranslation();
  const dia = treino.dias[activeDay];

  function copiar() {
    const txt = [
      treino.titulo, treino.resumo, "",
      ...treino.dias.map((d) =>
        [
          `\n${d.nome}`,
          `${t("gerar.warmup")}: ${d.aquecimento}`,
          ...d.exercicios.map((e) => `- ${e.nome} — ${e.series}x${e.reps} (${e.descanso})${e.observacao ? ` — ${e.observacao}` : ""}`),
          `${t("gerar.stretch")}: ${d.alongamento}`,
        ].join("\n")
      ),
      "", `${t("gerar.tips")}:`,
      ...treino.dicas.map((d) => `- ${d}`),
    ].join("\n");
    navigator.clipboard.writeText(txt);
    toast.success(t("gerar.copied"));
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-navy p-6 text-cream sm:p-8 md:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 diamond bg-primary/40" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 diamond bg-secondary/40" />
        <h1 className="relative font-display text-2xl sm:text-3xl md:text-4xl">{treino.titulo}</h1>
        <p className="relative mt-3 max-w-2xl text-cream/85">{treino.resumo}</p>
        <div className="relative mt-6 flex flex-wrap gap-2">
          <Badge icon={<Dumbbell className="h-3.5 w-3.5" />}>{t("gerar.days_per_week", { n: treino.diasPorSemana })}</Badge>
          <Badge icon={<Clock className="h-3.5 w-3.5" />}>{t("gerar.min_per_session", { n: treino.duracaoMin })}</Badge>
        </div>
      </div>

      <div className="no-print mt-6 flex flex-wrap gap-2">
        {onBack && (
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-foreground/5">
            <ArrowLeft className="h-4 w-4" /> {backLabel ?? t("gerar.back")}
          </button>
        )}
        {onRestart && (
          <button onClick={onRestart} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-foreground/5">
            <RefreshCcw className="h-4 w-4" /> {t("gerar.restart")}
          </button>
        )}
        <button onClick={copiar} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-foreground/5">
          <Copy className="h-4 w-4" /> {t("gerar.copy")}
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-95">
          <Printer className="h-4 w-4" /> {t("gerar.print")}
        </button>
      </div>

      <div className="no-print mt-8 flex flex-wrap gap-2">
        {treino.dias.map((_d, i) => (
          <button key={i} onClick={() => setActiveDay(i)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${i === activeDay ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30"}`}>
            {t("gerar.day_label", { letter: String.fromCharCode(65 + i) })}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6 print:space-y-0">
        <DiaCard dia={dia} index={activeDay} className="print:hidden" />
        <div className="hidden print:block">
          {treino.dias.map((d, i) => (
            <div key={i} className="print-page">
              <DiaCard dia={d} index={i} className="print-day" />
            </div>
          ))}
        </div>
      </div>

      {treino.dicas?.length > 0 && (
        <div className="mt-8 rounded-3xl bg-secondary/30 p-7 print-tips print:bg-white print:p-0">
          <h3 className="font-display text-xl">{t("gerar.tips")}</h3>
          <ul className="mt-3 space-y-2 text-foreground/90">
            {treino.dicas.map((d, i) => (
              <li key={i} className="flex gap-2 print-avoid-break"><span className="text-primary">•</span> {d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Badge({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3 py-1 text-xs font-semibold text-cream">
      {icon} {children}
    </span>
  );
}

function DiaCard({ dia, index, className = "" }: { dia: Dia; index: number; className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <div className={`rounded-3xl bg-card p-7 shadow-sm md:p-8 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl">{t("gerar.day_label", { letter: String.fromCharCode(65 + index) })} — {dia.nome}</h2>
      </div>
      <p className="mt-3 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{t("gerar.warmup")}:</span> {dia.aquecimento}</p>

      <div className="mt-6 grid gap-3 ex-grid">
        {dia.exercicios.map((e, i) => (
          <div key={i} className="rounded-2xl border border-border bg-background p-4 ex-card print-avoid-break">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-semibold">{e.nome}</div>
              <div className="text-sm text-muted-foreground">{e.descanso}</div>
            </div>
            <div className="mt-1 text-sm">
              <span className="font-semibold text-primary">{e.series}</span>
              <span className="text-muted-foreground"> × </span>
              <span className="font-semibold text-primary">{e.reps}</span>
            </div>
            {e.observacao && <div className="mt-2 text-sm text-muted-foreground">{e.observacao}</div>}
            <a
              href={youtubeSearchUrl(e.nome, locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="no-print mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <PlayCircle className="h-4 w-4" />
              {t("gerar.see_demo")}
            </a>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{t("gerar.stretch")}:</span> {dia.alongamento}</p>
    </div>
  );
}

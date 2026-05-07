import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Printer, Copy, RefreshCcw, Dumbbell, Clock, Flame, ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/gerar")({
  head: () => ({
    meta: [
      { title: "Montar treino — Forja" },
      { name: "description", content: "Responda algumas perguntas e receba um treino personalizado por IA." },
      { property: "og:title", content: "Montar treino — Forja" },
      { property: "og:description", content: "Treino personalizado em segundos." },
    ],
  }),
  component: Gerar,
});

type Form = {
  sexo: string;
  idade: string;
  nivel: string;
  objetivo: string;
  local: string;
  dias: string;
  tempo: string;
  foco: string[];
  restricoes: string;
};

type Exercicio = { nome: string; series: number; reps: string; descanso: string; observacao?: string };
type Dia = { nome: string; aquecimento: string; exercicios: Exercicio[]; alongamento: string };
type Treino = { titulo: string; resumo: string; diasPorSemana: number; duracaoMin: number; dias: Dia[]; dicas: string[] };

const initial: Form = {
  sexo: "", idade: "", nivel: "", objetivo: "", local: "",
  dias: "3", tempo: "45", foco: [], restricoes: "",
};

const SEXOS = [
  { v: "masculino", l: "Masculino" },
  { v: "feminino", l: "Feminino" },
  { v: "outro", l: "Prefiro não dizer" },
];
const NIVEIS = [
  { v: "iniciante", l: "Iniciante", d: "Pouca ou nenhuma experiência" },
  { v: "intermediario", l: "Intermediário", d: "Treina há alguns meses" },
  { v: "avancado", l: "Avançado", d: "Treina há mais de 1 ano" },
];
const OBJETIVOS = [
  { v: "hipertrofia", l: "Hipertrofia" },
  { v: "emagrecimento", l: "Emagrecimento" },
  { v: "condicionamento", l: "Condicionamento" },
  { v: "forca", l: "Força" },
  { v: "mobilidade", l: "Mobilidade" },
];
const LOCAIS = [
  { v: "academia", l: "Academia completa" },
  { v: "casa-equip", l: "Casa com equipamentos" },
  { v: "casa-livre", l: "Casa sem equipamentos" },
  { v: "ar-livre", l: "Ar livre" },
];
const FOCOS = ["Peito", "Costas", "Pernas", "Glúteos", "Braços", "Core", "Cardio"];

function Gerar() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [loading, setLoading] = useState(false);
  const [treino, setTreino] = useState<Treino | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
      else setAuthChecked(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setAuthChecked(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleFoco = (f: string) =>
    setForm((s) => ({ ...s, foco: s.foco.includes(f) ? s.foco.filter((x) => x !== f) : [...s.foco, f] }));

  const validStep = () => {
    if (step === 0) return form.sexo && form.idade && Number(form.idade) > 0 && form.nivel;
    if (step === 1) return form.objetivo && form.local;
    if (step === 2) return form.dias && form.tempo;
    return true;
  };

  async function gerar() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout", {
        body: {
          sexo: form.sexo,
          idade: Number(form.idade),
          nivel: form.nivel,
          objetivo: form.objetivo,
          local: form.local,
          dias: Number(form.dias),
          tempo: Number(form.tempo),
          foco: form.foco,
          restricoes: form.restricoes,
        },
      });
      if (error) {
        const msg = error.message || "";
        if (msg.includes("429")) toast.error("Muitas requisições. Tente novamente em instantes.");
        else if (msg.includes("402")) toast.error("Créditos de IA esgotados. Adicione créditos no workspace.");
        else toast.error("Não foi possível gerar o treino. Tente novamente.");
        return;
      }
      if (data?.treino) {
        setTreino(data.treino);
        setActiveDay(0);
      } else {
        toast.error("Resposta inesperada da IA.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function reiniciar() {
    setTreino(null);
    setStep(0);
  }

  function copiar() {
    if (!treino) return;
    const txt = [
      treino.titulo,
      treino.resumo,
      "",
      ...treino.dias.map((d) =>
        [
          `\n${d.nome}`,
          `Aquecimento: ${d.aquecimento}`,
          ...d.exercicios.map((e) => `- ${e.nome} — ${e.series}x${e.reps} (descanso ${e.descanso})${e.observacao ? ` — ${e.observacao}` : ""}`),
          `Alongamento: ${d.alongamento}`,
        ].join("\n")
      ),
      "",
      "Dicas:",
      ...treino.dicas.map((d) => `- ${d}`),
    ].join("\n");
    navigator.clipboard.writeText(txt);
    toast.success("Treino copiado!");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster richColors position="top-center" />
      <main className="mx-auto max-w-4xl px-6 py-12">
        {!treino ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <h1 className="font-display text-3xl md:text-4xl">Vamos montar seu treino</h1>
              <span className="text-sm text-muted-foreground">Etapa {step + 1} de 4</span>
            </div>

            {/* progress */}
            <div className="mb-10 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((step + 1) / 4) * 100}%` }}
              />
            </div>

            <div className="rounded-3xl bg-card p-8 shadow-sm md:p-10">
              {step === 0 && (
                <Step title="Sobre você">
                  <Field label="Sexo">
                    <Choices
                      value={form.sexo}
                      onChange={(v) => update("sexo", v)}
                      options={SEXOS.map((s) => ({ value: s.v, label: s.l }))}
                    />
                  </Field>
                  <Field label="Idade">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={10}
                      max={100}
                      value={form.idade}
                      onChange={(e) => update("idade", e.target.value)}
                      placeholder="Ex.: 28"
                      className="w-40 rounded-2xl border border-border bg-background px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                  <Field label="Nível">
                    <div className="grid gap-3 md:grid-cols-3">
                      {NIVEIS.map((n) => (
                        <button
                          type="button"
                          key={n.v}
                          onClick={() => update("nivel", n.v)}
                          className={`rounded-2xl border-2 p-4 text-left transition ${
                            form.nivel === n.v
                              ? "border-primary bg-primary/15 ring-2 ring-primary/30"
                              : "border-border hover:border-foreground/30"
                          }`}
                        >
                          <div className="font-semibold">{n.l}</div>
                          <div className="text-sm text-muted-foreground">{n.d}</div>
                        </button>
                      ))}
                    </div>
                  </Field>
                </Step>
              )}

              {step === 1 && (
                <Step title="Seu objetivo">
                  <Field label="O que você quer alcançar?">
                    <Choices
                      value={form.objetivo}
                      onChange={(v) => update("objetivo", v)}
                      options={OBJETIVOS.map((o) => ({ value: o.v, label: o.l }))}
                    />
                  </Field>
                  <Field label="Onde você vai treinar?">
                    <Choices
                      value={form.local}
                      onChange={(v) => update("local", v)}
                      options={LOCAIS.map((o) => ({ value: o.v, label: o.l }))}
                    />
                  </Field>
                </Step>
              )}

              {step === 2 && (
                <Step title="Tempo disponível">
                  <Field label="Dias por semana">
                    <Choices
                      value={form.dias}
                      onChange={(v) => update("dias", v)}
                      options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: String(n) }))}
                    />
                  </Field>
                  <Field label="Minutos por sessão">
                    <Choices
                      value={form.tempo}
                      onChange={(v) => update("tempo", v)}
                      options={[20, 30, 45, 60, 90].map((n) => ({ value: String(n), label: `${n} min` }))}
                    />
                  </Field>
                </Step>
              )}

              {step === 3 && (
                <Step title="Detalhes finais">
                  <Field label="Grupos preferidos (opcional)">
                    <div className="flex flex-wrap gap-2">
                      {FOCOS.map((f) => {
                        const on = form.foco.includes(f);
                        return (
                          <button
                            type="button"
                            key={f}
                            onClick={() => toggleFoco(f)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                              on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/30"
                            }`}
                          >
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label="Restrições ou lesões (opcional)">
                    <textarea
                      value={form.restricoes}
                      onChange={(e) => update("restricoes", e.target.value)}
                      placeholder="Ex.: dor lombar, evitar agachamento livre..."
                      rows={4}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                </Step>
              )}

              <div className="mt-10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0 || loading}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-foreground/80 transition hover:bg-foreground/5 disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!validStep()}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
                  >
                    Próximo <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={gerar}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
                    {loading ? "Gerando seu treino..." : "Gerar treino"}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <ResultadoView
            treino={treino}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            onCopy={copiar}
            onRestart={reiniciar}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl">{title}</h2>
      <div className="space-y-7">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-foreground/80">{label}</label>
      {children}
    </div>
  );
}

function Choices({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/30"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ResultadoView({
  treino, activeDay, setActiveDay, onCopy, onRestart,
}: {
  treino: Treino;
  activeDay: number;
  setActiveDay: (n: number) => void;
  onCopy: () => void;
  onRestart: () => void;
}) {
  const dia = treino.dias[activeDay];
  return (
    <div>
      {/* header */}
      <div className="relative overflow-hidden rounded-3xl bg-navy p-8 text-cream md:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 diamond bg-primary/40" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 diamond bg-secondary/40" />
        <h1 className="relative font-display text-3xl md:text-4xl">{treino.titulo}</h1>
        <p className="relative mt-3 max-w-2xl text-cream/85">{treino.resumo}</p>
        <div className="relative mt-6 flex flex-wrap gap-2">
          <Badge icon={<Dumbbell className="h-3.5 w-3.5" />}>{treino.diasPorSemana} dias/semana</Badge>
          <Badge icon={<Clock className="h-3.5 w-3.5" />}>{treino.duracaoMin} min/sessão</Badge>
        </div>
      </div>

      {/* actions */}
      <div className="no-print mt-6 flex flex-wrap gap-2">
        <button onClick={onRestart} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-foreground/5">
          <RefreshCcw className="h-4 w-4" /> Refazer
        </button>
        <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-foreground/5">
          <Copy className="h-4 w-4" /> Copiar
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-95">
          <Printer className="h-4 w-4" /> Imprimir / PDF
        </button>
      </div>

      {/* day tabs */}
      <div className="no-print mt-8 flex flex-wrap gap-2">
        {treino.dias.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              i === activeDay ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30"
            }`}
          >
            Dia {String.fromCharCode(65 + i)}
          </button>
        ))}
      </div>

      {/* day content (active day for screen, all days for print) */}
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

      {/* tips */}
      {treino.dicas?.length > 0 && (
        <div className="mt-8 rounded-3xl bg-secondary/30 p-7 print-tips print:bg-white print:p-0">
          <h3 className="font-display text-xl">Dicas</h3>
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
  return (
    <div className={`rounded-3xl bg-card p-7 shadow-sm md:p-8 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl">Dia {String.fromCharCode(65 + index)} — {dia.nome}</h2>
      </div>
      <p className="mt-3 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Aquecimento:</span> {dia.aquecimento}</p>

      <div className="mt-6 grid gap-3 ex-grid">
        {dia.exercicios.map((e, i) => (
          <div key={i} className="rounded-2xl border border-border bg-background p-4 ex-card print-avoid-break">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-semibold">{e.nome}</div>
              <div className="text-sm text-muted-foreground">descanso {e.descanso}</div>
            </div>
            <div className="mt-1 text-sm">
              <span className="font-semibold text-primary">{e.series}</span>
              <span className="text-muted-foreground"> séries × </span>
              <span className="font-semibold text-primary">{e.reps}</span>
              <span className="text-muted-foreground"> reps</span>
            </div>
            {e.observacao && <div className="mt-2 text-sm text-muted-foreground">{e.observacao}</div>}
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Alongamento:</span> {dia.alongamento}</p>
    </div>
  );
}

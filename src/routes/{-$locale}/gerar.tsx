import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Printer, Copy, RefreshCcw, Dumbbell, Clock, Flame, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale, localeParam } from "@/i18n/useLocale";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { localizedHead } from "@/i18n/seo";

export const Route = createFileRoute("/{-$locale}/gerar")({
  head: ({ params }) => {
    const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    return localizedHead(locale, "/gerar", {
      titleKey: "meta.gerar_title",
      descKey: "meta.gerar_desc",
      ogDescKey: "meta.gerar_og_desc",
    });
  },
  component: Gerar,
});

type Form = {
  sexo: string; idade: string; nivel: string; objetivo: string; local: string;
  dias: string; tempo: string; foco: string[]; restricoes: string;
};
type Exercicio = { nome: string; series: number; reps: string; descanso: string; observacao?: string };
type Dia = { nome: string; aquecimento: string; exercicios: Exercicio[]; alongamento: string };
type Treino = { titulo: string; resumo: string; diasPorSemana: number; duracaoMin: number; dias: Dia[]; dicas: string[] };

const initial: Form = {
  sexo: "", idade: "", nivel: "", objetivo: "", local: "",
  dias: "3", tempo: "45", foco: [], restricoes: "",
};

const SEX_VALUES = ["masculino", "feminino", "outro"];
const LEVEL_VALUES = ["iniciante", "intermediario", "avancado"];
const GOAL_VALUES = ["hipertrofia", "emagrecimento", "condicionamento", "forca", "mobilidade"];
const PLACE_VALUES = ["academia", "casa-equip", "casa-livre", "ar-livre"];
const FOCOS = ["Peito", "Costas", "Pernas", "Glúteos", "Braços", "Core", "Cardio"];

function Gerar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = useLocale();
  const lp = localeParam(locale);
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [loading, setLoading] = useState(false);
  const [treino, setTreino] = useState<Treino | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/{-$locale}/login", params: { locale: lp } });
      else setAuthChecked(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/{-$locale}/login", params: { locale: lp } });
      else setAuthChecked(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, lp]);

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
          sexo: form.sexo, idade: Number(form.idade), nivel: form.nivel,
          objetivo: form.objetivo, local: form.local,
          dias: Number(form.dias), tempo: Number(form.tempo),
          foco: form.foco, restricoes: form.restricoes,
          locale,
        },
      });
      if (error) {
        const msg = error.message || "";
        if (msg.includes("429")) toast.error(t("gerar.err_rate"));
        else if (msg.includes("402")) toast.error(t("gerar.err_credits"));
        else toast.error(t("gerar.err_generic"));
        return;
      }
      if (data?.treino) { setTreino(data.treino); setActiveDay(0); }
      else toast.error(t("gerar.err_response"));
    } catch (e) {
      console.error(e);
      toast.error(t("gerar.err_unexpected"));
    } finally {
      setLoading(false);
    }
  }

  function reiniciar() { setTreino(null); setStep(0); }

  function copiar() {
    if (!treino) return;
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

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sexOpts = SEX_VALUES.map((v) => ({ value: v, label: t(`gerar.sex.${v}`) }));
  const levelOpts = LEVEL_VALUES.map((v) => ({ value: v, label: t(`gerar.level.${v}`), desc: t(`gerar.level.${v}_desc`) }));
  const goalOpts = GOAL_VALUES.map((v) => ({ value: v, label: t(`gerar.goal.${v}`) }));
  const placeOpts = PLACE_VALUES.map((v) => ({ value: v, label: t(`gerar.place.${v}`) }));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster richColors position="top-center" />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        {!treino ? (
          <>
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl">{t("gerar.title")}</h1>
              <span className="text-sm text-muted-foreground">{t("gerar.step_of", { current: step + 1, total: 4 })}</span>
            </div>

            <div className="mb-10 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} />
            </div>

            <div className="rounded-3xl bg-card p-5 shadow-sm sm:p-8 md:p-10">
              {step === 0 && (
                <Step title={t("gerar.step0_title")}>
                  <Field label={t("gerar.f_sex")}>
                    <Choices value={form.sexo} onChange={(v) => update("sexo", v)} options={sexOpts} />
                  </Field>
                  <Field label={t("gerar.f_age")} htmlFor="idade">
                    <input
                      id="idade" type="number" inputMode="numeric" min={10} max={100}
                      value={form.idade} onChange={(e) => update("idade", e.target.value)}
                      placeholder={t("gerar.f_age_placeholder")}
                      className="w-40 rounded-2xl border border-border bg-background px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                  <Field label={t("gerar.f_level")}>
                    <div className="grid gap-3 md:grid-cols-3">
                      {levelOpts.map((n) => (
                        <button type="button" key={n.value} onClick={() => update("nivel", n.value)}
                          className={`rounded-2xl border-2 p-4 text-left transition ${form.nivel === n.value ? "border-primary bg-primary/15 ring-2 ring-primary/30" : "border-border hover:border-foreground/30"}`}>
                          <div className="font-semibold">{n.label}</div>
                          <div className="text-sm text-muted-foreground">{n.desc}</div>
                        </button>
                      ))}
                    </div>
                  </Field>
                </Step>
              )}

              {step === 1 && (
                <Step title={t("gerar.step1_title")}>
                  <Field label={t("gerar.f_goal")}>
                    <Choices value={form.objetivo} onChange={(v) => update("objetivo", v)} options={goalOpts} />
                  </Field>
                  <Field label={t("gerar.f_place")}>
                    <Choices value={form.local} onChange={(v) => update("local", v)} options={placeOpts} />
                  </Field>
                </Step>
              )}

              {step === 2 && (
                <Step title={t("gerar.step2_title")}>
                  <Field label={t("gerar.f_days")}>
                    <Choices value={form.dias} onChange={(v) => update("dias", v)}
                      options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: String(n) }))} />
                  </Field>
                  <Field label={t("gerar.f_minutes")}>
                    <Choices value={form.tempo} onChange={(v) => update("tempo", v)}
                      options={[20, 30, 45, 60, 90].map((n) => ({ value: String(n), label: t("gerar.minutes_unit", { n }) }))} />
                  </Field>
                </Step>
              )}

              {step === 3 && (
                <Step title={t("gerar.step3_title")}>
                  <Field label={t("gerar.f_focus")}>
                    <div className="flex flex-wrap gap-2">
                      {FOCOS.map((f) => {
                        const on = form.foco.includes(f);
                        return (
                          <button type="button" key={f} onClick={() => toggleFoco(f)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/30"}`}>
                            {t(`gerar.focus.${f}`)}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label={t("gerar.f_restrictions")} htmlFor="restricoes">
                    <textarea id="restricoes" value={form.restricoes} onChange={(e) => update("restricoes", e.target.value)}
                      placeholder={t("gerar.f_restrictions_placeholder")} rows={4}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
                  </Field>
                </Step>
              )}

              <div className="mt-10 flex items-center justify-between">
                <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || loading}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-foreground/80 transition hover:bg-foreground/5 disabled:opacity-40">
                  <ArrowLeft className="h-4 w-4" /> {t("gerar.back")}
                </button>
                {step < 3 ? (
                  <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!validStep()}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-50">
                    {t("gerar.next")} <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="button" onClick={gerar} disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-60">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
                    {loading ? t("gerar.generating") : t("gerar.generate")}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <ResultadoView treino={treino} activeDay={activeDay} setActiveDay={setActiveDay} onCopy={copiar} onRestart={reiniciar} />
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

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-3 block text-sm font-semibold text-foreground/80">{label}</label>
      {children}
    </div>
  );
}

function Choices({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/30"}`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ResultadoView({ treino, activeDay, setActiveDay, onCopy, onRestart }: {
  treino: Treino; activeDay: number; setActiveDay: (n: number) => void; onCopy: () => void; onRestart: () => void;
}) {
  const { t } = useTranslation();
  const dia = treino.dias[activeDay];
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
        <button onClick={onRestart} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-foreground/5">
          <RefreshCcw className="h-4 w-4" /> {t("gerar.restart")}
        </button>
        <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-foreground/5">
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
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{t("gerar.stretch")}:</span> {dia.alongamento}</p>
    </div>
  );
}

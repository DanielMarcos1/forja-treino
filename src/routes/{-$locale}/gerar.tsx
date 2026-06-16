import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Flame, ArrowLeft, ArrowRight, BookmarkCheck } from "lucide-react";
import { useLocale, localeParam } from "@/i18n/useLocale";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { localizedHead } from "@/i18n/seo";
import { WorkoutResult, type Treino } from "@/components/WorkoutResult";

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
  const [savedId, setSavedId] = useState<string | null>(null);

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
        const ctx = (error as { context?: { error?: string } }).context;
        if (ctx?.error === "quota_exceeded" || msg.includes("quota_exceeded")) toast.error(t("gerar.err_quota"));
        else if (msg.includes("429")) toast.error(t("gerar.err_rate"));
        else if (msg.includes("402")) toast.error(t("gerar.err_credits"));
        else toast.error(t("gerar.err_generic"));
        return;
      }
      if (data?.error === "quota_exceeded") { toast.error(t("gerar.err_quota")); return; }
      if (data?.treino) {
        setTreino(data.treino);
        setActiveDay(0);
        setSavedId(data.savedWorkoutId ?? null);
        if (data.savedWorkoutId) toast.success(t("gerar.saved_auto"));
      }
      else toast.error(t("gerar.err_response"));
    } catch (e) {
      console.error(e);
      toast.error(t("gerar.err_unexpected"));
    } finally {
      setLoading(false);
    }
  }

  function reiniciar() { setTreino(null); setSavedId(null); setStep(0); }

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
          <>
            {savedId && (
              <div className="no-print mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/40 px-4 py-1.5 text-xs font-semibold text-foreground/80">
                <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> {t("gerar.saved_auto")}
              </div>
            )}
            <WorkoutResult treino={treino} activeDay={activeDay} setActiveDay={setActiveDay} onRestart={reiniciar} />
          </>
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

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Loader2, Trash2, Pencil, Dumbbell, Clock, Flame, Check, X } from "lucide-react";
import { useLocale, localeParam } from "@/i18n/useLocale";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { localizedHead } from "@/i18n/seo";

export const Route = createFileRoute("/{-$locale}/meus-treinos/")({
  head: ({ params }) => {
    const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    return localizedHead(locale, "/meus-treinos", {
      titleKey: "meta.meus_title",
      descKey: "meta.meus_desc",
      ogDescKey: "meta.meus_desc",
    });
  },
  component: MeusTreinos,
});

type Row = {
  id: string;
  title: string;
  summary: string | null;
  dias_por_semana: number;
  duracao_min: number;
  created_at: string;
};

function MeusTreinos() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = useLocale();
  const lp = localeParam(locale);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/{-$locale}/login", params: { locale: lp } });
      else setAuthChecked(true);
    });
  }, [navigate, lp]);

  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("saved_workouts")
        .select("id,title,summary,dias_por_semana,duracao_min,created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error(t("meus.err_load"));
      else setItems(data ?? []);
      setLoading(false);
    })();
  }, [authChecked, t]);

  async function deleteOne(id: string) {
    if (!confirm(t("meus.delete_confirm"))) return;
    const { error } = await supabase.from("saved_workouts").delete().eq("id", id);
    if (error) { toast.error(t("meus.err_delete")); return; }
    setItems((s) => s.filter((x) => x.id !== id));
    toast.success(t("meus.deleted"));
  }

  function startEdit(row: Row) { setEditingId(row.id); setEditTitle(row.title); }
  function cancelEdit() { setEditingId(null); setEditTitle(""); }
  async function saveEdit(id: string) {
    const title = editTitle.trim();
    if (!title) { cancelEdit(); return; }
    const { error } = await supabase.from("saved_workouts").update({ title }).eq("id", id);
    if (error) { toast.error(t("meus.err_rename")); return; }
    setItems((s) => s.map((x) => x.id === id ? { ...x, title } : x));
    cancelEdit();
    toast.success(t("meus.renamed"));
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster richColors position="top-center" />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl">{t("meus.title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("meus.subtitle")}</p>
          </div>
          <Link
            to="/{-$locale}/gerar" params={{ locale: lp }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
          >
            <Flame className="h-4 w-4" /> {t("meus.new")}
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl bg-navy p-10 text-cream text-center">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 diamond bg-primary/40" />
            <h2 className="font-display text-2xl">{t("meus.empty_title")}</h2>
            <p className="mt-3 text-cream/80">{t("meus.empty_desc")}</p>
            <Link to="/{-$locale}/gerar" params={{ locale: lp }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-95">
              <Flame className="h-4 w-4" /> {t("meus.empty_cta")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((row) => (
              <div key={row.id} className="group flex flex-col rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
                {editingId === row.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(row.id); if (e.key === "Escape") cancelEdit(); }}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button onClick={() => saveEdit(row.id)} className="rounded-full p-2 text-primary hover:bg-primary/10" aria-label="Save"><Check className="h-4 w-4" /></button>
                    <button onClick={cancelEdit} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Cancel"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <Link to="/{-$locale}/meus-treinos/$id" params={{ locale: lp, id: row.id }} className="block">
                    <h3 className="font-display text-lg leading-snug group-hover:text-primary transition-colors">{row.title}</h3>
                  </Link>
                )}
                {row.summary && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{row.summary}</p>}
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/40 px-2.5 py-1 font-semibold">
                    <Dumbbell className="h-3 w-3" /> {t("gerar.days_per_week", { n: row.dias_por_semana })}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/40 px-2.5 py-1 font-semibold">
                    <Clock className="h-3 w-3" /> {t("gerar.min_per_session", { n: row.duracao_min })}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">{t("meus.saved_at", { date: dateFmt.format(new Date(row.created_at)) })}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(row)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t("meus.rename")}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteOne(row.id)} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={t("meus.delete")}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

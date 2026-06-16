import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLocale, localeParam } from "@/i18n/useLocale";
import { WorkoutResult, type Treino } from "@/components/WorkoutResult";

export const Route = createFileRoute("/{-$locale}/meus-treinos/$id")({
  component: MeuTreinoDetail,
});

function MeuTreinoDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = useLocale();
  const lp = localeParam(locale);
  const { id } = useParams({ from: "/{-$locale}/meus-treinos/$id" });
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [treino, setTreino] = useState<Treino | null>(null);
  const [activeDay, setActiveDay] = useState(0);

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
        .select("payload")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) { toast.error(t("meus.err_load")); setLoading(false); return; }
      setTreino(data.payload as unknown as Treino);
      setLoading(false);
    })();
  }, [authChecked, id, t]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster richColors position="top-center" />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        {treino ? (
          <WorkoutResult
            treino={treino}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            onBack={() => navigate({ to: "/{-$locale}/meus-treinos", params: { locale: lp } })}
            backLabel={t("meus.back_to_list")}
          />
        ) : (
          <p className="text-muted-foreground">{t("meus.not_found")}</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Forja" },
      { name: "description", content: "Entre com sua conta Google para gerar seu treino." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/gerar" });
    });
  }, [navigate]);

  async function entrar() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/gerar",
      });
      if (result.error) {
        toast.error("Não foi possível entrar. Tente novamente.");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/gerar" });
    } catch {
      toast.error("Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster richColors position="top-center" />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-20">
        <div className="w-full rounded-3xl bg-card p-8 shadow-sm md:p-10 text-center">
          <h1 className="font-display text-3xl">Entrar na Forja</h1>
          <p className="mt-3 text-muted-foreground">
            Entre com sua conta Google para gerar seu plano de treino personalizado.
          </p>
          <button
            onClick={entrar}
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z" />
              </svg>
            )}
            Continuar com Google
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

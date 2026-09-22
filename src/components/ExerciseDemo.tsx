import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, Loader2, PlayCircle, X } from "lucide-react";
import { useLocale } from "@/i18n/useLocale";
import { youtubeSearchUrl } from "@/lib/exerciseVideo";
import { findExerciseGif, type ExerciseMatch } from "@/lib/exerciseLibrary/match";

type Props = {
  name: string;
  nameEn?: string;
  open: boolean;
  onToggle: () => void;
};

export function ExerciseDemo({ name, nameEn, open, onToggle }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "searching" | "loading" | "ready" | "error">(
    "idle",
  );
  const [match, setMatch] = useState<ExerciseMatch | null | undefined>(undefined);

  useEffect(() => {
    if (!open) {
      setMatch(undefined);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    let image: HTMLImageElement | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    setMatch(undefined);
    setStatus("searching");

    findExerciseGif(name, nameEn)
      .then((m) => {
        if (cancelled) return;
        setMatch(m);

        if (!m) {
          setStatus("error");
          return;
        }

        setStatus("loading");
        image = new Image();
        image.onload = () => {
          if (cancelled) return;
          if (timeoutId) clearTimeout(timeoutId);
          setStatus("ready");
        };
        image.onerror = () => {
          if (cancelled) return;
          if (timeoutId) clearTimeout(timeoutId);
          setStatus("error");
        };
        timeoutId = setTimeout(() => {
          if (!cancelled) setStatus("error");
        }, 8000);
        image.src = m.gifUrl;
      })
      .catch(() => {
        if (!cancelled) {
          setMatch(null);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (image) {
        image.onload = null;
        image.onerror = null;
        image.src = "";
      }
    };
  }, [open, name, nameEn]);

  const loading = status === "searching" || status === "loading";
  const unavailable = status === "error";

  return (
    <div className="no-print">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:underline"
      >
        {open ? <X className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
        {open ? t("gerar.close_demo") : t("gerar.see_demo")}
      </button>

      {open && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          {loading && (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("gerar.demo_loading")}
            </div>
          )}

          {status === "ready" && match && (
            <div>
              <img
                src={match.gifUrl}
                alt={t("gerar.demo_alt", { name })}
                className="mx-auto block min-h-56 w-full max-w-[360px] bg-white"
              />
            </div>
          )}

          {unavailable && (
            <div className="p-5 text-sm text-muted-foreground">{t("gerar.demo_not_found")}</div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {status === "ready" ? t("gerar.demo_hint") : ""}
            </span>
            <a
              href={youtubeSearchUrl(name, locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> {t("gerar.open_youtube")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

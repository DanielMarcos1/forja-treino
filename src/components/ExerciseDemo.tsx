import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, Loader2, PlayCircle, X } from "lucide-react";
import { useLocale } from "@/i18n/useLocale";
import { youtubeSearchUrl } from "@/lib/exerciseVideo";
import { findExerciseGif, type ExerciseMatch } from "@/lib/exerciseLibrary/match";

type Props = { name: string; nameEn?: string };

export function ExerciseDemo({ name, nameEn }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [match, setMatch] = useState<ExerciseMatch | null | undefined>(undefined);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!open || match !== undefined) return;
    let alive = true;
    setSearching(true);
    findExerciseGif(name, nameEn)
      .then((m) => {
        if (alive) setMatch(m);
      })
      .catch(() => {
        if (alive) setMatch(null);
      })
      .finally(() => {
        if (alive) setSearching(false);
      });
    return () => {
      alive = false;
    };
  }, [open, match, name, nameEn]);

  const unavailable = !searching && (match === null || imgFailed);

  return (
    <div className="no-print">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:underline"
      >
        {open ? <X className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
        {open ? t("gerar.close_demo") : t("gerar.see_demo")}
      </button>

      {open && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          {searching && (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("gerar.demo_loading")}
            </div>
          )}

          {!searching && match && !imgFailed && (
            <div className="relative">
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              <img
                src={match.gifUrl}
                alt={t("gerar.demo_alt", { name })}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgFailed(true)}
                className={`mx-auto block min-h-56 w-full max-w-[360px] bg-white transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              />
            </div>
          )}


          {unavailable && (
            <div className="p-5 text-sm text-muted-foreground">{t("gerar.demo_not_found")}</div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {match && !imgFailed ? t("gerar.demo_hint") : ""}
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

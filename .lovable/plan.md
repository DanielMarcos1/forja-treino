## Goal
Two improvements based on user feedback:
1. Let users save generated workouts and revisit them in a personal dashboard.
2. Help lifters see how each exercise should be performed by linking a demo video.

---

## 1. Save workouts + dashboard

### Database
New table `saved_workouts`:
- `user_id` (owner)
- `title`, `summary`
- `dias_por_semana`, `duracao_min`
- `payload` (jsonb) — full `Treino` object as returned by the AI
- standard `id`, `created_at`, `updated_at`

RLS: users can view, insert, update, delete only their own rows. GRANTs for `authenticated` + `service_role`.

We keep the existing `workout_generations` table — it tracks the monthly quota and stays untouched.

### Edge function (`generate-workout`)
After generating, auto-save the workout to `saved_workouts` (so nothing is lost). Return the new `savedWorkoutId` along with `treino` and `quota`.

### Frontend

**Result view (`/gerar`)** — after a workout is generated:
- Add a "Saved automatically" indicator with a rename input (updates `title` in `saved_workouts`).
- Add a "My workouts" link in the header for signed-in users.

**New route `/{-$locale}/meus-treinos` (dashboard)**:
- Grid of cards showing each saved workout: title, summary, days/week, minutes, created date, quick stats.
- Card actions: Open, Rename, Delete.
- Empty state with CTA "Generate your first workout".
- Visual identity matches the rest of the site (navy hero band, cream cards, diamond accents).

**New route `/{-$locale}/meus-treinos/$id`**:
- Reuses the existing `ResultadoView` (extract from `gerar.tsx` into `src/components/WorkoutResult.tsx` so both `/gerar` and the detail page share it).
- Loads the workout from `saved_workouts` by id (RLS scopes to owner).
- Same copy / print / day-tabs behavior.

**Header (`SiteHeader`)**: add "Meus treinos" link visible only when authenticated.

---

## 2. Exercise demo videos

Approach: link each exercise to a YouTube search URL based on the exercise name + locale ("how to do {name}" / "como fazer {name}"). This needs zero API keys, zero storage, and works in 4 languages.

In `DiaCard`, each exercise row gets a small "Ver demonstração" button (Play icon) that opens a new tab to:
`https://www.youtube.com/results?search_query=<encoded query>`

Query is built per locale:
- pt: `como fazer {nome} exercício`
- en: `how to do {nome} exercise proper form`
- es: `cómo hacer {nome} ejercicio`
- fr: `comment faire {nome} exercice`

Why this over embedded video: real workout names are open-ended (AI-generated), so a static demo library would miss most. A YouTube search guarantees a relevant tutorial for any exercise, in the user's language, with no extra infra and no licensing concerns.

(If later you want richer UX, we can upgrade to a curated dictionary of common lifts mapped to specific videos, or use the YouTube Data API to inline-embed the top result — out of scope here.)

---

## i18n
Add keys in all 4 locales (`pt`, `en`, `es`, `fr`):
- `nav.my_workouts`
- `meus.title`, `meus.empty_title`, `meus.empty_cta`, `meus.open`, `meus.rename`, `meus.delete`, `meus.delete_confirm`, `meus.saved_at`, `meus.rename_placeholder`
- `gerar.saved_auto`, `gerar.rename_save`
- `gerar.see_demo`

---

## Files

**Created**
- `supabase/migrations/<ts>_saved_workouts.sql` — table + RLS + grants + updated_at trigger
- `src/components/WorkoutResult.tsx` — extracted ResultadoView + DiaCard + Badge, with exercise demo button
- `src/routes/{-$locale}/meus-treinos.tsx` — dashboard list
- `src/routes/{-$locale}/meus-treinos.$id.tsx` — detail view
- `src/lib/exerciseVideo.ts` — `youtubeSearchUrl(name, locale)` helper

**Edited**
- `supabase/functions/generate-workout/index.ts` — insert into `saved_workouts`, return `savedWorkoutId`
- `src/routes/{-$locale}/gerar.tsx` — use shared `WorkoutResult`, rename input wired to update
- `src/components/SiteChrome.tsx` — add "Meus treinos" nav link when authenticated
- `src/i18n/locales/{pt,en,es,fr}.json` — new keys
- `src/integrations/supabase/types.ts` — regenerated after migration

## Open questions
1. Confirm the YouTube-search approach for demos is acceptable (vs embedded video or curated library)?
2. Should saved workouts also count against the monthly limit? Current plan: yes, unchanged — quota is counted at generation time, saving is automatic and free.

# Multi-language support (PT, EN, ES, FR)

Add full internationalization to Forja with locale-prefixed URLs, browser-language detection on first visit, a header switcher, and translated metadata across all routes.

## Languages & defaults
- Supported: `pt` (Portuguese-BR, default), `en`, `es`, `fr`.
- Default for unmatched browser languages: `pt`.

## URL strategy
- Locale lives in a path prefix: `/`, `/en`, `/es`, `/fr` (no `/pt` — PT served at root to keep current URLs intact and preserve SEO).
- Use TanStack's optional path param `{-$locale}` so a single route file covers both `/about` (pt) and `/en/about` (en).
- Restructure routes:

```text
src/routes/
  __root.tsx
  {-$locale}/
    index.tsx     -> /, /en, /es, /fr
    gerar.tsx     -> /gerar, /en/gerar, ...
    sobre.tsx     -> /sobre, /en/sobre, ...
    login.tsx     -> /login, /en/login, ...
```

(File-based, dot-style: `{-$locale}.index.tsx`, `{-$locale}.gerar.tsx`, etc.)

## Detection on first visit
- Root component reads `navigator.language` on mount.
- If user lands on `/` and detected locale ≠ `pt`, redirect once to the prefixed URL (`/en`, `/es`, `/fr`).
- Persist explicit choice in `localStorage` (`forja.locale`); skip auto-redirect if a stored preference exists.
- Manual `?lang=` query or switcher click always wins and is persisted.

## Header switcher
- Dropdown beside the "Começar" button in `SiteHeader`, showing 🇧🇷 🇺🇸 🇪🇸 🇫🇷.
- Selecting a language navigates to the same route under the new locale prefix and updates `localStorage`.

## i18n runtime
- Add `react-i18next` + `i18next` (lightweight, SSR-friendly, no backend HTTP).
- Translation files under `src/i18n/locales/{pt,en,es,fr}.json` with namespaces: `common`, `home`, `gerar`, `sobre`, `login`, `meta`.
- `src/i18n/index.ts` initializes i18next with all 4 bundles inlined (no async load).
- `LocaleProvider` in `__root.tsx`'s `RootComponent` reads `locale` from route params and calls `i18n.changeLanguage(locale ?? 'pt')` on change.

## Translated content
All user-visible strings in:
- `SiteHeader` / `SiteFooter` (nav labels, CTA)
- `index.tsx` (hero, features, CTA strip)
- `gerar.tsx` (form labels, options, buttons, error/loading states)
- `sobre.tsx`
- `login.tsx`
- Toast/error messages

The `generate-workout` edge function gets a new optional `locale` field in the payload; system prompt switches language so the AI returns the plan in the user's language. Validation list values (sexo/nivel/etc.) stay in PT internally — only the prompt language changes.

## SEO / metadata
- Each route's `head()` becomes a function of `params.locale`, returning translated `title`, `description`, `og:*` from the `meta` namespace.
- Add `<link rel="alternate" hreflang="…">` tags for each locale + `x-default` on every leaf.
- Update `<html lang>` in `__root.tsx`'s `RootShell` to reflect active locale (read from router state).
- Sitemap (`sitemap[.]xml.ts`) emits all 4 locale variants per route with hreflang annotations.
- Canonical URL per route uses the locale-prefixed path.

## Switcher placement & a11y
- `<select>` styled to match header, accessible label "Language / Idioma".
- Mobile: same dropdown, compact.

## Technical notes
- Files to add: `src/i18n/index.ts`, `src/i18n/locales/{pt,en,es,fr}.json`, `src/components/LanguageSwitcher.tsx`.
- Files to rename/move: `index.tsx`, `gerar.tsx`, `sobre.tsx`, `login.tsx` → under `{-$locale}.` prefix.
- Files to edit: `SiteChrome.tsx`, `__root.tsx`, `sitemap[.]xml.ts`, `supabase/functions/generate-workout/index.ts`.
- Packages: `bun add react-i18next i18next`.
- All `<Link to="...">` calls updated to include `params={{ locale }}` (using current locale from `useParams({ strict: false })`).

## Out of scope
- Translating dynamic AI-generated workout titles already returned by the model (handled via prompt language above).
- Right-to-left languages (none in scope).
- Server-side IP geolocation (browser-language only, per your choice).

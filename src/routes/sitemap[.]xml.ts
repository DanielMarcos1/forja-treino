import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://forjatreino.com";
const LOCALES = ["pt", "en", "es", "fr"] as const;
const DEFAULT_LOCALE = "pt" as const;

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

function urlFor(locale: string, path: string) {
  const clean = path === "/" ? "" : path;
  return locale === DEFAULT_LOCALE ? `${BASE_URL}${clean || ""}` || BASE_URL : `${BASE_URL}/${locale}${clean}`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/sobre", changefreq: "monthly", priority: "0.7" },
        ];

        const urls: string[] = [];
        for (const e of entries) {
          for (const locale of LOCALES) {
            const loc = urlFor(locale, e.path);
            const alternates = LOCALES.map(
              (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l, e.path)}" />`,
            );
            alternates.push(
              `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LOCALE, e.path)}" />`,
            );
            urls.push(
              [
                `  <url>`,
                `    <loc>${loc}</loc>`,
                e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
                e.priority ? `    <priority>${e.priority}</priority>` : null,
                ...alternates,
                `  </url>`,
              ]
                .filter(Boolean)
                .join("\n"),
            );
          }
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

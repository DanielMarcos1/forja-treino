import { afterEach, describe, expect, it, vi } from "vitest";
import pt from "./locales/pt.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import { detectBrowserLocale, isLocale } from "./index";

function keys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
}

describe("locales", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("recognizes only supported locale codes", () => {
    expect(["pt", "en", "es", "fr"].every(isLocale)).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it("detects the first supported browser language", () => {
    vi.stubGlobal("navigator", { languages: ["de-DE", "fr-CA"], language: "de-DE" });
    expect(detectBrowserLocale()).toBe("fr");
  });

  it("falls back to Portuguese", () => {
    vi.stubGlobal("navigator", { languages: ["de-DE"], language: "de-DE" });
    expect(detectBrowserLocale()).toBe("pt");
  });

  it("keeps every translation file on the same key set", () => {
    const expected = keys(pt).sort();
    for (const locale of [en, es, fr]) expect(keys(locale).sort()).toEqual(expected);
  });
});
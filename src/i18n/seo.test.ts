import { describe, expect, it } from "vitest";
import { localizedHead, urlFor } from "./seo";

describe("localized SEO", () => {
  it("builds default and translated absolute URLs", () => {
    expect(urlFor("pt", "/")).toBe("https://forjatreino.com");
    expect(urlFor("pt", "sobre")).toBe("https://forjatreino.com/sobre");
    expect(urlFor("en", "/")).toBe("https://forjatreino.com/en");
    expect(urlFor("fr", "/sobre")).toBe("https://forjatreino.com/fr/sobre");
  });

  it("returns complete social and alternate metadata", () => {
    const head = localizedHead("es", "/sobre", {
      titleKey: "meta.sobre_title",
      descKey: "meta.sobre_desc",
    });
    expect(head.meta).toEqual(expect.arrayContaining([
      expect.objectContaining({ property: "og:type", content: "website" }),
      expect.objectContaining({ property: "og:locale", content: "es_ES" }),
      expect.objectContaining({ name: "twitter:card", content: "summary_large_image" }),
    ]));
    expect(head.links.filter((link) => link.rel === "alternate")).toHaveLength(5);
    expect(head.links).toContainEqual({ rel: "canonical", href: "https://forjatreino.com/es/sobre" });
  });
});
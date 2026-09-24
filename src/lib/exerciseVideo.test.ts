import { describe, expect, it } from "vitest";
import { youtubeSearchUrl } from "./exerciseVideo";

describe("youtubeSearchUrl", () => {
  it.each([
    ["pt", "como fazer Agachamento exercício técnica"],
    ["en", "how to do Squat exercise proper form"],
    ["es", "cómo hacer Sentadilla ejercicio técnica"],
    ["fr", "comment faire Squat exercice technique"],
  ] as const)("uses the %s search wording", (locale, query) => {
    expect(
      youtubeSearchUrl(
        locale === "es" ? "Sentadilla" : locale === "pt" ? "Agachamento" : "Squat",
        locale,
      ),
    ).toBe(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
  });
});

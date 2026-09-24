import { describe, expect, it } from "vitest";
import { findExerciseGif, gifUrlFor } from "./match";

describe("exercise library matching", () => {
  it("builds the canonical CDN URL", () => {
    expect(gifUrlFor("chest", "barbell-bench-press")).toBe(
      "https://cdn.jsdelivr.net/gh/jahelcuadrado/ExerciseGymGifsDB@main/chest/barbell-bench-press.gif",
    );
  });

  it("finds a known canonical English exercise", async () => {
    const result = await findExerciseGif("Supino com barra", "barbell bench press");
    expect(result).not.toBeNull();
    expect(result?.slug).toContain("barbell");
    expect(result?.slug).toContain("bench-press");
    expect(result?.score).toBeGreaterThanOrEqual(0.5);
  });

  it("uses multilingual synonyms and ignores accents", async () => {
    const result = await findExerciseGif("Agachamento búlgaro com halteres");
    expect(result).not.toBeNull();
    expect(result?.slug).toContain("split-squat");
  });

  it("returns null for an empty or unrelated query", async () => {
    await expect(findExerciseGif("")).resolves.toBeNull();
    await expect(findExerciseGif("xyzzy qqqq zzzz")).resolves.toBeNull();
  });
});
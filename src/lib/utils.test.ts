import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("combines conditional classes and resolves Tailwind conflicts", () => {
    const optionalClass: string | false = false;
    expect(cn("px-2", optionalClass, "px-4", { block: true })).toBe("px-4 block");
  });
});

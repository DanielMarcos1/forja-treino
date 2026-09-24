import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "./index";
import { localeParam, useLocale } from "./useLocale";

let routeLocale: string | undefined;
vi.mock("@tanstack/react-router", () => ({ useParams: () => ({ locale: routeLocale }) }));

describe("useLocale", () => {
  beforeEach(() => {
    routeLocale = undefined;
  });

  it("defaults to Portuguese and omits its route parameter", () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current).toBe("pt");
    expect(localeParam(result.current)).toBeUndefined();
  });

  it("reads and activates a supported route locale", async () => {
    routeLocale = "fr";
    const { result } = renderHook(() => useLocale());
    expect(result.current).toBe("fr");
    await waitFor(() => expect(i18n.language).toBe("fr"));
    expect(localeParam(result.current)).toBe("fr");
  });
});

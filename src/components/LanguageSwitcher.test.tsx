import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher, LOCALE_KEY, stripLocale } from "./LanguageSwitcher";

const navigate = vi.fn();
let pathname = "/gerar";
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname } }),
}));
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return { ...actual, useTranslation: () => ({ t: () => "Idioma" }) };
});
vi.mock("@/i18n/useLocale", () => ({ useLocale: () => "pt" }));

describe("LanguageSwitcher", () => {
  beforeEach(() => { pathname = "/gerar"; localStorage.clear(); });

  it("removes supported locale prefixes without changing the page", () => {
    expect(stripLocale("/en/meus-treinos/abc")).toBe("/meus-treinos/abc");
    expect(stripLocale("/pt/sobre")).toBe("/pt/sobre");
    expect(stripLocale("/")).toBe("/");
  });

  it("opens, selects a language, persists it and preserves the path", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);
    await user.click(screen.getByRole("button", { name: "Idioma" }));
    await user.click(screen.getByRole("option", { name: /English/ }));
    expect(localStorage.getItem(LOCALE_KEY)).toBe("en");
    expect(navigate).toHaveBeenCalledWith({ to: "/en/gerar" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes with Escape and an outside click", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);
    const trigger = screen.getByRole("button", { name: "Idioma" });
    await user.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
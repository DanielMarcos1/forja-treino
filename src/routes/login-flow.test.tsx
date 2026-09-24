import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigate = vi.fn();
const signInWithOAuth = vi.fn();
const getSession = vi.fn();
const unsubscribe = vi.fn();
const toastError = vi.fn();
let authCallback: (event: string, session: unknown) => void;

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => navigate,
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/components/SiteChrome", () => ({ SiteHeader: () => null, SiteFooter: () => null }));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => toastError(...args) } }));
vi.mock("@/i18n/useLocale", () => ({ useLocale: () => "pt", localeParam: () => undefined }));
vi.mock("@/integrations/lovable/index", () => ({
  lovable: { auth: { signInWithOAuth: (...args: unknown[]) => signInWithOAuth(...args) } },
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: {
    getSession: (...args: unknown[]) => getSession(...args),
    onAuthStateChange: (callback: typeof authCallback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe } } };
    },
  } },
}));

describe("Google login flow", () => {
  beforeEach(() => {
    getSession.mockResolvedValue({ data: { session: null } });
    signInWithOAuth.mockResolvedValue({ redirected: true });
  });

  async function renderLogin() {
    const { Route } = await import("./{-$locale}/login");
    const Component = (Route as unknown as { component: React.ComponentType }).component;
    render(<Component />);
  }

  it("starts Google login with a same-origin callback", async () => {
    await renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /login.button/ }));
    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledWith("google", {
      redirect_uri: `${window.location.origin}/login`,
    }));
  });

  it("redirects only after a valid session is available", async () => {
    await renderLogin();
    act(() => authCallback("SIGNED_IN", { user: { id: "u1" } }));
    expect(navigate).toHaveBeenCalledWith({ to: "/{-$locale}/gerar", params: { locale: undefined } });
  });

  it("shows errors returned by the login provider", async () => {
    signInWithOAuth.mockResolvedValue({ error: new Error("denied") });
    await renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /login.button/ }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("login.error_generic"));
  });
});
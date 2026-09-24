import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigate = vi.fn();
const invoke = vi.fn();
const getSession = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => navigate,
}));
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return { ...actual, useTranslation: () => ({ t: (key: string, data?: Record<string, unknown>) => data ? `${key}:${Object.values(data).join(":")}` : key }) };
});
vi.mock("@/components/SiteChrome", () => ({ SiteHeader: () => null, SiteFooter: () => null }));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("@/components/WorkoutResult", () => ({ WorkoutResult: ({ treino }: { treino: { titulo: string } }) => <div>{treino.titulo}</div> }));
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => toastError(...args), success: (...args: unknown[]) => toastSuccess(...args) } }));
vi.mock("@/i18n/useLocale", () => ({ useLocale: () => "pt", localeParam: () => undefined }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSession(...args),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    functions: { invoke: (...args: unknown[]) => invoke(...args) },
  },
}));

describe("workout generation flow", () => {
  beforeEach(() => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } } });
    invoke.mockResolvedValue({ data: null, error: null });
  });

  async function renderGenerator() {
    const { Route } = await import("./{-$locale}/gerar");
    const Component = (Route as unknown as { component: React.ComponentType }).component;
    render(<Component />);
    await screen.findByText("gerar.step0_title");
  }

  async function completeForm() {
    fireEvent.click(screen.getByRole("button", { name: "gerar.sex.masculino" }));
    fireEvent.change(screen.getByLabelText("gerar.f_age"), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: /gerar.level.iniciante/ }));
    fireEvent.click(screen.getByRole("button", { name: /gerar.next/ }));
    fireEvent.click(screen.getByRole("button", { name: "gerar.goal.hipertrofia" }));
    fireEvent.click(screen.getByRole("button", { name: "gerar.place.academia" }));
    fireEvent.click(screen.getByRole("button", { name: /gerar.next/ }));
    fireEvent.click(screen.getByRole("button", { name: /gerar.next/ }));
  }

  it("redirects signed-out visitors", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    const { Route } = await import("./{-$locale}/gerar");
    const Component = (Route as unknown as { component: React.ComponentType }).component;
    render(<Component />);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: "/{-$locale}/login", params: { locale: undefined } }));
  });

  it("requires the first-step fields before continuing", async () => {
    await renderGenerator();
    expect(screen.getByRole("button", { name: /gerar.next/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "gerar.sex.masculino" }));
    fireEvent.change(screen.getByLabelText("gerar.f_age"), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: /gerar.level.iniciante/ }));
    expect(screen.getByRole("button", { name: /gerar.next/ })).toBeEnabled();
  });

  it("submits converted values and displays an auto-saved workout", async () => {
    invoke.mockResolvedValue({ data: { treino: { titulo: "Plano pronto" }, savedWorkoutId: "w1" }, error: null });
    await renderGenerator();
    await completeForm();
    fireEvent.click(screen.getByRole("button", { name: /gerar.focus.Peito/ }));
    fireEvent.click(screen.getByRole("button", { name: /gerar.generate/ }));
    await waitFor(() => expect(invoke).toHaveBeenCalledWith("generate-workout", { body: expect.objectContaining({ idade: 30, dias: 3, tempo: 45, foco: ["Peito"], locale: "pt" }) }));
    expect(await screen.findByText("Plano pronto")).toBeInTheDocument();
    expect(toastSuccess).toHaveBeenCalledWith("gerar.saved_auto");
  });

  it.each([
    [{ message: "quota_exceeded" }, "gerar.err_quota"],
    [{ message: "status 429" }, "gerar.err_rate"],
    [{ message: "status 402" }, "gerar.err_credits"],
    [{ message: "other" }, "gerar.err_generic"],
  ])("maps generation errors to helpful messages", async (error, expected) => {
    invoke.mockResolvedValue({ data: null, error });
    await renderGenerator();
    await completeForm();
    fireEvent.click(screen.getByRole("button", { name: /gerar.generate/ }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(expected));
  });
});
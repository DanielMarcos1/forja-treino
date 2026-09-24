import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigate = vi.fn();
const getSession = vi.fn();
const maybeSingle = vi.fn();
const toastError = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => navigate,
  useParams: () => ({ id: "workout-42" }),
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/components/SiteChrome", () => ({ SiteHeader: () => null, SiteFooter: () => null }));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => toastError(...args) } }));
vi.mock("@/i18n/useLocale", () => ({ useLocale: () => "pt", localeParam: () => undefined }));
vi.mock("@/components/WorkoutResult", () => ({
  WorkoutResult: ({ treino, onBack }: { treino: { titulo: string }; onBack: () => void }) => (
    <button onClick={onBack}>{treino.titulo}</button>
  ),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: (...args: unknown[]) => getSession(...args) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: (...args: unknown[]) => maybeSingle(...args) }) }),
    }),
  },
}));

describe("saved workout detail", () => {
  beforeEach(() => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } } });
    maybeSingle.mockResolvedValue({ data: { payload: { titulo: "Treino aberto" } }, error: null });
  });

  async function renderDetail() {
    const { Route } = await import("./{-$locale}/meus-treinos.$id");
    const Component = (Route as unknown as { component: React.ComponentType }).component;
    render(<Component />);
  }

  it("loads the requested saved workout and returns to the list", async () => {
    await renderDetail();
    const workout = await screen.findByRole("button", { name: "Treino aberto" });
    workout.click();
    expect(navigate).toHaveBeenCalledWith({
      to: "/{-$locale}/meus-treinos",
      params: { locale: undefined },
    });
  });

  it("shows an error when the workout cannot be loaded", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: "missing" } });
    await renderDetail();
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("meus.err_load"));
    expect(screen.getByText("meus.not_found")).toBeInTheDocument();
  });

  it("redirects signed-out visitors", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await renderDetail();
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: "/{-$locale}/login",
        params: { locale: undefined },
      }),
    );
  });
});

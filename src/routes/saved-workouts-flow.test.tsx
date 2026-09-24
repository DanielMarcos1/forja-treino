import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigate = vi.fn();
const getSession = vi.fn();
const selectResult = vi.fn();
const deleteResult = vi.fn();
const updateResult = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();

const rows = [{
  id: "w1", title: "Treino inicial", summary: "Resumo",
  dias_por_semana: 3, duracao_min: 45, created_at: "2026-09-01T12:00:00Z",
}];

function queryBuilder(operation: "select" | "delete" | "update") {
  const result = operation === "select" ? selectResult : operation === "delete" ? deleteResult : updateResult;
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => result()),
    delete: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => result()),
  };
  return builder;
}

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => navigate,
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return { ...actual, useTranslation: () => ({
    t: (key: string, data?: Record<string, unknown>) => data ? `${key}:${Object.values(data).join(":")}` : key,
    i18n: { language: "pt-BR" },
  }) };
});
vi.mock("@/components/SiteChrome", () => ({ SiteHeader: () => null, SiteFooter: () => null }));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => toastError(...args), success: (...args: unknown[]) => toastSuccess(...args) } }));
vi.mock("@/i18n/useLocale", () => ({ useLocale: () => "pt", localeParam: () => undefined }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: (...args: unknown[]) => getSession(...args) },
    from: () => ({
      select: (..._args: unknown[]) => queryBuilder("select"),
      delete: () => queryBuilder("delete"),
      update: (..._args: unknown[]) => queryBuilder("update"),
    }),
  },
}));

describe("saved workouts list", () => {
  beforeEach(() => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } } });
    selectResult.mockResolvedValue({ data: rows, error: null });
    deleteResult.mockResolvedValue({ error: null });
    updateResult.mockResolvedValue({ error: null });
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  async function renderList() {
    const { Route } = await import("./{-$locale}/meus-treinos.index");
    const Component = (Route as unknown as { component: React.ComponentType }).component;
    render(<Component />);
    await screen.findByText("Treino inicial");
  }

  it("redirects visitors before loading private workouts", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    const { Route } = await import("./{-$locale}/meus-treinos.index");
    const Component = (Route as unknown as { component: React.ComponentType }).component;
    render(<Component />);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: "/{-$locale}/login", params: { locale: undefined } }));
  });

  it("renders saved workouts and renames one", async () => {
    await renderList();
    fireEvent.click(screen.getByRole("button", { name: "meus.rename" }));
    const input = screen.getByDisplayValue("Treino inicial");
    fireEvent.change(input, { target: { value: "  Novo nome  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByText("Novo nome")).toBeInTheDocument();
    expect(toastSuccess).toHaveBeenCalledWith("meus.renamed");
  });

  it("cancels rename with Escape", async () => {
    await renderList();
    fireEvent.click(screen.getByRole("button", { name: "meus.rename" }));
    fireEvent.keyDown(screen.getByDisplayValue("Treino inicial"), { key: "Escape" });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Treino inicial")).toBeInTheDocument();
  });

  it("deletes after confirmation and keeps it when cancelled", async () => {
    await renderList();
    vi.mocked(confirm).mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: "meus.delete" }));
    expect(screen.getByText("Treino inicial")).toBeInTheDocument();
    vi.mocked(confirm).mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole("button", { name: "meus.delete" }));
    await waitFor(() => expect(screen.queryByText("Treino inicial")).not.toBeInTheDocument());
    expect(toastSuccess).toHaveBeenCalledWith("meus.deleted");
  });

  it("renders the empty state", async () => {
    selectResult.mockResolvedValue({ data: [], error: null });
    const { Route } = await import("./{-$locale}/meus-treinos.index");
    const Component = (Route as unknown as { component: React.ComponentType }).component;
    render(<Component />);
    expect(await screen.findByText("meus.empty_title")).toBeInTheDocument();
  });
});
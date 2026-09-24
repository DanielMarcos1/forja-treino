import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorkoutResult, type Treino } from "./WorkoutResult";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string, data?: Record<string, unknown>) => data ? `${key}:${Object.values(data).join(":")}` : key }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
vi.mock("@/components/ExerciseDemo", () => ({
  ExerciseDemo: ({ name, open, onToggle }: { name: string; open: boolean; onToggle: () => void }) => (
    <button aria-label={`demo-${name}`} aria-expanded={open} onClick={onToggle}>{name}</button>
  ),
}));

const treino: Treino = {
  titulo: "Treino Forte",
  resumo: "Resumo",
  diasPorSemana: 2,
  duracaoMin: 45,
  dias: [
    { nome: "Peito", aquecimento: "Caminhada", alongamento: "Alongar", exercicios: [
      { nome: "Supino", nomeEn: "bench press", series: 3, reps: "10", descanso: "60s", observacao: "Controle" },
      { nome: "Crucifixo", nomeEn: "fly", series: 2, reps: "12", descanso: "45s" },
    ] },
    { nome: "Pernas", aquecimento: "Bike", alongamento: "Alongar pernas", exercicios: [
      { nome: "Agachamento", series: 4, reps: "8", descanso: "90s" },
    ] },
  ],
  dicas: ["Hidrate-se"],
};

describe("WorkoutResult", () => {
  beforeEach(() => {
    vi.mocked(navigator.clipboard.writeText).mockClear();
    vi.mocked(window.print).mockClear();
  });

  it("renders the selected day and switches days", () => {
    const setActiveDay = vi.fn();
    render(<WorkoutResult treino={treino} activeDay={0} setActiveDay={setActiveDay} />);
    expect(screen.getByText("gerar.day_label:A — Peito")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "gerar.day_label:B" }));
    expect(setActiveDay).toHaveBeenCalledWith(1);
  });

  it("copies the complete workout and prints", () => {
    render(<WorkoutResult treino={treino} activeDay={0} setActiveDay={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /gerar.copy/ }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("Supino — 3x10 (60s) — Controle"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("Hidrate-se"));
    fireEvent.click(screen.getByRole("button", { name: /gerar.print/ }));
    expect(window.print).toHaveBeenCalledOnce();
  });

  it("renders optional actions", () => {
    const onBack = vi.fn();
    const onRestart = vi.fn();
    render(<WorkoutResult treino={treino} activeDay={0} setActiveDay={vi.fn()} onBack={onBack} onRestart={onRestart} backLabel="Voltar" />);
    fireEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    fireEvent.click(screen.getByRole("button", { name: /gerar.restart/ }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it("keeps only one exercise demonstration open", () => {
    render(<WorkoutResult treino={treino} activeDay={0} setActiveDay={vi.fn()} />);
    const first = screen.getAllByRole("button", { name: "demo-Supino" })[0];
    const second = screen.getAllByRole("button", { name: "demo-Crucifixo" })[0];
    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(second);
    expect(second).toHaveAttribute("aria-expanded", "false");
  });
});
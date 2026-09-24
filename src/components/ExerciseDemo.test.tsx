import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExerciseDemo } from "./ExerciseDemo";

const findExerciseGif = vi.fn();
vi.mock("@/lib/exerciseLibrary/match", () => ({
  findExerciseGif: (...args: unknown[]) => findExerciseGif(...args),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, data?: { name?: string }) => (data?.name ? `${key}:${data.name}` : key),
  }),
}));
vi.mock("@/i18n/useLocale", () => ({ useLocale: () => "pt" }));

class TestImage {
  static instances: TestImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = "";
  constructor() {
    TestImage.instances.push(this);
  }
}

describe("ExerciseDemo", () => {
  beforeEach(() => {
    TestImage.instances = [];
    vi.stubGlobal("Image", TestImage);
  });

  it("loads and displays a matched animation", async () => {
    findExerciseGif.mockResolvedValue({
      slug: "squat",
      muscle: "quads",
      gifUrl: "https://cdn.test/squat.gif",
      score: 1,
    });
    render(<ExerciseDemo name="Agachamento" nameEn="squat" open onToggle={vi.fn()} />);
    expect(await screen.findByText("gerar.demo_loading")).toBeInTheDocument();
    await waitFor(() => expect(TestImage.instances).toHaveLength(1));
    act(() => TestImage.instances[0]?.onload?.());
    expect(await screen.findByRole("img", { name: "gerar.demo_alt:Agachamento" })).toHaveAttribute(
      "src",
      "https://cdn.test/squat.gif",
    );
    expect(screen.getByText("gerar.demo_hint")).toBeInTheDocument();
  });

  it("shows the safe fallback when no match exists", async () => {
    findExerciseGif.mockResolvedValue(null);
    render(<ExerciseDemo name="Desconhecido" open onToggle={vi.fn()} />);
    expect(await screen.findByText("gerar.demo_not_found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gerar.open_youtube/ })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("stops waiting after eight seconds", async () => {
    vi.useFakeTimers();
    findExerciseGif.mockResolvedValue({
      slug: "squat",
      muscle: "quads",
      gifUrl: "https://cdn.test/squat.gif",
      score: 1,
    });
    render(<ExerciseDemo name="Agachamento" open onToggle={vi.fn()} />);
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(screen.getByText("gerar.demo_not_found")).toBeInTheDocument();
  });

  it("resets and cancels image callbacks when closed", async () => {
    findExerciseGif.mockResolvedValue({
      slug: "squat",
      muscle: "quads",
      gifUrl: "https://cdn.test/squat.gif",
      score: 1,
    });
    const { rerender } = render(<ExerciseDemo name="Agachamento" open onToggle={vi.fn()} />);
    await waitFor(() => expect(TestImage.instances).toHaveLength(1));
    rerender(<ExerciseDemo name="Agachamento" open={false} onToggle={vi.fn()} />);
    expect(TestImage.instances[0]?.onload).toBeNull();
    expect(TestImage.instances[0]?.onerror).toBeNull();
    expect(screen.queryByText("gerar.demo_loading")).not.toBeInTheDocument();
  });

  it("delegates opening and closing to its parent", () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <ExerciseDemo name="Agachamento" open={false} onToggle={onToggle} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "gerar.see_demo" }));
    expect(onToggle).toHaveBeenCalledOnce();
    rerender(<ExerciseDemo name="Agachamento" open onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: "gerar.close_demo" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});

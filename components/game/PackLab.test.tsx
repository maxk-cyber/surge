import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PackLab } from "@/components/game/PackLab";
import { PACK_LAB_STORAGE_KEY } from "@/lib/pack-lab";

vi.mock("motion/react", () => {
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      initial,
      animate,
      transition,
      whileHover,
      whileInView,
      viewport,
      style,
      ...rest
    } = props;
    const safeStyle =
      style && typeof style === "object"
        ? Object.fromEntries(
            Object.entries(style as Record<string, unknown>).filter(([key]) => key !== "x" && key !== "y"),
          )
        : style;
    return { ...rest, style: safeStyle };
  };

  return {
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
        React.createElement("div", stripMotionProps(props as Record<string, unknown>), children),
      button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
        React.createElement("button", stripMotionProps(props as Record<string, unknown>), children),
    },
    useMotionValue: (value: number) => ({ get: () => value, set: vi.fn() }),
    useReducedMotion: () => false,
    useSpring: (value: unknown) => value,
  };
});

describe("PackLab", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists strategy changes and updates the briefing", async () => {
    const user = userEvent.setup();

    render(React.createElement(PackLab, { motionLevel: "calm" }));

    await user.click(screen.getByRole("button", { name: /rush/i }));

    expect(localStorage.getItem(PACK_LAB_STORAGE_KEY)).toBe("rush");
    expect(screen.getByText(/Speed Rush:/i)).toBeInTheDocument();
  });

  it("copies the visible pack briefing", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(React.createElement(PackLab, { motionLevel: "calm" }));
    await user.click(screen.getByRole("button", { name: /copy pack briefing/i }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Balanced Menace"));
    expect(screen.getByRole("button", { name: /copy pack briefing/i })).toHaveTextContent(/copied/i);
  });

  it("saves every unsaved fighter in the visible pack", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();

    render(React.createElement(PackLab, { motionLevel: "calm", favorites: [], onToggleFavorite }));
    const livePack = screen.getByText(/Live pack/i).closest("div")?.parentElement;

    await user.click(screen.getByRole("button", { name: /save visible pack/i }));

    expect(onToggleFavorite).toHaveBeenCalledTimes(4);
    if (livePack) {
      expect(within(livePack).getAllByRole("button", { name: /add .* favorite from pack/i })).toHaveLength(4);
    }
  });
});

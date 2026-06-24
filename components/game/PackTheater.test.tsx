import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PackTheater } from "@/components/game/PackTheater";

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

describe("PackTheater", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  it("persists lane selection, reveals a pull, favorites it, and copies the manifest", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();

    render(
      React.createElement(PackTheater, {
        vibe: "arcade",
        motionLevel: "calm",
        favorites: [],
        onToggleFavorite,
      }),
    );

    await user.click(screen.getByRole("button", { name: /neon slime rush/i }));
    expect(localStorage.getItem("snack-surge-pack-lane")).toBe("slime");

    const activePanel = screen.getByText(/Active pull/i).closest("div");
    expect(activePanel).not.toBeNull();
    expect(within(activePanel as HTMLElement).getByText(/wrapper is still sealed/i)).toBeInTheDocument();

    const favorite = screen.getByRole("button", { name: /add .* favorite/i });
    expect(favorite).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /reveal active pack pull/i }));
    expect(screen.getByText(/1\/5 seals opened/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add .* favorite/i })).not.toBeDisabled();

    await user.click(screen.getByRole("button", { name: /add .* favorite/i }));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /copy pack manifest/i }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Snack Surge Neon Slime Rush pack"));
  });
});

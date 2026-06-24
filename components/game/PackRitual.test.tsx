import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PackRitual } from "@/components/game/PackRitual";
import { PACK_RITUAL_STORAGE_KEY } from "@/lib/pack-ritual";

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

describe("PackRitual", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("reveals pulls, favorites a pull, and copies the pack summary", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();

    render(React.createElement(PackRitual, { favorites: [], onToggleFavorite }));

    expect(screen.getByText("0 / 5 pulls visible")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open pack ritual/i }));

    expect(screen.getByText("5 / 5 pulls visible")).toBeInTheDocument();
    expect(screen.getAllByAltText(/pack pull/i)).toHaveLength(5);

    await user.click(screen.getAllByRole("button", { name: /add .* favorite from pack/i })[0]!);
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /copy pack pull summary/i }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("Snack Surge")));
    expect(screen.getByRole("button", { name: /copy pack pull summary/i })).toHaveTextContent("Copied");
  });

  it("persists lane choices and uses R to reveal or reshuffle", async () => {
    const user = userEvent.setup();

    render(React.createElement(PackRitual, { favorites: [] }));

    await user.click(screen.getByRole("button", { name: /slime/i }));
    expect(localStorage.getItem(PACK_RITUAL_STORAGE_KEY)).toBe("slime");
    expect(screen.getByText("Neon Slime Rush")).toBeInTheDocument();

    const controls = screen.getByRole("group", { name: /pack ritual controls/i });
    controls.focus();
    await user.keyboard("r");
    expect(screen.getByText("5 / 5 pulls visible")).toBeInTheDocument();

    await user.keyboard("r");
    expect(screen.getByText("0 / 5 pulls visible")).toBeInTheDocument();
    expect(screen.getByText("Window #2")).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PackOpening } from "@/components/game/PackOpening";

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

describe("PackOpening", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reveals pack cards and updates progress", async () => {
    const user = userEvent.setup();
    render(React.createElement(PackOpening, { motionLevel: "calm" }));

    expect(screen.getByRole("progressbar", { name: /pack reveal progress/i })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );

    await user.click(screen.getByRole("button", { name: /rip pack/i }));

    expect(screen.getByRole("progressbar", { name: /pack reveal progress/i })).toHaveAttribute(
      "aria-valuenow",
      "20",
    );
    expect(screen.getByText(/active pull/i)).toBeInTheDocument();
  });

  it("persists the selected pack vibe", async () => {
    const user = userEvent.setup();
    render(React.createElement(PackOpening, { motionLevel: "calm" }));

    await user.click(screen.getByRole("button", { name: /crunch pack/i }));

    expect(localStorage.getItem("snack-surge-pack-vibe")).toBe("crunch");
  });

  it("favorites the active pull and copies revealed pulls", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    const onToggleFavorite = vi.fn();
    render(React.createElement(PackOpening, { motionLevel: "calm", onToggleFavorite }));

    await user.click(screen.getByRole("button", { name: /rip pack/i }));
    await user.click(screen.getByRole("button", { name: /add .* favorite/i }));
    await user.click(screen.getByRole("button", { name: /copy pulls/i }));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("1."));
  });
});

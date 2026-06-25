import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PackLab } from "@/components/game/PackLab";

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
      figure: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) =>
        React.createElement("figure", stripMotionProps(props as Record<string, unknown>), children),
    },
    useMotionValue: (value: number) => ({ get: () => value, set: vi.fn() }),
    useReducedMotion: () => false,
    useSpring: (value: unknown) => value,
  };
});

describe("PackLab", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("persists selected lane and cycles recommendations", async () => {
    const user = userEvent.setup();

    render(React.createElement(PackLab, { motionLevel: "calm" }));

    await user.click(screen.getByRole("button", { name: /rush/i }));
    expect(localStorage.getItem("snack-surge-pack-lane")).toBe("rush");

    await user.click(screen.getByRole("button", { name: /next pack lab fighter/i }));
    expect(screen.getByLabelText(/Pack lineup window/i)).toBeInTheDocument();
  });

  it("copies the drop code and exposes favorite action", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();

    render(React.createElement(PackLab, { motionLevel: "calm", onToggleFavorite }));

    await user.click(screen.getByRole("button", { name: /copy pack lab lineup/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /copy pack lab lineup/i })).toHaveTextContent("Copied"));

    await user.click(screen.getByRole("button", { name: /add .* from favorites/i }));
    expect(onToggleFavorite).toHaveBeenCalled();
  });
});

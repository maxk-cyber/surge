import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DraftAssistant } from "@/components/game/DraftAssistant";
import { PLAYER_AVATARS } from "@/lib/avatars";

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

describe("DraftAssistant", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("persists strategy choices and updates the recommended lineup", async () => {
    const user = userEvent.setup();

    render(<DraftAssistant fighters={PLAYER_AVATARS} motionLevel="calm" />);

    expect(screen.getByText(/Balanced tray/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Speed/i }));

    expect(localStorage.getItem("snack-surge-draft-strategy")).toBe("speed");
    expect(screen.getByText(/Speed line/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Skull Bunny/i).length).toBeGreaterThan(0);
  });

  it("copies a shareable squad summary", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<DraftAssistant fighters={PLAYER_AVATARS.slice(0, 4)} motionLevel="calm" />);

    await user.click(screen.getByRole("button", { name: /Copy recommended lineup/i }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Snack Surge"));
    expect(screen.getByRole("button", { name: /Copy recommended lineup/i })).toHaveTextContent("Copied squad");
  });
});

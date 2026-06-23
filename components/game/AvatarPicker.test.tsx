import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AvatarPicker } from "@/components/game/AvatarPicker";

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

describe("AvatarPicker", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders public PNG avatars and cycles to the next fighter", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    const onToggleSquad = vi.fn();

    render(React.createElement(AvatarPicker, { favorites: [], squad: [], onToggleFavorite, onToggleSquad }));

    expect(screen.getByAltText("Skull Mickey portrait")).toHaveAttribute(
      "src",
      "/avatars/skullmic.png",
    );

    await user.click(screen.getByRole("button", { name: /next fighter/i }));

    expect(localStorage.getItem("snack-surge-avatar")).toBe("skullbunny");

    await user.click(screen.getByRole("button", { name: /add skull bunny favorite/i }));
    expect(onToggleFavorite).toHaveBeenCalledWith("skullbunny");

    await user.click(screen.getByRole("button", { name: /add skull bunny to squad/i }));
    expect(onToggleSquad).toHaveBeenCalledWith("skullbunny");

    await user.keyboard("s");
    expect(onToggleSquad).toHaveBeenLastCalledWith("skullbunny");
  });

  it("shows an empty state for an empty favorites filter", () => {
    render(React.createElement(AvatarPicker, { filter: "favorites", favorites: [] }));

    expect(screen.getByText(/No fighters in this tray/i)).toBeInTheDocument();
  });
});

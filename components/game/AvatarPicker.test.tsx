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

  it("renders generated avatar art and cycles to the next fighter", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    const onSelectedChange = vi.fn();

    render(React.createElement(AvatarPicker, { favorites: [], onToggleFavorite, onSelectedChange }));

    expect(screen.getByAltText("Skull Mickey portrait").getAttribute("src")).toMatch(
      /^data:image\/svg\+xml;charset=utf-8,/,
    );

    await user.click(screen.getByRole("button", { name: /next fighter/i }));

    expect(localStorage.getItem("snack-surge-avatar")).toBe("skullbunny");
    expect(onSelectedChange).toHaveBeenCalledWith("skullbunny");

    await user.click(screen.getByRole("button", { name: /add skull bunny favorite/i }));
    expect(onToggleFavorite).toHaveBeenCalledWith("skullbunny");
  });

  it("accepts a controlled selected fighter", () => {
    render(React.createElement(AvatarPicker, { selectedId: "burgerlich" }));

    expect(screen.getByText("Burger Lich")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add burger lich favorite/i })).toBeInTheDocument();
  });

  it("shows an empty state for an empty favorites filter", () => {
    render(React.createElement(AvatarPicker, { filter: "favorites", favorites: [] }));

    expect(screen.getByText(/No fighters in this tray/i)).toBeInTheDocument();
  });
});

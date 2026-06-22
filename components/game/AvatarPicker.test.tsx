import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders public PNG avatars and cycles to the next fighter", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();

    render(React.createElement(AvatarPicker, { favorites: [], onToggleFavorite }));

    expect(screen.getByAltText("Skull Mickey portrait")).toHaveAttribute(
      "src",
      "/avatars/skullmic.png",
    );

    await user.click(screen.getByRole("button", { name: /next fighter/i }));

    expect(localStorage.getItem("snack-surge-avatar")).toBe("skullbunny");

    await user.click(screen.getByRole("button", { name: /add skull bunny favorite/i }));
    expect(onToggleFavorite).toHaveBeenCalledWith("skullbunny");
  });

  it("shows an empty state for an empty favorites filter", () => {
    render(React.createElement(AvatarPicker, { filter: "favorites", favorites: [] }));

    expect(screen.getByText(/No fighters in this tray/i)).toBeInTheDocument();
  });

  it("searches, sorts, announces active cards, and copies rich summaries", async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();

    render(
      React.createElement(AvatarPicker, {
        query: "cheese",
        sort: "weird",
        favorites: [],
        onActiveChange,
      }),
    );

    expect(screen.getByText(/Search: cheese/i)).toBeInTheDocument();
    expect(screen.getByAltText("Nachomancer portrait")).toHaveAttribute(
      "src",
      "/avatars/nachomancer.png",
    );
    await waitFor(() => expect(onActiveChange).toHaveBeenCalledWith("nachomancer"));

    await user.click(screen.getByRole("button", { name: /copy nachomancer card summary/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("Nachomancer #007 - Triangle summoner"),
    );
    expect(screen.getByRole("button", { name: /copy nachomancer card summary/i })).toHaveTextContent(
      /Copied/i,
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  buildPackPulls,
  formatPackManifest,
  getPackRevealProgress,
  isPackLane,
  normalizePackSeed,
  toggleReveal,
} from "@/lib/pack-theater";

describe("pack theater feature logic", () => {
  it("builds deterministic unique pack pulls by lane and seed", () => {
    const first = buildPackPulls({ lane: "lunchline", seed: 2 });
    const again = buildPackPulls({ lane: "lunchline", seed: 2 });
    const otherLane = buildPackPulls({ lane: "vault", seed: 2 });

    expect(first).toHaveLength(5);
    expect(new Set(first.map((pull) => pull.id)).size).toBe(5);
    expect(first.map((pull) => pull.id)).toEqual(again.map((pull) => pull.id));
    expect(first.map((pull) => pull.id)).not.toEqual(otherLane.map((pull) => pull.id));
  });

  it("normalizes pack lanes and seeds", () => {
    expect(isPackLane("slime")).toBe(true);
    expect(isPackLane("missing")).toBe(false);
    expect(normalizePackSeed("7")).toBe(7);
    expect(normalizePackSeed("-1")).toBe(0);
    expect(normalizePackSeed("nope")).toBe(0);
  });

  it("tracks reveal progress from valid indexes only", () => {
    expect(toggleReveal([0], 2)).toEqual([0, 2]);
    expect(toggleReveal([0, 2], 0)).toEqual([2]);
    expect(getPackRevealProgress([0, 1, 9, 1], 5)).toMatchObject({
      count: 2,
      total: 5,
      percent: 40,
      complete: false,
    });
  });

  it("formats a shareable manifest", () => {
    const pulls = buildPackPulls({ lane: "vault", seed: 1 });

    expect(formatPackManifest("vault", pulls)).toContain("Snack Surge After-Hours Vault pack");
    expect(formatPackManifest("vault", pulls)).toContain("1.");
  });
});

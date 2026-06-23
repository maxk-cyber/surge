import { describe, expect, it } from "vitest";
import {
  buildPackWindow,
  isPackStrategy,
  rankFightersForStrategy,
  scoreFighter,
  summarizePack,
} from "@/lib/pack-lab";
import { PLAYER_AVATARS } from "@/lib/avatars";

describe("pack lab recommendation logic", () => {
  it("validates persisted strategy values", () => {
    expect(isPackStrategy("rush")).toBe(true);
    expect(isPackStrategy("missing")).toBe(false);
    expect(isPackStrategy(null)).toBe(false);
  });

  it("scores fighters higher when the strategy fits their stats", () => {
    const skullBunny = PLAYER_AVATARS.find((fighter) => fighter.id === "skullbunny")!;
    const gaperSkull = PLAYER_AVATARS.find((fighter) => fighter.id === "gaperskull")!;

    expect(scoreFighter(skullBunny, "rush")).toBeGreaterThan(scoreFighter(gaperSkull, "rush"));
    expect(scoreFighter(gaperSkull, "weird")).toBeGreaterThan(scoreFighter(skullBunny, "weird"));
  });

  it("boosts favorites while preserving deterministic ranking", () => {
    const withoutFavorite = rankFightersForStrategy({ strategy: "wall" }).map((fighter) => fighter.id);
    const withFavorite = rankFightersForStrategy({
      strategy: "wall",
      favorites: ["skullmic"],
    }).map((fighter) => fighter.id);

    expect(withoutFavorite).toContain("skullmic");
    expect(withFavorite.indexOf("skullmic")).toBeLessThanOrEqual(withoutFavorite.indexOf("skullmic"));
  });

  it("builds wrapped pack windows from the ranked roster", () => {
    const pack = buildPackWindow({ strategy: "balanced", packIndex: 18, size: 4 });

    expect(pack).toHaveLength(4);
    expect(new Set(pack.map((item) => item.fighter.id)).size).toBe(4);
    expect(pack[0]?.score).toEqual(expect.any(Number));
  });

  it("summarizes the active pack for copy and share actions", () => {
    const pack = buildPackWindow({ strategy: "weird", packIndex: 0, size: 3 });

    expect(summarizePack({ strategy: "weird", pack })).toContain("Maximum Weird");
    expect(summarizePack({ strategy: "weird", pack: [] })).toMatch(/No fighters/i);
  });
});

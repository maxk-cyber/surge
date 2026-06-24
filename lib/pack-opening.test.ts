import { describe, expect, it } from "vitest";
import { PLAYER_AVATARS } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import {
  formatPackShare,
  getPackSpotlight,
  getRevealProgress,
  makePackLineup,
} from "@/lib/pack-opening";

describe("pack opening feature logic", () => {
  it("builds deterministic five-card lineups with a rare final reveal", () => {
    const lineup = makePackLineup(PLAYER_AVATARS, "haunt", 2);

    expect(lineup).toHaveLength(5);
    expect(new Set(lineup.map((fighter) => fighter.id)).size).toBe(5);
    expect(FIGHTER_CARD_META[lineup.at(-1)!.id].rarity).not.toBe("common");
    expect(makePackLineup(PLAYER_AVATARS, "haunt", 2).map((fighter) => fighter.id)).toEqual(
      lineup.map((fighter) => fighter.id),
    );
  });

  it("finds the highest-value spotlight card", () => {
    const lineup = PLAYER_AVATARS.filter((fighter) =>
      ["frywraith", "ramenlich", "gaperskull"].includes(fighter.id),
    );

    expect(getPackSpotlight(lineup)?.id).toBe("gaperskull");
  });

  it("clamps reveal progress and formats share text", () => {
    const lineup = makePackLineup(PLAYER_AVATARS, "crunch", 1);

    expect(getRevealProgress(-1, 5)).toBe(0);
    expect(getRevealProgress(3, 5)).toBe(60);
    expect(getRevealProgress(99, 5)).toBe(100);
    expect(formatPackShare(lineup)).toContain("1.");
    expect(formatPackShare(lineup)).toMatch(/RARE|LEGEND/);
  });
});

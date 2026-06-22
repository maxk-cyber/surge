import { describe, expect, it } from "vitest";
import { PLAYER_AVATARS } from "@/lib/avatars";
import {
  DRAFT_STRATEGIES,
  filterFighters,
  formatRosterStats,
  getLineupStats,
  lineupShareText,
  parseStoredFavorites,
  suggestDraftLineup,
  toggleFavorite,
} from "@/lib/showroom";

describe("showroom feature logic", () => {
  it("normalizes stored favorites to known avatar ids", () => {
    expect(parseStoredFavorites(JSON.stringify(["skullmic", "missing", "skullmic"]))).toEqual([
      "skullmic",
    ]);
    expect(parseStoredFavorites("not-json")).toEqual([]);
  });

  it("toggles favorites without duplicating ids", () => {
    expect(toggleFavorite([], "skullmic")).toEqual(["skullmic"]);
    expect(toggleFavorite(["skullmic"], "skullmic")).toEqual([]);
  });

  it("filters fighters by rarity and favorites", () => {
    expect(filterFighters(PLAYER_AVATARS, "legend", []).map((fighter) => fighter.id)).toEqual([
      "skullmic",
      "gaperskull",
      "burgerlich",
    ]);
    expect(filterFighters(PLAYER_AVATARS, "favorites", ["ramenlich"]).map((fighter) => fighter.id)).toEqual([
      "ramenlich",
    ]);
  });

  it("summarizes roster counts", () => {
    expect(formatRosterStats()).toMatchObject({
      total: 20,
      common: 7,
      rare: 10,
      legend: 3,
      averageWeird: 89,
    });
  });

  it("suggests deterministic draft lineups by strategy", () => {
    const speedLine = suggestDraftLineup(PLAYER_AVATARS, "speed", 2);

    expect(speedLine).toHaveLength(2);
    expect(speedLine[0]!.id).toBe("skullbunny");
    expect(speedLine[1]!.id).toBe("skullmic");
    expect(suggestDraftLineup(PLAYER_AVATARS, "balanced", 0)).toEqual([]);
  });

  it("summarizes and serializes shareable lineup text", () => {
    const lineup = suggestDraftLineup(PLAYER_AVATARS, "brawler", 3);
    const stats = getLineupStats(lineup);

    expect(stats.averageScore).toBeGreaterThan(300);
    expect(lineupShareText(lineup, "brawler")).toContain(DRAFT_STRATEGIES.brawler.label);
    expect(lineupShareText([], "balanced")).toBe("Snack Surge draft: no fighters selected.");
  });
});

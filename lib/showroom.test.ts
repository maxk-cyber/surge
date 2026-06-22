import { describe, expect, it } from "vitest";
import { PLAYER_AVATARS } from "@/lib/avatars";
import {
  browseFighters,
  filterFighters,
  formatCardShareSummary,
  formatRosterStats,
  getFavoriteProgress,
  getRarityOdds,
  parseStoredRecent,
  searchFighters,
  sortFighters,
  parseStoredFavorites,
  toggleFavorite,
  updateRecentFighters,
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

  it("searches fighters by label, flavor, rarity, and stat metadata", () => {
    expect(searchFighters(PLAYER_AVATARS, "cheese").map((fighter) => fighter.id)).toEqual([
      "nachomancer",
    ]);
    expect(searchFighters(PLAYER_AVATARS, "legend").map((fighter) => fighter.id)).toEqual([
      "skullmic",
      "gaperskull",
      "burgerlich",
    ]);
    expect(searchFighters(PLAYER_AVATARS, "  hp  ").length).toBe(0);
  });

  it("sorts and browses the filtered fighter deck", () => {
    expect(sortFighters(PLAYER_AVATARS, "weird").slice(0, 2).map((fighter) => fighter.id)).toEqual([
      "gaperskull",
      "skullmic",
    ]);
    expect(
      browseFighters({
        fighters: PLAYER_AVATARS,
        filter: "rare",
        favorites: [],
        query: "ghost",
        sort: "speed",
      }).map((fighter) => fighter.id),
    ).toEqual(["jellophant"]);
  });

  it("tracks favorite progress and recent fighter history", () => {
    expect(getFavoriteProgress(["skullmic", "missing"])).toEqual({
      collected: 1,
      total: 20,
      percent: 5,
    });
    expect(parseStoredRecent(JSON.stringify(["skullmic", "missing", "gaperskull"]))).toEqual([
      "skullmic",
      "gaperskull",
    ]);
    expect(updateRecentFighters(["skullmic", "gaperskull"], "skullmic")).toEqual([
      "skullmic",
      "gaperskull",
    ]);
    expect(updateRecentFighters(["skullmic", "gaperskull"], "burgerlich", 2)).toEqual([
      "burgerlich",
      "skullmic",
    ]);
  });

  it("formats share summaries and rarity odds", () => {
    expect(formatCardShareSummary(PLAYER_AVATARS[0])).toContain(
      "Skull Mickey #001 - Ear-resistible menace",
    );
    expect(getRarityOdds().map((item) => [item.rarity, item.percent])).toEqual([
      ["legend", 15],
      ["rare", 50],
      ["common", 35],
    ]);
  });
});

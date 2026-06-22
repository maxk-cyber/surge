import { describe, expect, it } from "vitest";
import { PLAYER_AVATARS } from "@/lib/avatars";
import {
  filterFighters,
  formatRosterStats,
  parseStoredFavorites,
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
});

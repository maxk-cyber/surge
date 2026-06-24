import { describe, expect, it } from "vitest";
import { PLAYER_AVATARS } from "@/lib/avatars";
import {
  buildCardSummary,
  buildLineupBrief,
  filterFighters,
  formatRosterStats,
  parseStoredFavorites,
  recommendFightersForStrategy,
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

  it("recommends strategy-specific lineups from fighter stats", () => {
    expect(recommendFightersForStrategy(PLAYER_AVATARS, "speedrun", [], 3).map((fighter) => fighter.id)).toEqual([
      "frywraith",
      "skullbunny",
      "donutcreep",
    ]);

    expect(recommendFightersForStrategy(PLAYER_AVATARS, "bulwark", [], 3).map((fighter) => fighter.id)).toEqual([
      "burgerlich",
      "gaperskull",
      "skullmic",
    ]);
  });

  it("boosts favorites and builds shareable lineup text", () => {
    const chaos = recommendFightersForStrategy(PLAYER_AVATARS, "chaos", ["ramenlich"], 3);
    expect(chaos.map((fighter) => fighter.id)).toContain("ramenlich");
    expect(buildCardSummary(PLAYER_AVATARS[0]!)).toBe("Skull Mickey #001 - Ear-resistible menace (LEGEND)");
    expect(buildLineupBrief("chaos", chaos)).toContain("Snack Surge Contraband Chaos:");
  });
});

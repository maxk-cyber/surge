import { describe, expect, it } from "vitest";
import { PLAYER_AVATARS } from "@/lib/avatars";
import {
  buildSquadShareText,
  filterFighters,
  formatRosterStats,
  parseStoredFavorites,
  parseStoredSquad,
  summarizeSquad,
  toggleFavorite,
  toggleSquadMember,
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

  it("normalizes and cycles squad members", () => {
    expect(parseStoredSquad(JSON.stringify(["skullmic", "missing", "skullmic", "burgerlich"]))).toEqual([
      "skullmic",
      "burgerlich",
    ]);
    expect(toggleSquadMember(["skullmic", "skullbunny", "gaperskull"], "burgerlich")).toEqual([
      "skullbunny",
      "gaperskull",
      "burgerlich",
    ]);
    expect(toggleSquadMember(["skullmic", "burgerlich"], "skullmic")).toEqual(["burgerlich"]);
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

  it("summarizes and formats a squad share card", () => {
    expect(summarizeSquad(["skullmic", "gaperskull", "ramenlich"])).toMatchObject({
      count: 3,
      completion: 100,
      totalHp: 259,
      averageWeird: 98,
      signature: "Mythic Lunch Rush",
      rarityMix: { common: 0, rare: 1, legend: 2 },
    });
    expect(buildSquadShareText(["skullmic", "gaperskull", "ramenlich"])).toBe(
      "Snack Surge squad: Skull Mickey + Gaper Skull + Ramen Lich — Mythic Lunch Rush, 98 WRD avg",
    );
  });
});

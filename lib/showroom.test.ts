import { describe, expect, it } from "vitest";
import { PLAYER_AVATARS } from "@/lib/avatars";
import {
  buildThreatBriefings,
  createCardSummary,
  filterFighters,
  formatRosterStats,
  parseShowroomSearch,
  parseStoredFavorites,
  toggleFavorite,
  updateShowroomSearch,
} from "@/lib/showroom";
import { playerPortraitSrc } from "@/lib/avatar-assets";

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

  it("creates concise share/copy card summaries", () => {
    expect(createCardSummary(PLAYER_AVATARS[0]!)).toBe(
      "Skull Mickey #001 - Ear-resistible menace (LEGEND / WRD 99)",
    );
  });

  it("parses and updates shareable showroom query state", () => {
    expect(parseShowroomSearch("?vibe=toxic&motion=calm&filter=legend&fighter=burgerlich")).toEqual({
      vibe: "toxic",
      motion: "calm",
      filter: "legend",
      fighter: "burgerlich",
    });

    expect(parseShowroomSearch("?vibe=invalid&filter=missing&fighter=nope")).toEqual({
      vibe: undefined,
      motion: undefined,
      filter: undefined,
      fighter: undefined,
    });

    expect(
      updateShowroomSearch("?utm=arcade", {
        vibe: "noir",
        motion: "showtime",
        filter: "rare",
        fighter: "wormface",
      }),
    ).toBe("?utm=arcade&vibe=noir&motion=showtime&filter=rare&fighter=wormface");
  });

  it("builds cyclic threat briefings from active fighter stats", () => {
    const briefings = buildThreatBriefings(PLAYER_AVATARS[1]!);

    expect(briefings).toHaveLength(3);
    expect(briefings[0].title).toContain("Skull Bunny");
    expect(briefings[1].body).toContain("SPD 91");
  });

  it("uses generated data-uri portraits so the static export has no missing avatar files", () => {
    expect(playerPortraitSrc("skullmic")).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
  });
});

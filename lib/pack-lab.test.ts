import { describe, expect, it } from "vitest";
import { PLAYER_AVATARS } from "@/lib/avatars";
import { buildDraftPack, scoreFighterForStrategy, summarizeDraftPack } from "@/lib/pack-lab";

describe("pack lab recommendation logic", () => {
  it("builds a stat-driven cyclic pack", () => {
    const firstPack = buildDraftPack({ strategy: "weird", packIndex: 0, size: 5 });
    const secondPack = buildDraftPack({ strategy: "weird", packIndex: 1, size: 5 });

    expect(firstPack).toHaveLength(5);
    expect(firstPack.map(({ fighter }) => fighter.id)).toContain("gaperskull");
    expect(secondPack.map(({ fighter }) => fighter.id)).not.toEqual(
      firstPack.map(({ fighter }) => fighter.id),
    );
  });

  it("boosts favorites without mutating the source roster", () => {
    const baseScore = scoreFighterForStrategy(PLAYER_AVATARS[1], "rush", []);
    const favoriteScore = scoreFighterForStrategy(PLAYER_AVATARS[1], "rush", ["skullbunny"]);

    expect(favoriteScore).toBe(baseScore + 8);
    expect(PLAYER_AVATARS[1].id).toBe("skullbunny");
  });

  it("summarizes packs for copy actions", () => {
    const pack = buildDraftPack({ strategy: "tank", packIndex: 0, size: 3 });

    expect(summarizeDraftPack(pack, "tank")).toContain("Tank Tray:");
    expect(summarizeDraftPack(pack, "tank").split(",")).toHaveLength(3);
  });
});

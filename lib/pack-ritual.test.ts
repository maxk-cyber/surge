import { describe, expect, it } from "vitest";
import {
  buildPackPulls,
  formatPackShareText,
  isPackLaneId,
  PACK_LANES,
  rankFightersForPack,
  summarizePackPulls,
} from "@/lib/pack-ritual";

describe("pack ritual logic", () => {
  it("validates known pack lane ids", () => {
    expect(isPackLaneId("haunted")).toBe(true);
    expect(isPackLaneId("missing")).toBe(false);
  });

  it("ranks fighters by each lane focus stat with rarity lift", () => {
    const hauntedPool = rankFightersForPack("haunted");
    const slimePool = rankFightersForPack("slime");

    expect(PACK_LANES.haunted.focusStat).toBe("weird");
    expect(hauntedPool[0]?.id).toBe("gaperskull");
    expect(slimePool[0]?.id).toBe("skullbunny");
  });

  it("builds wrapped five-pull windows from the iterator helpers", () => {
    const pulls = buildPackPulls({ laneId: "haunted", drawIndex: 0 });

    expect(pulls).toHaveLength(5);
    expect(pulls.map((pull) => pull.distance)).toEqual([-2, -1, 0, 1, 2]);
    expect(pulls.some((pull) => pull.featured)).toBe(true);
  });

  it("summarizes and formats a pack share line", () => {
    const pulls = buildPackPulls({ laneId: "vault", drawIndex: 1 });
    const summary = summarizePackPulls(pulls);

    expect(summary.total).toBe(5);
    expect(summary.topPull?.avatar.label).toBeTruthy();
    expect(formatPackShareText("vault", pulls)).toContain("Snack Surge After-Hours Vault pull:");
  });
});

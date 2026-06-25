import { describe, expect, it } from "vitest";
import { PLAYER_AVATARS } from "@/lib/avatars";
import {
  buildPackShareText,
  getLineupWindow,
  getPackLineup,
  isPackLaneId,
  nextPackLane,
  scoreFighterForLane,
} from "@/lib/pack-lab";

describe("pack lab feature logic", () => {
  it("validates and cycles pack lanes", () => {
    expect(isPackLaneId("vault")).toBe(true);
    expect(isPackLaneId("missing")).toBe(false);
    expect(nextPackLane("vault")).toBe("rush");
    expect(nextPackLane("vault", -1)).toBe("ritual");
  });

  it("builds deterministic stat-weighted lineups", () => {
    const vault = getPackLineup({ laneId: "vault" }).map((fighter) => fighter.id);
    const rush = getPackLineup({ laneId: "rush" }).map((fighter) => fighter.id);

    expect(vault[0]).toBe("gaperskull");
    expect(rush[0]).toBe("skullbunny");
    expect(vault).not.toEqual(rush);
  });

  it("boosts favorites without duplicating fighters", () => {
    const score = scoreFighterForLane(PLAYER_AVATARS.find((fighter) => fighter.id === "ramenlich")!, "vault", [
      "ramenlich",
    ]);

    expect(score).toBeGreaterThan(scoreFighterForLane(PLAYER_AVATARS.find((fighter) => fighter.id === "ramenlich")!, "vault"));
    expect(new Set(getPackLineup({ laneId: "vault", favorites: ["ramenlich"] }).map((fighter) => fighter.id)).size).toBe(5);
  });

  it("builds a wrapped spotlight window and share text", () => {
    const lineup = getPackLineup({ laneId: "ritual" });

    expect(getLineupWindow(lineup, 0, 1).map(({ item }) => item.id)).toEqual([
      lineup[4]!.id,
      lineup[0]!.id,
      lineup[1]!.id,
    ]);
    expect(buildPackShareText("ritual", lineup)).toContain("Lunchline Ritual RITUAL-13:");
  });
});

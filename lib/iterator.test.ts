import { describe, expect, it } from "vitest";
import { cycleIndex, itemAtCycle, steppedCycle, windowAroundIndex } from "@/lib/iterator";

describe("iterator helpers", () => {
  it("wraps indexes in both directions", () => {
    expect(cycleIndex(4, 4)).toBe(0);
    expect(cycleIndex(-1, 4)).toBe(3);
    expect(cycleIndex(1, 4, -2)).toBe(3);
  });

  it("returns undefined for empty cyclic lookups", () => {
    expect(itemAtCycle([], 3)).toBeUndefined();
  });

  it("builds a wrapped window around the active index", () => {
    expect(windowAroundIndex(["a", "b", "c", "d"], 0, 1)).toEqual([
      { item: "d", index: 3, distance: -1 },
      { item: "a", index: 0, distance: 0 },
      { item: "b", index: 1, distance: 1 },
    ]);
  });

  it("builds stepped cyclic sequences for rotating panels", () => {
    expect(steppedCycle(["a", "b", "c", "d"], 3, 3, 2)).toEqual([
      { item: "d", index: 3, step: 0 },
      { item: "b", index: 1, step: 1 },
      { item: "d", index: 3, step: 2 },
    ]);
  });
});

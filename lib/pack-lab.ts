import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";
import { cycleIndex, windowAroundIndex } from "@/lib/iterator";

export type PackLaneId = "vault" | "rush" | "ritual";

export const PACK_LAB_STORAGE_KEY = "snack-surge-pack-lane";

export const PACK_LANES: Record<
  PackLaneId,
  {
    label: string;
    shortLabel: string;
    deckCode: string;
    accent: string;
    description: string;
    weights: { hp: number; atk: number; spd: number; weird: number; legend: number; favorite: number };
  }
> = {
  vault: {
    label: "After-Hours Vault",
    shortLabel: "Vault",
    deckCode: "VAULT-88",
    accent: "#a78bfa",
    description: "A premium collector lane tuned for legends, strange lore, and high weirdness.",
    weights: { hp: 0.18, atk: 0.12, spd: 0.06, weird: 0.38, legend: 18, favorite: 9 },
  },
  rush: {
    label: "Neon Slime Rush",
    shortLabel: "Rush",
    deckCode: "RUSH-404",
    accent: "#84cc16",
    description: "Fast, crunchy picks for players who want kinetic glass-cannon cafeteria chaos.",
    weights: { hp: 0.06, atk: 0.3, spd: 0.34, weird: 0.12, legend: 7, favorite: 7 },
  },
  ritual: {
    label: "Lunchline Ritual",
    shortLabel: "Ritual",
    deckCode: "RITUAL-13",
    accent: "#fb7185",
    description: "Balanced horror-comic drafting with enough HP to survive a cursed lunch period.",
    weights: { hp: 0.28, atk: 0.22, spd: 0.12, weird: 0.22, legend: 10, favorite: 8 },
  },
};

export function isPackLaneId(value: string | null): value is PackLaneId {
  return value === "vault" || value === "rush" || value === "ritual";
}

export function scoreFighterForLane(
  fighter: AvatarDef,
  laneId: PackLaneId,
  favorites: readonly PlayerAvatarId[] = [],
) {
  const meta = FIGHTER_CARD_META[fighter.id];
  const lane = PACK_LANES[laneId];
  return Math.round(
    meta.hp * lane.weights.hp +
      meta.atk * lane.weights.atk +
      meta.spd * lane.weights.spd +
      meta.weird * lane.weights.weird +
      (meta.rarity === "legend" ? lane.weights.legend : 0) +
      (favorites.includes(fighter.id) ? lane.weights.favorite : 0),
  );
}

export function getPackLineup({
  laneId,
  favorites = [],
  fighters = PLAYER_AVATARS,
  limit = 5,
}: {
  laneId: PackLaneId;
  favorites?: readonly PlayerAvatarId[];
  fighters?: readonly AvatarDef[];
  limit?: number;
}) {
  return [...fighters]
    .sort((a, b) => {
      const scoreDelta = scoreFighterForLane(b, laneId, favorites) - scoreFighterForLane(a, laneId, favorites);
      if (scoreDelta !== 0) return scoreDelta;
      return FIGHTER_CARD_META[a.id].number.localeCompare(FIGHTER_CARD_META[b.id].number);
    })
    .slice(0, limit);
}

export function getLineupWindow(lineup: readonly AvatarDef[], activeIndex: number, radius = 1) {
  return windowAroundIndex(lineup, activeIndex, radius);
}

export function nextPackLane(current: PackLaneId, step = 1) {
  const lanes = Object.keys(PACK_LANES) as PackLaneId[];
  return lanes[cycleIndex(lanes.indexOf(current), lanes.length, step)]!;
}

export function buildPackShareText(laneId: PackLaneId, lineup: readonly AvatarDef[]) {
  const lane = PACK_LANES[laneId];
  const names = lineup.map((fighter) => fighter.label).join(" / ");
  return `${lane.label} ${lane.deckCode}: ${names}`;
}

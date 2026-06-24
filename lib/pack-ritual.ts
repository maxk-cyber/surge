import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { cycleIndex, windowAroundIndex } from "@/lib/iterator";

type FighterMeta = (typeof FIGHTER_CARD_META)[PlayerAvatarId];
type FocusStat = "hp" | "atk" | "spd" | "weird";

export type PackLaneId = "haunted" | "slime" | "vault";

export const PACK_RITUAL_STORAGE_KEY = "snack-surge-pack-lane";

export const PACK_LANE_IDS = ["haunted", "slime", "vault"] as const satisfies readonly PackLaneId[];

export const PACK_LANES: Record<
  PackLaneId,
  {
    label: string;
    shortLabel: string;
    eyebrow: string;
    description: string;
    promise: string;
    accent: string;
    glow: string;
    focusStat: FocusStat;
    starterIndex: number;
  }
> = {
  haunted: {
    label: "Haunted Lunchline",
    shortLabel: "Lunchline",
    eyebrow: "Weirdness chase",
    description: "A horror-comic pack tuned for the strangest cafeteria cryptids.",
    promise: "High weird scores, slow-burn reveal, maximum folklore.",
    accent: "#f4ead7",
    glow: "#7c3cff",
    focusStat: "weird",
    starterIndex: 2,
  },
  slime: {
    label: "Neon Slime Rush",
    shortLabel: "Slime",
    eyebrow: "Speed pull",
    description: "Acid-bright arcade packs for fast attackers and twitchy favorites.",
    promise: "Quick flips, kinetic silhouettes, and speed-heavy pulls.",
    accent: "#bef264",
    glow: "#65ff9a",
    focusStat: "spd",
    starterIndex: 7,
  },
  vault: {
    label: "After-Hours Vault",
    shortLabel: "Vault",
    eyebrow: "Boss shelf",
    description: "A premium locked-case pack for durable legends and heavy hitters.",
    promise: "Tankier stats, brighter seals, and showcase-grade card backs.",
    accent: "#f5c6ff",
    glow: "#ff4fd8",
    focusStat: "hp",
    starterIndex: 11,
  },
};

const RARITY_WEIGHT: Record<FighterMeta["rarity"], number> = {
  common: 0,
  rare: 8,
  legend: 18,
};

export type PackPull = {
  avatar: AvatarDef;
  meta: FighterMeta;
  poolIndex: number;
  distance: number;
  slot: number;
  featured: boolean;
};

export function isPackLaneId(value: string | null): value is PackLaneId {
  return value === "haunted" || value === "slime" || value === "vault";
}

export function rankFightersForPack(
  laneId: PackLaneId,
  fighters: readonly AvatarDef[] = PLAYER_AVATARS,
) {
  const lane = PACK_LANES[laneId];

  return [...fighters].sort((a, b) => {
    const aMeta = FIGHTER_CARD_META[a.id];
    const bMeta = FIGHTER_CARD_META[b.id];
    const focusDelta =
      bMeta[lane.focusStat] +
      RARITY_WEIGHT[bMeta.rarity] -
      (aMeta[lane.focusStat] + RARITY_WEIGHT[aMeta.rarity]);

    if (focusDelta !== 0) return focusDelta;
    return Number(aMeta.number) - Number(bMeta.number);
  });
}

export function buildPackPulls({
  laneId,
  drawIndex = 0,
  size = 5,
  fighters = PLAYER_AVATARS,
}: {
  laneId: PackLaneId;
  drawIndex?: number;
  size?: number;
  fighters?: readonly AvatarDef[];
}) {
  const pool = rankFightersForPack(laneId, fighters);
  if (pool.length === 0 || size <= 0) return [];

  const lane = PACK_LANES[laneId];
  const radius = Math.max(0, Math.floor((size - 1) / 2));
  const centerIndex = cycleIndex(lane.starterIndex + drawIndex * 3, pool.length);
  const window = windowAroundIndex(pool, centerIndex, radius).slice(0, size);

  return window.map<PackPull>(({ item, index, distance }, slot) => {
    const meta = FIGHTER_CARD_META[item.id];
    return {
      avatar: item,
      meta,
      poolIndex: index,
      distance,
      slot,
      featured: distance === 0 || meta.rarity === "legend",
    };
  });
}

export function summarizePackPulls(pulls: readonly PackPull[]) {
  return pulls.reduce(
    (summary, pull) => {
      summary.total += 1;
      summary[pull.meta.rarity] += 1;
      summary.averageWeird += pull.meta.weird;
      if (!summary.topPull || pull.meta.weird > summary.topPull.meta.weird) {
        summary.topPull = pull;
      }
      return summary;
    },
    {
      total: 0,
      common: 0,
      rare: 0,
      legend: 0,
      averageWeird: 0,
      topPull: undefined as PackPull | undefined,
    },
  );
}

export function formatPackShareText(laneId: PackLaneId, pulls: readonly PackPull[]) {
  const lane = PACK_LANES[laneId];
  const names = pulls.map((pull) => `${pull.avatar.label} #${pull.meta.number}`).join(", ");
  return `Snack Surge ${lane.label} pull: ${names}`;
}

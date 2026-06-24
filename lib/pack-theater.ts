import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { cycleIndex } from "@/lib/iterator";

export type PackLaneId = "lunchline" | "slime" | "vault";

export const PACK_THEATER_STORAGE_KEYS = {
  lane: "snack-surge-pack-lane",
  seed: "snack-surge-pack-seed",
} as const;

export const PACK_LANES: Record<
  PackLaneId,
  {
    label: string;
    shortLabel: string;
    accent: string;
    glow: string;
    description: string;
    callout: string;
    stride: number;
    rarityBias: Record<"common" | "rare" | "legend", number>;
  }
> = {
  lunchline: {
    label: "Haunted Lunchline",
    shortLabel: "Lunchline",
    accent: "#f4ead7",
    glow: "#ffb86b",
    description: "Balanced pulls with a grimy cafeteria counter feel.",
    callout: "Best for first-time scouts who want a readable five-card spread.",
    stride: 7,
    rarityBias: { common: 14, rare: 20, legend: 24 },
  },
  slime: {
    label: "Neon Slime Rush",
    shortLabel: "Slime Rush",
    accent: "#bef264",
    glow: "#65ff9a",
    description: "Fast, acidic, and tuned toward speed freaks.",
    callout: "Highlights slippery rare cards and high-speed gobblers.",
    stride: 9,
    rarityBias: { common: 18, rare: 28, legend: 19 },
  },
  vault: {
    label: "After-Hours Vault",
    shortLabel: "Vault",
    accent: "#e9d5ff",
    glow: "#a855f7",
    description: "A darker collector lane with heavier legendary pressure.",
    callout: "Built for premium hunters chasing foil-level weirdness.",
    stride: 11,
    rarityBias: { common: 8, rare: 18, legend: 36 },
  },
};

export type PackPull = {
  avatar: AvatarDef;
  id: PlayerAvatarId;
  score: number;
  laneRank: number;
  signature: string;
};

export function isPackLane(value: string | null): value is PackLaneId {
  return value === "lunchline" || value === "slime" || value === "vault";
}

function hashValue(value: string) {
  return [...value].reduce((hash, char) => (hash * 33 + char.charCodeAt(0)) % 10007, 5381);
}

export function normalizePackSeed(value: string | number | null) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

export function buildPackPulls({
  lane,
  seed = 0,
  count = 5,
  fighters = PLAYER_AVATARS,
}: {
  lane: PackLaneId;
  seed?: number;
  count?: number;
  fighters?: readonly AvatarDef[];
}) {
  const laneConfig = PACK_LANES[lane];
  const normalizedSeed = normalizePackSeed(seed);
  const ranked = fighters
    .map((avatar) => {
      const meta = FIGHTER_CARD_META[avatar.id];
      const hash = hashValue(`${lane}:${normalizedSeed}:${avatar.id}`);
      const score =
        meta.weird * 1.4 +
        meta.atk * 0.45 +
        meta.spd * (lane === "slime" ? 0.65 : 0.35) +
        laneConfig.rarityBias[meta.rarity] +
        (hash % 37);

      return {
        avatar,
        id: avatar.id,
        score: Math.round(score),
        signature: `${laneConfig.shortLabel.toUpperCase()}-${meta.number}-${(hash % 99).toString().padStart(2, "0")}`,
      };
    })
    .sort((a, b) => b.score - a.score || a.avatar.label.localeCompare(b.avatar.label));

  if (ranked.length === 0 || count <= 0) return [];

  const start = cycleIndex(normalizedSeed + laneConfig.stride, ranked.length);
  const pulls: PackPull[] = [];
  for (let offset = 0; pulls.length < Math.min(count, ranked.length); offset += 1) {
    const candidate = ranked[cycleIndex(start, ranked.length, offset * laneConfig.stride)]!;
    if (!pulls.some((pull) => pull.id === candidate.id)) {
      pulls.push({ ...candidate, laneRank: pulls.length + 1 });
    }
  }

  return pulls;
}

export function toggleReveal(revealed: readonly number[], index: number) {
  return revealed.includes(index)
    ? revealed.filter((item) => item !== index)
    : [...revealed, index].sort((a, b) => a - b);
}

export function getPackRevealProgress(revealed: readonly number[], total: number) {
  const safeTotal = Math.max(0, total);
  const count = new Set(revealed.filter((index) => index >= 0 && index < safeTotal)).size;
  const percent = safeTotal ? Math.round((count / safeTotal) * 100) : 0;
  return {
    count,
    total: safeTotal,
    percent,
    label: `${count}/${safeTotal} seals opened`,
    complete: safeTotal > 0 && count === safeTotal,
  };
}

export function formatPackManifest(lane: PackLaneId, pulls: readonly PackPull[]) {
  const laneConfig = PACK_LANES[lane];
  const cards = pulls
    .map((pull) => {
      const meta = FIGHTER_CARD_META[pull.id];
      return `${pull.laneRank}. ${pull.avatar.label} #${meta.number} (${meta.rarity.toUpperCase()}) - ${pull.signature}`;
    })
    .join("\n");

  return `Snack Surge ${laneConfig.label} pack\n${cards}`;
}

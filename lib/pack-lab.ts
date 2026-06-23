import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { cycleIndex } from "@/lib/iterator";

export type PackStrategyId = "balanced" | "rush" | "wall" | "weird";

export const PACK_LAB_STORAGE_KEY = "snack-surge-pack-strategy";

export const PACK_STRATEGIES: Record<
  PackStrategyId,
  {
    label: string;
    shortLabel: string;
    description: string;
    weights: { hp: number; atk: number; spd: number; weird: number };
  }
> = {
  balanced: {
    label: "Balanced Menace",
    shortLabel: "Balance",
    description: "A safe three-card squad with pressure, survivability, and enough weird to stay memorable.",
    weights: { hp: 0.26, atk: 0.26, spd: 0.22, weird: 0.26 },
  },
  rush: {
    label: "Speed Rush",
    shortLabel: "Rush",
    description: "Fast pulls that feel good for aggressive players who want the next snack fight to pop.",
    weights: { hp: 0.12, atk: 0.3, spd: 0.42, weird: 0.16 },
  },
  wall: {
    label: "Lunch Tray Wall",
    shortLabel: "Wall",
    description: "Durable weirdos that look like they can hold a cafeteria lane by themselves.",
    weights: { hp: 0.44, atk: 0.2, spd: 0.1, weird: 0.26 },
  },
  weird: {
    label: "Maximum Weird",
    shortLabel: "Weird",
    description: "The most brand-defining draft path: odd silhouettes, horror-comic flavor, and foil energy.",
    weights: { hp: 0.16, atk: 0.16, spd: 0.12, weird: 0.56 },
  },
};

const RARITY_BONUS = {
  common: 0,
  rare: 3,
  legend: 7,
} as const;

export function isPackStrategy(value: string | null): value is PackStrategyId {
  return value === "balanced" || value === "rush" || value === "wall" || value === "weird";
}

export function scoreFighter(
  fighter: AvatarDef,
  strategy: PackStrategyId,
  favorites: readonly PlayerAvatarId[] = [],
) {
  const meta = FIGHTER_CARD_META[fighter.id];
  const weights = PACK_STRATEGIES[strategy].weights;
  const base =
    meta.hp * weights.hp + meta.atk * weights.atk + meta.spd * weights.spd + meta.weird * weights.weird;
  const favoriteBoost = favorites.includes(fighter.id) ? 4 : 0;

  return Math.round((base + RARITY_BONUS[meta.rarity] + favoriteBoost) * 10) / 10;
}

export function rankFightersForStrategy({
  strategy,
  fighters = PLAYER_AVATARS,
  favorites = [],
}: {
  strategy: PackStrategyId;
  fighters?: readonly AvatarDef[];
  favorites?: readonly PlayerAvatarId[];
}) {
  return [...fighters].sort((a, b) => {
    const scoreDelta = scoreFighter(b, strategy, favorites) - scoreFighter(a, strategy, favorites);
    if (scoreDelta !== 0) return scoreDelta;
    return FIGHTER_CARD_META[a.id].number.localeCompare(FIGHTER_CARD_META[b.id].number);
  });
}

export function buildPackWindow({
  strategy,
  packIndex,
  size = 4,
  fighters = PLAYER_AVATARS,
  favorites = [],
}: {
  strategy: PackStrategyId;
  packIndex: number;
  size?: number;
  fighters?: readonly AvatarDef[];
  favorites?: readonly PlayerAvatarId[];
}) {
  const ranked = rankFightersForStrategy({ strategy, fighters, favorites });
  if (ranked.length === 0 || size <= 0) return [];

  return Array.from({ length: Math.min(size, ranked.length) }, (_, offset) => {
    const index = cycleIndex(packIndex + offset * 3, ranked.length);
    const fighter = ranked[index]!;
    return {
      fighter,
      score: scoreFighter(fighter, strategy, favorites),
      meta: FIGHTER_CARD_META[fighter.id],
    };
  });
}

export function summarizePack({
  strategy,
  pack,
}: {
  strategy: PackStrategyId;
  pack: ReturnType<typeof buildPackWindow>;
}) {
  if (pack.length === 0) return "No fighters available for this draft.";
  const leader = pack[0]!;
  const names = pack.map((item) => item.fighter.label).join(", ");
  return `${PACK_STRATEGIES[strategy].label}: lead with ${leader.fighter.label} (${leader.score}) and scout ${names}.`;
}

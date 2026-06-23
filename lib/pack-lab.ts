import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";
import { cycleIndex, windowAroundIndex } from "@/lib/iterator";

export type DraftStrategyId = "weird" | "rush" | "tank";

export const DRAFT_STRATEGIES: Record<
  DraftStrategyId,
  {
    label: string;
    shortLabel: string;
    description: string;
    stat: "weird" | "spd" | "hp";
  }
> = {
  weird: {
    label: "Weird Lab",
    shortLabel: "WRD",
    description: "Prioritizes oddity, rare flavor, and the roster's most memorable cryptids.",
    stat: "weird",
  },
  rush: {
    label: "Rush Line",
    shortLabel: "SPD",
    description: "Builds a fast lane for quick browsing, snappy favorites, and high-tempo picks.",
    stat: "spd",
  },
  tank: {
    label: "Tank Tray",
    shortLabel: "HP",
    description: "Finds durable frontliners with enough attack to anchor a premium draft pack.",
    stat: "hp",
  },
};

const RARITY_BONUS = {
  common: 0,
  rare: 7,
  legend: 14,
} as const;

export function scoreFighterForStrategy(
  fighter: AvatarDef,
  strategy: DraftStrategyId,
  favorites: readonly PlayerAvatarId[] = [],
) {
  const meta = FIGHTER_CARD_META[fighter.id];
  const strategyStat = DRAFT_STRATEGIES[strategy].stat;
  const statScore = meta[strategyStat];
  const balanceScore = Math.round((meta.atk + meta.spd + meta.hp + meta.weird) / 16);
  const favoriteBoost = favorites.includes(fighter.id) ? 8 : 0;
  return statScore + balanceScore + RARITY_BONUS[meta.rarity] + favoriteBoost;
}

export function buildDraftPack({
  fighters = PLAYER_AVATARS,
  strategy,
  favorites = [],
  packIndex = 0,
  size = 5,
}: {
  fighters?: readonly AvatarDef[];
  strategy: DraftStrategyId;
  favorites?: readonly PlayerAvatarId[];
  packIndex?: number;
  size?: number;
}) {
  if (fighters.length === 0 || size <= 0) return [];
  const sorted = [...fighters].sort((a, b) => {
    const scoreDelta =
      scoreFighterForStrategy(b, strategy, favorites) - scoreFighterForStrategy(a, strategy, favorites);
    if (scoreDelta !== 0) return scoreDelta;
    return FIGHTER_CARD_META[a.id].number.localeCompare(FIGHTER_CARD_META[b.id].number);
  });
  const start = cycleIndex(packIndex * Math.max(1, Math.floor(size / 2)), sorted.length);
  return windowAroundIndex(sorted, start, Math.floor(size / 2))
    .slice(0, size)
    .map(({ item }, index) => ({
      fighter: item,
      score: scoreFighterForStrategy(item, strategy, favorites),
      slot: index + 1,
    }));
}

export function summarizeDraftPack(pack: ReturnType<typeof buildDraftPack>, strategy: DraftStrategyId) {
  const names = pack.map(({ fighter }) => fighter.label).join(", ");
  return `${DRAFT_STRATEGIES[strategy].label}: ${names}`;
}

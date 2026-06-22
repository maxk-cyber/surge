import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";

export type VibeModeId = "arcade" | "toxic" | "noir";
export type MotionLevel = "calm" | "showtime";
export type FighterFilter = "all" | "favorites" | "common" | "rare" | "legend";
export type DraftStrategy = "balanced" | "brawler" | "speed" | "weird";

export const SHOWROOM_STORAGE_KEYS = {
  vibe: "snack-surge-vibe",
  motion: "snack-surge-motion",
  favorites: "snack-surge-favorites",
  draftStrategy: "snack-surge-draft-strategy",
} as const;

export const VIBE_MODES: Record<
  VibeModeId,
  {
    label: string;
    shortLabel: string;
    accent: string;
    glow: string;
    wash: string;
    description: string;
  }
> = {
  arcade: {
    label: "Arcade Chrome",
    shortLabel: "Arcade",
    accent: "#f7f7f7",
    glow: "#7c3cff",
    wash: "from-[#120f2d] via-[#090910] to-[#130712]",
    description: "High-contrast cabinet lights, collectible foil, and midnight purple bloom.",
  },
  toxic: {
    label: "Toxic Lime",
    shortLabel: "Toxic",
    accent: "#bef264",
    glow: "#65ff9a",
    wash: "from-[#0d2014] via-[#080b08] to-[#1d1707]",
    description: "Radioactive cafeteria slime with acid-green scanlines and crunchy highlights.",
  },
  noir: {
    label: "Bone Noir",
    shortLabel: "Noir",
    accent: "#f4ead7",
    glow: "#d7b98f",
    wash: "from-[#201b16] via-[#090807] to-[#111111]",
    description: "Sepia horror-comic restraint for players who want the weird without the neon.",
  },
};

export const HERO_BEATS = [
  "Collect the cafeteria cryptids.",
  "Spin the dome. Draft the menace.",
  "Every card feels like contraband foil.",
  "A showroom for snack-fueled monsters.",
] as const;

export const DRAFT_STRATEGIES: Record<
  DraftStrategy,
  {
    label: string;
    shortLabel: string;
    description: string;
    signal: string;
  }
> = {
  balanced: {
    label: "Balanced tray",
    shortLabel: "Balance",
    description: "Prioritizes a resilient three-card spread with no obvious stat gap.",
    signal: "Stable lunch rush coverage",
  },
  brawler: {
    label: "Brawler rush",
    shortLabel: "Brawl",
    description: "Weights attack and HP for a frontline-heavy cafeteria breach.",
    signal: "High-impact opener ready",
  },
  speed: {
    label: "Speed line",
    shortLabel: "Speed",
    description: "Finds fast fighters that can pressure before the tray cools.",
    signal: "First move advantage online",
  },
  weird: {
    label: "Weird science",
    shortLabel: "Weird",
    description: "Maximizes oddity for players who want surprise effects and lore value.",
    signal: "Anomaly density rising",
  },
};

const DRAFT_WEIGHTS: Record<DraftStrategy, { hp: number; atk: number; spd: number; weird: number }> = {
  balanced: { hp: 0.25, atk: 0.25, spd: 0.25, weird: 0.25 },
  brawler: { hp: 0.28, atk: 0.4, spd: 0.12, weird: 0.2 },
  speed: { hp: 0.12, atk: 0.23, spd: 0.45, weird: 0.2 },
  weird: { hp: 0.12, atk: 0.16, spd: 0.22, weird: 0.5 },
};

const RARITY_BONUS: Record<"common" | "rare" | "legend", number> = {
  common: 0,
  rare: 4,
  legend: 8,
};

export function isVibeMode(value: string | null): value is VibeModeId {
  return value === "arcade" || value === "toxic" || value === "noir";
}

export function isMotionLevel(value: string | null): value is MotionLevel {
  return value === "calm" || value === "showtime";
}

export function isDraftStrategy(value: string | null): value is DraftStrategy {
  return value === "balanced" || value === "brawler" || value === "speed" || value === "weird";
}

export function normalizeFavorites(ids: readonly string[]) {
  const known = new Set(PLAYER_AVATARS.map((avatar) => avatar.id));
  return Array.from(new Set(ids.filter((id): id is PlayerAvatarId => known.has(id as PlayerAvatarId))));
}

export function toggleFavorite(favorites: readonly PlayerAvatarId[], id: PlayerAvatarId) {
  return favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id];
}

export function parseStoredFavorites(raw: string | null) {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? normalizeFavorites(value) : [];
  } catch {
    return [];
  }
}

export function filterFighters(
  fighters: readonly AvatarDef[],
  filter: FighterFilter,
  favorites: readonly PlayerAvatarId[],
) {
  if (filter === "all") return [...fighters];
  if (filter === "favorites") {
    return fighters.filter((fighter) => favorites.includes(fighter.id));
  }
  return fighters.filter((fighter) => FIGHTER_CARD_META[fighter.id].rarity === filter);
}

export function getRosterStats(fighters: readonly AvatarDef[] = PLAYER_AVATARS) {
  return fighters.reduce(
    (stats, fighter) => {
      const meta = FIGHTER_CARD_META[fighter.id];
      stats.total += 1;
      stats[meta.rarity] += 1;
      stats.averageWeird += meta.weird;
      if (meta.weird > stats.weirdestScore) {
        stats.weirdestScore = meta.weird;
        stats.weirdest = fighter;
      }
      return stats;
    },
    {
      total: 0,
      common: 0,
      rare: 0,
      legend: 0,
      averageWeird: 0,
      weirdestScore: 0,
      weirdest: fighters[0],
    },
  );
}

export function formatRosterStats(fighters: readonly AvatarDef[] = PLAYER_AVATARS) {
  const stats = getRosterStats(fighters);
  return {
    ...stats,
    averageWeird: stats.total ? Math.round(stats.averageWeird / stats.total) : 0,
  };
}

export function getDraftScore(fighter: AvatarDef, strategy: DraftStrategy) {
  const meta = FIGHTER_CARD_META[fighter.id];
  const weights = DRAFT_WEIGHTS[strategy];
  return Math.round(
    meta.hp * weights.hp +
      meta.atk * weights.atk +
      meta.spd * weights.spd +
      meta.weird * weights.weird +
      RARITY_BONUS[meta.rarity],
  );
}

export function suggestDraftLineup(
  fighters: readonly AvatarDef[],
  strategy: DraftStrategy,
  limit = 3,
) {
  return [...fighters]
    .sort((a, b) => {
      const scoreDelta = getDraftScore(b, strategy) - getDraftScore(a, strategy);
      if (scoreDelta !== 0) return scoreDelta;
      return FIGHTER_CARD_META[a.id].number.localeCompare(FIGHTER_CARD_META[b.id].number);
    })
    .slice(0, Math.max(0, limit));
}

export function getLineupStats(lineup: readonly AvatarDef[]) {
  const stats = lineup.reduce(
    (current, fighter) => {
      const meta = FIGHTER_CARD_META[fighter.id];
      current.hp += meta.hp;
      current.atk += meta.atk;
      current.spd += meta.spd;
      current.weird += meta.weird;
      current.score += meta.hp + meta.atk + meta.spd + meta.weird;
      return current;
    },
    { hp: 0, atk: 0, spd: 0, weird: 0, score: 0 },
  );

  return {
    ...stats,
    averageWeird: lineup.length ? Math.round(stats.weird / lineup.length) : 0,
    averageScore: lineup.length ? Math.round(stats.score / lineup.length) : 0,
  };
}

export function lineupShareText(lineup: readonly AvatarDef[], strategy: DraftStrategy) {
  if (lineup.length === 0) {
    return "Snack Surge draft: no fighters selected.";
  }

  const names = lineup.map((fighter) => fighter.label).join(", ");
  const stats = getLineupStats(lineup);
  return `Snack Surge ${DRAFT_STRATEGIES[strategy].label}: ${names}. Avg score ${stats.averageScore}, weird ${stats.averageWeird}.`;
}

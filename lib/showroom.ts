import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";

export type VibeModeId = "arcade" | "toxic" | "noir";
export type MotionLevel = "calm" | "showtime";
export type FighterFilter = "all" | "favorites" | "common" | "rare" | "legend";
export type StrategyModeId = "balanced" | "speedrun" | "bulwark" | "chaos";

export const SHOWROOM_STORAGE_KEYS = {
  vibe: "snack-surge-vibe",
  motion: "snack-surge-motion",
  favorites: "snack-surge-favorites",
  strategy: "snack-surge-strategy",
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

export const STRATEGY_MODES: Record<
  StrategyModeId,
  {
    label: string;
    shortLabel: string;
    accent: string;
    description: string;
    formula: string;
  }
> = {
  balanced: {
    label: "Balanced Tray",
    shortLabel: "Balance",
    accent: "#f8fafc",
    description: "A stable draft that keeps HP, attack, speed, and weirdness in play.",
    formula: "HP + ATK + SPD + WRD",
  },
  speedrun: {
    label: "Neon Speedrun",
    shortLabel: "Speed",
    accent: "#67e8f9",
    description: "Fast fighters and sharp attackers for sprinting through the lunch rush.",
    formula: "SPD x2 + ATK + WRD",
  },
  bulwark: {
    label: "Lunchline Bulwark",
    shortLabel: "Wall",
    accent: "#fde68a",
    description: "Heavy HP and reliable weirdness for holding the cafeteria line.",
    formula: "HP x2 + WRD + ATK",
  },
  chaos: {
    label: "Contraband Chaos",
    shortLabel: "Chaos",
    accent: "#f0abfc",
    description: "Maximum oddity, legend bias, and favorite energy for spectacle pulls.",
    formula: "WRD x2 + rarity + favorites",
  },
};

export function isVibeMode(value: string | null): value is VibeModeId {
  return value === "arcade" || value === "toxic" || value === "noir";
}

export function isMotionLevel(value: string | null): value is MotionLevel {
  return value === "calm" || value === "showtime";
}

export function isStrategyMode(value: string | null): value is StrategyModeId {
  return value === "balanced" || value === "speedrun" || value === "bulwark" || value === "chaos";
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

export function fighterStrategyScore(
  fighter: AvatarDef,
  strategy: StrategyModeId,
  favorites: readonly PlayerAvatarId[] = [],
) {
  const meta = FIGHTER_CARD_META[fighter.id];
  const rarityBoost = meta.rarity === "legend" ? 18 : meta.rarity === "rare" ? 8 : 0;
  const favoriteBoost = favorites.includes(fighter.id) ? 12 : 0;

  switch (strategy) {
    case "speedrun":
      return meta.spd * 2 + meta.atk + meta.weird * 0.55 + rarityBoost + favoriteBoost;
    case "bulwark":
      return meta.hp * 2 + meta.weird * 0.65 + meta.atk * 0.45 + rarityBoost + favoriteBoost;
    case "chaos":
      return meta.weird * 2 + rarityBoost * 1.5 + favoriteBoost * 1.5 + meta.spd * 0.35;
    case "balanced":
    default:
      return meta.hp + meta.atk + meta.spd + meta.weird + rarityBoost + favoriteBoost;
  }
}

export function recommendFightersForStrategy(
  fighters: readonly AvatarDef[] = PLAYER_AVATARS,
  strategy: StrategyModeId,
  favorites: readonly PlayerAvatarId[] = [],
  count = 3,
) {
  return [...fighters]
    .sort((a, b) => {
      const scoreDelta =
        fighterStrategyScore(b, strategy, favorites) - fighterStrategyScore(a, strategy, favorites);
      if (scoreDelta !== 0) return scoreDelta;
      return FIGHTER_CARD_META[a.id].number.localeCompare(FIGHTER_CARD_META[b.id].number);
    })
    .slice(0, Math.max(0, count));
}

export function buildCardSummary(fighter: AvatarDef) {
  const meta = FIGHTER_CARD_META[fighter.id];
  return `${fighter.label} #${meta.number} - ${fighter.tagline} (${meta.rarity.toUpperCase()})`;
}

export function buildLineupBrief(
  strategy: StrategyModeId,
  fighters: readonly AvatarDef[],
) {
  const mode = STRATEGY_MODES[strategy];
  const lineup = fighters.map((fighter) => buildCardSummary(fighter)).join(" / ");
  return `Snack Surge ${mode.label}: ${lineup}`;
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

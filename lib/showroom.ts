import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";

export type VibeModeId = "arcade" | "toxic" | "noir";
export type MotionLevel = "calm" | "showtime";
export type FighterFilter = "all" | "favorites" | "common" | "rare" | "legend";
export type FighterSort = "number" | "rarity" | "weird" | "attack" | "speed";

export const SHOWROOM_STORAGE_KEYS = {
  vibe: "snack-surge-vibe",
  motion: "snack-surge-motion",
  favorites: "snack-surge-favorites",
  recent: "snack-surge-recent",
} as const;

const RARITY_WEIGHT: Record<"common" | "rare" | "legend", number> = {
  common: 1,
  rare: 2,
  legend: 3,
};

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

export const SCOUT_TRANSMISSIONS = [
  "Search by fighter, snack, rarity, or stat type.",
  "Favorite a pull to build your personal binder.",
  "Use arrows to cycle the deck and F to star the active card.",
  "Copy a card summary when you find a showroom-worthy menace.",
] as const;

export function isVibeMode(value: string | null): value is VibeModeId {
  return value === "arcade" || value === "toxic" || value === "noir";
}

export function isMotionLevel(value: string | null): value is MotionLevel {
  return value === "calm" || value === "showtime";
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

export function normalizeSearchQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
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

export function searchFighters(fighters: readonly AvatarDef[], query: string) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return [...fighters];

  return fighters.filter((fighter) => {
    const meta = FIGHTER_CARD_META[fighter.id];
    const haystack = [
      fighter.label,
      fighter.tagline,
      meta.type,
      meta.rarity,
      meta.flavor,
      meta.number,
      String(meta.hp),
      String(meta.atk),
      String(meta.spd),
      String(meta.weird),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function sortFighters(fighters: readonly AvatarDef[], sort: FighterSort) {
  return [...fighters].sort((a, b) => {
    const aMeta = FIGHTER_CARD_META[a.id];
    const bMeta = FIGHTER_CARD_META[b.id];

    if (sort === "rarity") {
      return RARITY_WEIGHT[bMeta.rarity] - RARITY_WEIGHT[aMeta.rarity] || aMeta.number.localeCompare(bMeta.number);
    }
    if (sort === "weird") return bMeta.weird - aMeta.weird || aMeta.number.localeCompare(bMeta.number);
    if (sort === "attack") return bMeta.atk - aMeta.atk || aMeta.number.localeCompare(bMeta.number);
    if (sort === "speed") return bMeta.spd - aMeta.spd || aMeta.number.localeCompare(bMeta.number);
    return aMeta.number.localeCompare(bMeta.number);
  });
}

export function browseFighters({
  fighters,
  filter,
  favorites,
  query,
  sort,
}: {
  fighters: readonly AvatarDef[];
  filter: FighterFilter;
  favorites: readonly PlayerAvatarId[];
  query: string;
  sort: FighterSort;
}) {
  return sortFighters(searchFighters(filterFighters(fighters, filter, favorites), query), sort);
}

export function getFavoriteProgress(favorites: readonly string[], total = PLAYER_AVATARS.length) {
  const collected = normalizeFavorites(favorites).length;
  return {
    collected,
    total,
    percent: total > 0 ? Math.round((collected / total) * 100) : 0,
  };
}

export function parseStoredRecent(raw: string | null) {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? normalizeFavorites(value).slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function updateRecentFighters(recent: readonly PlayerAvatarId[], id: PlayerAvatarId, limit = 5) {
  return [id, ...recent.filter((recentId) => recentId !== id)].slice(0, Math.max(1, limit));
}

export function formatCardShareSummary(fighter: AvatarDef) {
  const meta = FIGHTER_CARD_META[fighter.id];
  return `${fighter.label} #${meta.number} - ${fighter.tagline} (${meta.rarity.toUpperCase()} · HP ${meta.hp} · ATK ${meta.atk} · SPD ${meta.spd} · WRD ${meta.weird})`;
}

export function getRarityOdds(fighters: readonly AvatarDef[] = PLAYER_AVATARS) {
  const stats = getRosterStats(fighters);
  const safeTotal = Math.max(1, stats.total);

  return (["legend", "rare", "common"] as const).map((rarity) => ({
    rarity,
    count: stats[rarity],
    percent: Math.round((stats[rarity] / safeTotal) * 100),
  }));
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

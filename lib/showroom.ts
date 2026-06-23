import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";

export type VibeModeId = "arcade" | "toxic" | "noir";
export type MotionLevel = "calm" | "showtime";
export type FighterFilter = "all" | "favorites" | "common" | "rare" | "legend";
export type ShowroomSectionId = "brief" | "recipe" | "globe" | "glass" | "cards";

export const SHOWROOM_STORAGE_KEYS = {
  vibe: "snack-surge-vibe",
  motion: "snack-surge-motion",
  favorites: "snack-surge-favorites",
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

const SECTION_LABELS: Record<ShowroomSectionId, string> = {
  brief: "Brief",
  recipe: "Recipe",
  globe: "Dome",
  glass: "Glass",
  cards: "Cards",
};

export const SHOWROOM_SECTIONS = (Object.keys(SECTION_LABELS) as ShowroomSectionId[]).map((id) => ({
  id,
  label: SECTION_LABELS[id],
  href: `#${id}`,
}));

export function isVibeMode(value: string | null): value is VibeModeId {
  return value === "arcade" || value === "toxic" || value === "noir";
}

export function isMotionLevel(value: string | null): value is MotionLevel {
  return value === "calm" || value === "showtime";
}

export function isFighterFilter(value: string | null): value is FighterFilter {
  return value === "all" || value === "favorites" || value === "common" || value === "rare" || value === "legend";
}

export function isPlayerAvatarId(value: string | null): value is PlayerAvatarId {
  return Boolean(value && PLAYER_AVATARS.some((avatar) => avatar.id === value));
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

export function createCardSummary(avatar: AvatarDef) {
  const meta = FIGHTER_CARD_META[avatar.id];
  return `${avatar.label} #${meta.number} - ${avatar.tagline} (${meta.rarity.toUpperCase()} / WRD ${meta.weird})`;
}

export function buildThreatBriefings(avatar: AvatarDef) {
  const meta = FIGHTER_CARD_META[avatar.id];
  return [
    {
      label: "First bite",
      title: `${avatar.label} enters through the tray line`,
      body: `${meta.type} pressure with ${meta.hp} HP and a ${meta.rarity} pull rate.`,
    },
    {
      label: "Counter play",
      title: `Exploit the ${meta.spd >= meta.atk ? "speed burst" : "attack windup"}`,
      body: `ATK ${meta.atk}, SPD ${meta.spd}, WRD ${meta.weird}. Keep the spotlight on readable stats before the jump scare lands.`,
    },
    {
      label: "Foil tell",
      title: meta.flavor,
      body: `Signature line: ${avatar.tagline}. Favorite it, copy it, or share the exact cabinet state.`,
    },
  ] as const;
}

export function parseShowroomSearch(search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return {
    vibe: isVibeMode(params.get("vibe")) ? params.get("vibe")! : undefined,
    motion: isMotionLevel(params.get("motion")) ? params.get("motion")! : undefined,
    filter: isFighterFilter(params.get("filter")) ? params.get("filter")! : undefined,
    fighter: isPlayerAvatarId(params.get("fighter")) ? params.get("fighter")! : undefined,
  };
}

export function updateShowroomSearch(
  currentSearch: string,
  state: {
    vibe: VibeModeId;
    motion: MotionLevel;
    filter: FighterFilter;
    fighter: PlayerAvatarId;
  },
) {
  const params = new URLSearchParams(currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch);
  params.set("vibe", state.vibe);
  params.set("motion", state.motion);
  params.set("filter", state.filter);
  params.set("fighter", state.fighter);
  return `?${params.toString()}`;
}

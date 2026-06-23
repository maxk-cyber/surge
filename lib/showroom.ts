import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { PLAYER_AVATARS, type AvatarDef, type PlayerAvatarId } from "@/lib/avatars";

export type VibeModeId = "arcade" | "toxic" | "noir";
export type MotionLevel = "calm" | "showtime";
export type FighterFilter = "all" | "favorites" | "common" | "rare" | "legend";
export type SquadSummary = {
  count: number;
  completion: number;
  totalHp: number;
  totalAtk: number;
  totalSpd: number;
  totalWeird: number;
  averageWeird: number;
  rarityMix: Record<"common" | "rare" | "legend", number>;
  signature: string;
  label: string;
};

export const MAX_SQUAD_SIZE = 3;

export const SHOWROOM_STORAGE_KEYS = {
  vibe: "snack-surge-vibe",
  motion: "snack-surge-motion",
  favorites: "snack-surge-favorites",
  squad: "snack-surge-squad",
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

export function normalizeSquad(ids: readonly string[], maxSize = MAX_SQUAD_SIZE) {
  return normalizeFavorites(ids).slice(0, Math.max(0, maxSize));
}

export function toggleFavorite(favorites: readonly PlayerAvatarId[], id: PlayerAvatarId) {
  return favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id];
}

export function toggleSquadMember(
  squad: readonly PlayerAvatarId[],
  id: PlayerAvatarId,
  maxSize = MAX_SQUAD_SIZE,
) {
  const normalized = normalizeSquad(squad, maxSize);
  if (normalized.includes(id)) return normalized.filter((member) => member !== id);
  if (normalized.length < maxSize) return [...normalized, id];
  return [...normalized.slice(1), id];
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

export function parseStoredSquad(raw: string | null) {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? normalizeSquad(value) : [];
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

export function summarizeSquad(ids: readonly PlayerAvatarId[]): SquadSummary {
  const members = normalizeSquad(ids)
    .map((id) => PLAYER_AVATARS.find((fighter) => fighter.id === id))
    .filter((fighter): fighter is AvatarDef => Boolean(fighter));
  const totals = members.reduce(
    (summary, fighter) => {
      const meta = FIGHTER_CARD_META[fighter.id];
      summary.totalHp += meta.hp;
      summary.totalAtk += meta.atk;
      summary.totalSpd += meta.spd;
      summary.totalWeird += meta.weird;
      summary.rarityMix[meta.rarity] += 1;
      return summary;
    },
    {
      totalHp: 0,
      totalAtk: 0,
      totalSpd: 0,
      totalWeird: 0,
      rarityMix: { common: 0, rare: 0, legend: 0 },
    },
  );
  const averageWeird = members.length ? Math.round(totals.totalWeird / members.length) : 0;
  const signature =
    totals.rarityMix.legend > 0 && averageWeird >= 92
      ? "Mythic Lunch Rush"
      : totals.totalSpd >= totals.totalHp
        ? "Speed Tray"
        : totals.totalAtk >= totals.totalWeird
          ? "Brawl Combo"
          : "Haunted Combo";

  return {
    count: members.length,
    completion: Math.round((members.length / MAX_SQUAD_SIZE) * 100),
    averageWeird,
    signature,
    label: members.length ? members.map((member) => member.label).join(" + ") : "Empty tray",
    ...totals,
  };
}

export function buildSquadShareText(ids: readonly PlayerAvatarId[]) {
  const members = normalizeSquad(ids)
    .map((id) => PLAYER_AVATARS.find((fighter) => fighter.id === id))
    .filter((fighter): fighter is AvatarDef => Boolean(fighter));
  if (members.length === 0) return "Snack Surge squad: Empty tray";
  const summary = summarizeSquad(members.map((member) => member.id));
  return `Snack Surge squad: ${summary.label} — ${summary.signature}, ${summary.averageWeird} WRD avg`;
}

import { PLAYER_AVATARS, type AvatarDef } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";

export type PackVibeId = "haunt" | "crunch" | "overdrive";

export const PACK_SIZE = 5;

export const PACK_STORAGE_KEY = "snack-surge-pack-vibe";

export const PACK_VIBES: Record<
  PackVibeId,
  {
    label: string;
    shortLabel: string;
    accent: string;
    description: string;
  }
> = {
  haunt: {
    label: "Haunt foil",
    shortLabel: "Haunt",
    accent: "#f4ead7",
    description: "Biases toward weird, cursed pulls with a dramatic final reveal.",
  },
  crunch: {
    label: "Crunch pack",
    shortLabel: "Crunch",
    accent: "#bef264",
    description: "Prioritizes heavy attack and HP for lunch-table brawlers.",
  },
  overdrive: {
    label: "Overdrive sleeve",
    shortLabel: "Drive",
    accent: "#91f4ff",
    description: "Surfaces fast, reactive fighters for momentum-first drafts.",
  },
};

const RARITY_RANK = {
  common: 1,
  rare: 2,
  legend: 3,
} as const;

function hashString(value: string) {
  return [...value].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 11), 0);
}

function packScore(fighter: AvatarDef, vibe: PackVibeId, seed: number) {
  const meta = FIGHTER_CARD_META[fighter.id];
  const rarityBoost = RARITY_RANK[meta.rarity] * 24;
  const jitter = hashString(`${fighter.id}:${vibe}:${seed}`) % 31;

  if (vibe === "crunch") {
    return meta.atk * 1.05 + meta.hp * 0.75 + meta.weird * 0.22 + rarityBoost + jitter;
  }

  if (vibe === "overdrive") {
    return meta.spd * 1.22 + meta.atk * 0.42 + meta.weird * 0.18 + rarityBoost + jitter;
  }

  return meta.weird * 1.24 + meta.hp * 0.28 + meta.atk * 0.18 + rarityBoost + jitter;
}

export function isPackVibe(value: string | null): value is PackVibeId {
  return value === "haunt" || value === "crunch" || value === "overdrive";
}

export function makePackLineup(
  fighters: readonly AvatarDef[] = PLAYER_AVATARS,
  vibe: PackVibeId = "haunt",
  seed = 0,
) {
  if (fighters.length === 0) return [];

  const ranked = fighters
    .map((fighter) => ({ fighter, score: packScore(fighter, vibe, seed) }))
    .sort((a, b) => b.score - a.score || a.fighter.label.localeCompare(b.fighter.label));

  const offset = Math.abs(seed) % ranked.length;
  const rotated = [...ranked.slice(offset), ...ranked.slice(0, offset)];
  const spotlight =
    rotated.find(({ fighter }) => FIGHTER_CARD_META[fighter.id].rarity !== "common")?.fighter ??
    rotated[0]!.fighter;
  const lineup = rotated
    .map(({ fighter }) => fighter)
    .filter((fighter) => fighter.id !== spotlight.id)
    .slice(0, Math.max(0, Math.min(PACK_SIZE, fighters.length) - 1));

  return [...lineup, spotlight].slice(0, PACK_SIZE);
}

export function getPackSpotlight(lineup: readonly AvatarDef[]) {
  return lineup.reduce<AvatarDef | undefined>((best, fighter) => {
    if (!best) return fighter;
    const currentMeta = FIGHTER_CARD_META[fighter.id];
    const bestMeta = FIGHTER_CARD_META[best.id];
    const rarityDelta = RARITY_RANK[currentMeta.rarity] - RARITY_RANK[bestMeta.rarity];
    if (rarityDelta > 0) return fighter;
    if (rarityDelta === 0 && currentMeta.weird > bestMeta.weird) return fighter;
    return best;
  }, undefined);
}

export function getRevealProgress(revealedCount: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((Math.min(Math.max(revealedCount, 0), total) / total) * 100);
}

export function formatPackShare(lineup: readonly AvatarDef[]) {
  return lineup
    .map((fighter, index) => {
      const meta = FIGHTER_CARD_META[fighter.id];
      return `${index + 1}. ${fighter.label} #${meta.number} (${meta.rarity.toUpperCase()})`;
    })
    .join("\n");
}

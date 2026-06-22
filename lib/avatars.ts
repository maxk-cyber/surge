export type PlayerAvatarId =
  | "skullmic"
  | "skullbunny"
  | "gaperskull"
  | "wormface"
  | "sporkfiend"
  | "slurpghoul"
  | "nachomancer"
  | "burgerlich"
  | "frywraith"
  | "milkspecter"
  | "pizzoid"
  | "sodasnarl"
  | "donutcreep"
  | "hotdogwraith"
  | "jellophant"
  | "poptartgeist"
  | "cornfiend"
  | "ramenlich"
  | "pretzelwraith"
  | "wafflegeist";

export type EnemyKind = "swarmer" | "tank" | "ranged";

export interface AvatarDef {
  id: PlayerAvatarId;
  label: string;
  tagline: string;
  ring: string;
  bg: string;
}

export const PLAYER_AVATARS: AvatarDef[] = [
  { id: "skullmic", label: "Skull Mickey", tagline: "Ear-resistible menace", ring: "#f5f5f5", bg: "#0a0a0a" },
  { id: "skullbunny", label: "Skull Bunny", tagline: "Hop-scare specialist", ring: "#ececec", bg: "#0a0a0a" },
  { id: "gaperskull", label: "Gaper Skull", tagline: "Unhinged stare", ring: "#e0e0e0", bg: "#0a0a0a" },
  { id: "wormface", label: "Worm Face", tagline: "Wriggle & ruin", ring: "#d8d8d8", bg: "#0a0a0a" },
  { id: "sporkfiend", label: "Spork Fiend", tagline: "Utensil of doom", ring: "#f0f0f0", bg: "#0a0a0a" },
  { id: "slurpghoul", label: "Slurp Ghoul", tagline: "Last sip, first fright", ring: "#ebebeb", bg: "#0a0a0a" },
  { id: "nachomancer", label: "Nachomancer", tagline: "Triangle summoner", ring: "#e8e8e8", bg: "#0a0a0a" },
  { id: "burgerlich", label: "Burger Lich", tagline: "Sesame-seed sovereign", ring: "#dedede", bg: "#0a0a0a" },
  { id: "frywraith", label: "Fry Wraith", tagline: "Crisp and cursed", ring: "#d4d4d4", bg: "#0a0a0a" },
  { id: "milkspecter", label: "Milk Specter", tagline: "Expired since 1998", ring: "#f2f2f2", bg: "#0a0a0a" },
  { id: "pizzoid", label: "Pizzoid", tagline: "Slice of the abyss", ring: "#e6e6e6", bg: "#0a0a0a" },
  { id: "sodasnarl", label: "Soda Snarl", tagline: "Carbonated carnage", ring: "#dcdcdc", bg: "#0a0a0a" },
  { id: "donutcreep", label: "Donut Creep", tagline: "Sprinkles of doom", ring: "#e4e4e4", bg: "#0a0a0a" },
  { id: "hotdogwraith", label: "Hotdog Wraith", tagline: "Condiment curse", ring: "#d0d0d0", bg: "#0a0a0a" },
  { id: "jellophant", label: "Jello Phantom", tagline: "Wobbles without mercy", ring: "#f0f0f0", bg: "#0a0a0a" },
  { id: "poptartgeist", label: "Pop-Tart Geist", tagline: "Toaster-oven terror", ring: "#d8d8d8", bg: "#0a0a0a" },
  { id: "cornfiend", label: "Corn Fiend", tagline: "Kernel of darkness", ring: "#e2e2e2", bg: "#0a0a0a" },
  { id: "ramenlich", label: "Ramen Lich", tagline: "Broth of the damned", ring: "#d6d6d6", bg: "#0a0a0a" },
  { id: "pretzelwraith", label: "Pretzel Wraith", tagline: "Salted fate", ring: "#ececec", bg: "#0a0a0a" },
  { id: "wafflegeist", label: "Waffle Geist", tagline: "Grid-pattern grave", ring: "#dedede", bg: "#0a0a0a" },
];

export const ENEMY_AVATARS: Record<
  EnemyKind,
  { label: string; emoji: string; color: string; desc: string }
> = {
  swarmer: { label: "Crawl Head", emoji: "💀", color: "#a3a3a3", desc: "Skittering skull pest" },
  tank: { label: "Block Skull", emoji: "☠️", color: "#737373", desc: "Heavy bone brute" },
  ranged: { label: "Spit Skull", emoji: "👁", color: "#525252", desc: "Ocular spit freak" },
};

const STORAGE_KEY = "snack-surge-avatar";

const LEGACY_AVATAR_MAP: Record<string, PlayerAvatarId> = {
  chef: "skullmic",
  hotdog: "skullbunny",
  taco: "nachomancer",
  spork: "sporkfiend",
  cuphead: "skullbunny",
  mugman: "gaperskull",
  chalice: "milkspecter",
};

export function getStoredAvatarId(): PlayerAvatarId {
  if (typeof window === "undefined") return "skullmic";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && PLAYER_AVATARS.some((a) => a.id === stored)) {
    return stored as PlayerAvatarId;
  }
  if (stored && LEGACY_AVATAR_MAP[stored]) {
    const migrated = LEGACY_AVATAR_MAP[stored];
    setStoredAvatarId(migrated);
    return migrated;
  }
  return "skullmic";
}

export function setStoredAvatarId(id: PlayerAvatarId) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
}

export function getAvatarDef(id: string): AvatarDef {
  const mapped = LEGACY_AVATAR_MAP[id] ?? id;
  return PLAYER_AVATARS.find((a) => a.id === mapped) ?? PLAYER_AVATARS[0];
}

export function avatarForName(name: string): AvatarDef {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PLAYER_AVATARS[hash % PLAYER_AVATARS.length];
}

export function playerTextureKey(id: PlayerAvatarId) {
  return `avatar-${id}`;
}

export function enemyTextureKey(kind: EnemyKind) {
  return `enemy-${kind}`;
}

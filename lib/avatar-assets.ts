import type { EnemyKind, PlayerAvatarId } from "@/lib/avatars";
import { PLAYER_AVATARS } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";

export function playerPortraitSrc(id: PlayerAvatarId) {
  return PLAYER_PORTRAIT_CACHE[id] ?? playerPortraitSvg(id);
}

export function enemyPortraitSrc(kind: EnemyKind) {
  return ENEMY_PORTRAIT_CACHE[kind] ?? enemyPortraitSvg(kind);
}

const RARITY_TONES = {
  common: ["#d8dde8", "#707888", "#f7f7ff"],
  rare: ["#91f4ff", "#7c3cff", "#ffffff"],
  legend: ["#ffd166", "#ff4fd8", "#ffffff"],
} as const;

const ENEMY_TONES: Record<EnemyKind, [string, string, string]> = {
  swarmer: ["#e5e7eb", "#52525b", "#ffffff"],
  tank: ["#d6d3d1", "#292524", "#fafaf9"],
  ranged: ["#c4b5fd", "#312e81", "#ffffff"],
};

const PLAYER_PORTRAIT_CACHE = {} as Partial<Record<PlayerAvatarId, string>>;
const ENEMY_PORTRAIT_CACHE = {} as Partial<Record<EnemyKind, string>>;

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });
}

function dataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function hashString(value: string) {
  return [...value].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 7), 0);
}

function initials(label: string) {
  return label
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function playerPortraitSvg(id: PlayerAvatarId) {
  const avatar = PLAYER_AVATARS.find((item) => item.id === id) ?? PLAYER_AVATARS[0]!;
  const meta = FIGHTER_CARD_META[avatar.id];
  const [core, shadow, highlight] = RARITY_TONES[meta.rarity];
  const seed = hashString(avatar.id);
  const eyeOffset = seed % 9;
  const mouthWidth = 26 + (seed % 18);
  const hornTilt = (seed % 16) - 8;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420" role="img" aria-label="${escapeXml(avatar.label)} portrait">
  <defs>
    <radialGradient id="bg-${avatar.id}" cx="50%" cy="24%" r="78%">
      <stop offset="0%" stop-color="${highlight}" stop-opacity="0.32"/>
      <stop offset="42%" stop-color="${shadow}" stop-opacity="0.58"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
    <linearGradient id="foil-${avatar.id}" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${core}"/>
      <stop offset="48%" stop-color="${highlight}"/>
      <stop offset="100%" stop-color="${shadow}"/>
    </linearGradient>
    <filter id="soft-${avatar.id}" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity="0.72"/>
    </filter>
  </defs>
  <rect width="320" height="420" rx="34" fill="#050505"/>
  <rect x="10" y="10" width="300" height="400" rx="28" fill="url(#bg-${avatar.id})" stroke="${core}" stroke-opacity="0.38" stroke-width="2"/>
  <g opacity="0.18">
    <path d="M36 76H284M36 132H284M36 188H284M36 244H284M36 300H284M36 356H284" stroke="#fff"/>
    <path d="M72 38V382M128 38V382M184 38V382M240 38V382" stroke="#fff"/>
  </g>
  <g filter="url(#soft-${avatar.id})">
    <path d="M96 ${132 + hornTilt} C86 88 112 62 142 98" fill="none" stroke="#0b0b0b" stroke-width="28" stroke-linecap="round"/>
    <path d="M224 ${132 - hornTilt} C234 88 208 62 178 98" fill="none" stroke="#0b0b0b" stroke-width="28" stroke-linecap="round"/>
    <path d="M96 ${132 + hornTilt} C86 88 112 62 142 98" fill="none" stroke="url(#foil-${avatar.id})" stroke-width="16" stroke-linecap="round"/>
    <path d="M224 ${132 - hornTilt} C234 88 208 62 178 98" fill="none" stroke="url(#foil-${avatar.id})" stroke-width="16" stroke-linecap="round"/>
    <path d="M82 166 C82 105 238 105 238 166 V238 C238 294 203 330 160 330 C117 330 82 294 82 238 Z" fill="#f1efe7" stroke="#0b0b0b" stroke-width="12"/>
    <path d="M107 166 C126 138 194 138 213 166 C194 154 126 154 107 166Z" fill="${core}" opacity="0.34"/>
    <ellipse cx="${128 - eyeOffset}" cy="202" rx="28" ry="34" fill="#090909"/>
    <ellipse cx="${192 + eyeOffset}" cy="202" rx="28" ry="34" fill="#090909"/>
    <circle cx="${137 - eyeOffset}" cy="193" r="7" fill="${highlight}"/>
    <circle cx="${183 + eyeOffset}" cy="193" r="7" fill="${highlight}"/>
    <path d="M160 226 L146 252 H174 Z" fill="#101010"/>
    <path d="M${160 - mouthWidth / 2} 280 C142 300 178 300 ${160 + mouthWidth / 2} 280" fill="none" stroke="#101010" stroke-width="12" stroke-linecap="round"/>
    <path d="M120 282 V304M145 286 V312M175 286 V312M200 282 V304" stroke="#101010" stroke-width="6" stroke-linecap="round"/>
  </g>
  <rect x="28" y="336" width="264" height="48" rx="16" fill="#050505" fill-opacity="0.72" stroke="#fff" stroke-opacity="0.12"/>
  <text x="160" y="360" text-anchor="middle" fill="#fff" font-family="monospace" font-size="18" font-weight="700" letter-spacing="2">${escapeXml(initials(avatar.label))}</text>
  <text x="160" y="378" text-anchor="middle" fill="${core}" font-family="monospace" font-size="10" letter-spacing="3">${escapeXml(meta.type)}</text>
</svg>`;
  const uri = dataUri(svg);
  PLAYER_PORTRAIT_CACHE[id] = uri;
  return uri;
}

function enemyPortraitSvg(kind: EnemyKind) {
  const [core, shadow, highlight] = ENEMY_TONES[kind];
  const label = kind.toUpperCase();
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420" role="img" aria-label="${label} enemy portrait">
  <defs>
    <radialGradient id="enemy-${kind}" cx="50%" cy="30%" r="72%">
      <stop offset="0%" stop-color="${highlight}" stop-opacity="0.28"/>
      <stop offset="54%" stop-color="${shadow}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
  </defs>
  <rect width="320" height="420" rx="34" fill="#050505"/>
  <rect x="10" y="10" width="300" height="400" rx="28" fill="url(#enemy-${kind})" stroke="${core}" stroke-opacity="0.42" stroke-width="2"/>
  <path d="M92 176 C92 112 228 112 228 176 V246 C228 304 194 334 160 334 C126 334 92 304 92 246 Z" fill="#e7e5df" stroke="#080808" stroke-width="12"/>
  <circle cx="130" cy="204" r="30" fill="#080808"/>
  <circle cx="190" cy="204" r="30" fill="#080808"/>
  <path d="M160 230 L142 264 H178 Z" fill="#080808"/>
  <path d="M112 286 H208" stroke="#080808" stroke-width="12" stroke-linecap="round"/>
  <text x="160" y="372" text-anchor="middle" fill="${core}" font-family="monospace" font-size="14" font-weight="700" letter-spacing="4">${label}</text>
</svg>`;
  const uri = dataUri(svg);
  ENEMY_PORTRAIT_CACHE[kind] = uri;
  return uri;
}

import { ENEMY_AVATARS, PLAYER_AVATARS, type EnemyKind, type PlayerAvatarId } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";

const AVATAR_LABELS = Object.fromEntries(PLAYER_AVATARS.map((avatar) => [avatar.id, avatar.label])) as Record<
  PlayerAvatarId,
  string
>;

const RARITY_TONES = {
  common: ["#d7d7d7", "#707070", "#141414"],
  rare: ["#93f5ff", "#9b8cff", "#080b17"],
  legend: ["#ffe58f", "#ff6ec7", "#120711"],
} as const;

const ENEMY_TONES = {
  swarmer: ["#f6f1e8", "#9ca3af", "#090909"],
  tank: ["#d1d5db", "#6b7280", "#080808"],
  ranged: ["#fafafa", "#a78bfa", "#080712"],
} as const;

function hashId(value: string) {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973, 17);
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function svgDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function playerSvg(id: PlayerAvatarId) {
  const meta = FIGHTER_CARD_META[id];
  const label = AVATAR_LABELS[id];
  const hash = hashId(id);
  const [bone, glow, back] = RARITY_TONES[meta.rarity];
  const eyeShift = (hash % 9) - 4;
  const mouth = meta.weird > 93 ? "M76 124 Q96 145 116 124" : "M78 126 Q96 135 114 126";
  const spikes = Array.from({ length: 8 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 8 + (hash % 5) * 0.08;
    const inner = 50 + (hash % 8);
    const outer = 70 + ((hash + index * 7) % 18);
    const x1 = 96 + Math.cos(angle) * inner;
    const y1 = 92 + Math.sin(angle) * inner;
    const x2 = 96 + Math.cos(angle) * outer;
    const y2 = 92 + Math.sin(angle) * outer;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#050505" stroke-width="5" stroke-linecap="round"/><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${glow}" stroke-width="2" stroke-linecap="round" opacity=".82"/>`;
  }).join("");

  const symbol =
    id.includes("burger")
      ? `<ellipse cx="96" cy="52" rx="48" ry="15" fill="${bone}" stroke="#060606" stroke-width="4"/><circle cx="78" cy="49" r="3" fill="#fff"/><circle cx="96" cy="46" r="3" fill="#fff"/><circle cx="114" cy="49" r="3" fill="#fff"/>`
      : id.includes("bunny")
        ? `<ellipse cx="70" cy="44" rx="14" ry="34" fill="#080808" stroke="${bone}" stroke-width="4"/><ellipse cx="120" cy="46" rx="14" ry="34" fill="#080808" stroke="${bone}" stroke-width="4"/>`
        : id.includes("nacho") || id.includes("pizzo")
          ? `<polygon points="96,22 148,88 44,88" fill="${bone}" stroke="#050505" stroke-width="4" opacity=".94"/>`
          : id.includes("milk") || id.includes("soda")
            ? `<path d="M70 42 L82 28 H110 L122 42 V94 H70 Z" fill="${bone}" stroke="#050505" stroke-width="4" opacity=".95"/>`
            : `<circle cx="70" cy="54" r="${14 + (hash % 10)}" fill="#080808" stroke="${bone}" stroke-width="4"/><circle cx="122" cy="54" r="${14 + ((hash + 3) % 10)}" fill="#080808" stroke="${bone}" stroke-width="4"/>`;

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-label="${escapeXml(label)} portrait">
      <defs>
        <radialGradient id="stage" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stop-color="${glow}" stop-opacity=".58"/>
          <stop offset="48%" stop-color="${back}"/>
          <stop offset="100%" stop-color="#030303"/>
        </radialGradient>
        <linearGradient id="bone" x1="28%" y1="10%" x2="78%" y2="96%">
          <stop offset="0%" stop-color="#fff"/>
          <stop offset="48%" stop-color="${bone}"/>
          <stop offset="100%" stop-color="#8b8278"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".72"/>
        </filter>
      </defs>
      <rect width="192" height="192" rx="42" fill="url(#stage)"/>
      <path d="M12 148 C44 120 50 184 84 156 C118 128 128 184 180 140 V192 H12 Z" fill="#000" opacity=".35"/>
      <g opacity=".28">${spikes}</g>
      ${symbol}
      <g filter="url(#shadow)">
        <circle cx="96" cy="104" r="43" fill="#050505"/>
        <circle cx="96" cy="101" r="39" fill="url(#bone)" stroke="#050505" stroke-width="5"/>
        <ellipse cx="96" cy="118" rx="30" ry="18" fill="#81776d" opacity=".28"/>
        <circle cx="${82 + eyeShift * 0.25}" cy="96" r="13" fill="#050505"/>
        <circle cx="${111 - eyeShift * 0.25}" cy="96" r="13" fill="#050505"/>
        <circle cx="${86 + eyeShift * 0.25}" cy="94" r="4" fill="#fff" opacity=".86"/>
        <circle cx="${107 - eyeShift * 0.25}" cy="94" r="4" fill="#fff" opacity=".86"/>
        <ellipse cx="96" cy="112" rx="5" ry="3.5" fill="#050505"/>
        <path d="${mouth}" fill="none" stroke="#050505" stroke-width="5" stroke-linecap="round"/>
        <path d="M78 131 H114" stroke="#fff8e9" stroke-width="3" stroke-linecap="round" opacity=".86"/>
      </g>
      <rect x="18" y="18" width="156" height="156" rx="34" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
      <text x="96" y="170" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="#fff" fill-opacity=".86">${escapeXml(meta.rarity.toUpperCase())} #${meta.number}</text>
    </svg>
  `);
}

function enemySvg(kind: EnemyKind) {
  const enemy = ENEMY_AVATARS[kind];
  const [bone, glow, back] = ENEMY_TONES[kind];

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-label="${escapeXml(enemy.label)} portrait">
      <defs>
        <radialGradient id="enemy-stage" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stop-color="${glow}" stop-opacity=".65"/>
          <stop offset="60%" stop-color="${back}"/>
          <stop offset="100%" stop-color="#020202"/>
        </radialGradient>
      </defs>
      <rect width="192" height="192" rx="42" fill="url(#enemy-stage)"/>
      <circle cx="96" cy="96" r="${kind === "tank" ? 54 : 42}" fill="#050505"/>
      <circle cx="96" cy="94" r="${kind === "tank" ? 48 : 36}" fill="${bone}" stroke="#050505" stroke-width="6"/>
      <circle cx="78" cy="88" r="12" fill="#050505"/>
      <circle cx="114" cy="88" r="12" fill="#050505"/>
      <path d="M76 116 Q96 132 116 116" fill="none" stroke="#050505" stroke-width="6" stroke-linecap="round"/>
      <text x="96" y="164" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" letter-spacing="1.8" fill="#fff" fill-opacity=".88">${escapeXml(enemy.label.toUpperCase())}</text>
    </svg>
  `);
}

const PLAYER_SOURCES = Object.fromEntries(PLAYER_AVATARS.map((avatar) => [avatar.id, playerSvg(avatar.id)])) as Record<
  PlayerAvatarId,
  string
>;

const ENEMY_SOURCES = {
  swarmer: enemySvg("swarmer"),
  tank: enemySvg("tank"),
  ranged: enemySvg("ranged"),
} as const satisfies Record<EnemyKind, string>;

export function playerPortraitSrc(id: PlayerAvatarId) {
  return PLAYER_SOURCES[id] ?? PLAYER_SOURCES.skullmic;
}

export function enemyPortraitSrc(kind: EnemyKind) {
  return ENEMY_SOURCES[kind];
}

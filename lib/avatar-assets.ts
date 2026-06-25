import type { EnemyKind, PlayerAvatarId } from "@/lib/avatars";

const PLAYER_ART: Record<PlayerAvatarId, { label: string; fg: string; bg: string; glow: string; mark: string }> = {
  skullmic: { label: "SM", fg: "#f8fafc", bg: "#20133f", glow: "#a78bfa", mark: "ears" },
  skullbunny: { label: "SB", fg: "#fff7ed", bg: "#302036", glow: "#fb7185", mark: "ears" },
  gaperskull: { label: "GS", fg: "#ecfeff", bg: "#102a43", glow: "#22d3ee", mark: "jaw" },
  wormface: { label: "WF", fg: "#f7fee7", bg: "#17301b", glow: "#84cc16", mark: "worms" },
  sporkfiend: { label: "SP", fg: "#f8fafc", bg: "#1f2937", glow: "#cbd5e1", mark: "spork" },
  slurpghoul: { label: "SG", fg: "#eff6ff", bg: "#12243f", glow: "#60a5fa", mark: "sip" },
  nachomancer: { label: "NM", fg: "#fff7ed", bg: "#3f230d", glow: "#f59e0b", mark: "tri" },
  burgerlich: { label: "BL", fg: "#fffbeb", bg: "#3a2213", glow: "#fbbf24", mark: "crown" },
  frywraith: { label: "FW", fg: "#fff7ed", bg: "#332111", glow: "#fb923c", mark: "flame" },
  milkspecter: { label: "MS", fg: "#f8fafc", bg: "#20242f", glow: "#e5e7eb", mark: "drop" },
  pizzoid: { label: "PZ", fg: "#fff7ed", bg: "#361617", glow: "#ef4444", mark: "tri" },
  sodasnarl: { label: "SS", fg: "#ecfeff", bg: "#122b2f", glow: "#2dd4bf", mark: "sip" },
  donutcreep: { label: "DC", fg: "#fdf2f8", bg: "#3b1730", glow: "#f472b6", mark: "ring" },
  hotdogwraith: { label: "HW", fg: "#fff7ed", bg: "#3b2415", glow: "#f97316", mark: "flame" },
  jellophant: { label: "JP", fg: "#f5f3ff", bg: "#261b44", glow: "#c084fc", mark: "drop" },
  poptartgeist: { label: "PG", fg: "#fff1f2", bg: "#3f1d2d", glow: "#fb7185", mark: "spark" },
  cornfiend: { label: "CF", fg: "#fefce8", bg: "#302e12", glow: "#facc15", mark: "kernel" },
  ramenlich: { label: "RL", fg: "#fff7ed", bg: "#33200f", glow: "#f97316", mark: "steam" },
  pretzelwraith: { label: "PW", fg: "#fef3c7", bg: "#2d1b12", glow: "#d97706", mark: "twist" },
  wafflegeist: { label: "WG", fg: "#fffbeb", bg: "#2a2113", glow: "#f59e0b", mark: "grid" },
};

const ENEMY_ART: Record<EnemyKind, { label: string; fg: string; bg: string; glow: string }> = {
  swarmer: { label: "CR", fg: "#f8fafc", bg: "#1f2937", glow: "#a3e635" },
  tank: { label: "BK", fg: "#f8fafc", bg: "#111827", glow: "#f97316" },
  ranged: { label: "SP", fg: "#f8fafc", bg: "#172554", glow: "#38bdf8" },
};

function encodeSvg(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function markPath(mark: string, glow: string) {
  const common = `fill="none" stroke="${glow}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity=".9"`;

  switch (mark) {
    case "ears":
      return `<path d="M72 100C46 44 76 20 112 74M184 74c36-54 66-30 40 26" ${common}/>`;
    case "jaw":
      return `<path d="M92 162c24 36 104 36 128 0M106 182h100" ${common}/>`;
    case "worms":
      return `<path d="M70 92c22-44 46 18 70-20s52 12 78-22" ${common}/>`;
    case "spork":
      return `<path d="M74 206 206 74M180 62l34 34M192 52l34 34M72 190l22 22" ${common}/>`;
    case "sip":
      return `<path d="M88 72h112l-16 140H104L88 72ZM104 48h96" ${common}/>`;
    case "tri":
      return `<path d="M144 52 224 204H64L144 52Z" ${common}/>`;
    case "crown":
      return `<path d="M64 104 96 66l48 50 48-50 32 38-18 88H82l-18-88Z" ${common}/>`;
    case "flame":
      return `<path d="M146 44c32 48-22 56 18 94 18-18 24-42 22-66 34 36 46 96 8 134-36 36-104 32-126-14-20-42 18-72 44-106-2 34 12 52 34 52-18-34-10-64 0-94Z" ${common}/>`;
    case "drop":
      return `<path d="M144 44c50 58 76 98 76 130 0 42-34 76-76 76s-76-34-76-76c0-32 26-72 76-130Z" ${common}/>`;
    case "ring":
      return `<path d="M144 58a86 86 0 1 0 0 172 86 86 0 0 0 0-172Zm0 58a28 28 0 1 1 0 56 28 28 0 0 1 0-56Z" ${common}/>`;
    case "spark":
      return `<path d="m144 42 18 76 74 26-74 26-18 76-18-76-74-26 74-26 18-76Z" ${common}/>`;
    case "kernel":
      return `<path d="M98 68c70 0 116 50 92 138-18 24-74 26-110 0-24-88 0-138 18-138ZM104 126h82M92 166h104" ${common}/>`;
    case "steam":
      return `<path d="M96 78c-24 30 24 38 0 70M144 64c-26 34 28 44 0 84M192 78c-24 30 24 38 0 70M76 180h136l-18 46H94l-18-46Z" ${common}/>`;
    case "twist":
      return `<path d="M76 148c16-80 120-80 136 0-12 66-124 66-136 0Zm0 0 136 0M100 86l88 124" ${common}/>`;
    case "grid":
      return `<path d="M72 72h144v144H72zM72 120h144M72 168h144M120 72v144M168 72v144" ${common}/>`;
    default:
      return `<path d="M74 74h140v140H74z" ${common}/>`;
  }
}

function playerSvg(id: PlayerAvatarId) {
  const art = PLAYER_ART[id];
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 288" role="img" aria-label="${id} portrait">
      <defs>
        <radialGradient id="g" cx="50%" cy="34%" r="70%">
          <stop offset="0%" stop-color="${art.glow}" stop-opacity=".9"/>
          <stop offset="52%" stop-color="${art.bg}"/>
          <stop offset="100%" stop-color="#050505"/>
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8"/>
        </filter>
      </defs>
      <rect width="288" height="288" rx="44" fill="url(#g)"/>
      <circle cx="144" cy="150" r="92" fill="#050505" opacity=".48"/>
      <circle cx="144" cy="142" r="74" fill="${art.fg}" opacity=".92"/>
      <circle cx="112" cy="132" r="13" fill="#050505"/>
      <circle cx="176" cy="132" r="13" fill="#050505"/>
      <path d="M118 178c18 18 48 18 66 0" fill="none" stroke="#050505" stroke-width="8" stroke-linecap="round"/>
      ${markPath(art.mark, art.glow)}
      <circle cx="88" cy="224" r="44" fill="${art.glow}" opacity=".24" filter="url(#soft)"/>
      <text x="144" y="260" text-anchor="middle" fill="${art.fg}" font-family="monospace" font-size="34" font-weight="700" letter-spacing="6">${art.label}</text>
    </svg>
  `);
}

function enemySvg(kind: EnemyKind) {
  const art = ENEMY_ART[kind];
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 288" role="img" aria-label="${kind} enemy portrait">
      <rect width="288" height="288" rx="44" fill="${art.bg}"/>
      <circle cx="144" cy="144" r="100" fill="${art.glow}" opacity=".24"/>
      <path d="M74 126c0-46 32-82 70-82s70 36 70 82v56c0 34-32 62-70 62s-70-28-70-62v-56Z" fill="${art.fg}"/>
      <circle cx="112" cy="134" r="16" fill="#050505"/>
      <circle cx="176" cy="134" r="16" fill="#050505"/>
      <path d="M106 186h76" stroke="#050505" stroke-width="10" stroke-linecap="round"/>
      <text x="144" y="260" text-anchor="middle" fill="${art.fg}" font-family="monospace" font-size="34" font-weight="700" letter-spacing="6">${art.label}</text>
    </svg>
  `);
}

export function playerPortraitSrc(id: PlayerAvatarId) {
  return playerSvg(id);
}

export function enemyPortraitSrc(kind: EnemyKind) {
  return enemySvg(kind);
}

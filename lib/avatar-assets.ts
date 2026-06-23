import { PLAYER_AVATARS, type EnemyKind, type PlayerAvatarId } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";

export function playerPortraitSrc(id: PlayerAvatarId) {
  const avatar = PLAYER_AVATARS.find((item) => item.id === id) ?? PLAYER_AVATARS[0];
  const meta = FIGHTER_CARD_META[avatar.id];
  const index = PLAYER_AVATARS.findIndex((item) => item.id === avatar.id);
  const hue = (index * 37 + meta.weird * 3) % 360;
  const rarityGlow = meta.rarity === "legend" ? "#f8d66d" : meta.rarity === "rare" ? "#99f6e4" : "#f5f5f5";
  const initials = avatar.label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 704" role="img" aria-label="${escapeXml(avatar.label)} portrait">
      <defs>
        <radialGradient id="g" cx="50%" cy="28%" r="72%">
          <stop offset="0%" stop-color="hsl(${hue} 95% 72%)" stop-opacity="0.95"/>
          <stop offset="46%" stop-color="hsl(${(hue + 48) % 360} 88% 43%)" stop-opacity="0.72"/>
          <stop offset="100%" stop-color="#050505"/>
        </radialGradient>
        <linearGradient id="foil" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${rarityGlow}" stop-opacity="0.9"/>
          <stop offset="44%" stop-color="#ffffff" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="hsl(${(hue + 140) % 360} 90% 62%)" stop-opacity="0.78"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000000" flood-opacity="0.62"/>
        </filter>
      </defs>
      <rect width="512" height="704" rx="56" fill="#070707"/>
      <rect x="18" y="18" width="476" height="668" rx="44" fill="url(#g)" stroke="url(#foil)" stroke-width="5"/>
      <g opacity="0.28">
        ${Array.from({ length: 18 }, (_, line) => `<path d="M${line * 35 - 80} 0 L${line * 35 + 260} 704" stroke="#fff" stroke-width="2"/>`).join("")}
      </g>
      <g filter="url(#shadow)" transform="translate(0 18)">
        <ellipse cx="256" cy="432" rx="132" ry="34" fill="#000" opacity="0.45"/>
        <path d="M151 299c0-82 47-143 106-143 65 0 112 61 112 143 0 46-15 72-35 98-18 23-22 46-22 74H201c0-30-5-51-23-75-18-24-27-53-27-97Z" fill="#f4f0e6" stroke="#050505" stroke-width="13" stroke-linejoin="round"/>
        <path d="M176 265c14-67 59-91 96-84 50 9 75 53 77 117-43-36-116-48-173-33Z" fill="#ffffff" opacity="0.32"/>
        <circle cx="216" cy="313" r="34" fill="#070707"/>
        <circle cx="304" cy="313" r="34" fill="#070707"/>
        <circle cx="${207 + (meta.atk % 10)}" cy="${303 + (meta.spd % 8)}" r="7" fill="${rarityGlow}"/>
        <circle cx="${294 - (meta.spd % 9)}" cy="${304 + (meta.weird % 8)}" r="7" fill="${rarityGlow}"/>
        <path d="M256 343l-18 46h38l-20-46Z" fill="#080808"/>
        <path d="M203 430c38 22 76 22 114 0" fill="none" stroke="#080808" stroke-width="13" stroke-linecap="round"/>
        <path d="M201 451h112" stroke="#080808" stroke-width="7" stroke-linecap="round" stroke-dasharray="10 15"/>
      </g>
      <g>
        <rect x="56" y="548" width="400" height="78" rx="24" fill="#050505" opacity="0.72" stroke="#ffffff" stroke-opacity="0.18"/>
        <text x="256" y="587" text-anchor="middle" font-family="monospace" font-size="28" font-weight="700" fill="#ffffff" letter-spacing="3">${escapeXml(initials)}</text>
        <text x="256" y="615" text-anchor="middle" font-family="monospace" font-size="14" fill="#d4d4d4" letter-spacing="2">${escapeXml(meta.type)} - ${escapeXml(meta.rarity.toUpperCase())}</text>
      </g>
    </svg>
  `);
}

export function enemyPortraitSrc(kind: EnemyKind) {
  const label = kind === "swarmer" ? "Crawl Head" : kind === "tank" ? "Block Skull" : "Spit Skull";
  const hue = kind === "swarmer" ? 96 : kind === "tank" ? 24 : 190;
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 704" role="img" aria-label="${label} portrait">
      <rect width="512" height="704" rx="56" fill="#060606"/>
      <rect x="18" y="18" width="476" height="668" rx="44" fill="hsl(${hue} 58% 18%)" stroke="hsl(${hue} 80% 68%)" stroke-width="5"/>
      <circle cx="256" cy="322" r="118" fill="#e7e0d2" stroke="#050505" stroke-width="16"/>
      <rect x="184" y="292" width="52" height="36" rx="8" fill="#050505"/>
      <rect x="276" y="292" width="52" height="36" rx="8" fill="#050505"/>
      <path d="M256 332l-25 55h50l-25-55Z" fill="#050505"/>
      <text x="256" y="585" text-anchor="middle" font-family="monospace" font-size="24" font-weight="700" fill="#fff" letter-spacing="3">${label}</text>
    </svg>
  `);
}

function svgDataUri(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

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

import { PLAYER_AVATARS, type EnemyKind, type PlayerAvatarId } from "@/lib/avatars";

const AVATAR_ART: Record<
  PlayerAvatarId,
  {
    primary: string;
    secondary: string;
    glow: string;
    symbol: string;
    eye: "round" | "slash" | "void";
  }
> = {
  skullmic: { primary: "#f8fafc", secondary: "#7c3cff", glow: "#f0abfc", symbol: "M", eye: "round" },
  skullbunny: { primary: "#f3f4f6", secondary: "#fb7185", glow: "#fecdd3", symbol: "B", eye: "slash" },
  gaperskull: { primary: "#e5e7eb", secondary: "#38bdf8", glow: "#bae6fd", symbol: "G", eye: "void" },
  wormface: { primary: "#d9f99d", secondary: "#84cc16", glow: "#bef264", symbol: "W", eye: "round" },
  sporkfiend: { primary: "#f5f5f4", secondary: "#a3e635", glow: "#eab308", symbol: "S", eye: "slash" },
  slurpghoul: { primary: "#e0f2fe", secondary: "#06b6d4", glow: "#67e8f9", symbol: "U", eye: "round" },
  nachomancer: { primary: "#fef3c7", secondary: "#f59e0b", glow: "#facc15", symbol: "N", eye: "slash" },
  burgerlich: { primary: "#fde68a", secondary: "#fb923c", glow: "#f97316", symbol: "K", eye: "void" },
  frywraith: { primary: "#fef08a", secondary: "#eab308", glow: "#fde047", symbol: "F", eye: "round" },
  milkspecter: { primary: "#f8fafc", secondary: "#93c5fd", glow: "#dbeafe", symbol: "L", eye: "void" },
  pizzoid: { primary: "#fed7aa", secondary: "#ef4444", glow: "#fdba74", symbol: "P", eye: "slash" },
  sodasnarl: { primary: "#cffafe", secondary: "#22d3ee", glow: "#67e8f9", symbol: "Z", eye: "round" },
  donutcreep: { primary: "#fbcfe8", secondary: "#a855f7", glow: "#f0abfc", symbol: "D", eye: "void" },
  hotdogwraith: { primary: "#fee2e2", secondary: "#dc2626", glow: "#fca5a5", symbol: "H", eye: "slash" },
  jellophant: { primary: "#ddd6fe", secondary: "#8b5cf6", glow: "#c4b5fd", symbol: "J", eye: "round" },
  poptartgeist: { primary: "#fce7f3", secondary: "#ec4899", glow: "#f9a8d4", symbol: "T", eye: "slash" },
  cornfiend: { primary: "#fef9c3", secondary: "#65a30d", glow: "#bef264", symbol: "C", eye: "round" },
  ramenlich: { primary: "#ffedd5", secondary: "#f97316", glow: "#fdba74", symbol: "R", eye: "void" },
  pretzelwraith: { primary: "#f5e8c7", secondary: "#b45309", glow: "#fbbf24", symbol: "Q", eye: "slash" },
  wafflegeist: { primary: "#fef3c7", secondary: "#92400e", glow: "#f59e0b", symbol: "A", eye: "round" },
};

const ENEMY_ART: Record<EnemyKind, { primary: string; secondary: string; glow: string; symbol: string }> = {
  swarmer: { primary: "#e5e7eb", secondary: "#64748b", glow: "#cbd5e1", symbol: "S" },
  tank: { primary: "#d6d3d1", secondary: "#57534e", glow: "#a8a29e", symbol: "T" },
  ranged: { primary: "#cbd5e1", secondary: "#334155", glow: "#94a3b8", symbol: "R" },
};

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function avatarLabel(id: PlayerAvatarId) {
  return PLAYER_AVATARS.find((avatar) => avatar.id === id)?.label ?? "Snack Surge Fighter";
}

function eyeMarkup(eye: "round" | "slash" | "void", color: string) {
  if (eye === "slash") {
    return `
      <path d="M92 106l24-12" stroke="#0b0b0f" stroke-width="8" stroke-linecap="round"/>
      <path d="M164 94l24 12" stroke="#0b0b0f" stroke-width="8" stroke-linecap="round"/>
      <circle cx="104" cy="101" r="5" fill="${color}"/>
      <circle cx="176" cy="101" r="5" fill="${color}"/>`;
  }
  if (eye === "void") {
    return `
      <ellipse cx="104" cy="102" rx="17" ry="22" fill="#050508"/>
      <ellipse cx="176" cy="102" rx="17" ry="22" fill="#050508"/>
      <circle cx="110" cy="94" r="4" fill="${color}"/>
      <circle cx="170" cy="94" r="4" fill="${color}"/>`;
  }
  return `
    <circle cx="104" cy="102" r="18" fill="#050508"/>
    <circle cx="176" cy="102" r="18" fill="#050508"/>
    <circle cx="110" cy="96" r="5" fill="${color}"/>
    <circle cx="182" cy="96" r="5" fill="${color}"/>`;
}

function buildPortraitSvg({
  label,
  primary,
  secondary,
  glow,
  symbol,
  eye = "round",
}: {
  label: string;
  primary: string;
  secondary: string;
  glow: string;
  symbol: string;
  eye?: "round" | "slash" | "void";
}) {
  const safeLabel = label.replace(/[<>&"]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420" role="img" aria-label="${safeLabel}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="28%" r="68%">
        <stop offset="0%" stop-color="${glow}" stop-opacity=".72"/>
        <stop offset="42%" stop-color="${secondary}" stop-opacity=".2"/>
        <stop offset="100%" stop-color="#050507"/>
      </radialGradient>
      <linearGradient id="foil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff" stop-opacity=".85"/>
        <stop offset="48%" stop-color="${primary}" stop-opacity=".92"/>
        <stop offset="100%" stop-color="${secondary}" stop-opacity=".75"/>
      </linearGradient>
      <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M24 0H0v24" fill="none" stroke="#ffffff" stroke-opacity=".08" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="320" height="420" rx="36" fill="url(#bg)"/>
    <rect x="16" y="16" width="288" height="388" rx="28" fill="url(#grid)" opacity=".75"/>
    <circle cx="160" cy="140" r="116" fill="${secondary}" opacity=".2" filter="url(#softGlow)"/>
    <path d="M70 168c-20-73 20-118 90-118s110 45 90 118c26 12 35 34 24 59-11 24-37 27-53 16-12 17-33 29-61 29s-49-12-61-29c-16 11-42 8-53-16-11-25-2-47 24-59z" fill="url(#foil)" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>
    <path d="M72 178c-18 8-26 25-18 43 7 16 24 18 37 8-8-13-14-29-19-51z" fill="#0a0a0d" opacity=".72"/>
    <path d="M248 178c18 8 26 25 18 43-7 16-24 18-37 8 8-13 14-29 19-51z" fill="#0a0a0d" opacity=".72"/>
    ${eyeMarkup(eye, glow)}
    <path d="M132 139c8 12 48 12 56 0" fill="none" stroke="#0b0b0f" stroke-width="8" stroke-linecap="round"/>
    <path d="M115 180h90" stroke="#0b0b0f" stroke-width="9" stroke-linecap="round"/>
    <path d="M126 199h68" stroke="#0b0b0f" stroke-width="7" stroke-linecap="round" opacity=".76"/>
    <path d="M103 292c34 18 80 18 114 0l-14 48c-27 16-59 16-86 0z" fill="${secondary}" opacity=".82" stroke="#fff" stroke-opacity=".22"/>
    <text x="160" y="333" text-anchor="middle" font-family="monospace" font-size="54" font-weight="900" fill="#050507" opacity=".9">${symbol}</text>
    <path d="M54 360c45 25 167 25 212 0" fill="none" stroke="${glow}" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <text x="160" y="384" text-anchor="middle" font-family="monospace" font-size="16" font-weight="700" letter-spacing="2" fill="#fff">${safeLabel.toUpperCase()}</text>
  </svg>`;
}

export function playerPortraitSrc(id: PlayerAvatarId) {
  const art = AVATAR_ART[id] ?? AVATAR_ART.skullmic;
  return svgToDataUri(buildPortraitSvg({ label: avatarLabel(id), ...art }));
}

export function enemyPortraitSrc(kind: EnemyKind) {
  const art = ENEMY_ART[kind];
  return svgToDataUri(
    buildPortraitSvg({
      label: `${kind} enemy`,
      primary: art.primary,
      secondary: art.secondary,
      glow: art.glow,
      symbol: art.symbol,
      eye: "void",
    }),
  );
}

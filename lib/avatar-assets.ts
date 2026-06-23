import { PLAYER_AVATARS, type EnemyKind, type PlayerAvatarId } from "@/lib/avatars";

const AVATAR_TONES: Record<PlayerAvatarId, { bg: string; glow: string; ink: string; mark: string }> = {
  skullmic: { bg: "#151025", glow: "#f8fafc", ink: "#0a0a0a", mark: "SM" },
  skullbunny: { bg: "#1a1021", glow: "#f5d0fe", ink: "#111111", mark: "SB" },
  gaperskull: { bg: "#111827", glow: "#dbeafe", ink: "#050505", mark: "GS" },
  wormface: { bg: "#10251b", glow: "#bbf7d0", ink: "#080808", mark: "WF" },
  sporkfiend: { bg: "#1f1f16", glow: "#fde68a", ink: "#090909", mark: "SF" },
  slurpghoul: { bg: "#10222a", glow: "#bae6fd", ink: "#071014", mark: "SG" },
  nachomancer: { bg: "#281809", glow: "#fdba74", ink: "#100804", mark: "NM" },
  burgerlich: { bg: "#22140d", glow: "#fef3c7", ink: "#120806", mark: "BL" },
  frywraith: { bg: "#261908", glow: "#fde68a", ink: "#100804", mark: "FW" },
  milkspecter: { bg: "#111827", glow: "#e0f2fe", ink: "#05090f", mark: "MS" },
  pizzoid: { bg: "#2a1212", glow: "#fecaca", ink: "#120606", mark: "PZ" },
  sodasnarl: { bg: "#10202a", glow: "#a5f3fc", ink: "#061016", mark: "SS" },
  donutcreep: { bg: "#24111d", glow: "#fbcfe8", ink: "#110711", mark: "DC" },
  hotdogwraith: { bg: "#24160e", glow: "#fed7aa", ink: "#100806", mark: "HW" },
  jellophant: { bg: "#141329", glow: "#c4b5fd", ink: "#080714", mark: "JP" },
  poptartgeist: { bg: "#29161b", glow: "#fecdd3", ink: "#12070a", mark: "PG" },
  cornfiend: { bg: "#17210d", glow: "#d9f99d", ink: "#080d04", mark: "CF" },
  ramenlich: { bg: "#25160f", glow: "#fed7aa", ink: "#100806", mark: "RL" },
  pretzelwraith: { bg: "#20150d", glow: "#f5deb3", ink: "#0f0804", mark: "PW" },
  wafflegeist: { bg: "#1f190f", glow: "#fde68a", ink: "#0e0904", mark: "WG" },
};

const ENEMY_TONES: Record<EnemyKind, { bg: string; glow: string; ink: string; mark: string }> = {
  swarmer: { bg: "#18181b", glow: "#e4e4e7", ink: "#050505", mark: "SW" },
  tank: { bg: "#111111", glow: "#d4d4d8", ink: "#030303", mark: "TK" },
  ranged: { bg: "#101827", glow: "#bae6fd", ink: "#030712", mark: "RG" },
};

function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function portraitSvg({
  seed,
  label,
  bg,
  glow,
  ink,
  mark,
}: {
  seed: string;
  label: string;
  bg: string;
  glow: string;
  ink: string;
  mark: string;
}) {
  const safeLabel = label.replace(/[<>&"]/g, "");
  const uid = seed.replace(/[^a-z0-9-]/gi, "");

  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${safeLabel}" viewBox="0 0 240 240">
  <defs>
    <radialGradient id="${uid}-glow" cx="50%" cy="32%" r="68%">
      <stop offset="0%" stop-color="${glow}" stop-opacity=".95"/>
      <stop offset="46%" stop-color="${glow}" stop-opacity=".24"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${uid}-foil" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="#fff" stop-opacity=".95"/>
      <stop offset="42%" stop-color="${glow}" stop-opacity=".88"/>
      <stop offset="100%" stop-color="#9ca3af" stop-opacity=".95"/>
    </linearGradient>
    <filter id="${uid}-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="12" flood-color="#000" flood-opacity=".65"/>
    </filter>
  </defs>
  <rect width="240" height="240" rx="36" fill="${bg}"/>
  <rect x="10" y="10" width="220" height="220" rx="30" fill="none" stroke="#fff" stroke-opacity=".16"/>
  <path d="M28 190 C76 150 139 236 212 172 L212 232 L28 232 Z" fill="#000" opacity=".34"/>
  <circle cx="120" cy="102" r="94" fill="url(#${uid}-glow)"/>
  <g filter="url(#${uid}-shadow)">
    <path d="M120 38 C79 38 49 66 49 108 C49 137 62 154 82 166 L82 188 L101 188 L101 172 L118 176 L139 172 L139 188 L158 188 L158 166 C178 153 191 136 191 108 C191 66 161 38 120 38 Z" fill="url(#${uid}-foil)" stroke="${ink}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M76 100 C82 78 107 79 113 98 C106 116 83 118 76 100 Z" fill="${ink}"/>
    <path d="M127 98 C135 79 160 78 166 100 C158 118 136 116 127 98 Z" fill="${ink}"/>
    <path d="M113 122 L126 122 L120 140 Z" fill="${ink}" opacity=".9"/>
    <path d="M87 150 C106 160 136 160 154 150" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round"/>
    <path d="M72 66 C83 45 96 33 111 30" fill="none" stroke="${glow}" stroke-width="9" stroke-linecap="round" opacity=".72"/>
    <path d="M167 66 C156 45 143 33 128 30" fill="none" stroke="${glow}" stroke-width="9" stroke-linecap="round" opacity=".58"/>
  </g>
  <g opacity=".58" stroke="#fff" stroke-width="2">
    <path d="M32 54 H78"/>
    <path d="M162 54 H208"/>
    <path d="M42 202 H98"/>
    <path d="M142 202 H198"/>
  </g>
  <text x="120" y="218" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="18" letter-spacing="4" fill="#fff" fill-opacity=".86">${mark}</text>
</svg>`;
}

export function playerPortraitSrc(id: PlayerAvatarId) {
  const avatar = PLAYER_AVATARS.find((item) => item.id === id);
  const tone = AVATAR_TONES[id];
  return svgDataUri(
    portraitSvg({
      seed: id,
      label: avatar?.label ?? id,
      ...tone,
    }),
  );
}

export function enemyPortraitSrc(kind: EnemyKind) {
  return svgDataUri(
    portraitSvg({
      seed: `enemy-${kind}`,
      label: `${kind} enemy`,
      ...ENEMY_TONES[kind],
    }),
  );
}

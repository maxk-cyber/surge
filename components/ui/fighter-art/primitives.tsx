import { createContext, useContext, type ReactNode } from "react";

export const ART_VIEW = 192;

export type FighterArtMode = "portrait" | "sprite";

const FighterArtModeContext = createContext<FighterArtMode>("portrait");

export function FighterArtModeProvider({
  mode,
  children,
}: {
  mode: FighterArtMode;
  children: ReactNode;
}) {
  return <FighterArtModeContext.Provider value={mode}>{children}</FighterArtModeContext.Provider>;
}

export function useFighterArtMode() {
  return useContext(FighterArtModeContext);
}

export const C = {
  ink: "#080808",
  bone: "#f6f1e8",
  boneMid: "#e8dfd2",
  boneDark: "#c9bfb0",
  shade: "#7a7a7a",
  dim: "#3d3d3d",
  high: "#ffffff",
  blush: "#c4bab0",
  foil: "#d9d9d9",
} as const;

export function ArtDefs({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={`${id}-stage`} cx="50%" cy="42%" r="58%">
        <stop offset="0%" stopColor="#2a2a2a" />
        <stop offset="55%" stopColor="#141414" />
        <stop offset="100%" stopColor="#060606" />
      </radialGradient>
      <radialGradient id={`${id}-spot`} cx="50%" cy="38%" r="45%">
        <stop offset="0%" stopColor={C.high} stopOpacity="0.14" />
        <stop offset="100%" stopColor={C.high} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-bone`} cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor={C.high} />
        <stop offset="40%" stopColor={C.bone} />
        <stop offset="100%" stopColor={C.boneDark} />
      </radialGradient>
      <radialGradient id={`${id}-ink`} cx="45%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#222" />
        <stop offset="100%" stopColor={C.ink} />
      </radialGradient>
      <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.shade} stopOpacity="0" />
        <stop offset="100%" stopColor={C.shade} stopOpacity="0.5" />
      </linearGradient>
      <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.65" />
      </filter>
      <filter id={`${id}-rim`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur" />
        <feOffset dx="0" dy="1" result="offsetBlur" />
        <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
      </filter>
    </defs>
  );
}

export function PortraitFrame({ uid, children }: { uid: string; children: ReactNode }) {
  const mode = useFighterArtMode();
  const cx = ART_VIEW / 2;
  return (
    <g filter={mode === "portrait" ? `url(#${uid}-soft)` : undefined}>
      <ArtDefs id={uid} />
      {mode === "portrait" && (
        <>
          <ellipse cx={cx} cy={98} rx={86} ry={88} fill={`url(#${uid}-stage)`} />
          <ellipse cx={cx} cy={88} rx={72} ry={74} fill={`url(#${uid}-spot)`} />
          <ellipse
            cx={cx}
            cy={98}
            rx={86}
            ry={88}
            fill="none"
            stroke={C.foil}
            strokeWidth={1.5}
            opacity={0.25}
          />
        </>
      )}
      {children}
    </g>
  );
}

export function PieEye({
  cx,
  cy,
  r,
  px,
  py,
  angry,
}: {
  cx: number;
  cy: number;
  r: number;
  px: number;
  py: number;
  angry?: boolean;
}) {
  return (
    <g>
      {angry && (
        <>
          <path
            d={`M${cx - r - 5} ${cy - r - 3} L${cx - 1} ${cy - r + 6}`}
            stroke={C.ink}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M${cx + r + 5} ${cy - r - 3} L${cx + 1} ${cy - r + 6}`}
            stroke={C.ink}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      <circle cx={cx} cy={cy} r={r + 2} fill={C.ink} />
      <circle cx={cx} cy={cy} r={r} fill={C.high} stroke={C.ink} strokeWidth={2.8} />
      <ellipse cx={cx - r * 0.28} cy={cy - r * 0.22} rx={r * 0.24} ry={r * 0.16} fill={C.high} />
      <circle cx={cx + px} cy={cy + py} r={Math.max(3, r * 0.38)} fill={C.ink} />
      <circle cx={cx + px + 1.5} cy={cy + py - 1.5} r={1.3} fill={C.high} opacity={0.9} />
    </g>
  );
}

export function SkullHead({
  uid,
  cx,
  cy,
  r,
}: {
  uid: string;
  cx: number;
  cy: number;
  r: number;
}) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r + 2} fill={C.ink} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={4} />
      <ellipse cx={cx + r * 0.12} cy={cy + r * 0.35} rx={r * 0.75} ry={r * 0.42} fill={`url(#${uid}-shade)`} />
    </>
  );
}

export function ChomperTeeth({ cx, cy, w, n }: { cx: number; cy: number; w: number; n: number }) {
  const step = w / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = cx - w / 2 + step * i + step / 2;
        return (
          <polygon
            key={i}
            points={`${x - step * 0.3},${cy} ${x},${cy + 8} ${x + step * 0.3},${cy}`}
            fill={C.bone}
            stroke={C.ink}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
}

export function InkMouth({ cx, cy, w, h }: { cx: number; cy: number; w: number; h: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2} fill={C.ink} />
      <ellipse cx={cx} cy={cy + h * 0.15} rx={w * 0.35} ry={h * 0.28} fill={C.dim} />
    </>
  );
}

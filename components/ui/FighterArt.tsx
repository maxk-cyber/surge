"use client";

import type { FC } from "react";
import type { EnemyKind, PlayerAvatarId } from "@/lib/avatars";
import { ART_VIEW, C, FighterArtModeProvider, PieEye, PortraitFrame, SkullHead, type FighterArtMode } from "./fighter-art/primitives";
import { PLAYER_PORTRAITS } from "./fighter-art/player-portraits";

function CrawlHeadArt({ uid }: { uid: string }) {
  return (
    <PortraitFrame uid={uid}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        const x1 = 96 + Math.cos(a) * 18;
        const y1 = 98 + Math.sin(a) * 18;
        const x2 = 96 + Math.cos(a) * 40;
        const y2 = 98 + Math.sin(a) * 40;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
            <circle cx={x2} cy={y2} r={4.5} fill={C.ink} />
          </g>
        );
      })}
      <SkullHead uid={uid} cx={96} cy={98} r={26} />
      <PieEye cx={84} cy={94} r={9} px={2} py={0} />
      <PieEye cx={108} cy={94} r={9} px={-2} py={1} />
    </PortraitFrame>
  );
}

function BlockSkullArt({ uid }: { uid: string }) {
  return (
    <PortraitFrame uid={uid}>
      <rect x={48} y={58} width={96} height={72} rx={10} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={4.5} />
      <rect x={108} y={68} width={28} height={52} fill={C.shade} opacity={0.25} />
      <rect x={62} y={88} width={20} height={8} fill={C.ink} />
      <rect x={110} y={88} width={20} height={8} fill={C.ink} />
      <rect x={94} y={84} width={6} height={14} fill={C.ink} />
    </PortraitFrame>
  );
}

function SpitSkullArt({ uid }: { uid: string }) {
  return (
    <PortraitFrame uid={uid}>
      <SkullHead uid={uid} cx={88} cy={98} r={28} />
      <PieEye cx={78} cy={92} r={10} px={1.5} py={0} angry />
      <line x1={108} y1={90} x2={132} y2={78} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={138} cy={76} r={12} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={2.5} />
      <circle cx={138} cy={76} r={7} fill={C.high} />
      <circle cx={140} cy={75} r={2.5} fill={C.ink} />
    </PortraitFrame>
  );
}

const ENEMY_ART: Record<EnemyKind, FC<{ uid: string }>> = {
  swarmer: CrawlHeadArt,
  tank: BlockSkullArt,
  ranged: SpitSkullArt,
};

export function FighterArtSvg({
  id,
  enemy,
  size = 160,
  className,
  mode = "portrait",
}: {
  id?: PlayerAvatarId | string;
  enemy?: EnemyKind;
  size?: number;
  className?: string;
  mode?: FighterArtMode;
}) {
  const uid = `fa-${enemy ?? id ?? "x"}`;
  const Player = id && id in PLAYER_PORTRAITS ? PLAYER_PORTRAITS[id as PlayerAvatarId] : null;
  const Enemy = enemy ? ENEMY_ART[enemy] : null;
  const Art = Enemy ?? Player ?? PLAYER_PORTRAITS.skullmic;

  return (
    <FighterArtModeProvider mode={mode}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${ART_VIEW} ${ART_VIEW}`}
        className={className}
        aria-hidden="true"
        shapeRendering="geometricPrecision"
      >
        <Art uid={uid} />
      </svg>
    </FighterArtModeProvider>
  );
}

export { ART_VIEW };

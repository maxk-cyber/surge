import type { FC } from "react";
import type { PlayerAvatarId } from "@/lib/avatars";
import {
  ART_VIEW,
  C,
  ChomperTeeth,
  InkMouth,
  PieEye,
  PortraitFrame,
  SkullHead,
} from "./primitives";

type P = FC<{ uid: string }>;

const SkullMickeyPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <circle cx={72} cy={58} r={22} fill={`url(#${uid}-ink)`} stroke={C.ink} strokeWidth={4} />
    <circle cx={120} cy={58} r={22} fill={`url(#${uid}-ink)`} stroke={C.ink} strokeWidth={4} />
    <ellipse cx={72} cy={60} rx={11} ry={9} fill={C.dim} opacity={0.35} />
    <ellipse cx={120} cy={60} rx={11} ry={9} fill={C.dim} opacity={0.35} />
    <SkullHead uid={uid} cx={96} cy={108} r={38} />
    <ellipse cx={82} cy={118} rx={8} ry={5} fill={C.blush} opacity={0.3} />
    <ellipse cx={110} cy={118} rx={8} ry={5} fill={C.blush} opacity={0.3} />
    <PieEye cx={82} cy={102} r={13} px={3} py={2} />
    <PieEye cx={110} cy={102} r={13} px={-2.5} py={2.5} />
    <ellipse cx={96} cy={118} rx={5} ry={3.5} fill={C.ink} />
    <path d="M68 128 A28 28 0 0 1 124 128 Z" fill={C.ink} />
    <ChomperTeeth cx={96} cy={128} w={40} n={8} />
    <path d="M88 72 L94 84 L92 90" fill="none" stroke={C.ink} strokeWidth={2.2} opacity={0.4} strokeLinecap="round" />
  </PortraitFrame>
);

const SkullBunnyPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <ellipse cx={74} cy={42} rx={14} ry={38} fill={`url(#${uid}-ink)`} stroke={C.ink} strokeWidth={4} />
    <ellipse cx={118} cy={52} rx={13} ry={28} fill={`url(#${uid}-ink)`} stroke={C.ink} strokeWidth={4} />
    <ellipse cx={74} cy={36} rx={6} ry={24} fill={C.shade} opacity={0.45} />
    <SkullHead uid={uid} cx={96} cy={112} r={36} />
    <PieEye cx={82} cy={106} r={12} px={3.5} py={-1} angry />
    <PieEye cx={112} cy={108} r={13} px={-3} py={2.5} />
    <ellipse cx={96} cy={122} rx={4.5} ry={3} fill={C.ink} />
    <rect x={84} y={124} width={10} height={14} rx={1.5} fill={C.bone} stroke={C.ink} strokeWidth={2.8} />
    <rect x={98} y={124} width={10} height={14} rx={1.5} fill={C.bone} stroke={C.ink} strokeWidth={2.8} />
    <line x1={89} y1={124} x2={89} y2={136} stroke={C.ink} strokeWidth={2} />
    <line x1={103} y1={124} x2={103} y2={136} stroke={C.ink} strokeWidth={2} />
    {[0, 1, 2].map((i) => (
      <g key={i} opacity={0.8}>
        <line x1={58} y1={108 + i * 5} x2={44} y2={112 + i * 5} stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={134} y1={108 + i * 5} x2={148} y2={112 + i * 5} stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" />
      </g>
    ))}
  </PortraitFrame>
);

const GaperSkullPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <SkullHead uid={uid} cx={96} cy={96} r={42} />
    <PieEye cx={100} cy={88} r={20} px={2} py={4} />
    <circle cx={68} cy={68} r={6} fill={C.ink} />
    <circle cx={128} cy={64} r={5} fill={C.ink} />
    <InkMouth cx={96} cy={118} w={32} h={22} />
    <rect x={62} y={132} width={68} height={18} rx={6} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={3.5} />
    <ChomperTeeth cx={96} cy={132} w={52} n={9} />
    <path d="M128 58 L136 40 L144 48" fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={144} cy={48} r={4} fill={C.high} stroke={C.ink} strokeWidth={2} />
  </PortraitFrame>
);

const WormFacePortrait: P = ({ uid }) => {
  const worms = [
    { ox: -26, oy: -48, curl: -0.55 },
    { ox: 0, oy: -58, curl: 0 },
    { ox: 26, oy: -48, curl: 0.55 },
  ];
  return (
    <PortraitFrame uid={uid}>
      {worms.map(({ ox, oy, curl }, i) => {
        const bx = 96 + ox;
        const by = 108;
        const tx = 96 + ox * 0.55;
        const ty = 108 + oy;
        const mx = 96 + ox + curl * 14;
        const my = 72;
        return (
          <g key={i}>
            <path d={`M${bx} ${by} Q${mx} ${my} ${tx} ${ty}`} fill="none" stroke={C.shade} strokeWidth={8} strokeLinecap="round" />
            <path d={`M${bx} ${by} Q${mx} ${my} ${tx} ${ty}`} fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />
            <circle cx={tx} cy={ty} r={6.5} fill={C.high} stroke={C.ink} strokeWidth={2.5} />
            <circle cx={tx + 1.5} cy={ty + 1.5} r={2.2} fill={C.ink} />
          </g>
        );
      })}
      <SkullHead uid={uid} cx={96} cy={112} r={36} />
      {([-1, 1] as const).map((s) => (
        <g key={s}>
          <circle cx={96 + s * 16} cy={108} r={10} fill="none" stroke={C.ink} strokeWidth={3.2} />
          <circle cx={96 + s * 16} cy={108} r={6} fill="none" stroke={C.ink} strokeWidth={2} />
          <circle cx={96 + s * 16} cy={108} r={3} fill={C.ink} />
        </g>
      ))}
      <path d="M78 132 Q96 138 114 132" fill="none" stroke={C.ink} strokeWidth={2.8} strokeLinecap="round" />
      <path d="M80 138 Q96 146 112 138" fill="none" stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" opacity={0.75} />
    </PortraitFrame>
  );
};

const SporkFiendPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <SkullHead uid={uid} cx={96} cy={108} r={34} />
    <PieEye cx={84} cy={102} r={11} px={2.5} py={1.5} angry />
    <PieEye cx={108} cy={102} r={11} px={-2} py={2} />
    <path d="M68 128 A28 28 0 0 1 124 128 Z" fill={C.ink} />
    <ChomperTeeth cx={96} cy={128} w={36} n={7} />
    <path d="M96 74 L96 24" stroke={C.shade} strokeWidth={10} strokeLinecap="round" />
    <path d="M96 74 L96 24" stroke={C.high} strokeWidth={6} strokeLinecap="round" />
    <path d="M96 74 L96 24" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
    <path d="M88 32 L96 18 L104 32 L100 38 L92 38 Z" fill={C.high} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
    <path d="M92 38 L96 48 L100 38" fill={C.ink} />
    <path d="M88 48 L104 48" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
  </PortraitFrame>
);

const SlurpGhoulPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <SkullHead uid={uid} cx={96} cy={108} r={34} />
    <PieEye cx={84} cy={102} r={10} px={2} py={1.5} />
    <PieEye cx={108} cy={104} r={11} px={-2.5} py={2} />
    <path d="M72 128 Q96 140 120 128" fill={C.ink} />
    <path d="M118 48 L128 38 L138 52 L132 120 L118 120 Z" fill={C.high} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
    <path d="M122 52 L128 44 L134 54" fill={C.shade} opacity={0.4} />
    <rect x={120} y={68} width={8} height={36} rx={2} fill={`url(#${uid}-ink)`} />
    <path d="M124 108 Q130 118 124 128" fill="none" stroke={C.high} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
    <ellipse cx={96} cy={148} rx={28} ry={8} fill={C.high} opacity={0.15} />
  </PortraitFrame>
);

const NachomancerPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <polygon points="96,28 148,88 44,88" fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <polygon points="96,40 132,84 60,84" fill={C.boneDark} opacity={0.35} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={72 + i * 12} cy={78} r={3.5} fill={C.dim} opacity={0.55} />
    ))}
    <SkullHead uid={uid} cx={96} cy={118} r={32} />
    <PieEye cx={86} cy={112} r={10} px={2} py={1.5} />
    <PieEye cx={106} cy={112} r={10} px={-2} py={2} />
    <path d="M78 132 Q96 142 114 132" fill={C.ink} />
    <ChomperTeeth cx={96} cy={132} w={28} n={6} />
  </PortraitFrame>
);

const BurgerLichPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <ellipse cx={96} cy={52} rx={52} ry={16} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={3.5} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <circle key={i} cx={58 + i * 10} cy={48} r={3} fill={C.high} stroke={C.ink} strokeWidth={1.2} />
    ))}
    <rect x={58} y={58} width={76} height={10} rx={2} fill={C.dim} stroke={C.ink} strokeWidth={2} />
    <rect x={58} y={72} width={76} height={8} rx={2} fill={C.shade} opacity={0.6} />
    <SkullHead uid={uid} cx={96} cy={112} r={34} />
    <PieEye cx={84} cy={106} r={11} px={2.5} py={1.5} />
    <PieEye cx={108} cy={106} r={11} px={-2} py={2} />
    <path d="M72 128 A48 48 0 0 1 120 128 Z" fill={C.ink} />
    <ChomperTeeth cx={96} cy={128} w={34} n={7} />
    <ellipse cx={96} cy={148} rx={50} ry={12} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={3} />
  </PortraitFrame>
);

const FryWraithPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x1 = 96 + Math.cos(a) * 28;
      const y1 = 88 + Math.sin(a) * 28;
      const x2 = 96 + Math.cos(a) * 52;
      const y2 = 52 + Math.sin(a) * 52;
      return (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.boneMid} strokeWidth={7} strokeLinecap="round" />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
          <rect x={x2 - 4} y={y2 - 8} width={8} height={14} rx={2} fill={C.bone} stroke={C.ink} strokeWidth={2} transform={`rotate(${(a * 180) / Math.PI + 90} ${x2} ${y2})`} />
        </g>
      );
    })}
    <SkullHead uid={uid} cx={96} cy={112} r={34} />
    <PieEye cx={84} cy={106} r={11} px={2} py={1.5} />
    <PieEye cx={108} cy={106} r={11} px={-2} py={2} angry />
    <InkMouth cx={96} cy={128} w={22} h={14} />
  </PortraitFrame>
);

const MilkSpecterPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <path d="M62 68 L72 48 L120 48 L130 68 L130 152 L62 152 Z" fill={C.high} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M72 48 L82 38 L110 38 L120 48" fill={C.boneMid} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
    <rect x={68} y={56} width={56} height={36} rx={3} fill={C.shade} opacity={0.25} />
    <text x={96} y={78} textAnchor="middle" fontSize={11} fontFamily="monospace" fill={C.ink} fontWeight="bold">MILK</text>
    <SkullHead uid={uid} cx={96} cy={108} r={28} />
    <PieEye cx={86} cy={104} r={9} px={2} py={1.5} />
    <PieEye cx={106} cy={104} r={9} px={-2} py={2} />
    <path d="M82 122 Q96 132 110 122" fill={C.ink} />
    <text x={96} y={142} textAnchor="middle" fontSize={9} fontFamily="monospace" fill={C.dim}>EXP 1998</text>
  </PortraitFrame>
);

const PizzoidPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <polygon points="96,32 156,148 36,148" fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <polygon points="96,48 136,140 56,140" fill={C.boneDark} opacity={0.3} />
    <circle cx={82} cy={108} r={8} fill={C.dim} stroke={C.ink} strokeWidth={2} />
    <circle cx={110} cy={118} r={7} fill={C.dim} stroke={C.ink} strokeWidth={2} />
    <circle cx={96} cy={132} r={6} fill={C.dim} stroke={C.ink} strokeWidth={2} />
    <PieEye cx={86} cy={92} r={12} px={2.5} py={1.5} />
    <PieEye cx={106} cy={92} r={12} px={-2} py={2} />
    <path d="M78 108 Q96 118 114 108" fill={C.ink} />
    <path d="M96 32 L96 22" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
    <circle cx={96} cy={18} r={4} fill={C.high} stroke={C.ink} strokeWidth={2} />
  </PortraitFrame>
);

const SodaSnarlPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <path d="M68 52 L78 38 L114 38 L124 52 L124 148 L68 148 Z" fill={C.shade} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M78 38 L88 28 L104 28 L114 38" fill={C.high} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
    <rect x={72} y={56} width={48} height={64} rx={4} fill={C.dim} opacity={0.5} />
    <SkullHead uid={uid} cx={96} cy={108} r={30} />
    <PieEye cx={86} cy={102} r={10} px={2.5} py={1.5} angry />
    <PieEye cx={106} cy={102} r={10} px={-2} py={2} angry />
    <path d="M80 124 Q96 134 112 124" fill={C.ink} />
    <ChomperTeeth cx={96} cy={124} w={26} n={6} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={118 + i * 6} cy={72 + i * 8} r={3 + i * 0.5} fill={C.high} opacity={0.35 - i * 0.08} />
    ))}
    <path d="M124 90 L140 82" stroke={C.high} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
  </PortraitFrame>
);

const DonutCreepPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <circle cx={96} cy={108} r={52} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={4} />
    <circle cx={96} cy={108} r={28} fill={C.ink} />
    <SkullHead uid={uid} cx={96} cy={108} r={24} />
    <PieEye cx={88} cy={104} r={8} px={2} py={1} />
    <PieEye cx={104} cy={104} r={8} px={-2} py={1.5} />
    <path d="M88 116 Q96 122 104 116" fill={C.bone} />
    {[
      [72, 72], [120, 74], [68, 108], [124, 110], [78, 140], [114, 138],
    ].map(([x, y], i) => (
      <rect key={i} x={x - 3} y={y - 3} width={6} height={6} rx={1.5} fill={i % 2 ? C.high : C.dim} stroke={C.ink} strokeWidth={1.5} transform={`rotate(${i * 18} ${x} ${y})`} />
    ))}
  </PortraitFrame>
);

const HotdogWraithPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <ellipse cx={96} cy={132} rx={58} ry={22} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={3.5} />
    <ellipse cx={96} cy={128} rx={48} ry={14} fill={C.boneDark} opacity={0.35} />
    <rect x={52} y={108} width={88} height={22} rx={11} fill={C.shade} stroke={C.ink} strokeWidth={3} />
    <rect x={58} y={112} width={76} height={14} rx={7} fill={C.dim} opacity={0.55} />
    <SkullHead uid={uid} cx={96} cy={88} r={34} />
    <PieEye cx={84} cy={82} r={11} px={2.5} py={1.5} angry />
    <PieEye cx={108} cy={82} r={11} px={-2} py={2} />
    <path d="M72 98 A24 24 0 0 1 120 98 Z" fill={C.ink} />
    <ChomperTeeth cx={96} cy={98} w={34} n={7} />
    <path d="M44 120 Q52 108 60 120" fill="none" stroke={C.high} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
    <path d="M132 118 Q140 106 148 118" fill="none" stroke={C.high} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
  </PortraitFrame>
);

const JellophantPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <rect x={52} y={48} width={88} height={104} rx={14} fill={C.high} stroke={C.ink} strokeWidth={3.5} opacity={0.55} />
    <rect x={58} y={54} width={76} height={92} rx={10} fill={C.boneMid} stroke={C.ink} strokeWidth={2} opacity={0.35} />
    <SkullHead uid={uid} cx={96} cy={104} r={30} />
    <PieEye cx={86} cy={98} r={10} px={2} py={1.5} />
    <PieEye cx={106} cy={98} r={10} px={-2} py={2} />
    <path d="M82 118 Q96 126 110 118" fill={C.ink} />
    <ellipse cx={72} cy={72} rx={10} ry={6} fill={C.high} opacity={0.25} />
    <ellipse cx={118} cy={88} rx={8} ry={5} fill={C.high} opacity={0.2} />
    <path d="M52 152 Q96 162 140 152" fill="none" stroke={C.high} strokeWidth={2.5} strokeLinecap="round" opacity={0.35} />
  </PortraitFrame>
);

const PoptartGeistPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <rect x={54} y={56} width={84} height={96} rx={8} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={3.5} />
    <rect x={60} y={62} width={72} height={84} rx={5} fill={C.boneDark} opacity={0.25} />
    <path d="M54 68 L138 68" stroke={C.ink} strokeWidth={2.5} />
    <path d="M54 140 L138 140" stroke={C.ink} strokeWidth={2.5} />
    <SkullHead uid={uid} cx={96} cy={104} r={28} />
    <PieEye cx={86} cy={98} r={9} px={2} py={1.5} />
    <PieEye cx={106} cy={98} r={9} px={-2} py={2} />
    <path d="M82 116 Q96 124 110 116" fill={C.ink} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={68 + i * 12} y={72} width={6} height={10} rx={2} fill={C.high} stroke={C.ink} strokeWidth={1.2} opacity={0.7} />
    ))}
    <path d="M96 56 L96 44" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
    <circle cx={96} cy={40} r={4} fill={C.high} stroke={C.ink} strokeWidth={2} />
  </PortraitFrame>
);

const CornFiendPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <ellipse cx={96} cy={118} rx={28} ry={52} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={3.5} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <ellipse key={i} cx={96} cy={78 + i * 12} rx={22 - i * 1.5} ry={6} fill={C.boneMid} stroke={C.ink} strokeWidth={1.5} />
    ))}
    <SkullHead uid={uid} cx={96} cy={72} r={30} />
    <PieEye cx={86} cy={66} r={10} px={2} py={1.5} angry />
    <PieEye cx={106} cy={66} r={10} px={-2} py={2} />
    <path d="M82 82 Q96 90 110 82" fill={C.ink} />
    <path d="M96 36 L96 24" stroke={C.shade} strokeWidth={5} strokeLinecap="round" />
    <path d="M96 36 L96 24" stroke={C.boneMid} strokeWidth={3} strokeLinecap="round" />
    <ellipse cx={96} cy={22} rx={8} ry={4} fill={C.boneDark} stroke={C.ink} strokeWidth={2} />
  </PortraitFrame>
);

const RamenLichPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <path d="M58 56 L68 44 L124 44 L134 56 L134 148 L58 148 Z" fill={C.shade} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M68 44 L78 36 L114 36 L124 44" fill={C.high} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
    <ellipse cx={96} cy={108} rx={34} ry={28} fill={C.dim} opacity={0.45} />
    <SkullHead uid={uid} cx={96} cy={96} r={28} />
    <PieEye cx={86} cy={90} r={9} px={2} py={1.5} />
    <PieEye cx={106} cy={90} r={9} px={-2} py={2} />
    <path d="M82 106 Q96 114 110 106" fill={C.ink} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <path key={i} d={`M${72 + i * 8} 120 Q${76 + i * 8} ${132 + (i % 2) * 6} ${80 + i * 8} 144`} fill="none" stroke={C.high} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
    ))}
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={108 + i * 4} cy={68 + i * 6} r={2.5 + i * 0.5} fill={C.high} opacity={0.3 - i * 0.08} />
    ))}
  </PortraitFrame>
);

const PretzelWraithPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <path d="M56 108 C56 72 88 56 96 72 C104 56 136 72 136 108 C136 132 120 148 96 148 C72 148 56 132 56 108 Z" fill="none" stroke={C.boneMid} strokeWidth={14} strokeLinecap="round" />
    <path d="M56 108 C56 72 88 56 96 72 C104 56 136 72 136 108 C136 132 120 148 96 148 C72 148 56 132 56 108 Z" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <SkullHead uid={uid} cx={96} cy={108} r={28} />
    <PieEye cx={86} cy={102} r={9} px={2} py={1.5} />
    <PieEye cx={106} cy={102} r={9} px={-2} py={2} />
    <path d="M82 118 Q96 126 110 118" fill={C.ink} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={68 + i * 14} cy={88 + (i % 2) * 8} r={2} fill={C.high} stroke={C.ink} strokeWidth={1} />
    ))}
  </PortraitFrame>
);

const WaffleGeistPortrait: P = ({ uid }) => (
  <PortraitFrame uid={uid}>
    <rect x={48} y={52} width={96} height={96} rx={10} fill={`url(#${uid}-bone)`} stroke={C.ink} strokeWidth={3.5} />
    {[0, 1, 2].map((row) =>
      [0, 1, 2].map((col) => (
        <rect key={`${row}-${col}`} x={56 + col * 28} y={60 + row * 28} width={22} height={22} rx={3} fill={C.boneDark} stroke={C.ink} strokeWidth={1.5} opacity={0.45} />
      )),
    )}
    <SkullHead uid={uid} cx={96} cy={100} r={26} />
    <PieEye cx={87} cy={94} r={8} px={2} py={1.5} />
    <PieEye cx={105} cy={94} r={8} px={-2} py={2} />
    <path d="M84 110 Q96 118 108 110" fill={C.ink} />
    <path d="M48 148 Q96 158 144 148" fill={C.shade} opacity={0.5} />
    <ellipse cx={96} cy={152} rx={40} ry={6} fill={C.high} opacity={0.2} />
  </PortraitFrame>
);

export const PLAYER_PORTRAITS: Record<PlayerAvatarId, P> = {
  skullmic: SkullMickeyPortrait,
  skullbunny: SkullBunnyPortrait,
  gaperskull: GaperSkullPortrait,
  wormface: WormFacePortrait,
  sporkfiend: SporkFiendPortrait,
  slurpghoul: SlurpGhoulPortrait,
  nachomancer: NachomancerPortrait,
  burgerlich: BurgerLichPortrait,
  frywraith: FryWraithPortrait,
  milkspecter: MilkSpecterPortrait,
  pizzoid: PizzoidPortrait,
  sodasnarl: SodaSnarlPortrait,
  donutcreep: DonutCreepPortrait,
  hotdogwraith: HotdogWraithPortrait,
  jellophant: JellophantPortrait,
  poptartgeist: PoptartGeistPortrait,
  cornfiend: CornFiendPortrait,
  ramenlich: RamenLichPortrait,
  pretzelwraith: PretzelWraithPortrait,
  wafflegeist: WaffleGeistPortrait,
};

export { ART_VIEW as PORTRAIT_VIEW };

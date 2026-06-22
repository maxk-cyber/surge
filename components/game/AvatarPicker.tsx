"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TiltCard } from "@/components/ui/TiltCard";
import { FighterCard, FighterThumb } from "@/components/game/FighterCard";
import {
  PLAYER_AVATARS,
  getStoredAvatarId,
  setStoredAvatarId,
  type PlayerAvatarId,
} from "@/lib/avatars";
import { useCallback, useMemo, useState as useReactState } from "react";

const CARD_W = 272;
const CARD_H = 460;

const SLOT: Record<
  number,
  { x: number; y: number; rotate: number; scale: number; opacity: number; z: number }
> = {
  [-2]: { x: -195, y: 38, rotate: -24, scale: 0.6, opacity: 0.52, z: 1 },
  [-1]: { x: -112, y: 14, rotate: -12, scale: 0.77, opacity: 0.78, z: 2 },
  [0]: { x: 0, y: -2, rotate: 0, scale: 1, opacity: 1, z: 5 },
  [1]: { x: 112, y: 14, rotate: 12, scale: 0.77, opacity: 0.78, z: 2 },
  [2]: { x: 195, y: 38, rotate: 24, scale: 0.6, opacity: 0.52, z: 1 },
};
const OFFSCREEN_L = { x: -420, y: 80, rotate: -40, scale: 0.4, opacity: 0, z: 0 };
const OFFSCREEN_R = { x: 420, y: 80, rotate: 40, scale: 0.4, opacity: 0, z: 0 };

function slotFor(itemIdx: number, selectedIdx: number, total: number) {
  let d = itemIdx - selectedIdx;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

function slotStyle(slot: number) {
  if (slot in SLOT) return SLOT[slot]!;
  return slot < 0 ? OFFSCREEN_L : OFFSCREEN_R;
}

function FighterDeck({
  items,
  selectedIndex,
  onSelectIndex,
}: {
  items: React.ReactNode[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}) {
  const [dealt, setDealt] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDealt(true), 60);
    return () => clearTimeout(t);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="relative mx-auto w-full" style={{ height: CARD_H + 80 }}>
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: CARD_W * 1.55,
          height: CARD_H * 1.25,
          marginTop: -(CARD_H * 1.25) / 2,
          marginLeft: -(CARD_W * 1.55) / 2,
          zIndex: 3,
          pointerEvents: "none",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 46%, transparent 70%)",
          filter: "blur(34px)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />

      {items.map((item, itemIndex) => {
        const slot = slotFor(itemIndex, selectedIndex, items.length);
        const st = slotStyle(slot);
        const isActive = slot === 0;
        const isVisible = slot >= -2 && slot <= 2;
        const dealDelay = Math.abs(slot) * 0.07;

        return (
          <motion.div
            key={itemIndex}
            initial={{
              x: st.x,
              y: CARD_H + 120,
              rotate: st.rotate * 1.8,
              scale: 0.3,
              opacity: 0,
            }}
            animate={
              dealt
                ? {
                    x: st.x,
                    y: st.y,
                    rotate: st.rotate,
                    scale: st.scale,
                    opacity: st.opacity,
                  }
                : {
                    x: st.x,
                    y: CARD_H + 120,
                    rotate: st.rotate * 1.8,
                    scale: 0.3,
                    opacity: 0,
                  }
            }
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: dealt ? 0 : dealDelay,
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -CARD_H / 2,
              marginLeft: -CARD_W / 2,
              width: CARD_W,
              height: CARD_H,
              zIndex: isActive ? 10 : st.z,
              pointerEvents: isVisible ? "auto" : "none",
              transformOrigin: "bottom center",
            }}
            whileHover={
              !isActive && isVisible
                ? {
                    y: st.y - 22,
                    scale: st.scale + 0.05,
                    zIndex: 4,
                    transition: { type: "spring", stiffness: 340, damping: 22 },
                  }
                : undefined
            }
            onClick={!isActive && isVisible ? () => onSelectIndex(itemIndex) : undefined}
          >
            <TiltCard className="h-full w-full">
              <div className="h-full w-full">{item}</div>
            </TiltCard>
          </motion.div>
        );
      })}
    </div>
  );
}

export function AvatarPicker() {
  const [selected, setSelected] = useReactState<PlayerAvatarId>("skullmic");
  const [activeIndex, setActiveIndex] = useReactState(0);

  useEffect(() => {
    const id = getStoredAvatarId();
    setSelected(id);
    const idx = PLAYER_AVATARS.findIndex((a) => a.id === id);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [setSelected, setActiveIndex]);

  const pickByIndex = useCallback(
    (index: number) => {
      const avatar = PLAYER_AVATARS[index];
      if (!avatar) return;
      setSelected(avatar.id);
      setStoredAvatarId(avatar.id);
      setActiveIndex(index);
    },
    [setSelected, setActiveIndex],
  );

  const cards = useMemo(
    () => PLAYER_AVATARS.map((avatar) => <FighterCard key={avatar.id} avatar={avatar} />),
    [],
  );

  const active = PLAYER_AVATARS[activeIndex] ?? PLAYER_AVATARS[0]!;

  return (
    <div className="relative z-10 w-full max-w-lg">
      <div className="mb-3 flex items-center justify-center gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-accent">Fighter cards</p>
        <span className="rounded-full border border-foreground/20 bg-black/40 px-2.5 py-0.5 font-body text-[9px] uppercase tracking-widest text-secondary">
          {PLAYER_AVATARS.length} fighters
        </span>
      </div>
      <p className="mb-2 text-center font-body text-[10px] uppercase tracking-widest text-secondary/80">
        Tap side cards to browse · thumbnails below to jump
      </p>

      <FighterDeck items={cards} selectedIndex={activeIndex} onSelectIndex={pickByIndex} />

      <div className="mx-auto mt-4 max-w-md">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {PLAYER_AVATARS.map((avatar, idx) => (
            <FighterThumb
              key={avatar.id}
              avatar={avatar}
              active={avatar.id === selected}
              onClick={() => pickByIndex(idx)}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-center font-display text-base text-foreground">{active.label}</p>
      <p className="text-center font-body text-xs text-secondary/80">{active.tagline}</p>
    </div>
  );
}

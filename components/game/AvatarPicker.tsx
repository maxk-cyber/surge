"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TiltCard } from "@/components/ui/TiltCard";
import { FighterCard, FighterThumb } from "@/components/game/FighterCard";
import { MagneticButton } from "@/components/ui/reactbits-effects";
import {
  PLAYER_AVATARS,
  getStoredAvatarId,
  setStoredAvatarId,
  type AvatarDef,
  type PlayerAvatarId,
} from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { cycleIndex } from "@/lib/iterator";
import {
  createCardSummary,
  filterFighters,
  type FighterFilter,
  type MotionLevel,
  type VibeModeId,
  VIBE_MODES,
} from "@/lib/showroom";

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
  fighters,
  selectedIndex,
  onSelectIndex,
  favorites,
  accent,
  motionLevel,
}: {
  fighters: AvatarDef[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  favorites: PlayerAvatarId[];
  accent: string;
  motionLevel: MotionLevel;
}) {
  const [dealt, setDealt] = useState(false);
  const reducedMotion = useReducedMotion();
  const calm = reducedMotion || motionLevel === "calm";

  useEffect(() => {
    const t = setTimeout(() => setDealt(true), 60);
    return () => clearTimeout(t);
  }, []);

  if (fighters.length === 0) return null;

  return (
    <div className="relative mx-auto w-full max-w-[min(100vw-2rem,560px)]" style={{ height: CARD_H + 80 }}>
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
        animate={calm ? { scale: 1, opacity: 0.5 } : { scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ repeat: calm ? 0 : Infinity, duration: 3, ease: "easeInOut" }}
      />

      {fighters.map((fighter, itemIndex) => {
        const slot = slotFor(itemIndex, selectedIndex, fighters.length);
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
              type: calm ? "tween" : "spring",
              stiffness: 260,
              damping: 20,
              duration: calm ? 0 : undefined,
              delay: calm || dealt ? 0 : dealDelay,
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
              !calm && !isActive && isVisible
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
              <div className="h-full w-full">
                <FighterCard
                  avatar={fighter}
                  favorite={favorites.includes(fighter.id)}
                  accent={accent}
                />
              </div>
            </TiltCard>
          </motion.div>
        );
      })}
    </div>
  );
}

export function AvatarPicker({
  vibe = "arcade",
  motionLevel = "showtime",
  filter = "all",
  favorites = [],
  onToggleFavorite,
  selectedId,
  onSelectedChange,
}: {
  vibe?: VibeModeId;
  motionLevel?: MotionLevel;
  filter?: FighterFilter;
  favorites?: PlayerAvatarId[];
  onToggleFavorite?: (id: PlayerAvatarId) => void;
  selectedId?: PlayerAvatarId;
  onSelectedChange?: (id: PlayerAvatarId) => void;
}) {
  const [selected, setSelected] = useState<PlayerAvatarId>(selectedId ?? "skullmic");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const vibeMode = VIBE_MODES[vibe];

  const fighters = useMemo(
    () => filterFighters(PLAYER_AVATARS, filter, favorites),
    [favorites, filter],
  );

  useEffect(() => {
    const id = selectedId ?? getStoredAvatarId();
    setSelected(id);
    const idx = fighters.findIndex((a) => a.id === id);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [fighters, selectedId]);

  useEffect(() => {
    setActiveIndex((current) => cycleIndex(current, fighters.length));
  }, [fighters.length]);

  const pickByIndex = useCallback(
    (index: number) => {
      const avatar = fighters[cycleIndex(index, fighters.length)];
      if (!avatar) return;
      setSelected(avatar.id);
      setStoredAvatarId(avatar.id);
      onSelectedChange?.(avatar.id);
      setActiveIndex(cycleIndex(index, fighters.length));
    },
    [fighters, onSelectedChange],
  );

  const next = useCallback(() => pickByIndex(activeIndex + 1), [activeIndex, pickByIndex]);
  const previous = useCallback(() => pickByIndex(activeIndex - 1), [activeIndex, pickByIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
      if (event.key.toLowerCase() === "f") {
        const active = fighters[activeIndex];
        if (active) onToggleFavorite?.(active.id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, fighters, next, onToggleFavorite, previous]);

  const active = fighters[activeIndex] ?? fighters[0];
  const activeMeta = active ? FIGHTER_CARD_META[active.id] : null;

  const copyActive = async () => {
    if (!active || !activeMeta) return;
    const text = createCardSummary(active);
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-4xl">
      <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-accent">Draft deck</p>
        <span className="rounded-full border border-foreground/20 bg-black/40 px-2.5 py-0.5 font-body text-[9px] uppercase tracking-widest text-secondary">
          {fighters.length} shown / {PLAYER_AVATARS.length} fighters
        </span>
        {filter !== "all" && (
          <span className="rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-0.5 font-body text-[9px] uppercase tracking-widest text-secondary">
            Filter: {filter}
          </span>
        )}
      </div>
      <p className="mb-2 text-center font-body text-[10px] uppercase tracking-widest text-secondary/80">
        Tap side cards, use arrow keys, or press F to favorite
      </p>

      {active ? (
        <>
          <FighterDeck
            fighters={fighters}
            selectedIndex={activeIndex}
            onSelectIndex={pickByIndex}
            favorites={favorites}
            accent={vibeMode.accent}
            motionLevel={motionLevel}
          />

          <div className="mx-auto mt-3 flex max-w-md flex-wrap items-center justify-center gap-2">
            <MagneticButton onClick={previous} aria-label="Previous fighter">
              Prev
            </MagneticButton>
            <MagneticButton
              onClick={() => onToggleFavorite?.(active.id)}
              className={favorites.includes(active.id) ? "border-white/50 bg-white/20 text-white" : ""}
              aria-label={`${favorites.includes(active.id) ? "Remove" : "Add"} ${active.label} favorite`}
            >
              {favorites.includes(active.id) ? "Favorited" : "Favorite"}
            </MagneticButton>
            <MagneticButton onClick={copyActive} aria-label={`Copy ${active.label} card summary`}>
              {copied ? "Copied" : "Copy card"}
            </MagneticButton>
            <MagneticButton onClick={next} aria-label="Next fighter">
              Next
            </MagneticButton>
          </div>

          <div className="mx-auto mt-4 max-w-2xl">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {fighters.map((avatar, idx) => (
                <FighterThumb
                  key={avatar.id}
                  avatar={avatar}
                  active={avatar.id === active.id || avatar.id === selected}
                  onClick={() => pickByIndex(idx)}
                />
              ))}
            </div>
          </div>

          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/10 bg-black/35 p-4 text-center shadow-inner">
            <p className="font-display text-xl uppercase tracking-[0.12em] text-foreground">
              {active.label}
            </p>
            <p className="mt-1 font-body text-xs text-secondary/80">{active.tagline}</p>
            {activeMeta && (
              <dl className="mt-4 grid grid-cols-4 gap-2 font-body text-[10px] uppercase tracking-wider text-secondary">
                {[
                  ["HP", activeMeta.hp],
                  ["ATK", activeMeta.atk],
                  ["SPD", activeMeta.spd],
                  ["WRD", activeMeta.weird],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
                    <dt>{label}</dt>
                    <dd className="mt-1 text-base text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 text-center">
          <p className="font-display text-2xl uppercase tracking-[0.12em] text-foreground">
            No fighters in this tray
          </p>
          <p className="mt-3 font-body text-sm text-secondary">
            Add favorites or switch filters to bring the cafeteria monsters back.
          </p>
        </div>
      )}
    </div>
  );
}

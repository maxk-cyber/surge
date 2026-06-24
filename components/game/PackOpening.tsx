"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FighterPortrait } from "@/components/ui/FighterPortrait";
import {
  MagneticButton,
  ShinyText,
  SpotlightCard,
  StarBorder,
} from "@/components/ui/reactbits-effects";
import { PLAYER_AVATARS, type PlayerAvatarId } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { useIterator } from "@/lib/iterator";
import {
  PACK_STORAGE_KEY,
  PACK_VIBES,
  formatPackShare,
  getRevealProgress,
  isPackVibe,
  makePackLineup,
  type PackVibeId,
} from "@/lib/pack-opening";
import type { MotionLevel, VibeModeId } from "@/lib/showroom";
import { VIBE_MODES } from "@/lib/showroom";
import { cn } from "@/lib/utils";

const rarityLabel = {
  common: "Common",
  rare: "Rare",
  legend: "Legend",
} as const;

export function PackOpening({
  vibe = "arcade",
  motionLevel = "showtime",
  favorites = [],
  onToggleFavorite,
}: {
  vibe?: VibeModeId;
  motionLevel?: MotionLevel;
  favorites?: PlayerAvatarId[];
  onToggleFavorite?: (id: PlayerAvatarId) => void;
}) {
  const [packVibe, setPackVibe] = useState<PackVibeId>("haunt");
  const [packSeed, setPackSeed] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const reducedMotion = useReducedMotion();
  const calm = reducedMotion || motionLevel === "calm";
  const vibeMode = VIBE_MODES[vibe];
  const packMode = PACK_VIBES[packVibe];
  const lineup = useMemo(() => makePackLineup(PLAYER_AVATARS, packVibe, packSeed), [packSeed, packVibe]);
  const revealedCards = useMemo(() => lineup.slice(0, revealedCount), [lineup, revealedCount]);
  const progress = getRevealProgress(revealedCount, lineup.length);
  const active = useIterator({
    items: revealedCards,
    autoAdvanceMs: !calm && revealedCards.length > 1 ? 2600 : undefined,
    enabled: !calm && revealedCards.length > 1,
  });
  const activeCard = active.activeItem ?? revealedCards.at(-1);
  const activeMeta = activeCard ? FIGHTER_CARD_META[activeCard.id] : null;

  useEffect(() => {
    const stored = localStorage.getItem(PACK_STORAGE_KEY);
    if (isPackVibe(stored)) setPackVibe(stored);
  }, []);

  useEffect(() => {
    active.goTo(Math.max(0, revealedCards.length - 1));
  }, [active.goTo, revealedCards.length]);

  const choosePackVibe = (nextVibe: PackVibeId) => {
    setPackVibe(nextVibe);
    setRevealedCount(0);
    localStorage.setItem(PACK_STORAGE_KEY, nextVibe);
  };

  const openFreshPack = () => {
    setPackSeed((current) => current + 1);
    setRevealedCount(0);
    setCopied(false);
  };

  const revealNext = () => {
    setRevealedCount((current) => {
      const nextCount = Math.min(lineup.length, current + 1);
      active.goTo(Math.max(0, nextCount - 1));
      return nextCount;
    });
  };

  const revealAll = () => {
    setRevealedCount(lineup.length);
    active.goTo(Math.max(0, lineup.length - 1));
  };

  const copyLineup = async () => {
    if (revealedCards.length === 0) return;
    try {
      await navigator.clipboard?.writeText(formatPackShare(revealedCards));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
      <StarBorder color={packMode.accent} motion={motionLevel}>
        <div className="relative min-h-[520px] overflow-hidden rounded-[calc(2rem-1px)] border border-white/10 p-5">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background: `radial-gradient(circle at 50% 12%, ${packMode.accent}33, transparent 44%), linear-gradient(145deg, ${vibeMode.glow}2e, transparent 48%)`,
            }}
          />
          <div className="absolute inset-x-6 top-8 h-48 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex h-full min-h-[480px] flex-col justify-between">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                Pack ritual
              </p>
              <h3 className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.1em] text-foreground md:text-5xl">
                <ShinyText>{packMode.label}</ShinyText>
              </h3>
              <p className="mt-4 max-w-sm font-body text-xs leading-6 text-secondary/90">
                {packMode.description} The last slot is staged as the rare-reveal beat, borrowing the
                anticipation curve from modern digital pack openings.
              </p>
            </div>

            <motion.div
              className="mx-auto my-8 w-full max-w-[280px]"
              animate={
                calm
                  ? { y: 0, rotate: 0 }
                  : { y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] }
              }
              transition={{ duration: 4.2, repeat: calm ? 0 : Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              <div className="relative aspect-[0.72] overflow-hidden rounded-[2rem] border border-white/25 bg-black shadow-[0_26px_70px_rgba(0,0,0,0.58)]">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${packMode.accent}44, transparent 38%), radial-gradient(circle at 50% 22%, ${vibeMode.glow}55, transparent 58%)`,
                  }}
                />
                <div className="absolute inset-5 rounded-[1.45rem] border border-white/20 bg-black/35" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/20" />
                <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/[0.08] blur-[1px]" />
                <div className="absolute inset-x-6 bottom-8 rounded-2xl border border-white/15 bg-black/55 p-4 text-center">
                  <p className="font-body text-[9px] uppercase tracking-[0.32em] text-secondary">
                    Snack Surge
                  </p>
                  <p className="mt-2 font-display text-3xl uppercase tracking-[0.12em] text-white">
                    Pack
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 font-body text-[10px] uppercase tracking-[0.2em] text-secondary">
                  <span>{revealedCount} revealed / {lineup.length}</span>
                  <span>{progress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Pack reveal progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-2 overflow-hidden rounded-full bg-white/10"
                >
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${packMode.accent}, #ffffff)`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PACK_VIBES) as PackVibeId[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-label={`${PACK_VIBES[mode].label} pack`}
                    onClick={() => choosePackVibe(mode)}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-left font-body text-[9px] uppercase tracking-[0.18em] outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                      packVibe === mode
                        ? "border-white/55 bg-white/15 text-white"
                        : "border-white/10 bg-white/[0.04] text-secondary hover:border-white/30",
                    )}
                  >
                    {PACK_VIBES[mode].shortLabel}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <MagneticButton onClick={revealNext} disabled={revealedCount >= lineup.length}>
                  {revealedCount === 0 ? "Rip pack" : "Reveal next"}
                </MagneticButton>
                <MagneticButton onClick={revealAll} disabled={revealedCount >= lineup.length}>
                  Reveal all
                </MagneticButton>
                <MagneticButton onClick={openFreshPack}>New pack</MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </StarBorder>

      <SpotlightCard className="p-4 md:p-5" spotlightColor={`${packMode.accent}24`}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                Reveal board
              </p>
              <h3 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] text-foreground md:text-4xl">
                Chase the final foil
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <MagneticButton onClick={active.previous} disabled={revealedCards.length <= 1} aria-label="Previous revealed card">
                Prev card
              </MagneticButton>
              <MagneticButton onClick={active.next} disabled={revealedCards.length <= 1} aria-label="Next revealed card">
                Next card
              </MagneticButton>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-5">
            {lineup.map((fighter, index) => {
              const meta = FIGHTER_CARD_META[fighter.id];
              const revealed = index < revealedCount;
              const selected = activeCard?.id === fighter.id;
              return (
                <button
                  key={`${fighter.id}-${index}`}
                  type="button"
                  disabled={!revealed}
                  onClick={() => active.goTo(index)}
                  aria-label={revealed ? `Inspect ${fighter.label}` : `Hidden card slot ${index + 1}`}
                  className={cn(
                    "group min-h-44 rounded-2xl border p-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                    revealed
                      ? "border-white/15 bg-black/45 hover:border-white/35"
                      : "border-white/10 bg-white/[0.035]",
                    selected && "border-white/55 bg-white/[0.09]",
                    index === lineup.length - 1 && "shadow-[0_0_40px_rgba(255,255,255,0.08)]",
                  )}
                >
                  <div className="flex h-full flex-col items-center justify-between gap-2 text-center">
                    {revealed ? (
                      <>
                        <FighterPortrait id={fighter.id} size={92} label={`${fighter.label} pack pull`} />
                        <div>
                          <p className="font-display text-sm uppercase tracking-[0.08em] text-white">
                            {fighter.label}
                          </p>
                          <p
                            className="mt-1 font-body text-[9px] uppercase tracking-[0.2em]"
                            style={{ color: meta.rarity === "common" ? undefined : packMode.accent }}
                          >
                            {rarityLabel[meta.rarity]}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mt-5 flex h-24 w-20 items-center justify-center rounded-xl border border-white/10 bg-black/60 font-display text-2xl text-secondary">
                          ??
                        </div>
                        <p className="font-body text-[9px] uppercase tracking-[0.22em] text-secondary">
                          Slot {index + 1}
                        </p>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/35 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-secondary">
                Active pull
              </p>
              {activeCard && activeMeta ? (
                <>
                  <h4 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
                    {activeCard.label}
                  </h4>
                  <p className="mt-1 font-body text-xs leading-6 text-secondary/85">
                    {activeMeta.flavor} <span className="text-foreground/80">#{activeMeta.number}</span>
                  </p>
                </>
              ) : (
                <p className="mt-2 font-body text-sm text-secondary">
                  Rip the pack to start revealing your cafeteria cryptids.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <MagneticButton
                onClick={() => activeCard && onToggleFavorite?.(activeCard.id)}
                disabled={!activeCard}
                className={activeCard && favorites.includes(activeCard.id) ? "border-white/50 bg-white/20" : ""}
                aria-label={
                  activeCard
                    ? `${favorites.includes(activeCard.id) ? "Remove" : "Add"} ${activeCard.label} favorite`
                    : "Favorite active pull"
                }
              >
                {activeCard && favorites.includes(activeCard.id) ? "Favorited" : "Favorite pull"}
              </MagneticButton>
              <MagneticButton onClick={copyLineup} disabled={revealedCards.length === 0}>
                {copied ? "Copied" : "Copy pulls"}
              </MagneticButton>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FighterPortrait } from "@/components/ui/FighterPortrait";
import {
  MagneticButton,
  PlasmaWaveBackdrop,
  RibbonBadge,
  ShinyText,
  SpotlightCard,
} from "@/components/ui/reactbits-effects";
import {
  buildPackPulls,
  formatPackShareText,
  isPackLaneId,
  PACK_LANE_IDS,
  PACK_LANES,
  PACK_RITUAL_STORAGE_KEY,
  summarizePackPulls,
  type PackLaneId,
} from "@/lib/pack-ritual";
import type { MotionLevel } from "@/lib/showroom";
import type { PlayerAvatarId } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const rarityTone = {
  common: "text-zinc-200",
  rare: "text-cyan-100",
  legend: "text-amber-100",
} as const;

export function PackRitual({
  motionLevel = "showtime",
  favorites = [],
  onToggleFavorite,
}: {
  motionLevel?: MotionLevel;
  favorites?: PlayerAvatarId[];
  onToggleFavorite?: (id: PlayerAvatarId) => void;
}) {
  const [laneId, setLaneId] = useState<PackLaneId>("haunted");
  const [drawIndex, setDrawIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const reducedMotion = useReducedMotion();
  const calm = reducedMotion || motionLevel === "calm";

  const lane = PACK_LANES[laneId];
  const pulls = useMemo(() => buildPackPulls({ laneId, drawIndex }), [drawIndex, laneId]);
  const summary = useMemo(() => summarizePackPulls(pulls), [pulls]);
  const revealedCount = revealed ? pulls.length : 0;

  useEffect(() => {
    const stored = localStorage.getItem(PACK_RITUAL_STORAGE_KEY);
    if (isPackLaneId(stored)) setLaneId(stored);
  }, []);

  const chooseLane = (nextLaneId: PackLaneId) => {
    setLaneId(nextLaneId);
    setRevealed(false);
    setCopied(false);
    localStorage.setItem(PACK_RITUAL_STORAGE_KEY, nextLaneId);
  };

  const openPack = useCallback(() => {
    setRevealed(true);
    setCopied(false);
  }, []);

  const nextPack = useCallback(() => {
    setDrawIndex((current) => current + 1);
    setRevealed(false);
    setCopied(false);
  }, []);

  const copyPulls = async () => {
    try {
      await navigator.clipboard?.writeText(formatPackShareText(laneId, pulls));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key.toLowerCase() !== "r") return;
    event.preventDefault();
    if (revealed) {
      nextPack();
    } else {
      openPack();
    }
  };

  return (
    <section
      id="pack"
      className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-8"
      aria-labelledby="pack-ritual-title"
    >
      <div
        role="group"
        tabIndex={0}
        aria-label="Pack ritual controls"
        onKeyDown={onKeyDown}
        className="outline-none focus-visible:rounded-[2rem] focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
              ReactBits PlasmaWave · Skill v1 pack ritual
            </p>
            <h2
              id="pack-ritual-title"
              className="mt-2 max-w-4xl font-display text-3xl uppercase tracking-[0.1em] text-foreground md:text-5xl"
            >
              Open a contraband cafeteria pack
            </h2>
          </div>
          <p className="max-w-md font-body text-xs leading-6 text-secondary">
            Pick a lane, reveal a deterministic five-card pull window, favorite standouts, and copy the
            haul. Focus this panel and press R to reveal or reshuffle.
          </p>
        </div>

        <SpotlightCard
          className="relative overflow-hidden p-4 md:p-6"
          spotlightColor={`${lane.glow}22`}
        >
          <PlasmaWaveBackdrop accent={lane.accent} glow={lane.glow} motion={motionLevel} />
          <div className="relative grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="flex min-h-[540px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div>
                <RibbonBadge
                  accent={lane.accent}
                  motion={motionLevel}
                  className="font-body text-[10px] uppercase tracking-[0.22em] text-foreground"
                >
                  {revealed ? "Pack opened" : "Sealed pull"}
                </RibbonBadge>
                <p className="mt-7 font-body text-[10px] uppercase tracking-[0.32em] text-secondary">
                  {lane.eyebrow}
                </p>
                <h3 className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.12em] text-foreground md:text-5xl">
                  <ShinyText motion={motionLevel}>{lane.label}</ShinyText>
                </h3>
                <p className="mt-4 font-body text-sm leading-7 text-secondary/90">{lane.description}</p>
                <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 font-body text-xs leading-6 text-secondary">
                  {lane.promise}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <MagneticButton onClick={revealed ? nextPack : openPack}>
                    {revealed ? "Next pack" : "Open pack"}
                  </MagneticButton>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-black/35 px-3 py-2 font-body text-[9px] uppercase tracking-[0.16em] text-secondary">
                    Focus panel + R
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-4 grid grid-cols-3 gap-2" aria-label="Choose pack lane">
                  {PACK_LANE_IDS.map((id) => {
                    const item = PACK_LANES[id];
                    const active = id === laneId;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => chooseLane(id)}
                        className={cn(
                          "rounded-2xl border px-3 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                          active
                            ? "border-white/45 bg-white/15 text-foreground shadow-[0_0_28px_rgba(255,255,255,0.08)]"
                            : "border-white/10 bg-black/35 text-secondary hover:border-white/30 hover:text-foreground",
                        )}
                        aria-pressed={active}
                      >
                        <span className="block font-body text-[9px] uppercase tracking-[0.18em]">
                          {item.shortLabel}
                        </span>
                        <span
                          className="mt-2 block h-1 rounded-full"
                          style={{ background: item.accent }}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/35 p-3 text-center font-body text-[10px] uppercase tracking-[0.16em] text-secondary">
                  <div>
                    <span className="block text-lg text-foreground">{summary.legend}</span>
                    Legends
                  </div>
                  <div>
                    <span className="block text-lg text-foreground">{summary.rare}</span>
                    Rares
                  </div>
                  <div>
                    <span className="block text-lg text-foreground">
                      {summary.total ? Math.round(summary.averageWeird / summary.total) : 0}
                    </span>
                    Avg weird
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/45 p-4 md:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                    Reveal progress
                  </p>
                  <p className="mt-1 font-display text-2xl uppercase tracking-[0.1em] text-foreground">
                    {revealedCount} / {pulls.length} pulls visible
                  </p>
                </div>
                <p className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-body text-[10px] uppercase tracking-[0.18em] text-secondary">
                  Window #{drawIndex + 1}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {pulls.map((pull, index) => {
                  const isFavorite = favorites.includes(pull.avatar.id);
                  const delay = calm ? 0 : index * 0.07;
                  return (
                    <motion.div
                      key={`${pull.avatar.id}-${pull.poolIndex}-${drawIndex}`}
                      initial={{ opacity: 0, y: calm ? 0 : 18, rotateX: calm ? 0 : -10 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ duration: calm ? 0 : 0.38, delay, ease: "easeOut" }}
                      className={cn(
                        "relative min-h-[268px] overflow-hidden rounded-3xl border p-3",
                        revealed
                          ? "border-white/15 bg-white/[0.065]"
                          : "pack-card-back border-white/10 bg-black/50",
                      )}
                      style={{ ["--pack-accent" as string]: lane.accent }}
                    >
                      {revealed ? (
                        <div className="flex h-full flex-col">
                          <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/55">
                            <div
                              className="absolute inset-0 opacity-60"
                              style={{
                                background: `radial-gradient(circle at 50% 22%, ${lane.glow}45, transparent 58%)`,
                              }}
                              aria-hidden="true"
                            />
                            <FighterPortrait
                              id={pull.avatar.id}
                              size={118}
                              label={`${pull.avatar.label} pack pull`}
                              className="relative z-10 drop-shadow-[0_14px_30px_rgba(0,0,0,0.75)]"
                            />
                          </div>
                          <div className="mt-3 flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display text-base uppercase tracking-[0.08em] text-foreground">
                                {pull.avatar.label}
                              </p>
                              <p className="mt-1 font-body text-[9px] uppercase tracking-[0.18em] text-secondary">
                                #{pull.meta.number} · {pull.meta.type}
                              </p>
                            </div>
                            {pull.featured && (
                              <span className="rounded-full border border-white/15 bg-white/[0.08] px-2 py-1 font-body text-[8px] uppercase tracking-widest text-foreground">
                                Hit
                              </span>
                            )}
                          </div>
                          <p className="mt-2 flex-1 font-body text-[10px] leading-5 text-secondary/85">
                            {pull.meta.flavor}
                          </p>
                          <button
                            type="button"
                            onClick={() => onToggleFavorite?.(pull.avatar.id)}
                            className={cn(
                              "mt-3 rounded-full border px-3 py-2 font-body text-[9px] uppercase tracking-[0.16em] outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                              isFavorite
                                ? "border-white/45 bg-white/20 text-foreground"
                                : "border-white/10 bg-black/40 text-secondary hover:border-white/30 hover:text-foreground",
                            )}
                            aria-label={`${isFavorite ? "Remove" : "Add"} ${pull.avatar.label} favorite from pack`}
                          >
                            {isFavorite ? "Saved" : "Save pull"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                          <div className="mb-5 h-20 w-20 rounded-full border border-white/15 bg-black/35 shadow-[inset_0_0_28px_rgba(255,255,255,0.08)]" />
                          <p className="font-body text-[10px] uppercase tracking-[0.24em] text-secondary">
                            Mystery slot {index + 1}
                          </p>
                          <p className="mt-3 max-w-[12rem] font-display text-xl uppercase tracking-[0.12em] text-foreground">
                            Sealed
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-body text-xs text-secondary" aria-live="polite">
                  {revealed && summary.topPull ? (
                    <>
                      Top weird pull:{" "}
                      <span className={rarityTone[summary.topPull.meta.rarity]}>
                        {summary.topPull.avatar.label}
                      </span>
                    </>
                  ) : (
                    "Five sealed cards are staged for a choreographed reveal."
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <MagneticButton onClick={revealed ? nextPack : openPack} aria-label={revealed ? "Shuffle next pack window" : "Open pack ritual"}>
                    {revealed ? "Next pack" : "Open pack"}
                  </MagneticButton>
                  <MagneticButton onClick={copyPulls} disabled={!revealed} aria-label="Copy pack pull summary">
                    {copied ? "Copied" : "Copy pulls"}
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}

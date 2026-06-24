"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { FighterPortrait } from "@/components/ui/FighterPortrait";
import {
  AnimatedReveal,
  MagneticButton,
  RibbonField,
  ShinyText,
  SpotlightCard,
  StarBorder,
} from "@/components/ui/reactbits-effects";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { useIterator, windowAroundIndex } from "@/lib/iterator";
import {
  buildPackPulls,
  formatPackManifest,
  getPackRevealProgress,
  isPackLane,
  PACK_LANES,
  PACK_THEATER_STORAGE_KEYS,
  toggleReveal,
  type PackLaneId,
} from "@/lib/pack-theater";
import { cn } from "@/lib/utils";
import type { MotionLevel, VibeModeId } from "@/lib/showroom";
import type { PlayerAvatarId } from "@/lib/avatars";

const laneIds = Object.keys(PACK_LANES) as PackLaneId[];

function rarityTone(rarity: "common" | "rare" | "legend") {
  if (rarity === "legend") return "from-amber-200 via-white to-fuchsia-300";
  if (rarity === "rare") return "from-cyan-200 via-white to-violet-300";
  return "from-zinc-300 via-white to-zinc-500";
}

export function PackTheater({
  vibe,
  motionLevel,
  favorites,
  onToggleFavorite,
}: {
  vibe: VibeModeId;
  motionLevel: MotionLevel;
  favorites: PlayerAvatarId[];
  onToggleFavorite?: (id: PlayerAvatarId) => void;
}) {
  const [lane, setLane] = useState<PackLaneId>("lunchline");
  const [seed, setSeed] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const pulls = useMemo(() => buildPackPulls({ lane, seed }), [lane, seed]);
  const carousel = useIterator({ items: pulls, enabled: false });
  const { index: activeIndex, goTo, next, previous } = carousel;
  const activePull = pulls[activeIndex] ?? pulls[0];
  const activeMeta = activePull ? FIGHTER_CARD_META[activePull.id] : null;
  const progress = getPackRevealProgress(revealed, pulls.length);
  const laneConfig = PACK_LANES[lane];

  useEffect(() => {
    const storedLane = localStorage.getItem(PACK_THEATER_STORAGE_KEYS.lane);
    const storedSeed = Number.parseInt(localStorage.getItem(PACK_THEATER_STORAGE_KEYS.seed) ?? "", 10);
    setLane(isPackLane(storedLane) ? storedLane : "lunchline");
    setSeed(Number.isFinite(storedSeed) && storedSeed >= 0 ? storedSeed : 0);
  }, []);

  useEffect(() => {
    goTo(0);
    setRevealed([]);
    setCopied(false);
  }, [goTo, lane, seed]);

  const chooseLane = (nextLane: PackLaneId) => {
    setLane(nextLane);
    localStorage.setItem(PACK_THEATER_STORAGE_KEYS.lane, nextLane);
  };

  const newPack = useCallback(() => {
    setSeed((current) => {
      const next = current + 1;
      localStorage.setItem(PACK_THEATER_STORAGE_KEYS.seed, String(next));
      return next;
    });
  }, []);

  const revealIndex = useCallback(
    (index: number) => {
      setRevealed((current) => (current.includes(index) ? current : toggleReveal(current, index)));
    },
    [],
  );

  const revealActive = useCallback(() => {
    if (!activePull) return;
    revealIndex(activeIndex);
    if (revealed.includes(activeIndex)) {
      next();
    }
  }, [activeIndex, activePull, next, revealIndex, revealed]);

  const copyManifest = async () => {
    try {
      await navigator.clipboard?.writeText(formatPackManifest(lane, pulls));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        revealActive();
      }
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        newPack();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [newPack, revealActive]);

  return (
    <section
      id="pack"
      className="gallery-section relative z-10 mx-auto mt-20 w-full max-w-7xl px-5 md:px-8"
      aria-labelledby="pack-heading"
    >
      <AnimatedReveal motion={motionLevel}>
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
              Skill v1 pack theater · Iterator ritual
            </p>
            <h2 id="pack-heading" className="mt-2 font-display text-3xl uppercase tracking-[0.1em] md:text-5xl">
              <ShinyText motion={motionLevel}>Open the contraband foil</ShinyText>
            </h2>
          </div>
          <p className="max-w-xl font-body text-xs leading-6 text-secondary">
            Choose a drop lane, tear through five sealed pulls, favorite keepers, and copy a shareable
            manifest. Press <kbd className="rounded border border-white/15 px-1">P</kbd> to reveal or{" "}
            <kbd className="rounded border border-white/15 px-1">N</kbd> for a new pack.
          </p>
        </div>
      </AnimatedReveal>

      <StarBorder accent={laneConfig.glow} motion={motionLevel} innerClassName="overflow-hidden">
        <RibbonField accent={laneConfig.glow} glow={laneConfig.accent} motion={motionLevel} />
        <div className="relative grid gap-6 p-4 md:grid-cols-[0.78fr_1.22fr] md:p-6">
          <aside className="space-y-4">
            <SpotlightCard className="p-5" spotlightColor={`${laneConfig.glow}24`}>
              <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                Drop lane
              </p>
              <div className="mt-4 grid gap-2">
                {laneIds.map((id) => {
                  const item = PACK_LANES[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={lane === id}
                      onClick={() => chooseLane(id)}
                      className={cn(
                        "rounded-2xl border p-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                        lane === id
                          ? "border-white/45 bg-white/15 text-foreground"
                          : "border-white/10 bg-white/[0.04] text-secondary hover:border-white/30 hover:text-foreground",
                      )}
                    >
                      <span className="block font-body text-[10px] uppercase tracking-[0.22em]">
                        {item.label}
                      </span>
                      <span className="mt-1 block font-body text-[11px] leading-5 text-secondary/85">
                        {item.callout}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-5" spotlightColor={`${laneConfig.accent}1f`}>
              <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                Reveal progress
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-[width]"
                  style={{ width: `${progress.percent}%`, backgroundColor: laneConfig.accent }}
                />
              </div>
              <p className="mt-3 font-display text-3xl text-foreground">{progress.percent}%</p>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-secondary" aria-live="polite">
                {progress.complete ? "Pack ritual complete" : progress.label}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <MagneticButton onClick={newPack} aria-label="Open a new pack">
                  New pack
                </MagneticButton>
                <MagneticButton onClick={copyManifest} aria-label="Copy pack manifest">
                  {copied ? "Copied" : "Copy manifest"}
                </MagneticButton>
              </div>
            </SpotlightCard>
          </aside>

          <div className="relative min-h-[560px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/40 p-4 md:p-6">
            <div
              className="pointer-events-none absolute inset-y-0 left-[-30%] w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              aria-hidden="true"
            />
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 left-[-40%] w-1/2 bg-gradient-to-r from-transparent via-white/16 to-transparent",
                motionLevel === "showtime" && "animate-glass-scan",
              )}
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-5">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.3em] text-secondary">
                  {laneConfig.label} · Pack #{seed + 1}
                </p>
                <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-foreground md:text-4xl">
                  {activePull ? activePull.avatar.label : "No pull loaded"}
                </h3>
                <p className="mt-2 font-body text-xs leading-6 text-secondary">{laneConfig.description}</p>
              </div>

              <div className="relative mx-auto h-[350px] w-full max-w-[640px]" aria-label="Pack pull carousel">
                {windowAroundIndex(pulls, activeIndex, 2).map(({ item, index, distance }) => {
                  const meta = FIGHTER_CARD_META[item.id];
                  const isActive = distance === 0;
                  const isRevealed = revealed.includes(index);
                  const favorite = favorites.includes(item.id);
                  return (
                    <button
                      key={`${item.id}-${seed}`}
                      type="button"
                      onClick={() => goTo(index)}
                      className={cn(
                        "absolute left-1/2 top-1/2 w-[174px] -translate-x-1/2 -translate-y-1/2 rounded-[1.35rem] border p-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70 md:w-[210px]",
                        isActive
                          ? "border-white/55 bg-white/12 shadow-[0_22px_80px_rgba(0,0,0,0.55)]"
                          : "border-white/10 bg-white/[0.045] opacity-75 hover:border-white/30",
                        motionLevel === "showtime" && isActive && "animate-pack-float",
                      )}
                      style={
                        {
                          transform: `translate(-50%, -50%) translateX(${distance * 118}px) translateY(${Math.abs(distance) * 26}px) rotate(${distance * 8}deg) scale(${isActive ? 1 : 0.76})`,
                          zIndex: 10 - Math.abs(distance),
                          "--pack-rotate": `${distance * 8}deg`,
                        } as CSSProperties
                      }
                      aria-label={`${isRevealed ? "View" : "Select sealed"} ${item.avatar.label}`}
                      aria-pressed={isActive}
                    >
                      <div className="relative overflow-hidden rounded-[1rem] border border-white/10 bg-black">
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-70",
                            rarityTone(meta.rarity),
                          )}
                        />
                        <div className="relative flex h-[220px] items-center justify-center p-3">
                          {isRevealed ? (
                            <FighterPortrait
                              id={item.id}
                              size={172}
                              label={`${item.avatar.label} pack pull`}
                              className="drop-shadow-[0_14px_34px_rgba(0,0,0,0.85)]"
                            />
                          ) : (
                            <div className="grid h-36 w-28 place-items-center rounded-2xl border border-white/20 bg-black/65 text-center">
                              <span className="font-display text-4xl text-white/80">?</span>
                              <span className="font-body text-[9px] uppercase tracking-[0.22em] text-secondary">
                                sealed
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="relative border-t border-white/10 bg-black/70 p-3">
                          <p className="truncate font-display text-lg uppercase tracking-[0.1em] text-foreground">
                            {isRevealed ? item.avatar.label : `Pull ${item.laneRank}`}
                          </p>
                          <p className="mt-1 font-body text-[9px] uppercase tracking-[0.18em] text-secondary">
                            {isRevealed ? `${meta.rarity} · ${item.signature}` : "Tap to stage"}
                          </p>
                          {favorite && isRevealed && (
                            <span className="mt-2 inline-block rounded-full border border-white/20 px-2 py-0.5 font-body text-[8px] uppercase tracking-[0.18em] text-white">
                              Saved
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {activePull && activeMeta && (
                <div className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.24em] text-secondary">
                      Active pull · {activePull.signature}
                    </p>
                    <p className="mt-2 font-body text-sm leading-6 text-secondary/90">
                      {revealed.includes(activeIndex)
                        ? `${activePull.avatar.tagline}. ${activeMeta.flavor}`
                        : "The wrapper is still sealed. Reveal it to inspect stats and add it to favorites."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <MagneticButton onClick={previous} aria-label="Previous pack pull">
                      Prev
                    </MagneticButton>
                    <MagneticButton onClick={revealActive} aria-label="Reveal active pack pull">
                      {revealed.includes(activeIndex) ? "Next seal" : "Tear seal"}
                    </MagneticButton>
                    <MagneticButton
                      onClick={() => onToggleFavorite?.(activePull.id)}
                      disabled={!revealed.includes(activeIndex)}
                      aria-label={`${favorites.includes(activePull.id) ? "Remove" : "Add"} ${activePull.avatar.label} favorite`}
                    >
                      {favorites.includes(activePull.id) ? "Saved" : "Favorite"}
                    </MagneticButton>
                    <MagneticButton onClick={next} aria-label="Next pack pull">
                      Next
                    </MagneticButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </StarBorder>
    </section>
  );
}

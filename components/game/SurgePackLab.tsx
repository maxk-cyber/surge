"use client";

import { useMemo, useState } from "react";
import { AnimatedReveal, MagneticButton, SignalText, SpotlightCard } from "@/components/ui/reactbits-effects";
import { FighterPortrait } from "@/components/ui/FighterPortrait";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import {
  DRAFT_STRATEGIES,
  buildDraftPack,
  summarizeDraftPack,
  type DraftStrategyId,
} from "@/lib/pack-lab";
import { PLAYER_AVATARS, type PlayerAvatarId } from "@/lib/avatars";
import { cycleIndex } from "@/lib/iterator";
import { cn } from "@/lib/utils";
import type { MotionLevel, VibeModeId } from "@/lib/showroom";

export function SurgePackLab({
  favorites,
  vibe,
  motionLevel,
}: {
  favorites: PlayerAvatarId[];
  vibe: VibeModeId;
  motionLevel: MotionLevel;
}) {
  const [strategy, setStrategy] = useState<DraftStrategyId>("weird");
  const [packIndex, setPackIndex] = useState(0);
  const [activeSlot, setActiveSlot] = useState(0);
  const [copied, setCopied] = useState(false);
  const pack = useMemo(
    () => buildDraftPack({ strategy, favorites, packIndex, size: 5 }),
    [favorites, packIndex, strategy],
  );
  const active = pack[cycleIndex(activeSlot, pack.length)] ?? pack[0];
  const activeMeta = active ? FIGHTER_CARD_META[active.fighter.id] : null;

  const chooseStrategy = (nextStrategy: DraftStrategyId) => {
    setStrategy(nextStrategy);
    setActiveSlot(0);
  };

  const nextPack = () => {
    setPackIndex((current) => current + 1);
    setActiveSlot(0);
  };

  const copyPack = async () => {
    if (!pack.length) return;
    try {
      await navigator.clipboard?.writeText(summarizeDraftPack(pack, strategy));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="pack" className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
      <AnimatedReveal motion={motionLevel}>
        <div className="mb-8 grid gap-4 md:grid-cols-[0.95fr_1.05fr] md:items-end">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
              Skill v1 pack lab · cyclic recommendations
            </p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-none tracking-[0.1em] text-foreground md:text-6xl">
              Open a <SignalText>surge pack</SignalText>
            </h2>
          </div>
          <p className="max-w-xl font-body text-sm leading-7 text-secondary/90">
            Pick a draft strategy and the cockpit builds a favorite-aware pack from real roster stats.
            Cycle packs, inspect the active recommendation, then copy a shareable lineup.
          </p>
        </div>
      </AnimatedReveal>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <SpotlightCard className="p-5 md:p-6" spotlightColor="rgba(255,255,255,0.14)">
          <div className="ribbon-field absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative">
            <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
              Strategy tuner
            </p>
            <div className="mt-4 grid gap-2">
              {(Object.keys(DRAFT_STRATEGIES) as DraftStrategyId[]).map((id) => {
                const item = DRAFT_STRATEGIES[id];
                const selected = strategy === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => chooseStrategy(id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                      selected
                        ? "border-white/50 bg-white/15 text-foreground"
                        : "border-white/10 bg-black/25 text-secondary hover:border-white/30 hover:text-foreground",
                    )}
                    aria-pressed={selected}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-display text-xl uppercase tracking-[0.1em]">{item.label}</span>
                      <span className="rounded-full border border-white/15 px-2 py-1 font-body text-[9px] uppercase tracking-[0.2em]">
                        {item.shortLabel}
                      </span>
                    </span>
                    <span className="mt-2 block font-body text-xs leading-5 text-secondary/85">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <MagneticButton onClick={nextPack}>Shuffle pack</MagneticButton>
              <MagneticButton onClick={copyPack}>{copied ? "Copied lineup" : "Copy lineup"}</MagneticButton>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="overflow-hidden p-0" spotlightColor="rgba(190,242,100,0.14)">
          <div className="grid min-h-[520px] gap-0 md:grid-cols-[0.92fr_1.08fr]">
            <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden border-b border-white/10 bg-black/45 p-6 md:border-b-0 md:border-r">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.16),transparent_38%)]" />
              {active && activeMeta && (
                <div className="relative text-center">
                  <div className="mx-auto rounded-[2rem] border border-white/15 bg-white/[0.055] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.52)]">
                    <FighterPortrait
                      id={active.fighter.id}
                      size={250}
                      label={`${active.fighter.label} pack recommendation portrait`}
                      className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.75)]"
                    />
                  </div>
                  <p className="mt-5 font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                    Slot {active.slot} · score {active.score}
                  </p>
                  <h3 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] text-foreground">
                    {active.fighter.label}
                  </h3>
                  <p className="mt-2 font-body text-xs leading-5 text-secondary/85">{activeMeta.flavor}</p>
                </div>
              )}
            </div>

            <div className="relative p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                    Pack #{packIndex + 1}
                  </p>
                  <p className="mt-1 font-body text-xs text-secondary/80">
                    {favorites.length} favorites boosting recommendations
                  </p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 font-body text-[9px] uppercase tracking-[0.2em] text-secondary">
                  {vibe} mode
                </span>
              </div>

              <div className="mt-6 space-y-3" aria-label="Recommended pack fighters">
                {pack.map(({ fighter, score, slot }, index) => {
                  const meta = FIGHTER_CARD_META[fighter.id];
                  const selected = active?.fighter.id === fighter.id;
                  return (
                    <button
                      key={fighter.id}
                      type="button"
                      onClick={() => setActiveSlot(index)}
                      className={cn(
                        "group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                        selected
                          ? "border-white/50 bg-white/15"
                          : "border-white/10 bg-white/[0.035] hover:border-white/30 hover:bg-white/[0.07]",
                      )}
                      aria-pressed={selected}
                    >
                      <span className="font-display text-2xl text-foreground/80">{slot}</span>
                      <span>
                        <span className="block font-body text-xs uppercase tracking-[0.18em] text-foreground">
                          {fighter.label}
                        </span>
                        <span className="mt-1 block h-2 overflow-hidden rounded-full bg-black/60 ring-1 ring-white/10">
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-white via-lime-200 to-violet-200"
                            style={{ width: `${Math.min(100, score)}%` }}
                          />
                        </span>
                      </span>
                      <span className="text-right font-body text-[10px] uppercase tracking-[0.16em] text-secondary">
                        {meta.rarity}
                        <span className="block text-foreground">{score}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}

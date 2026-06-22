"use client";

import { useEffect, useMemo, useState } from "react";
import { FighterPortrait } from "@/components/ui/FighterPortrait";
import {
  MagneticButton,
  ShimmerText,
  SpotlightCard,
} from "@/components/ui/reactbits-effects";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { useIterator } from "@/lib/iterator";
import {
  DRAFT_STRATEGIES,
  SHOWROOM_STORAGE_KEYS,
  getDraftScore,
  getLineupStats,
  isDraftStrategy,
  lineupShareText,
  suggestDraftLineup,
  type DraftStrategy,
  type MotionLevel,
  type VibeModeId,
  VIBE_MODES,
} from "@/lib/showroom";
import type { AvatarDef } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const STRATEGY_IDS = Object.keys(DRAFT_STRATEGIES) as DraftStrategy[];

function StatMeter({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage = Math.min(100, Math.round((value / Math.max(1, max)) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-body text-[9px] uppercase tracking-[0.18em] text-secondary">
        <span>{label}</span>
        <span className="text-foreground/85">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/60 ring-1 ring-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-white/60 via-white to-white/70"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function DraftAssistant({
  fighters,
  vibe = "arcade",
  motionLevel = "showtime",
}: {
  fighters: readonly AvatarDef[];
  vibe?: VibeModeId;
  motionLevel?: MotionLevel;
}) {
  const [strategy, setStrategy] = useState<DraftStrategy>("balanced");
  const [copied, setCopied] = useState(false);
  const vibeMode = VIBE_MODES[vibe];

  useEffect(() => {
    const stored = localStorage.getItem(SHOWROOM_STORAGE_KEYS.draftStrategy);
    if (isDraftStrategy(stored)) {
      setStrategy(stored);
    }
  }, []);

  const chooseStrategy = (nextStrategy: DraftStrategy) => {
    setStrategy(nextStrategy);
    localStorage.setItem(SHOWROOM_STORAGE_KEYS.draftStrategy, nextStrategy);
  };

  const lineup = useMemo(() => suggestDraftLineup(fighters, strategy), [fighters, strategy]);
  const stats = useMemo(() => getLineupStats(lineup), [lineup]);
  const tickerItems = useMemo(
    () =>
      lineup.map((fighter) => {
        const meta = FIGHTER_CARD_META[fighter.id];
        return `${fighter.label} leads with ${meta.rarity} ${meta.type.toLowerCase()} pressure`;
      }),
    [lineup],
  );
  const ticker = useIterator({
    items: tickerItems.length ? tickerItems : [DRAFT_STRATEGIES[strategy].signal],
    autoAdvanceMs: 3200,
    enabled: motionLevel === "showtime",
  });

  const copyLineup = async () => {
    try {
      await navigator.clipboard?.writeText(lineupShareText(lineup, strategy));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <SpotlightCard
      className="w-full p-4 md:p-5"
      spotlightColor={`${vibeMode.glow}24`}
    >
      <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
            Draft intelligence
          </p>
          <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-foreground md:text-3xl">
            <ShimmerText motion={motionLevel}>Build a lunch-rush squad</ShimmerText>
          </h3>
          <p className="mt-3 font-body text-xs leading-6 text-secondary/85">
            Pick a playstyle and the assistant ranks the visible tray into a three-fighter
            recommendation using HP, attack, speed, weirdness, and rarity.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {STRATEGY_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => chooseStrategy(id)}
                aria-pressed={strategy === id}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                  strategy === id
                    ? "border-white/50 bg-white/15 text-foreground"
                    : "border-white/10 bg-white/[0.04] text-secondary hover:border-white/30 hover:text-foreground",
                )}
              >
                <span className="block font-body text-[10px] uppercase tracking-[0.2em]">
                  {DRAFT_STRATEGIES[id].shortLabel}
                </span>
                <span className="mt-1 block font-body text-[10px] leading-4 text-secondary/80">
                  {DRAFT_STRATEGIES[id].signal}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.24em] text-secondary">
                {DRAFT_STRATEGIES[strategy].label}
              </p>
              <p className="mt-1 font-body text-xs leading-5 text-secondary/80">
                {DRAFT_STRATEGIES[strategy].description}
              </p>
            </div>
            <MagneticButton
              onClick={copyLineup}
              disabled={lineup.length === 0}
              aria-label="Copy recommended lineup"
            >
              {copied ? "Copied squad" : "Copy squad"}
            </MagneticButton>
          </div>

          <p className="mt-4 min-h-5 font-body text-[10px] uppercase tracking-[0.2em] text-foreground/85" aria-live="polite">
            {ticker.activeItem}
          </p>

          {lineup.length > 0 ? (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {lineup.map((fighter, index) => {
                  const meta = FIGHTER_CARD_META[fighter.id];
                  const active = index === ticker.index % lineup.length;
                  return (
                    <article
                      key={fighter.id}
                      className={cn(
                        "relative overflow-hidden rounded-2xl border bg-white/[0.045] p-3 transition",
                        active ? "border-white/45 shadow-[0_0_28px_rgba(255,255,255,0.12)]" : "border-white/10",
                      )}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-40"
                        style={{
                          background: `radial-gradient(circle at 50% 10%, ${vibeMode.glow}44, transparent 58%)`,
                        }}
                      />
                      <div className="relative flex items-center gap-3 md:block md:text-center">
                        <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/45">
                          <FighterPortrait
                            id={fighter.id}
                            size={68}
                            label={`${fighter.label} draft portrait`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-lg uppercase tracking-[0.08em] text-foreground">
                            {fighter.label}
                          </p>
                          <p className="mt-1 font-body text-[9px] uppercase tracking-[0.16em] text-secondary">
                            #{meta.number} · {meta.rarity} · score {getDraftScore(fighter, strategy)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <StatMeter label="HP pool" value={stats.hp} max={lineup.length * 100} />
                <StatMeter label="Attack" value={stats.atk} max={lineup.length * 100} />
                <StatMeter label="Speed" value={stats.spd} max={lineup.length * 100} />
                <StatMeter label="Weirdness" value={stats.weird} max={lineup.length * 100} />
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <p className="font-display text-xl uppercase tracking-[0.1em] text-foreground">
                No squad signal
              </p>
              <p className="mt-2 font-body text-xs leading-6 text-secondary">
                Clear the favorites filter or save a fighter to generate a recommendation.
              </p>
            </div>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}

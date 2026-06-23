"use client";

import { useEffect, useMemo, useState } from "react";
import { FighterPortrait } from "@/components/ui/FighterPortrait";
import {
  MagneticButton,
  ShinyText,
  SpotlightCard,
  StarBorder,
} from "@/components/ui/reactbits-effects";
import { PLAYER_AVATARS, type PlayerAvatarId } from "@/lib/avatars";
import { useIterator } from "@/lib/iterator";
import {
  PACK_LAB_STORAGE_KEY,
  PACK_STRATEGIES,
  buildPackWindow,
  isPackStrategy,
  summarizePack,
  type PackStrategyId,
} from "@/lib/pack-lab";
import { type MotionLevel, type VibeModeId, VIBE_MODES } from "@/lib/showroom";
import { cn } from "@/lib/utils";

const PACK_SEEDS = PLAYER_AVATARS.map((_, index) => index);

export function PackLab({
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
  const [strategy, setStrategy] = useState<PackStrategyId>("balanced");
  const [copied, setCopied] = useState(false);
  const vibeMode = VIBE_MODES[vibe];
  const packCycle = useIterator({
    items: PACK_SEEDS,
    autoAdvanceMs: 6200,
    enabled: motionLevel === "showtime",
  });
  const packIndex = packCycle.activeItem ?? 0;

  useEffect(() => {
    const stored = localStorage.getItem(PACK_LAB_STORAGE_KEY);
    if (isPackStrategy(stored)) setStrategy(stored);
  }, []);

  const pack = useMemo(
    () => buildPackWindow({ strategy, packIndex, favorites, size: 4 }),
    [favorites, packIndex, strategy],
  );
  const briefing = useMemo(() => summarizePack({ strategy, pack }), [pack, strategy]);
  const lead = pack[0];

  const chooseStrategy = (nextStrategy: PackStrategyId) => {
    setStrategy(nextStrategy);
    localStorage.setItem(PACK_LAB_STORAGE_KEY, nextStrategy);
    packCycle.goTo(0);
  };

  const copyBriefing = async () => {
    try {
      await navigator.clipboard?.writeText(briefing);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  const favoritePack = () => {
    pack.forEach(({ fighter }) => {
      if (!favorites.includes(fighter.id)) onToggleFavorite?.(fighter.id);
    });
  };

  return (
    <section
      id="pack-lab"
      className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-8"
      aria-labelledby="pack-lab-title"
    >
      <div className="mb-8 grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
            Skill v1 feature / ReactBits StarBorder + Ribbons
          </p>
          <h2
            id="pack-lab-title"
            className="mt-2 max-w-3xl font-display text-3xl uppercase leading-tight tracking-[0.1em] md:text-5xl"
          >
            <ShinyText accent={vibeMode.accent} motion={motionLevel}>
              Open a tactical snack pack
            </ShinyText>
          </h2>
        </div>
        <p className="font-body text-xs leading-6 text-secondary md:text-sm">
          Pick a draft vibe and the lab ranks the roster into a rotating four-card pack. It is
          deterministic, keyboard-friendly, copyable, and biased toward fighters you already favor.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <SpotlightCard className="p-4 md:p-5" spotlightColor={`${vibeMode.glow}24`}>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(PACK_STRATEGIES) as PackStrategyId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => chooseStrategy(id)}
                className={cn(
                  "min-h-28 rounded-[1.35rem] border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                  strategy === id
                    ? "border-white/50 bg-white/15 text-foreground shadow-[0_0_40px_rgba(255,255,255,0.08)]"
                    : "border-white/10 bg-black/25 text-secondary hover:border-white/30 hover:bg-white/[0.07] hover:text-foreground",
                )}
                aria-pressed={strategy === id}
              >
                <span className="font-body text-[10px] uppercase tracking-[0.22em]">
                  {PACK_STRATEGIES[id].shortLabel}
                </span>
                <span className="mt-2 block font-display text-xl uppercase tracking-[0.08em]">
                  {PACK_STRATEGIES[id].label}
                </span>
                <span className="mt-2 block font-body text-[11px] leading-5 text-secondary/85">
                  {PACK_STRATEGIES[id].description}
                </span>
              </button>
            ))}
          </div>
        </SpotlightCard>

        <StarBorder accent={vibeMode.accent} motion={motionLevel} className="min-h-[420px]">
          <div
            className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 p-5 md:p-6"
            style={{ background: `linear-gradient(135deg, ${vibeMode.glow}2b, rgba(0,0,0,0.86) 58%)` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_8%,rgba(255,255,255,0.16),transparent_32%)]" />
            <div className="relative grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                  Live pack #{String(packIndex + 1).padStart(2, "0")}
                </p>
                {lead && (
                  <div className="mt-5 flex flex-col items-center rounded-[1.5rem] border border-white/10 bg-black/35 p-5 text-center">
                    <div
                      className="rounded-full border border-white/10 p-3"
                      style={{ background: `radial-gradient(circle, ${vibeMode.accent}24, transparent 62%)` }}
                    >
                      <FighterPortrait
                        id={lead.fighter.id}
                        size={170}
                        label={`${lead.fighter.label} recommended lead portrait`}
                        className="drop-shadow-[0_18px_42px_rgba(0,0,0,0.75)]"
                      />
                    </div>
                    <p className="mt-4 font-display text-2xl uppercase tracking-[0.1em]">
                      {lead.fighter.label}
                    </p>
                    <p className="mt-1 font-body text-[10px] uppercase tracking-[0.2em] text-secondary">
                      Lead score {lead.score} / {lead.meta.rarity}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                  Draft briefing
                </p>
                <p className="mt-3 min-h-14 font-body text-sm leading-7 text-foreground/90" aria-live="polite">
                  {briefing}
                </p>

                <div className="mt-5 grid gap-2">
                  {pack.map(({ fighter, score, meta }, index) => {
                    const favorite = favorites.includes(fighter.id);
                    return (
                      <div
                        key={`${fighter.id}-${index}`}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-2.5"
                      >
                        <FighterPortrait
                          id={fighter.id}
                          size={54}
                          label={`${fighter.label} pack portrait`}
                          className="rounded-xl bg-black/40"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-base uppercase tracking-[0.08em]">
                            {fighter.label}
                          </p>
                          <p className="font-body text-[10px] uppercase tracking-[0.18em] text-secondary">
                            #{meta.number} / {meta.type} / {score}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleFavorite?.(fighter.id)}
                          className={cn(
                            "min-h-10 rounded-full border px-3 font-body text-[9px] uppercase tracking-[0.18em] outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                            favorite
                              ? "border-white/50 bg-white/20 text-foreground"
                              : "border-white/10 bg-black/30 text-secondary hover:border-white/30 hover:text-foreground",
                          )}
                          aria-label={`${favorite ? "Remove" : "Add"} ${fighter.label} favorite from pack`}
                        >
                          {favorite ? "Saved" : "Save"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <MagneticButton onClick={packCycle.previous} aria-label="Previous pack">
                    Previous pack
                  </MagneticButton>
                  <MagneticButton onClick={packCycle.next} aria-label="Open next pack">
                    Open pack
                  </MagneticButton>
                  <MagneticButton onClick={favoritePack} aria-label="Save visible pack">
                    Save pack
                  </MagneticButton>
                  <MagneticButton onClick={copyBriefing} aria-label="Copy pack briefing">
                    {copied ? "Copied" : "Copy brief"}
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        </StarBorder>
      </div>
    </section>
  );
}

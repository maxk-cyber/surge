"use client";

import { useEffect, useMemo, useState } from "react";
import { FighterPortrait } from "@/components/ui/FighterPortrait";
import {
  MagneticButton,
  ShinyText,
  SignalRibbon,
  SpotlightCard,
  StarBorder,
} from "@/components/ui/reactbits-effects";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { useIterator } from "@/lib/iterator";
import {
  PACK_LAB_STORAGE_KEY,
  PACK_LANES,
  buildPackShareText,
  getLineupWindow,
  getPackLineup,
  isPackLaneId,
  nextPackLane,
  scoreFighterForLane,
  type PackLaneId,
} from "@/lib/pack-lab";
import type { MotionLevel } from "@/lib/showroom";
import type { PlayerAvatarId } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function PackLab({
  favorites = [],
  onToggleFavorite,
  motionLevel = "showtime",
}: {
  favorites?: PlayerAvatarId[];
  onToggleFavorite?: (id: PlayerAvatarId) => void;
  motionLevel?: MotionLevel;
}) {
  const [lane, setLane] = useState<PackLaneId>("vault");
  const [copied, setCopied] = useState(false);
  const laneConfig = PACK_LANES[lane];
  const lineup = useMemo(() => getPackLineup({ laneId: lane, favorites }), [favorites, lane]);
  const spotlight = useIterator({
    items: lineup,
    autoAdvanceMs: 4200,
    enabled: motionLevel === "showtime",
  });
  const active = spotlight.activeItem ?? lineup[0];
  const activeMeta = active ? FIGHTER_CARD_META[active.id] : null;
  const spotlightWindow = getLineupWindow(lineup, spotlight.index, 1);

  useEffect(() => {
    const stored = localStorage.getItem(PACK_LAB_STORAGE_KEY);
    if (isPackLaneId(stored)) setLane(stored);
  }, []);

  const chooseLane = (nextLane: PackLaneId) => {
    setLane(nextLane);
    localStorage.setItem(PACK_LAB_STORAGE_KEY, nextLane);
    spotlight.goTo(0);
  };

  const copyLineup = async () => {
    try {
      await navigator.clipboard?.writeText(buildPackShareText(lane, lineup));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="lab"
      className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-8"
      aria-labelledby="pack-lab-title"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div className="space-y-5">
          <SignalRibbon
            motion={motionLevel}
            items={["ReactBits Pack Lab", "lane-aware picks", "copyable drop code", "cyclic scout light"]}
          />
          <StarBorder color={laneConfig.accent} motion={motionLevel}>
            <div className="p-6 md:p-8">
              <p className="font-body text-[10px] uppercase tracking-[0.36em] text-secondary">
                Skill v1 curator
              </p>
              <h2
                id="pack-lab-title"
                className="mt-3 max-w-xl font-display text-4xl uppercase leading-none tracking-[0.1em] text-foreground md:text-6xl"
              >
                Build a <ShinyText motion={motionLevel}>five-pull ritual</ShinyText>.
              </h2>
              <p className="mt-5 max-w-xl font-body text-sm leading-7 text-secondary/90">
                Choose a lane and the lab scores the whole roster by stats, rarity, and your favorites.
                The spotlight cycles through the recommended pull window so collectors always have a next
                card to inspect.
              </p>

              <div className="mt-7 grid gap-2 sm:grid-cols-3" aria-label="Pack lab lanes">
                {(Object.keys(PACK_LANES) as PackLaneId[]).map((laneId) => {
                  const config = PACK_LANES[laneId];
                  return (
                    <button
                      key={laneId}
                      type="button"
                      onClick={() => chooseLane(laneId)}
                      className={cn(
                        "rounded-2xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                        lane === laneId
                          ? "border-white/50 bg-white/15 text-foreground"
                          : "border-white/10 bg-white/[0.04] text-secondary hover:border-white/30 hover:text-foreground",
                      )}
                      aria-pressed={lane === laneId}
                    >
                      <span className="block font-body text-[10px] uppercase tracking-[0.24em]">
                        {config.shortLabel}
                      </span>
                      <span className="mt-2 block h-1.5 rounded-full" style={{ background: config.accent }} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                  {laneConfig.deckCode}
                </p>
                <p className="mt-2 font-body text-sm leading-6 text-secondary/90">{laneConfig.description}</p>
              </div>
            </div>
          </StarBorder>
        </div>

        <SpotlightCard className="p-4 md:p-5" spotlightColor={`${laneConfig.accent}24`}>
          {active && activeMeta ? (
            <div className="grid h-full gap-5 md:grid-cols-[220px_1fr]">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/45 p-4">
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    background: `radial-gradient(circle at 50% 22%, ${laneConfig.accent}55, transparent 58%)`,
                  }}
                />
                <div className="relative flex min-h-[310px] flex-col items-center justify-center text-center">
                  <FighterPortrait
                    id={active.id}
                    size={178}
                    label={`${active.label} pack lab portrait`}
                    className="drop-shadow-[0_20px_48px_rgba(0,0,0,0.85)]"
                  />
                  <p className="mt-5 font-display text-2xl uppercase tracking-[0.12em] text-foreground">
                    {active.label}
                  </p>
                  <p className="mt-2 font-body text-[10px] uppercase tracking-[0.22em] text-secondary">
                    Score {scoreFighterForLane(active, lane, favorites)} · {activeMeta.rarity}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-5 p-1">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.32em] text-secondary">
                    Live spotlight
                  </p>
                  <h3 className="mt-3 font-display text-3xl uppercase tracking-[0.1em] text-foreground">
                    {active.tagline}
                  </h3>
                  <p className="mt-4 font-body text-sm leading-7 text-secondary/90">{activeMeta.flavor}</p>

                  <dl className="mt-5 grid grid-cols-4 gap-2 font-body text-[10px] uppercase tracking-wider text-secondary">
                    {[
                      ["HP", activeMeta.hp],
                      ["ATK", activeMeta.atk],
                      ["SPD", activeMeta.spd],
                      ["WRD", activeMeta.weird],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                        <dt>{label}</dt>
                        <dd className="mt-1 text-lg text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <div className="grid gap-2 sm:grid-cols-3" aria-label="Pack lineup window" aria-live="polite">
                    {spotlightWindow.map(({ item, distance, index }) => (
                      <button
                        key={`${item.id}-${distance}`}
                        type="button"
                        onClick={() => spotlight.goTo(index)}
                        className={cn(
                          "rounded-2xl border p-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                          distance === 0
                            ? "border-white/50 bg-white/15"
                            : "border-white/10 bg-white/[0.04] hover:border-white/30",
                        )}
                        aria-current={distance === 0 ? "true" : undefined}
                      >
                        <span className="font-body text-[9px] uppercase tracking-[0.2em] text-secondary">
                          {distance < 0 ? "Previous" : distance > 0 ? "Next" : "Now"}
                        </span>
                        <span className="mt-1 block truncate font-display text-lg uppercase tracking-[0.08em] text-foreground">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <MagneticButton onClick={spotlight.previous} aria-label="Previous pack lab fighter">
                      Prev pull
                    </MagneticButton>
                    <MagneticButton onClick={spotlight.next} aria-label="Next pack lab fighter">
                      Next pull
                    </MagneticButton>
                    <MagneticButton
                      onClick={() => onToggleFavorite?.(active.id)}
                      aria-label={`${favorites.includes(active.id) ? "Remove" : "Add"} ${active.label} from favorites`}
                      className={favorites.includes(active.id) ? "border-white/50 bg-white/20 text-white" : ""}
                    >
                      {favorites.includes(active.id) ? "Saved" : "Save pull"}
                    </MagneticButton>
                    <MagneticButton onClick={copyLineup} aria-label="Copy pack lab lineup">
                      {copied ? "Copied" : "Copy drop"}
                    </MagneticButton>
                    <MagneticButton
                      onClick={() => chooseLane(nextPackLane(lane))}
                      aria-label="Cycle pack lab lane"
                    >
                      Cycle lane
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SpotlightCard>
      </div>
    </section>
  );
}

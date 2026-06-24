"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AvatarPicker } from "@/components/game/AvatarPicker";
import { FighterPortrait } from "@/components/ui/FighterPortrait";
import {
  AnimatedReveal,
  AuroraBackdrop,
  ClickSpark,
  DockNav,
  MagneticButton,
  PlasmaWave,
  ShinyText,
  SpotlightCard,
} from "@/components/ui/reactbits-effects";
import { avatarGalleryImages } from "@/lib/gallery-images";
import { useIterator } from "@/lib/iterator";
import {
  HERO_BEATS,
  SHOWROOM_STORAGE_KEYS,
  STRATEGY_MODES,
  VIBE_MODES,
  buildLineupBrief,
  filterFighters,
  formatRosterStats,
  isMotionLevel,
  isStrategyMode,
  isVibeMode,
  parseStoredFavorites,
  recommendFightersForStrategy,
  toggleFavorite,
  type FighterFilter,
  type MotionLevel,
  type StrategyModeId,
  type VibeModeId,
} from "@/lib/showroom";
import { PLAYER_AVATARS, type PlayerAvatarId } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { cn } from "@/lib/utils";

const DomeGallery = dynamic(() => import("@/components/ui/DomeGallery"), { ssr: false });

const galleryImages = avatarGalleryImages();
const rosterStats = formatRosterStats();
const filters: { id: FighterFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "common", label: "Common" },
  { id: "rare", label: "Rare" },
  { id: "legend", label: "Legend" },
];

function ShowroomDock({ motion }: { motion: MotionLevel }) {
  return (
    <DockNav
      motion={motion}
      items={[
        { label: "Brief", href: "#brief", icon: "01" },
        { label: "Planner", href: "#planner", icon: "02" },
        { label: "Dome", href: "#globe", icon: "03" },
        { label: "Prism", href: "#prism", icon: "04" },
        { label: "Cards", href: "#cards", icon: "05" },
      ]}
    />
  );
}

export default function CardGalleryPage() {
  const [vibe, setVibe] = useState<VibeModeId>("arcade");
  const [motionLevel, setMotionLevel] = useState<MotionLevel>("showtime");
  const [filter, setFilter] = useState<FighterFilter>("all");
  const [strategy, setStrategy] = useState<StrategyModeId>("balanced");
  const [favorites, setFavorites] = useState<PlayerAvatarId[]>([]);
  const [lineupCopied, setLineupCopied] = useState(false);
  const vibeMode = VIBE_MODES[vibe];
  const filteredCount = useMemo(
    () => filterFighters(PLAYER_AVATARS, filter, favorites).length,
    [favorites, filter],
  );
  const strategyMode = STRATEGY_MODES[strategy];
  const recommendations = useMemo(
    () => recommendFightersForStrategy(PLAYER_AVATARS, strategy, favorites, 5),
    [favorites, strategy],
  );
  const lineup = recommendations.slice(0, 3);
  const hero = useIterator({
    items: HERO_BEATS,
    autoAdvanceMs: 2800,
    enabled: motionLevel === "showtime",
  });
  const scout = useIterator({
    items: recommendations,
    autoAdvanceMs: 3600,
    enabled: motionLevel === "showtime",
  });
  const activeScout = scout.activeItem ?? recommendations[0];
  const activeScoutMeta = activeScout ? FIGHTER_CARD_META[activeScout.id] : null;

  useEffect(() => {
    const storedVibe = localStorage.getItem(SHOWROOM_STORAGE_KEYS.vibe);
    const storedMotion = localStorage.getItem(SHOWROOM_STORAGE_KEYS.motion);
    const storedStrategy = localStorage.getItem(SHOWROOM_STORAGE_KEYS.strategy);
    setVibe(isVibeMode(storedVibe) ? storedVibe : "arcade");
    setMotionLevel(isMotionLevel(storedMotion) ? storedMotion : "showtime");
    setStrategy(isStrategyMode(storedStrategy) ? storedStrategy : "balanced");
    setFavorites(parseStoredFavorites(localStorage.getItem(SHOWROOM_STORAGE_KEYS.favorites)));
  }, []);

  const chooseVibe = (nextVibe: VibeModeId) => {
    setVibe(nextVibe);
    localStorage.setItem(SHOWROOM_STORAGE_KEYS.vibe, nextVibe);
  };

  const chooseMotion = (nextMotion: MotionLevel) => {
    setMotionLevel(nextMotion);
    localStorage.setItem(SHOWROOM_STORAGE_KEYS.motion, nextMotion);
  };

  const chooseStrategy = (nextStrategy: StrategyModeId) => {
    setStrategy(nextStrategy);
    localStorage.setItem(SHOWROOM_STORAGE_KEYS.strategy, nextStrategy);
  };

  const onToggleFavorite = (id: PlayerAvatarId) => {
    setFavorites((current) => {
      const next = toggleFavorite(current, id);
      localStorage.setItem(SHOWROOM_STORAGE_KEYS.favorites, JSON.stringify(next));
      return next;
    });
  };

  const copyLineup = async () => {
    try {
      await navigator.clipboard?.writeText(buildLineupBrief(strategy, lineup));
      setLineupCopied(true);
      window.setTimeout(() => setLineupCopied(false), 1300);
    } catch {
      setLineupCopied(false);
    }
  };

  return (
    <ClickSpark motion={motionLevel}>
      <main className={cn("relative min-h-screen overflow-hidden bg-gradient-to-b pb-28", vibeMode.wash)}>
        <AuroraBackdrop accent={vibeMode.glow} glow={vibeMode.accent} motion={motionLevel} />
        <PlasmaWave colors={[vibeMode.glow, strategyMode.accent]} motion={motionLevel} className="z-[1]" />
        <ShowroomDock motion={motionLevel} />

        <header id="brief" className="relative z-20 mx-auto grid min-h-[92vh] w-full max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-[1.05fr_0.95fr] md:px-8">
          <AnimatedReveal motion={motionLevel}>
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.45em] text-secondary">
                Snack Surge / Contraband Holo-Vault
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-5xl uppercase leading-[0.92] tracking-[0.08em] text-foreground md:text-7xl lg:text-8xl">
                <ShinyText motion={motionLevel} color="#f4f4f5" shineColor={strategyMode.accent}>
                  Draft cafeteria cryptids with style.
                </ShinyText>
              </h1>
              <p
                className="mt-5 min-h-8 font-body text-sm uppercase tracking-[0.2em]"
                style={{ color: vibeMode.accent }}
                aria-live="polite"
              >
                {hero.activeItem}
              </p>
              <p className="mt-6 max-w-2xl font-body text-sm leading-7 text-secondary/90 md:text-base">
                A market-ready collectible showroom for the Snack Surge roster: generate a strategy lineup,
                spin the portrait dome, browse a prism vault, favorite fighters, and copy shareable card
                briefings without relying on missing external assets.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <MagneticButton onClick={() => document.querySelector("#planner")?.scrollIntoView({ behavior: "smooth" })}>
                  Build a lineup
                </MagneticButton>
                <MagneticButton onClick={() => document.querySelector("#globe")?.scrollIntoView({ behavior: "smooth" })}>
                  Spin the dome
                </MagneticButton>
              </div>
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={0.12} motion={motionLevel}>
            <SpotlightCard spotlightColor={`${vibeMode.glow}26`} className="p-5 md:p-6">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/50 p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.16),transparent_38%)]" />
                <div className="relative">
                  <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                    Live cabinet controls
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-secondary">
                      Active strategy
                    </p>
                    <p className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-foreground">
                      {strategyMode.label}
                    </p>
                    <p className="mt-2 font-body text-xs leading-5 text-secondary/80">
                      {strategyMode.description}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div>
                      <p className="mb-2 font-body text-[10px] uppercase tracking-[0.2em] text-secondary">
                        Vibe mode
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(VIBE_MODES) as VibeModeId[]).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => chooseVibe(mode)}
                            className={cn(
                              "rounded-2xl border px-3 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                              vibe === mode
                                ? "border-white/50 bg-white/15 text-foreground"
                                : "border-white/10 bg-white/[0.04] text-secondary hover:border-white/30",
                            )}
                          >
                            <span className="block font-body text-[10px] uppercase tracking-[0.2em]">
                              {VIBE_MODES[mode].shortLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 font-body text-xs leading-5 text-secondary/80">
                        {vibeMode.description}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 font-body text-[10px] uppercase tracking-[0.2em] text-secondary">
                        Motion intensity
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["calm", "showtime"] as MotionLevel[]).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => chooseMotion(level)}
                            className={cn(
                              "rounded-2xl border px-3 py-3 font-body text-[10px] uppercase tracking-[0.2em] outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                              motionLevel === level
                                ? "border-white/50 bg-white/15 text-foreground"
                                : "border-white/10 bg-white/[0.04] text-secondary hover:border-white/30",
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </AnimatedReveal>
        </header>

        <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-4 px-5 md:grid-cols-4 md:px-8">
          {[
            ["Roster", rosterStats.total, "Generated SVG fighters with no missing assets"],
            ["Legends", rosterStats.legend, "Top-tier pulls with premium foil"],
            ["Avg weird", rosterStats.averageWeird, "Snack Surge oddity score"],
            ["Shown", filteredCount, `${filter} filter active`],
          ].map(([label, value, body], index) => (
            <AnimatedReveal key={label} delay={index * 0.05} motion={motionLevel}>
              <SpotlightCard className="h-full p-5" spotlightColor={`${vibeMode.accent}1f`}>
                <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                  {label}
                </p>
                <p className="mt-3 font-display text-4xl text-foreground">{value}</p>
                <p className="mt-2 font-body text-xs leading-5 text-secondary/80">{body}</p>
              </SpotlightCard>
            </AnimatedReveal>
          ))}
        </section>

        <section id="planner" className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
          <AnimatedReveal motion={motionLevel}>
            <div className="mb-8 grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-end">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                  Skill v1 run planner / Iterator scout spotlight
                </p>
                <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] md:text-5xl">
                  Holo-vault lineup lab
                </h2>
              </div>
              <p className="font-body text-xs leading-6 text-secondary">
                Choose a battle plan and the vault scores the roster using real card stats, favorites, and
                rarity. The spotlight cycles through the recommendation window so the draft feels alive
                while staying explainable.
              </p>
            </div>
          </AnimatedReveal>

          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <SpotlightCard className="p-5 md:p-6" spotlightColor={`${strategyMode.accent}22`}>
              <div className="relative z-10">
                <p className="font-body text-[10px] uppercase tracking-[0.3em] text-secondary">
                  Pick a strategy mode
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(Object.keys(STRATEGY_MODES) as StrategyModeId[]).map((mode) => {
                    const item = STRATEGY_MODES[mode];
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => chooseStrategy(mode)}
                        className={cn(
                          "rounded-2xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                          strategy === mode
                            ? "border-white/50 bg-white/15 text-foreground"
                            : "border-white/10 bg-white/[0.04] text-secondary hover:border-white/30 hover:text-foreground",
                        )}
                      >
                        <span className="block font-body text-[10px] uppercase tracking-[0.22em]">
                          {item.shortLabel}
                        </span>
                        <span className="mt-2 block font-body text-xs leading-5 text-secondary/85">
                          {item.formula}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="font-display text-2xl uppercase tracking-[0.1em] text-foreground">
                    {strategyMode.label}
                  </p>
                  <p className="mt-2 font-body text-xs leading-6 text-secondary/85">
                    {strategyMode.description}
                  </p>
                  <MagneticButton onClick={copyLineup} className="mt-4" aria-label="Copy recommended lineup">
                    {lineupCopied ? "Lineup copied" : "Copy lineup"}
                  </MagneticButton>
                </div>
              </div>
            </SpotlightCard>

            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <SpotlightCard className="overflow-hidden p-5" spotlightColor={`${vibeMode.glow}25`}>
                {activeScout && activeScoutMeta && (
                  <div className="relative z-10 flex h-full flex-col items-center text-center">
                    <p className="font-body text-[10px] uppercase tracking-[0.3em] text-secondary">
                      Rotating scout
                    </p>
                    <div className="mt-4 rounded-[2rem] border border-white/10 bg-black/40 p-4 shadow-inner">
                      <FighterPortrait
                        id={activeScout.id}
                        size={190}
                        label={`${activeScout.label} strategy portrait`}
                        className="drop-shadow-[0_18px_42px_rgba(0,0,0,0.85)]"
                      />
                    </div>
                    <p className="mt-4 font-display text-2xl uppercase tracking-[0.1em] text-foreground">
                      {activeScout.label}
                    </p>
                    <p className="mt-1 font-body text-xs uppercase tracking-[0.18em] text-secondary">
                      #{activeScoutMeta.number} / {activeScoutMeta.rarity} / WRD {activeScoutMeta.weird}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <MagneticButton onClick={scout.previous} aria-label="Previous scout recommendation">
                        Prev scout
                      </MagneticButton>
                      <MagneticButton onClick={scout.next} aria-label="Next scout recommendation">
                        Next scout
                      </MagneticButton>
                    </div>
                  </div>
                )}
              </SpotlightCard>

              <div className="grid gap-3">
                {lineup.map((fighter, index) => {
                  const meta = FIGHTER_CARD_META[fighter.id];
                  return (
                    <SpotlightCard key={fighter.id} className="p-4" spotlightColor={`${strategyMode.accent}1c`}>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] font-display text-xl text-foreground">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-lg uppercase tracking-[0.08em] text-foreground">
                            {fighter.label}
                          </p>
                          <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-secondary">
                            {meta.type} / {meta.rarity}
                          </p>
                        </div>
                        <div className="hidden gap-1 sm:flex" aria-label={`${fighter.label} stats`}>
                          {[
                            ["HP", meta.hp],
                            ["ATK", meta.atk],
                            ["SPD", meta.spd],
                          ].map(([label, value]) => (
                            <span
                              key={label}
                              className="rounded-xl border border-white/10 bg-black/35 px-2 py-1 text-center font-body text-[9px] uppercase tracking-wider text-secondary"
                            >
                              {label}
                              <strong className="block text-sm text-foreground">{value}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="globe" className="gallery-section relative z-10 mt-20 h-[min(88vh,920px)] w-full">
          <div className="pointer-events-none absolute inset-x-0 top-8 z-30 px-5 text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
              ReactBits DomeGallery / generated portrait atlas
            </p>
            <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.12em] text-foreground md:text-5xl">
              Spin the cafeteria sphere
            </h2>
          </div>
          <DomeGallery
            images={galleryImages}
            fit={0.48}
            minRadius={420}
            overlayBlurColor="#080808"
            grayscale={vibe === "noir"}
            imageBorderRadius="22px"
            openedImageBorderRadius="28px"
            openedImageWidth="300px"
            openedImageHeight="420px"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-secondary/80">
              Drag to spin · tap or focus + Enter to enlarge
            </p>
          </div>
        </section>

        <section id="prism" className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
          <AnimatedReveal motion={motionLevel}>
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                  ReactBits prism wall / generated SVG atlas
                </p>
                <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] md:text-5xl">
                  Chromatic snack vault
                </h2>
              </div>
              <p className="max-w-md font-body text-xs leading-6 text-secondary">
                A lightweight glassy wall replaces missing GLB dependencies with CSS depth, generated
                fighter art, and quick-to-scan vault cards that stay friendly on mobile.
              </p>
            </div>
          </AnimatedReveal>
          <div
            className="prism-wall relative overflow-hidden rounded-[2rem] border border-white/10 p-4 shadow-[0_24px_100px_rgba(0,0,0,0.55)] md:p-6"
            style={{ background: `linear-gradient(135deg, ${vibeMode.glow}, #080808 62%)` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_24%,rgba(255,255,255,0.08)_52%,transparent_72%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.26),transparent_24%),radial-gradient(circle_at_88%_78%,rgba(255,255,255,0.16),transparent_28%)]" />
            <div className="relative grid gap-4 md:grid-cols-5">
              {PLAYER_AVATARS.slice(0, 5).map((fighter, index) => {
                const meta = FIGHTER_CARD_META[fighter.id];
                const tilt = index - 2;
                return (
                  <article
                    key={fighter.id}
                    className="prism-card rounded-[1.5rem] border border-white/15 bg-black/45 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                    style={{
                      ["--tilt-x" as string]: `${Math.abs(tilt) * -1.2}deg`,
                      ["--tilt-y" as string]: `${tilt * 3.2}deg`,
                    }}
                  >
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-3">
                      <FighterPortrait
                        id={fighter.id}
                        size={154}
                        label={`${fighter.label} prism portrait`}
                        className="mx-auto drop-shadow-[0_16px_34px_rgba(0,0,0,0.72)]"
                      />
                    </div>
                    <p className="mt-4 font-display text-lg uppercase tracking-[0.08em] text-foreground">
                      {fighter.label}
                    </p>
                    <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-secondary">
                      Vault #{meta.number} / {meta.rarity}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/60">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${meta.weird}%`, background: strategyMode.accent }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="cards"
          className="gallery-section relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-24 pt-8 md:px-8"
        >
          <AnimatedReveal motion={motionLevel}>
            <div className="mb-8 text-center">
              <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                Skill v1 controls · Iterator deck
              </p>
              <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] md:text-5xl">
                Draft your weirdest pull
              </h2>
              <p className="mx-auto mt-3 max-w-2xl font-body text-xs leading-6 text-secondary">
                Filter rarity, save favorites, browse cyclically, copy card summaries, and keep the
                interaction alive with keyboard shortcuts.
              </p>
            </div>
          </AnimatedReveal>

          <div className="mb-8 flex flex-wrap justify-center gap-2" aria-label="Filter fighters">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "rounded-full border px-4 py-2 font-body text-[10px] uppercase tracking-[0.2em] outline-none transition focus-visible:ring-2 focus-visible:ring-white/70",
                  filter === item.id
                    ? "border-white/50 bg-white/15 text-foreground"
                    : "border-white/10 bg-white/[0.04] text-secondary hover:border-white/30 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <AvatarPicker
            vibe={vibe}
            motionLevel={motionLevel}
            filter={filter}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />

          <div className="mt-12 grid w-full gap-4 md:grid-cols-3">
            {PLAYER_AVATARS.slice(0, 3).map((fighter) => {
              const meta = FIGHTER_CARD_META[fighter.id];
              return (
                <SpotlightCard key={fighter.id} className="p-5" spotlightColor={`${vibeMode.glow}20`}>
                  <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                    Scout note #{meta.number}
                  </p>
                  <p className="mt-3 font-display text-xl uppercase tracking-[0.08em] text-foreground">
                    {fighter.label}
                  </p>
                  <p className="mt-2 font-body text-xs leading-6 text-secondary/85">{meta.flavor}</p>
                </SpotlightCard>
              );
            })}
          </div>
        </section>
      </main>
    </ClickSpark>
  );
}

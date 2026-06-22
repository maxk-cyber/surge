"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AvatarPicker } from "@/components/game/AvatarPicker";
import {
  AnimatedReveal,
  AuroraBackdrop,
  ClickSpark,
  GlareHover,
  MagneticButton,
  ShinyText,
  SpotlightCard,
} from "@/components/ui/reactbits-effects";
import { avatarGalleryImages, avatarScrollImages } from "@/lib/gallery-images";
import { steppedCycle, useIterator } from "@/lib/iterator";
import {
  HERO_BEATS,
  SCOUT_TRANSMISSIONS,
  SHOWROOM_STORAGE_KEYS,
  VIBE_MODES,
  browseFighters,
  formatRosterStats,
  getFavoriteProgress,
  getRarityOdds,
  isMotionLevel,
  isVibeMode,
  parseStoredFavorites,
  parseStoredRecent,
  toggleFavorite,
  updateRecentFighters,
  type FighterFilter,
  type FighterSort,
  type MotionLevel,
  type VibeModeId,
} from "@/lib/showroom";
import { PLAYER_AVATARS, type PlayerAvatarId } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { cn } from "@/lib/utils";

const DomeGallery = dynamic(() => import("@/components/ui/DomeGallery"), { ssr: false });
const FluidGlass = dynamic(() => import("@/components/ui/FluidGlass"), { ssr: false });

const galleryImages = avatarGalleryImages();
const scrollImages = avatarScrollImages(5);
const rosterStats = formatRosterStats();
const filters: { id: FighterFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "common", label: "Common" },
  { id: "rare", label: "Rare" },
  { id: "legend", label: "Legend" },
];
const sortOptions: { id: FighterSort; label: string }[] = [
  { id: "number", label: "Card no." },
  { id: "rarity", label: "Rarity" },
  { id: "weird", label: "Weird" },
  { id: "attack", label: "Attack" },
  { id: "speed", label: "Speed" },
];

function ShowroomDock() {
  return (
    <nav
      aria-label="Showroom sections"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(94vw,560px)] items-center justify-center rounded-full border border-white/10 bg-black/55 p-1.5 shadow-[0_18px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
    >
      {[
        ["Brief", "#brief"],
        ["Dome", "#globe"],
        ["Glass", "#glass"],
        ["Cards", "#cards"],
      ].map(([label, href]) => (
        <a
          key={href}
          href={href}
          className="rounded-full px-4 py-2 font-body text-[10px] uppercase tracking-[0.2em] text-secondary transition hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

export default function CardGalleryPage() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [vibe, setVibe] = useState<VibeModeId>("arcade");
  const [motionLevel, setMotionLevel] = useState<MotionLevel>("showtime");
  const [filter, setFilter] = useState<FighterFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<FighterSort>("number");
  const [favorites, setFavorites] = useState<PlayerAvatarId[]>([]);
  const [recent, setRecent] = useState<PlayerAvatarId[]>([]);
  const vibeMode = VIBE_MODES[vibe];
  const visibleFighters = useMemo(
    () => browseFighters({ fighters: PLAYER_AVATARS, filter, favorites, query, sort }),
    [favorites, filter, query, sort],
  );
  const filteredCount = visibleFighters.length;
  const favoriteProgress = useMemo(() => getFavoriteProgress(favorites), [favorites]);
  const rarityOdds = useMemo(() => getRarityOdds(visibleFighters), [visibleFighters]);
  const recentFighters = useMemo(
    () =>
      recent
        .map((id) => PLAYER_AVATARS.find((fighter) => fighter.id === id))
        .filter((fighter): fighter is (typeof PLAYER_AVATARS)[number] => Boolean(fighter)),
    [recent],
  );
  const hero = useIterator({
    items: HERO_BEATS,
    autoAdvanceMs: 2800,
    enabled: motionLevel === "showtime",
  });
  const scout = useIterator({
    items: SCOUT_TRANSMISSIONS,
    autoAdvanceMs: 3600,
    enabled: motionLevel === "showtime",
  });
  const spotlightOdds = steppedCycle(rarityOdds, scout.index, 3);

  useEffect(() => {
    const storedVibe = localStorage.getItem(SHOWROOM_STORAGE_KEYS.vibe);
    const storedMotion = localStorage.getItem(SHOWROOM_STORAGE_KEYS.motion);
    setVibe(isVibeMode(storedVibe) ? storedVibe : "arcade");
    setMotionLevel(isMotionLevel(storedMotion) ? storedMotion : "showtime");
    setFavorites(parseStoredFavorites(localStorage.getItem(SHOWROOM_STORAGE_KEYS.favorites)));
    setRecent(parseStoredRecent(localStorage.getItem(SHOWROOM_STORAGE_KEYS.recent)));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const chooseVibe = (nextVibe: VibeModeId) => {
    setVibe(nextVibe);
    localStorage.setItem(SHOWROOM_STORAGE_KEYS.vibe, nextVibe);
  };

  const chooseMotion = (nextMotion: MotionLevel) => {
    setMotionLevel(nextMotion);
    localStorage.setItem(SHOWROOM_STORAGE_KEYS.motion, nextMotion);
  };

  const onToggleFavorite = (id: PlayerAvatarId) => {
    setFavorites((current) => {
      const next = toggleFavorite(current, id);
      localStorage.setItem(SHOWROOM_STORAGE_KEYS.favorites, JSON.stringify(next));
      return next;
    });
  };

  const recordActiveFighter = useCallback((id: PlayerAvatarId) => {
    setRecent((current) => {
      const next = updateRecentFighters(current, id);
      localStorage.setItem(SHOWROOM_STORAGE_KEYS.recent, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <ClickSpark motion={motionLevel}>
      <main className={cn("relative min-h-screen overflow-hidden bg-gradient-to-b pb-28", vibeMode.wash)}>
        <AuroraBackdrop accent={vibeMode.glow} glow={vibeMode.accent} motion={motionLevel} />
        <ShowroomDock />

        <header id="brief" className="relative z-20 mx-auto grid min-h-[92vh] w-full max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-[1.05fr_0.95fr] md:px-8">
          <AnimatedReveal motion={motionLevel}>
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.45em] text-secondary">
                Snack Surge · Premium Fighter Showroom
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-5xl uppercase leading-[0.92] tracking-[0.08em] text-foreground md:text-7xl lg:text-8xl">
                <ShinyText
                  text="Card gallery for cafeteria cryptids."
                  color="#f2f2f2"
                  shineColor={vibeMode.accent}
                  motion={motionLevel}
                />
              </h1>
              <p
                className="mt-5 min-h-8 font-body text-sm uppercase tracking-[0.2em]"
                style={{ color: vibeMode.accent }}
                aria-live="polite"
              >
                {hero.activeItem}
              </p>
              <p className="mt-6 max-w-2xl font-body text-sm leading-7 text-secondary/90 md:text-base">
                Browse the roster as a product-grade collectible interface: spin the PNG portrait dome,
                inspect the refraction wall, filter rarity, favorite your fighters, and copy shareable
                card summaries from the deck.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <MagneticButton onClick={() => document.querySelector("#cards")?.scrollIntoView({ behavior: "smooth" })}>
                  Draft a fighter
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
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-secondary">
                          Binder progress
                        </p>
                        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground">
                          {favoriteProgress.collected}/{favoriteProgress.total}
                        </p>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/60 ring-1 ring-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-white via-white to-transparent transition-[width]"
                          style={{ width: `${favoriteProgress.percent}%` }}
                        />
                      </div>
                      <p className="mt-2 font-body text-xs leading-5 text-secondary/80">
                        {favoriteProgress.percent}% collected · press <kbd className="rounded bg-white/10 px-1">/</kbd> to search.
                      </p>
                    </div>

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

                    <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                      <p className="font-body text-[10px] uppercase tracking-[0.2em] text-secondary">
                        Scout transmission
                      </p>
                      <p className="mt-2 min-h-10 font-body text-xs leading-5 text-foreground" aria-live="polite">
                        {scout.activeItem}
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {spotlightOdds.map(({ item }) => (
                          <div key={item.rarity} className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
                            <p className="font-body text-[8px] uppercase tracking-[0.18em] text-secondary">
                              {item.rarity}
                            </p>
                            <p className="mt-1 font-display text-xl text-foreground">{item.percent}%</p>
                            <p className="font-body text-[8px] uppercase tracking-[0.14em] text-secondary/80">
                              {item.count} cards
                            </p>
                          </div>
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
            ["Roster", rosterStats.total, "PNG fighters loaded from public/avatars"],
            ["Legends", rosterStats.legend, "Top-tier pulls with premium foil"],
            ["Avg weird", rosterStats.averageWeird, "Snack Surge oddity score"],
            ["Shown", filteredCount, `${filter} · ${sort}${query.trim() ? ` · "${query.trim()}"` : ""}`],
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

        <section id="globe" className="gallery-section relative z-10 mt-20 h-[min(88vh,920px)] w-full">
          <div className="pointer-events-none absolute inset-x-0 top-8 z-30 px-5 text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
              ReactBits DomeGallery · Public PNG atlas
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

        <section id="glass" className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
          <AnimatedReveal motion={motionLevel}>
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                  FluidGlass · GLB lens assets
                </p>
                <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] md:text-5xl">
                  Refraction wall
                </h2>
              </div>
              <p className="max-w-md font-body text-xs leading-6 text-secondary">
                Scroll inside the panel and move your pointer: the lens bends real checked-in PNG art,
                giving the roster a tactile premium preview without hiding the cards.
              </p>
            </div>
          </AnimatedReveal>
          <div
            className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_100px_rgba(0,0,0,0.55)]"
            style={{ background: `linear-gradient(135deg, ${vibeMode.glow}, #080808 62%)` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_28%,rgba(255,255,255,0.08)_52%,transparent_72%)]" />
            <div className="relative h-[620px]">
              <FluidGlass
                mode="lens"
                title="Snack Surge"
                imageUrls={scrollImages}
                lensProps={{
                  scale: 0.25,
                  ior: 1.15,
                  thickness: 5,
                  chromaticAberration: motionLevel === "calm" ? 0.03 : 0.1,
                  anisotropy: 0.01,
                }}
              />
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

          <AnimatedReveal delay={0.05} motion={motionLevel} className="w-full">
            <SpotlightCard className="mb-5 w-full p-4 md:p-5" spotlightColor={`${vibeMode.accent}20`}>
              <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
                <label className="block">
                  <span className="font-body text-[10px] uppercase tracking-[0.24em] text-secondary">
                    Search the roster
                  </span>
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Try legend, skull, cheese, HP, 100..."
                    className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/45 px-4 font-body text-sm text-foreground outline-none transition placeholder:text-secondary/55 focus:border-white/45 focus:ring-2 focus:ring-white/20"
                    aria-label="Search fighters"
                  />
                </label>
                <label className="block">
                  <span className="font-body text-[10px] uppercase tracking-[0.24em] text-secondary">
                    Sort deck
                  </span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as FighterSort)}
                    className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/45 px-4 font-body text-xs uppercase tracking-[0.14em] text-foreground outline-none transition focus:border-white/45 focus:ring-2 focus:ring-white/20"
                    aria-label="Sort fighters"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <MagneticButton
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                      setSort("number");
                    }}
                    aria-label="Reset fighter browser"
                  >
                    Reset
                  </MagneticButton>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <p className="font-body text-xs uppercase tracking-[0.18em] text-secondary" aria-live="polite">
                  {filteredCount} visible · {favoriteProgress.collected} favorited · sorted by {sort}
                </p>
                <p className="font-body text-[10px] uppercase tracking-[0.18em] text-secondary/80">
                  Shortcut: / search · arrows browse · F favorite
                </p>
              </div>
            </SpotlightCard>
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

          {recentFighters.length > 0 && (
            <AnimatedReveal delay={0.08} motion={motionLevel} className="mb-8 w-full">
              <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/30 p-3 md:flex-row md:justify-between">
                <p className="font-body text-[10px] uppercase tracking-[0.24em] text-secondary">
                  Recent pulls
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {recentFighters.map((fighter) => (
                    <button
                      key={fighter.id}
                      type="button"
                      onClick={() => {
                        setFilter("all");
                        setQuery(fighter.label);
                        setSort("number");
                      }}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 font-body text-[10px] uppercase tracking-[0.16em] text-secondary transition hover:border-white/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      {fighter.label}
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedReveal>
          )}

          <AvatarPicker
            vibe={vibe}
            motionLevel={motionLevel}
            filter={filter}
            query={query}
            sort={sort}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onActiveChange={recordActiveFighter}
          />

          <div className="mt-12 grid w-full gap-4 md:grid-cols-3">
            {PLAYER_AVATARS.slice(0, 3).map((fighter) => {
              const meta = FIGHTER_CARD_META[fighter.id];
              return (
                <GlareHover key={fighter.id} className="h-full rounded-[2rem]" glareColor={vibeMode.accent} motion={motionLevel}>
                  <SpotlightCard className="h-full p-5" spotlightColor={`${vibeMode.glow}20`}>
                    <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                      Scout note #{meta.number}
                    </p>
                    <p className="mt-3 font-display text-xl uppercase tracking-[0.08em] text-foreground">
                      {fighter.label}
                    </p>
                    <p className="mt-2 font-body text-xs leading-6 text-secondary/85">{meta.flavor}</p>
                  </SpotlightCard>
                </GlareHover>
              );
            })}
          </div>
        </section>
      </main>
    </ClickSpark>
  );
}

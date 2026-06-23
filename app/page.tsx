"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AvatarPicker } from "@/components/game/AvatarPicker";
import {
  AnimatedReveal,
  AuroraBackdrop,
  ClickSpark,
  MagneticButton,
  RibbonField,
  SignalText,
  SpotlightCard,
} from "@/components/ui/reactbits-effects";
import { avatarGalleryImages, avatarScrollImages } from "@/lib/gallery-images";
import { useIterator, windowAroundIndex } from "@/lib/iterator";
import {
  HERO_BEATS,
  SHOWROOM_SECTIONS,
  SHOWROOM_STORAGE_KEYS,
  VIBE_MODES,
  buildThreatBriefings,
  createCardSummary,
  filterFighters,
  formatRosterStats,
  isFighterFilter,
  isMotionLevel,
  isVibeMode,
  parseStoredFavorites,
  parseShowroomSearch,
  toggleFavorite,
  updateShowroomSearch,
  type FighterFilter,
  type MotionLevel,
  type ShowroomSectionId,
  type VibeModeId,
} from "@/lib/showroom";
import { getStoredAvatarId, setStoredAvatarId, PLAYER_AVATARS, type PlayerAvatarId } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { cn } from "@/lib/utils";

const DomeGallery = dynamic(() => import("@/components/ui/DomeGallery"), { ssr: false });

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

function ShowroomDock({ activeSection }: { activeSection: ShowroomSectionId }) {
  return (
    <nav
      aria-label="Showroom sections"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(94vw,560px)] items-center justify-center rounded-full border border-white/10 bg-black/55 p-1.5 shadow-[0_18px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
    >
      {SHOWROOM_SECTIONS.map(({ id, label, href }) => (
        <a
          key={href}
          href={href}
          aria-current={activeSection === id ? "true" : undefined}
          className={cn(
            "rounded-full px-3 py-2 font-body text-[10px] uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:px-4",
            activeSection === id
              ? "bg-white/15 text-foreground shadow-[0_0_24px_rgba(255,255,255,0.12)]"
              : "text-secondary hover:bg-white/10 hover:text-foreground",
          )}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

function isShowroomSection(id: string): id is ShowroomSectionId {
  return SHOWROOM_SECTIONS.some((section) => section.id === id);
}

export default function CardGalleryPage() {
  const [vibe, setVibe] = useState<VibeModeId>("arcade");
  const [motionLevel, setMotionLevel] = useState<MotionLevel>("showtime");
  const [filter, setFilter] = useState<FighterFilter>("all");
  const [favorites, setFavorites] = useState<PlayerAvatarId[]>([]);
  const [selectedFighterId, setSelectedFighterId] = useState<PlayerAvatarId>("skullmic");
  const [activeSection, setActiveSection] = useState<ShowroomSectionId>("brief");
  const [copiedShare, setCopiedShare] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const vibeMode = VIBE_MODES[vibe];
  const selectedFighter = useMemo(
    () => PLAYER_AVATARS.find((fighter) => fighter.id === selectedFighterId) ?? PLAYER_AVATARS[0],
    [selectedFighterId],
  );
  const selectedIndex = useMemo(
    () => Math.max(0, PLAYER_AVATARS.findIndex((fighter) => fighter.id === selectedFighter.id)),
    [selectedFighter.id],
  );
  const threatBriefings = useMemo(() => buildThreatBriefings(selectedFighter), [selectedFighter]);
  const filteredCount = useMemo(
    () => filterFighters(PLAYER_AVATARS, filter, favorites).length,
    [favorites, filter],
  );
  const hero = useIterator({
    items: HERO_BEATS,
    autoAdvanceMs: 2800,
    enabled: motionLevel === "showtime",
  });
  const threat = useIterator({
    items: threatBriefings,
    autoAdvanceMs: 4200,
    enabled: motionLevel === "showtime",
  });
  const scoutNotes = useMemo(
    () => windowAroundIndex(PLAYER_AVATARS, selectedIndex, 1),
    [selectedIndex],
  );

  useEffect(() => {
    const query = parseShowroomSearch(window.location.search);
    const storedVibe = localStorage.getItem(SHOWROOM_STORAGE_KEYS.vibe);
    const storedMotion = localStorage.getItem(SHOWROOM_STORAGE_KEYS.motion);
    const storedFilter = localStorage.getItem("snack-surge-filter");
    setVibe(query.vibe ?? (isVibeMode(storedVibe) ? storedVibe : "arcade"));
    setMotionLevel(query.motion ?? (isMotionLevel(storedMotion) ? storedMotion : "showtime"));
    setFilter(query.filter ?? (isFighterFilter(storedFilter) ? storedFilter : "all"));
    setSelectedFighterId(query.fighter ?? getStoredAvatarId());
    setFavorites(parseStoredFavorites(localStorage.getItem(SHOWROOM_STORAGE_KEYS.favorites)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id && isShowroomSection(visible.target.id)) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.2, 0.45, 0.7] },
    );

    SHOWROOM_SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("snack-surge-filter", filter);
    const nextSearch = updateShowroomSearch(window.location.search, {
      vibe,
      motion: motionLevel,
      filter,
      fighter: selectedFighterId,
    });
    const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [filter, hydrated, motionLevel, selectedFighterId, vibe]);

  const chooseVibe = (nextVibe: VibeModeId) => {
    setVibe(nextVibe);
    localStorage.setItem(SHOWROOM_STORAGE_KEYS.vibe, nextVibe);
  };

  const chooseMotion = (nextMotion: MotionLevel) => {
    setMotionLevel(nextMotion);
    localStorage.setItem(SHOWROOM_STORAGE_KEYS.motion, nextMotion);
  };

  const chooseFighter = (id: PlayerAvatarId) => {
    setSelectedFighterId(id);
    setStoredAvatarId(id);
  };

  const onToggleFavorite = (id: PlayerAvatarId) => {
    setFavorites((current) => {
      const next = toggleFavorite(current, id);
      localStorage.setItem(SHOWROOM_STORAGE_KEYS.favorites, JSON.stringify(next));
      return next;
    });
  };

  const copyShareLink = async () => {
    const nextSearch = updateShowroomSearch(window.location.search, {
      vibe,
      motion: motionLevel,
      filter,
      fighter: selectedFighterId,
    });
    const url = `${window.location.origin}${window.location.pathname}${nextSearch}#cards`;
    try {
      await navigator.clipboard?.writeText(`${url}\n${createCardSummary(selectedFighter)}`);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 1400);
    } catch {
      setCopiedShare(false);
    }
  };

  return (
    <ClickSpark motion={motionLevel}>
      <main className={cn("relative min-h-screen overflow-hidden bg-gradient-to-b pb-28", vibeMode.wash)}>
        <AuroraBackdrop accent={vibeMode.glow} glow={vibeMode.accent} motion={motionLevel} />
        <RibbonField accent={vibeMode.accent} motion={motionLevel} className="opacity-35" />
        <ShowroomDock activeSection={activeSection} />

        <header id="brief" className="relative z-20 mx-auto grid min-h-[92vh] w-full max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-[1.05fr_0.95fr] md:px-8">
          <AnimatedReveal motion={motionLevel}>
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.45em] text-secondary">
                Snack Surge · Premium Fighter Showroom
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-5xl uppercase leading-[0.92] tracking-[0.08em] text-foreground md:text-7xl lg:text-8xl">
                Card gallery for cafeteria cryptids.
              </h1>
              <p
                className="mt-5 min-h-8 font-body text-sm uppercase tracking-[0.2em]"
                style={{ color: vibeMode.accent }}
                aria-live="polite"
              >
                <SignalText text={hero.activeItem ?? HERO_BEATS[0]} motion={motionLevel} />
              </p>
              <p className="mt-6 max-w-2xl font-body text-sm leading-7 text-secondary/90 md:text-base">
                Browse the roster as a product-grade collectible interface: spin the generated portrait dome,
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
                <MagneticButton onClick={copyShareLink} aria-label="Copy shareable showroom link">
                  {copiedShare ? "Link copied" : "Share cabinet"}
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

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-secondary">
                        Now scouting
                      </p>
                      <p className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-foreground">
                        {selectedFighter.label}
                      </p>
                      <p className="mt-2 font-body text-xs leading-5 text-secondary/85">
                        {createCardSummary(selectedFighter)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </AnimatedReveal>
        </header>

        <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-4 px-5 md:grid-cols-4 md:px-8">
          {[
            ["Roster", rosterStats.total, "Self-contained generated SVG fighters"],
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

        <section id="recipe" className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
          <AnimatedReveal motion={motionLevel}>
            <SpotlightCard className="overflow-hidden p-0" spotlightColor={`${vibeMode.glow}24`}>
              <div className="relative grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
                <div
                  className="relative min-h-[360px] overflow-hidden border-b border-white/10 bg-black/55 p-6 lg:border-b-0 lg:border-r"
                  style={{ borderColor: `${vibeMode.accent}22` }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.18),transparent_38%)]" />
                  <div className="absolute inset-x-8 bottom-10 top-12 rounded-full border border-white/10 bg-white/[0.03] blur-sm" />
                  <div className="relative flex h-full min-h-[320px] items-center justify-center">
                    <img
                      src={galleryImages[selectedIndex]?.src ?? galleryImages[0]?.src}
                      alt={`${selectedFighter.label} generated portrait`}
                      className="h-[min(68vw,310px)] w-[min(68vw,310px)] object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.75)]"
                      draggable={false}
                    />
                  </div>
                </div>

                <div className="relative p-6 md:p-8">
                  <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                    Iterator threat recipe · Live fighter sync
                  </p>
                  <h2 className="mt-3 font-display text-3xl uppercase leading-none tracking-[0.12em] text-foreground md:text-5xl">
                    Cabinet intelligence that follows your pull
                  </h2>

                  <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 font-body text-[10px] uppercase tracking-[0.2em] text-secondary">
                        {threat.activeItem?.label}
                      </span>
                      <span className="font-body text-[10px] uppercase tracking-[0.2em] text-secondary">
                        {threat.index + 1} / {threatBriefings.length}
                      </span>
                    </div>
                    <p className="mt-4 font-display text-2xl uppercase tracking-[0.1em] text-foreground">
                      {threat.activeItem?.title}
                    </p>
                    <p className="mt-3 font-body text-sm leading-7 text-secondary/90">
                      {threat.activeItem?.body}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <MagneticButton onClick={threat.previous} aria-label="Previous threat briefing">
                      Previous intel
                    </MagneticButton>
                    <MagneticButton onClick={threat.next} aria-label="Next threat briefing">
                      Next intel
                    </MagneticButton>
                    <MagneticButton onClick={() => chooseFighter(selectedFighter.id)} aria-label={`Lock ${selectedFighter.label}`}>
                      Lock pull
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </AnimatedReveal>
        </section>

        <section id="globe" className="gallery-section relative z-10 mt-20 h-[min(88vh,920px)] w-full">
          <div className="pointer-events-none absolute inset-x-0 top-8 z-30 px-5 text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
              ReactBits DomeGallery · Generated SVG atlas
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
                  Prism wall · CSS glass atlas
                </p>
                <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] md:text-5xl">
                  Refraction wall
                </h2>
              </div>
              <p className="max-w-md font-body text-xs leading-6 text-secondary">
                A fast, static-export-safe glass wall replaces missing 3D lens assets with layered
                portraits, scanlines, and tactile hover states that still feel collectible.
              </p>
            </div>
          </AnimatedReveal>
          <div
            className="relative overflow-hidden rounded-[2rem] border border-white/10 p-4 shadow-[0_24px_100px_rgba(0,0,0,0.55)] md:p-6"
            style={{ background: `linear-gradient(135deg, ${vibeMode.glow}, #080808 62%)` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16),transparent_28%,rgba(255,255,255,0.08)_52%,transparent_72%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:100%_18px] opacity-40" />
            <div className="relative grid gap-4 md:grid-cols-5">
              {PLAYER_AVATARS.slice(0, 5).map((fighter, index) => {
                const meta = FIGHTER_CARD_META[fighter.id];
                const isActive = fighter.id === selectedFighter.id;
                return (
                  <button
                    key={fighter.id}
                    type="button"
                    onClick={() => chooseFighter(fighter.id)}
                    className={cn(
                      "group relative min-h-[260px] overflow-hidden rounded-[1.5rem] border bg-black/40 p-4 text-left outline-none backdrop-blur-md transition focus-visible:ring-2 focus-visible:ring-white/70",
                      isActive
                        ? "border-white/50 shadow-[0_0_50px_rgba(255,255,255,0.16)]"
                        : "border-white/10 hover:-translate-y-1 hover:border-white/35",
                    )}
                    style={{ marginTop: index % 2 === 0 ? 0 : 18 }}
                    aria-pressed={isActive}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.18),transparent_46%)] opacity-80" />
                    <img
                      src={scrollImages[index]}
                      alt={`${fighter.label} prism portrait`}
                      className="relative mx-auto h-40 w-40 object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.7)] transition group-hover:scale-105"
                      draggable={false}
                    />
                    <div className="relative mt-4">
                      <p className="font-display text-xl uppercase tracking-[0.1em] text-foreground">
                        {fighter.label}
                      </p>
                      <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-secondary">
                        {meta.rarity} · WRD {meta.weird}
                      </p>
                    </div>
                  </button>
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
            selectedId={selectedFighterId}
            onSelectedChange={chooseFighter}
          />

          <div className="mt-12 grid w-full gap-4 md:grid-cols-3">
            {scoutNotes.map(({ item: fighter, distance }) => {
              const meta = FIGHTER_CARD_META[fighter.id];
              return (
                <SpotlightCard key={fighter.id} className="p-5" spotlightColor={`${vibeMode.glow}20`}>
                  <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                    {distance === 0 ? "Active scout note" : "Adjacent scout note"} #{meta.number}
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

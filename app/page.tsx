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
import { FighterPortrait } from "@/components/ui/FighterPortrait";
import { avatarGalleryImages, avatarScrollImages } from "@/lib/gallery-images";
import { useIterator } from "@/lib/iterator";
import {
  MAX_SQUAD_SIZE,
  HERO_BEATS,
  SHOWROOM_STORAGE_KEYS,
  VIBE_MODES,
  buildSquadShareText,
  filterFighters,
  formatRosterStats,
  isMotionLevel,
  isVibeMode,
  parseStoredFavorites,
  parseStoredSquad,
  summarizeSquad,
  toggleFavorite,
  toggleSquadMember,
  type FighterFilter,
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

function ShowroomDock() {
  return (
    <nav
      aria-label="Showroom sections"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(94vw,640px)] items-center justify-center rounded-full border border-white/10 bg-black/55 p-1.5 shadow-[0_18px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
    >
      {[
        ["Brief", "#brief"],
        ["Squad", "#squad"],
        ["Dome", "#globe"],
        ["Glass", "#glass"],
        ["Cards", "#cards"],
      ].map(([label, href]) => (
        <a
          key={href}
          href={href}
          className="rounded-full px-3 py-2 font-body text-[10px] uppercase tracking-[0.2em] text-secondary transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:px-4"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

function SquadCockpit({
  squad,
  accent,
  glow,
  motionLevel,
  onToggleSquad,
}: {
  squad: PlayerAvatarId[];
  accent: string;
  glow: string;
  motionLevel: MotionLevel;
  onToggleSquad: (id: PlayerAvatarId) => void;
}) {
  const [copied, setCopied] = useState(false);
  const summary = useMemo(() => summarizeSquad(squad), [squad]);
  const members = useMemo(
    () =>
      squad
        .map((id) => PLAYER_AVATARS.find((fighter) => fighter.id === id))
        .filter((fighter): fighter is (typeof PLAYER_AVATARS)[number] => Boolean(fighter)),
    [squad],
  );

  const copySquad = async () => {
    try {
      await navigator.clipboard?.writeText(buildSquadShareText(squad));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="squad" className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-16 md:px-8">
      <AnimatedReveal motion={motionLevel}>
        <SpotlightCard className="relative overflow-hidden p-0" spotlightColor={`${accent}22`}>
          <RibbonField accent={glow} glow={accent} motion={motionLevel} className="opacity-80" />
          <div className="relative grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-white/10 bg-black/45 p-6 md:p-8 lg:border-b-0 lg:border-r">
              <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                Skill v1 squad builder
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.11em] text-foreground md:text-5xl">
                Build a surge squad
              </h2>
              <p className="mt-4 max-w-xl font-body text-sm leading-7 text-secondary/90">
                Add up to three fighters from the draft deck. A full squad benches the oldest pick,
                keeping the flow fast like a real card pull session.
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between font-body text-[10px] uppercase tracking-[0.22em] text-secondary">
                  <span>Squad charge</span>
                  <span>{summary.completion}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-white via-lime-200 to-fuchsia-200 transition-[width]"
                    style={{ width: `${summary.completion}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <MagneticButton onClick={() => document.querySelector("#cards")?.scrollIntoView({ behavior: "smooth" })}>
                  Draft fighters
                </MagneticButton>
                <MagneticButton onClick={copySquad} disabled={summary.count === 0} aria-label="Copy squad summary">
                  {copied ? "Copied squad" : "Copy squad"}
                </MagneticButton>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {Array.from({ length: MAX_SQUAD_SIZE }, (_, index) => {
                  const fighter = members[index];
                  const meta = fighter ? FIGHTER_CARD_META[fighter.id] : null;
                  return (
                    <div
                      key={fighter?.id ?? index}
                      className={cn(
                        "relative min-h-[190px] overflow-hidden rounded-[1.5rem] border p-4 text-center",
                        fighter ? "border-white/15 bg-white/[0.07]" : "border-dashed border-white/15 bg-black/25",
                      )}
                    >
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-black/45">
                        {fighter ? (
                          <FighterPortrait id={fighter.id} size={84} label={`${fighter.label} squad portrait`} />
                        ) : (
                          <span className="font-display text-3xl text-secondary/40">{index + 1}</span>
                        )}
                      </div>
                      <p className="mt-3 font-display text-lg uppercase tracking-[0.1em] text-foreground">
                        {fighter?.label ?? "Open slot"}
                      </p>
                      <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-secondary">
                        {meta ? `${meta.rarity} · ${meta.type}` : "Press S on a card"}
                      </p>
                      {fighter && (
                        <button
                          type="button"
                          onClick={() => onToggleSquad(fighter.id)}
                          className="mt-3 rounded-full border border-white/15 px-3 py-1 font-body text-[9px] uppercase tracking-[0.18em] text-secondary transition hover:border-white/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                          Bench
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.28em] text-secondary">
                      Current combo
                    </p>
                    <p className="mt-1 font-display text-2xl uppercase tracking-[0.1em] text-foreground">
                      {summary.signature}
                    </p>
                    <p className="mt-1 font-body text-xs leading-5 text-secondary/80">{summary.label}</p>
                  </div>
                  <dl className="grid min-w-[260px] grid-cols-4 gap-2 font-body text-[10px] uppercase tracking-wider text-secondary">
                    {[
                      ["HP", summary.totalHp],
                      ["ATK", summary.totalAtk],
                      ["SPD", summary.totalSpd],
                      ["WRD", summary.totalWeird],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-center">
                        <dt>{label}</dt>
                        <dd className="mt-1 text-base text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </AnimatedReveal>
    </section>
  );
}

export default function CardGalleryPage() {
  const [vibe, setVibe] = useState<VibeModeId>("arcade");
  const [motionLevel, setMotionLevel] = useState<MotionLevel>("showtime");
  const [filter, setFilter] = useState<FighterFilter>("all");
  const [favorites, setFavorites] = useState<PlayerAvatarId[]>([]);
  const [squad, setSquad] = useState<PlayerAvatarId[]>([]);
  const vibeMode = VIBE_MODES[vibe];
  const filteredCount = useMemo(
    () => filterFighters(PLAYER_AVATARS, filter, favorites).length,
    [favorites, filter],
  );
  const squadSummary = useMemo(() => summarizeSquad(squad), [squad]);
  const hero = useIterator({
    items: HERO_BEATS,
    autoAdvanceMs: 2800,
    enabled: motionLevel === "showtime",
  });

  useEffect(() => {
    const storedVibe = localStorage.getItem(SHOWROOM_STORAGE_KEYS.vibe);
    const storedMotion = localStorage.getItem(SHOWROOM_STORAGE_KEYS.motion);
    setVibe(isVibeMode(storedVibe) ? storedVibe : "arcade");
    setMotionLevel(isMotionLevel(storedMotion) ? storedMotion : "showtime");
    setFavorites(parseStoredFavorites(localStorage.getItem(SHOWROOM_STORAGE_KEYS.favorites)));
    setSquad(parseStoredSquad(localStorage.getItem(SHOWROOM_STORAGE_KEYS.squad)));
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

  const onToggleSquad = (id: PlayerAvatarId) => {
    setSquad((current) => {
      const next = toggleSquadMember(current, id);
      localStorage.setItem(SHOWROOM_STORAGE_KEYS.squad, JSON.stringify(next));
      return next;
    });
  };

  return (
    <ClickSpark motion={motionLevel}>
      <main className={cn("relative min-h-screen overflow-hidden bg-gradient-to-b pb-28", vibeMode.wash)}>
        <AuroraBackdrop accent={vibeMode.glow} glow={vibeMode.accent} motion={motionLevel} />
        <RibbonField accent={vibeMode.glow} glow={vibeMode.accent} motion={motionLevel} className="z-[1] opacity-45" />
        <ShowroomDock />

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
            ["Roster", rosterStats.total, "PNG fighters loaded from public/avatars"],
            ["Legends", rosterStats.legend, "Top-tier pulls with premium foil"],
            ["Squad", `${squadSummary.count}/${MAX_SQUAD_SIZE}`, squadSummary.signature],
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

        <SquadCockpit
          squad={squad}
          accent={vibeMode.accent}
          glow={vibeMode.glow}
          motionLevel={motionLevel}
          onToggleSquad={onToggleSquad}
        />

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
            squad={squad}
            onToggleFavorite={onToggleFavorite}
            onToggleSquad={onToggleSquad}
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

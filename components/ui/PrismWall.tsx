"use client";

import { FighterPortrait } from "@/components/ui/FighterPortrait";
import { AnimatedReveal, ShinyText, SpotlightCard } from "@/components/ui/reactbits-effects";
import { PLAYER_AVATARS } from "@/lib/avatars";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import { useIterator } from "@/lib/iterator";
import { VIBE_MODES, type MotionLevel, type VibeModeId } from "@/lib/showroom";
import { cn } from "@/lib/utils";

export function PrismWall({ vibe, motionLevel }: { vibe: VibeModeId; motionLevel: MotionLevel }) {
  const vibeMode = VIBE_MODES[vibe];
  const featured = PLAYER_AVATARS.slice(0, 8);
  const iterator = useIterator({
    items: featured,
    autoAdvanceMs: 2600,
    enabled: motionLevel === "showtime",
  });
  const active = iterator.activeItem ?? featured[0];
  const activeMeta = active ? FIGHTER_CARD_META[active.id] : null;

  return (
    <section id="glass" className="gallery-section relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
      <AnimatedReveal motion={motionLevel}>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
              CSS PrismWall · Generated portrait atlas
            </p>
            <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] md:text-5xl">
              <ShinyText motion={motionLevel}>Refraction wall</ShinyText>
            </h2>
          </div>
          <p className="max-w-md font-body text-xs leading-6 text-secondary">
            A lightweight liquid-glass inspection wall with moving highlights, keyboard-safe buttons,
            and no external 3D model dependency.
          </p>
        </div>
      </AnimatedReveal>

      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_100px_rgba(0,0,0,0.55)]"
        style={{ background: `linear-gradient(135deg, ${vibeMode.glow}66, #080808 62%)` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(120deg,rgba(255,255,255,0.12),transparent_28%,rgba(255,255,255,0.08)_52%,transparent_72%)]" />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-[-30%] z-20 w-1/3 bg-gradient-to-r from-transparent via-white/16 to-transparent",
            motionLevel === "showtime" && "animate-glass-scan",
          )}
          aria-hidden="true"
        />

        <div className="relative grid min-h-[620px] gap-5 p-5 md:grid-cols-[1.05fr_0.95fr] md:p-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-3">
            {featured.map((avatar, index) => {
              const meta = FIGHTER_CARD_META[avatar.id];
              const activeTile = active?.id === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => iterator.goTo(index)}
                  className={cn(
                    "group relative min-h-40 overflow-hidden rounded-[1.35rem] border bg-black/45 p-3 text-left outline-none backdrop-blur-xl transition focus-visible:ring-2 focus-visible:ring-white/70",
                    activeTile
                      ? "border-white/55 shadow-[0_0_32px_rgba(255,255,255,0.12)]"
                      : "border-white/10 hover:border-white/30",
                  )}
                  aria-pressed={activeTile}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_55%)] opacity-0 transition group-hover:opacity-100" />
                  <div className="relative flex items-center justify-center">
                    <FighterPortrait id={avatar.id} size={112} label={`${avatar.label} prism tile`} />
                  </div>
                  <p className="relative mt-2 truncate font-display text-sm uppercase tracking-[0.1em] text-foreground">
                    {avatar.label}
                  </p>
                  <p className="relative font-body text-[9px] uppercase tracking-[0.18em] text-secondary">
                    {meta.rarity} · WRD {meta.weird}
                  </p>
                </button>
              );
            })}
          </div>

          {active && activeMeta && (
            <SpotlightCard className="relative flex min-h-[520px] flex-col justify-between p-5" spotlightColor={`${vibeMode.accent}24`}>
              <div className="absolute inset-4 rounded-[1.5rem] border border-white/10 bg-white/[0.035]" />
              <div className="relative">
                <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
                  Live lens target
                </p>
                <h3 className="mt-3 font-display text-4xl uppercase tracking-[0.1em] text-foreground md:text-6xl">
                  {active.label}
                </h3>
                <p className="mt-3 font-body text-xs uppercase tracking-[0.2em]" style={{ color: vibeMode.accent }}>
                  {active.tagline}
                </p>
              </div>

              <div className="relative mx-auto grid h-64 w-64 place-items-center rounded-full border border-white/15 bg-black/35 shadow-[inset_0_0_48px_rgba(255,255,255,0.08)] backdrop-blur-2xl">
                <div
                  className="absolute inset-4 rounded-full blur-2xl"
                  style={{ background: `radial-gradient(circle, ${vibeMode.glow}44, transparent 65%)` }}
                />
                <FighterPortrait
                  id={active.id}
                  size={220}
                  label={`${active.label} refracted portrait`}
                  className="relative drop-shadow-[0_20px_44px_rgba(0,0,0,0.85)]"
                />
              </div>

              <dl className="relative grid grid-cols-4 gap-2 font-body text-[10px] uppercase tracking-wider text-secondary">
                {[
                  ["HP", activeMeta.hp],
                  ["ATK", activeMeta.atk],
                  ["SPD", activeMeta.spd],
                  ["WRD", activeMeta.weird],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-black/35 p-2 text-center">
                    <dt>{label}</dt>
                    <dd className="mt-1 text-base text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </SpotlightCard>
          )}
        </div>
      </div>
    </section>
  );
}

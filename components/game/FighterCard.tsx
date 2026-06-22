"use client";

import { FighterPortrait } from "@/components/ui/FighterPortrait";
import { FIGHTER_CARD_META } from "@/lib/fighter-cards";
import type { AvatarDef } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const RARITY = {
  common: { label: "COMMON", dots: 1, tone: "from-zinc-400 to-white" },
  rare: { label: "RARE", dots: 2, tone: "from-cyan-200 via-white to-violet-200" },
  legend: { label: "LEGEND", dots: 3, tone: "from-amber-200 via-white to-fuchsia-200" },
} as const;

export function FighterCard({
  avatar,
  favorite = false,
  accent = "#f7f7f7",
}: {
  avatar: AvatarDef;
  favorite?: boolean;
  accent?: string;
}) {
  const meta = FIGHTER_CARD_META[avatar.id];
  const rarity = RARITY[meta.rarity];

  return (
    <article
      className="fighter-card-pro relative flex h-full w-full flex-col overflow-hidden rounded-2xl text-left"
      style={{ ["--card-accent" as string]: accent }}
      aria-label={`${avatar.label} fighter card`}
    >
      <div className="fighter-card-shine pointer-events-none absolute inset-0 z-20" />
      <div className="fighter-card-grid pointer-events-none absolute inset-0 z-[1]" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-foreground/50" />
      <div className="pointer-events-none absolute inset-[3px] rounded-[13px] border border-foreground/15" />

      <header className="relative z-10 flex items-center justify-between bg-gradient-to-r from-black/80 via-black/60 to-black/80 px-3.5 py-2">
        <span className="rounded-sm border border-foreground/20 bg-black/40 px-2 py-0.5 font-body text-[9px] uppercase tracking-[0.2em] text-secondary">
          {meta.type}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-body text-[9px] uppercase tracking-wider text-secondary">HP</span>
          <span className="font-display text-lg leading-none text-foreground">{meta.hp}</span>
        </div>
      </header>

      <div className="relative z-10 mx-2.5 mt-2.5 overflow-hidden rounded-xl border border-foreground/20 bg-black shadow-inner">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--card-accent) 26%, transparent), transparent 62%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="flex h-[188px] items-center justify-center px-1 py-2">
          <FighterPortrait
            id={avatar.id}
            size={172}
            priority
            label={`${avatar.label} portrait`}
            className="drop-shadow-[0_12px_32px_rgba(0,0,0,0.8)]"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-2 pt-8">
          <div className="flex items-end justify-between gap-2">
            <h3 className="font-display text-base uppercase tracking-wide text-foreground">
              {avatar.label}
            </h3>
            <span className="rounded border border-foreground/25 bg-black/50 px-1.5 py-0.5 font-body text-[8px] text-secondary">
              #{meta.number}
            </span>
          </div>
        </div>
      </div>

      <p className="relative z-10 h-[52px] overflow-hidden px-3.5 pt-2 font-body text-[10px] italic leading-relaxed text-secondary/90">
        {meta.flavor}
      </p>

      <div className="relative z-10 mt-auto space-y-1.5 px-3.5 py-2.5">
        {(
          [
            ["ATK", meta.atk],
            ["SPD", meta.spd],
            ["WRD", meta.weird],
          ] as const
        ).map(([label, val]) => (
          <div key={label} className="flex items-center gap-2 font-body text-[9px]">
            <span className="w-7 font-medium text-secondary">{label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/70 ring-1 ring-white/5">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r", rarity.tone)}
                style={{ width: `${Math.min(100, val)}%` }}
              />
            </div>
            <span className="w-6 text-right tabular-nums text-foreground/85">{val}</span>
          </div>
        ))}
      </div>

      <footer className="relative z-10 flex items-center justify-between border-t border-white/10 bg-black/50 px-3.5 py-2">
        <span className="font-body text-[9px] uppercase tracking-[0.18em] text-secondary">
          {avatar.tagline}
        </span>
        <span className="flex items-center gap-1 font-body text-[8px] uppercase tracking-widest text-foreground/70">
          {favorite ? "FAV · " : ""}
          {rarity.label}
          <span className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: rarity.dots }, (_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-current" />
            ))}
          </span>
        </span>
      </footer>
    </article>
  );
}

export function FighterThumb({
  avatar,
  active,
  onClick,
}: {
  avatar: AvatarDef;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-lg border-2 bg-black/60 p-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
        active
          ? "border-foreground shadow-[0_0_16px_rgba(255,255,255,0.15)]"
          : "border-white/10 hover:border-white/30",
      )}
      title={avatar.label}
      aria-label={`Select ${avatar.label}`}
      aria-pressed={active}
    >
      <FighterPortrait id={avatar.id} size={52} label={`${avatar.label} thumbnail`} />
      <span className="mt-0.5 block max-w-[52px] truncate font-body text-[7px] uppercase tracking-wide text-secondary group-hover:text-foreground">
        {avatar.label.split(" ")[0]}
      </span>
    </button>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type FluidGlassProps = {
  mode?: "lens" | "bar" | "cube";
  lensProps?: {
    accent?: string;
    chromaticAberration?: number;
  } & Record<string, unknown>;
  barProps?: Record<string, unknown>;
  cubeProps?: Record<string, unknown>;
  imageUrls?: string[];
  title?: string;
};

function normalizeImages(urls?: string[]) {
  const pool = urls?.length ? urls : [];
  return Array.from({ length: 10 }, (_, index) => pool[index % Math.max(1, pool.length)]).filter(Boolean) as string[];
}

export default function FluidGlass({
  imageUrls,
  title = "Snack Surge",
  lensProps = {},
}: FluidGlassProps) {
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 54, y: 42 });
  const images = useMemo(() => normalizeImages(imageUrls), [imageUrls]);
  const accent = String(lensProps.accent ?? "#a78bfa");
  const chroma = Number(lensProps.chromaticAberration ?? 0.08);

  return (
    <div
      className="relative h-full min-h-[560px] overflow-hidden bg-black"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, ${accent}2b, transparent 34%), linear-gradient(135deg, #050505, #111 48%, #050505)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />

      <div className="absolute left-1/2 top-1/2 z-10 w-[min(84vw,760px)] -translate-x-1/2 -translate-y-1/2">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.055] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(255,255,255,0.2), transparent 28%)`,
            }}
          />
          <div className="relative grid max-h-[430px] snap-y snap-mandatory gap-4 overflow-y-auto pr-2">
            {images.map((src, index) => (
              <motion.figure
                key={`${src}-${index}`}
                className="group relative grid min-h-[190px] snap-center grid-cols-[120px_1fr] items-center gap-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/45 p-4"
                initial={false}
                whileHover={reduced ? undefined : { scale: 1.015 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    background: `linear-gradient(${112 + index * 7}deg, transparent, ${accent}${Math.round(
                      18 + chroma * 120,
                    )
                      .toString(16)
                      .padStart(2, "0")}, transparent)`,
                  }}
                />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                  <img
                    src={src}
                    alt=""
                    className="h-24 w-24 object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.7)]"
                    aria-hidden="true"
                    draggable={false}
                  />
                </div>
                <figcaption className="relative">
                  <p className="font-body text-[10px] uppercase tracking-[0.32em] text-secondary">
                    Prism sample {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-foreground">
                    {title} lens pass
                  </p>
                  <p className="mt-2 max-w-md font-body text-xs leading-6 text-secondary/85">
                    A lightweight CSS refractor keeps the collectible art tactile while avoiding heavy
                    model downloads on static hosting.
                  </p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute h-56 w-56 rounded-full border border-white/25 bg-white/[0.08] shadow-[inset_0_0_42px_rgba(255,255,255,0.16),0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md",
          reduced && "hidden",
        )}
        animate={{
          left: `calc(${pointer.x}% - 7rem)`,
          top: `calc(${pointer.y}% - 7rem)`,
        }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
      />
    </div>
  );
}

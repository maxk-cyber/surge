"use client";

import { useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type FluidGlassProps = {
  mode?: "lens" | "bar" | "cube";
  lensProps?: Record<string, unknown>;
  barProps?: Record<string, unknown>;
  cubeProps?: Record<string, unknown>;
  imageUrls?: string[];
  title?: string;
};

const DEFAULT_POINTER = { x: 50, y: 42 };

export default function FluidGlass({
  mode = "lens",
  lensProps = {},
  barProps = {},
  cubeProps = {},
  imageUrls = [],
  title = "Snack Surge",
}: FluidGlassProps) {
  const reducedMotion = useReducedMotion();
  const [pointer, setPointer] = useState(DEFAULT_POINTER);
  const modeProps = mode === "bar" ? barProps : mode === "cube" ? cubeProps : lensProps;
  const images = useMemo(() => {
    if (imageUrls.length) return imageUrls;
    return [];
  }, [imageUrls]);
  const chroma = typeof modeProps.chromaticAberration === "number" ? modeProps.chromaticAberration : 0.08;

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      className="fluid-glass relative h-full overflow-hidden bg-black"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setPointer(DEFAULT_POINTER)}
      style={
        {
          "--glass-x": `${pointer.x}%`,
          "--glass-y": `${pointer.y}%`,
          "--glass-chroma": chroma,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--glass-x)_var(--glass-y),rgba(255,255,255,0.16),transparent_30%),linear-gradient(120deg,rgba(255,255,255,0.10),transparent_28%,rgba(255,255,255,0.07)_52%,transparent_72%)]" />
      <div className="absolute inset-x-0 top-0 z-20 p-5 md:p-8">
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
          ReactBits Fluid Glass · no external GLB required
        </p>
        <h3 className="mt-2 font-display text-4xl uppercase tracking-[0.12em] text-foreground md:text-6xl">
          {title}
        </h3>
      </div>

      <div className="relative z-10 h-full overflow-y-auto overscroll-contain px-5 pb-16 pt-36 md:px-8 md:pt-44">
        <div className="grid min-h-[840px] grid-cols-6 gap-4">
          {images.map((src, index) => (
            <figure
              key={`${src}-${index}`}
              className={cn(
                "group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-[0_18px_70px_rgba(0,0,0,0.42)]",
                index === 0 && "col-span-6 h-72 md:col-span-3 md:h-96",
                index === 1 && "col-span-6 h-64 md:col-span-3 md:h-80 md:translate-y-16",
                index === 2 && "col-span-3 h-72 md:col-span-2",
                index === 3 && "col-span-3 h-72 md:col-span-2 md:translate-y-10",
                index >= 4 && "col-span-6 h-72 md:col-span-2",
              )}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                draggable={false}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.62),transparent_55%)]" />
            </figure>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="fluid-glass__lens absolute left-[var(--glass-x)] top-[var(--glass-y)] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/[0.08] shadow-[0_18px_80px_rgba(255,255,255,0.12)] backdrop-blur-md md:h-64 md:w-64" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--glass-x)_var(--glass-y),transparent_0,transparent_18%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.48)_100%)]" />
      </div>
    </div>
  );
}

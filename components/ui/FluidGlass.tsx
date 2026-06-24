"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type FluidGlassProps = {
  mode?: "lens" | "bar" | "cube";
  lensProps?: Record<string, unknown>;
  barProps?: Record<string, unknown>;
  cubeProps?: Record<string, unknown>;
  imageUrls?: string[];
  title?: string;
};

function pickImageUrls(urls?: string[]) {
  const pool = urls?.length ? urls : [];
  return Array.from({ length: Math.max(5, pool.length || 5) }, (_, i) => pool[i % Math.max(1, pool.length)] ?? "");
}

export default function FluidGlass({
  mode = "lens",
  lensProps = {},
  barProps = {},
  cubeProps = {},
  imageUrls,
  title = "Snack Surge",
}: FluidGlassProps) {
  const rawOverrides = mode === "bar" ? barProps : mode === "cube" ? cubeProps : lensProps;
  const modeProps = rawOverrides as { chromaticAberration?: number; scale?: number };
  const images = pickImageUrls(imageUrls);
  const reducedMotion = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const glassSize = mode === "cube" ? 210 : mode === "bar" ? 340 : 250;
  const rows = useMemo(() => [images.slice(0, 5), images.slice(1, 6), images.slice(2, 7)], [images]);

  return (
    <div
      className="relative h-full min-h-[520px] overflow-hidden bg-black"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_42%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:54px_54px]" />

      <div className="absolute inset-0 flex flex-col justify-center gap-6 py-10">
        {rows.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            className="flex min-w-max gap-5 px-8"
            animate={reducedMotion ? undefined : { x: rowIndex % 2 === 0 ? ["0%", "-18%", "0%"] : ["-18%", "0%", "-18%"] }}
            transition={{ duration: 22 + rowIndex * 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {[...row, ...row].map((src, index) => (
              <div
                key={`${rowIndex}-${index}`}
                className="h-44 w-32 shrink-0 overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(0,0,0,0.4)]"
              >
                {src ? (
                  <img src={src} alt="" className="h-full w-full object-cover opacity-85" draggable={false} />
                ) : (
                  <div className="h-full w-full bg-white/5" />
                )}
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      <motion.div
        className={cn(
          "pointer-events-none absolute rounded-full border border-white/35 bg-white/[0.12] shadow-[0_32px_120px_rgba(255,255,255,0.22)] backdrop-blur-xl",
          mode === "bar" && "rounded-[2rem]",
          mode === "cube" && "rounded-[2.4rem]",
        )}
        style={{
          width: mode === "bar" ? glassSize : glassSize * ((modeProps.scale ?? 0.25) / 0.25),
          height: mode === "bar" ? 150 : glassSize * ((modeProps.scale ?? 0.25) / 0.25),
          left: `${pointer.x}%`,
          top: `${pointer.y}%`,
          ["translate" as string]: "-50% -50%",
          boxShadow: `0 30px 120px rgba(255,255,255,${modeProps.chromaticAberration ?? 0.1}), inset 0 0 42px rgba(255,255,255,0.2)`,
        }}
        animate={reducedMotion ? undefined : { scale: [1, 1.025, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <div className="absolute inset-4 rounded-[inherit] border border-white/25" />
        <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.5),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.28),transparent_44%,rgba(255,255,255,0.18)_72%,transparent)] mix-blend-screen" />
      </motion.div>

      <div className="absolute inset-x-0 top-8 text-center">
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
          ReactBits FluidGlass adapted
        </p>
        <p className="mt-2 font-display text-5xl uppercase tracking-[0.08em] text-white/95 md:text-7xl">
          {title}
        </p>
      </div>

      <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/10 bg-black/55 p-4 text-center backdrop-blur-xl">
        <p className="font-body text-[10px] uppercase tracking-[0.25em] text-secondary">
          Move pointer over the wall to bend the roster atlas. No GLB preload required.
        </p>
      </div>
    </div>
  );
}

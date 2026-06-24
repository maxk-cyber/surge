"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion as m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

type MotionPreference = "calm" | "showtime";

function shouldSoftenMotion(reduced: boolean | null, preference?: MotionPreference) {
  return Boolean(reduced) || preference === "calm";
}

export function AuroraBackdrop({
  className,
  accent = "#7c3cff",
  glow = "#f7f7f7",
  motion = "showtime",
}: {
  className?: string;
  accent?: string;
  glow?: string;
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const calm = shouldSoftenMotion(reduced, motion);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div
        className={cn(
          "absolute -left-1/4 top-[-18%] h-[42rem] w-[70rem] rounded-full blur-3xl",
          !calm && "animate-aurora-drift",
        )}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accent}55, transparent 62%)`,
        }}
      />
      <div
        className={cn(
          "absolute right-[-22%] top-[12%] h-[36rem] w-[50rem] rounded-full opacity-70 blur-3xl",
          !calm && "animate-aurora-pulse",
        )}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glow}33, transparent 66%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,transparent,rgba(0,0,0,0.42)_50%,rgba(0,0,0,0.86)_100%)]" />
    </div>
  );
}

export function PlasmaWave({
  className,
  colors = ["#7c3cff", "#06b6d4"],
  motion = "showtime",
}: {
  className?: string;
  colors?: [string, string];
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const calm = shouldSoftenMotion(reduced, motion);

  return (
    <div
      className={cn("plasma-wave pointer-events-none absolute inset-0 overflow-hidden", calm && "plasma-wave-calm", className)}
      style={{
        ["--plasma-a" as string]: colors[0],
        ["--plasma-b" as string]: colors[1],
      }}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </div>
  );
}

export function ShinyText({
  children,
  className,
  color = "#b5b5b5",
  shineColor = "#ffffff",
  motion = "showtime",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
  shineColor?: string;
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const calm = shouldSoftenMotion(reduced, motion);

  return (
    <span
      className={cn("shiny-text inline-block", calm && "shiny-text-calm", className)}
      style={{
        ["--shiny-color" as string]: color,
        ["--shiny-highlight" as string]: shineColor,
      }}
    >
      {children}
    </span>
  );
}

export function AnimatedReveal({
  children,
  className,
  delay = 0,
  motion = "showtime",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const calm = shouldSoftenMotion(reduced, motion);

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: calm ? 0 : 22, filter: calm ? "none" : "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: calm ? 0 : 0.55, delay: calm ? 0 : delay, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255,255,255,0.18)",
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const [position, setPosition] = useState({ x: 50, y: 0 });

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <article
      onPointerMove={onPointerMove}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_24px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl",
        "focus-within:ring-2 focus-within:ring-white/60",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(circle at ${position.x}% ${position.y}%, ${spotlightColor}, transparent 34%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-px rounded-[calc(2rem-1px)] border border-white/10" />
      {children}
    </article>
  );
}

export function DockNav({
  items,
  className,
  motion = "showtime",
}: {
  items: { label: string; href: string; icon: string }[];
  className?: string;
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const calm = shouldSoftenMotion(reduced, motion);

  return (
    <nav
      aria-label="Showroom sections"
      className={cn(
        "fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(94vw,640px)] items-end justify-center gap-1.5 rounded-full border border-white/10 bg-black/60 p-1.5 shadow-[0_18px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl",
        className,
      )}
      onMouseMove={(event) => {
        if (calm) return;
        const nav = event.currentTarget;
        const rect = nav.getBoundingClientRect();
        nav.style.setProperty("--dock-x", `${event.clientX - rect.left}px`);
      }}
    >
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            "dock-item group relative flex h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] px-3 font-body text-[10px] uppercase tracking-[0.16em] text-secondary outline-none transition",
            "hover:border-white/35 hover:bg-white/[0.14] hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/70",
            calm && "dock-item-calm",
          )}
          aria-label={item.label}
        >
          <span className="text-sm" aria-hidden="true">
            {item.icon}
          </span>
          <span className="ml-2 hidden sm:inline">{item.label}</span>
          <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-2 py-1 text-[9px] text-foreground opacity-0 shadow-xl transition group-hover:block group-hover:opacity-100 group-focus-visible:block group-focus-visible:opacity-100 sm:hidden">
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
}

export function MagneticButton({
  children,
  className,
  onClick,
  type = "button",
  disabled,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.45 });

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reduced || disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.18);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.18);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      style={{ x: springX, y: springY }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-foreground outline-none transition",
        "hover:border-white/35 hover:bg-white/[0.14] focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
    >
      {children}
    </m.button>
  );
}

type Spark = { id: number; x: number; y: number };

export function ClickSpark({
  children,
  className,
  motion = "showtime",
}: {
  children: React.ReactNode;
  className?: string;
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const [sparks, setSparks] = useState<Spark[]>([]);
  const idRef = useRef(0);
  const calm = shouldSoftenMotion(reduced, motion);

  useEffect(() => {
    if (!sparks.length) return;
    const id = window.setTimeout(() => setSparks([]), 520);
    return () => window.clearTimeout(id);
  }, [sparks.length]);

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (calm) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setSparks((current) => [
      ...current.slice(-5),
      {
        id: idRef.current++,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    ]);
  };

  return (
    <div className={cn("relative", className)} onClickCapture={onClickCapture}>
      {children}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="click-spark pointer-events-none absolute"
          style={{ left: spark.x, top: spark.y }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

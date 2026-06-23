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

export function ShinyText({
  children,
  className,
  accent = "#ffffff",
  motion = "showtime",
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const calm = shouldSoftenMotion(reduced, motion);

  return (
    <span
      className={cn("shiny-text inline-block", !calm && "shiny-text-animated", className)}
      style={{
        ["--shiny-accent" as string]: accent,
      }}
    >
      {children}
    </span>
  );
}

export function StarBorder({
  children,
  className,
  accent = "#ffffff",
  motion = "showtime",
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const calm = shouldSoftenMotion(reduced, motion);

  return (
    <div
      className={cn("star-border relative overflow-hidden rounded-[2rem]", !calm && "star-border-animated", className)}
      style={{ ["--star-accent" as string]: accent }}
    >
      {children}
    </div>
  );
}

export function RibbonField({
  className,
  accent = "#ffffff",
  glow = "#7c3cff",
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
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn("ribbon-line", !calm && "ribbon-line-animated")}
          style={{
            ["--ribbon-accent" as string]: index === 1 ? glow : accent,
            ["--ribbon-y" as string]: `${18 + index * 24}%`,
            ["--ribbon-rotate" as string]: `${index % 2 === 0 ? -8 : 7}deg`,
            ["--ribbon-rotate-alt" as string]: `${index % 2 === 0 ? 5 : -5}deg`,
            ["--ribbon-delay" as string]: `${index * -2.2}s`,
          }}
        />
      ))}
    </div>
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

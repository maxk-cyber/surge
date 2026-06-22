"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion as m,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

type MotionPreference = "calm" | "showtime";

function shouldSoftenMotion(reduced: boolean | null, preference?: MotionPreference) {
  return Boolean(reduced) || preference === "calm";
}

export function ShinyText({
  text,
  className,
  color = "#b5b5b5",
  shineColor = "#ffffff",
  speed = 2.8,
  delay = 0.7,
  motion = "showtime",
}: {
  text: string;
  className?: string;
  color?: string;
  shineColor?: string;
  speed?: number;
  delay?: number;
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const calm = shouldSoftenMotion(reduced, motion);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const duration = Math.max(0.5, speed) * 1000;
  const delayDuration = Math.max(0, delay) * 1000;

  useAnimationFrame((time) => {
    if (calm) {
      progress.set(38);
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    elapsedRef.current += time - lastTimeRef.current;
    lastTimeRef.current = time;
    const cycleTime = elapsedRef.current % (duration + delayDuration);
    progress.set(cycleTime < duration ? (cycleTime / duration) * 100 : 100);
  });

  const backgroundPosition = useTransform(progress, (value) => `${150 - value * 2}% center`);

  return (
    <m.span
      className={cn("inline-block", className)}
      style={{
        backgroundImage: `linear-gradient(115deg, ${color} 0%, ${color} 34%, ${shineColor} 50%, ${color} 66%, ${color} 100%)`,
        backgroundSize: "220% auto",
        backgroundPosition,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {text}
    </m.span>
  );
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

export function GlareHover({
  children,
  className,
  glareColor = "#ffffff",
  glareOpacity = 0.38,
  glareAngle = -35,
  motion = "showtime",
}: {
  children: React.ReactNode;
  className?: string;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  motion?: MotionPreference;
}) {
  const reduced = useReducedMotion();
  const calm = shouldSoftenMotion(reduced, motion);
  const [active, setActive] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 transition-[background-position,opacity] duration-700 ease-out",
          active && !calm ? "opacity-100" : "opacity-0",
        )}
        style={{
          background: `linear-gradient(${glareAngle}deg, transparent 58%, color-mix(in srgb, ${glareColor} ${Math.round(
            glareOpacity * 100,
          )}%, transparent) 70%, transparent 86%)`,
          backgroundSize: "250% 250%",
          backgroundPosition: active && !calm ? "100% 100%" : "-100% -100%",
        }}
        aria-hidden="true"
      />
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

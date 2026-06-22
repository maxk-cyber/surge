"use client";

import { motion, useReducedMotion } from "motion/react";

export function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reducedMotion ? undefined : { rotateX: -4, rotateY: 6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={{ transformPerspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

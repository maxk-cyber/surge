"use client";

import { motion } from "motion/react";

export function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ rotateX: -4, rotateY: 6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={{ transformPerspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

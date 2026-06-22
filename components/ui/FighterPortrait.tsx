"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { enemyPortraitSrc, playerPortraitSrc } from "@/lib/avatar-assets";
import type { EnemyKind, PlayerAvatarId } from "@/lib/avatars";
import { getTransparentImageUrl } from "@/lib/image/remove-background";
import { cn } from "@/lib/utils";

export function FighterPortrait({
  id,
  enemy,
  size = 160,
  className,
  priority = false,
}: {
  id?: PlayerAvatarId | string;
  enemy?: EnemyKind;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const src = enemy
    ? enemyPortraitSrc(enemy)
    : id
      ? playerPortraitSrc(id as PlayerAvatarId)
      : playerPortraitSrc("skullmic");

  const [displaySrc, setDisplaySrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setDisplaySrc(null);
    getTransparentImageUrl(src, { tolerance: 58, feather: 42, trim: true, trimPad: 8 })
      .then((url) => {
        if (alive) setDisplaySrc(url);
      })
      .catch(() => {
        if (alive) setDisplaySrc(src);
      });
    return () => {
      alive = false;
    };
  }, [src]);

  if (!displaySrc) {
    return (
      <div
        className={cn("animate-pulse rounded-sm bg-white/5", className)}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <Image
      src={displaySrc}
      alt=""
      width={size}
      height={size}
      priority={priority}
      unoptimized={displaySrc.startsWith("data:")}
      className={cn("pointer-events-none select-none object-contain", className)}
      aria-hidden="true"
      draggable={false}
    />
  );
}

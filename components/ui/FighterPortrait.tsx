"use client";

import Image from "next/image";
import { enemyPortraitSrc, playerPortraitSrc } from "@/lib/avatar-assets";
import type { EnemyKind, PlayerAvatarId } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function FighterPortrait({
  id,
  enemy,
  size = 160,
  className,
  priority = false,
  label,
}: {
  id?: PlayerAvatarId | string;
  enemy?: EnemyKind;
  size?: number;
  className?: string;
  priority?: boolean;
  label?: string;
}) {
  const src = enemy
    ? enemyPortraitSrc(enemy)
    : id
      ? playerPortraitSrc(id as PlayerAvatarId)
      : playerPortraitSrc("skullmic");

  return (
    <Image
      src={src}
      alt={label ?? ""}
      width={size}
      height={size}
      priority={priority}
      className={cn("pointer-events-none select-none object-contain", className)}
      aria-hidden={label ? undefined : true}
      draggable={false}
    />
  );
}

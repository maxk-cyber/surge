"use client";

import { enemyPortraitSrc, playerPortraitSrc } from "@/lib/avatar-assets";
import type { EnemyKind, PlayerAvatarId } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function FighterPortrait({
  id,
  enemy,
  size = 160,
  className,
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
    <span
      className={cn("inline-flex select-none items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={label ?? ""}
        className="pointer-events-none max-h-full max-w-full object-contain"
        aria-hidden={label ? undefined : true}
        draggable={false}
      />
    </span>
  );
}

import type { EnemyKind, PlayerAvatarId } from "@/lib/avatars";

export function playerPortraitSrc(id: PlayerAvatarId) {
  return `/avatars/${id}.png`;
}

export function enemyPortraitSrc(kind: EnemyKind) {
  return `/avatars/enemy-${kind}.png`;
}

import type { EnemyKind, PlayerAvatarId } from "@/lib/avatars";
import { publicAssetPath } from "@/lib/public-path";

export function playerPortraitSrc(id: PlayerAvatarId) {
  return publicAssetPath(`/avatars/${id}.png`);
}

export function enemyPortraitSrc(kind: EnemyKind) {
  return publicAssetPath(`/avatars/enemy-${kind}.png`);
}

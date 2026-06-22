import { PLAYER_AVATARS } from "@/lib/avatars";
import { playerPortraitSrc } from "@/lib/avatar-assets";

export function avatarGalleryImages() {
  return PLAYER_AVATARS.map((avatar) => ({
    src: playerPortraitSrc(avatar.id),
    alt: avatar.label,
  }));
}

export function avatarScrollImages(count = 8) {
  return PLAYER_AVATARS.slice(0, count).map((avatar) => playerPortraitSrc(avatar.id));
}

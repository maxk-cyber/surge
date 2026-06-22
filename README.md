# Snack Surge — Card Gallery Lite

A standalone showcase of Snack Surge fighter cards and avatars — **no game**, no database, no Phaser.

Built with React Bits:

- **DomeGallery** — draggable 3D dome of fighter portraits
- **FluidGlass** — scrollable lens refraction over avatar art
- **Fighter cards** — full trading-card UI with SVG portrait art

## Run

```bash
cd card-gallery-lite
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Structure

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Main gallery page (dome + glass + card picker) |
| `components/ui/DomeGallery.tsx` | React Bits dome globe |
| `components/ui/FluidGlass.tsx` | React Bits fluid glass lens |
| `components/game/FighterCard.tsx` | Trading card UI |
| `components/game/AvatarPicker.tsx` | Card fan picker (localStorage only) |
| `lib/avatars.ts` | Fighter definitions |
| `lib/fighter-cards.ts` | Card stats / rarity metadata |
| `public/assets/3d/` | GLB models for FluidGlass (`lens.glb`, etc.) |

## Notes

- Portraits use PNG assets from `public/avatars/` (copied from the main app).
- Dome / glass sections use the same PNG paths via `lib/gallery-images.ts`.
- To refresh assets, copy from `../public/avatars/` in the main Snack Surge project.

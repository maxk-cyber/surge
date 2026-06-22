# Snack Surge — Premium Fighter Showroom

A standalone premium showcase of Snack Surge fighter cards and avatars — **no game**, no database, no Phaser.

Built with ReactBits-style interaction patterns:

- **DomeGallery** — draggable 3D dome of fighter portraits
- **FluidGlass** — scrollable lens refraction over avatar art
- **Aurora / spotlight / magnetic / click-spark effects** — purposeful motion around the showroom
- **Ribbon / shimmer effects** — lightweight ReactBits-style ambient lighting and focal text treatment
- **Fighter cards** — full trading-card UI with PNG portrait art from `public/avatars`
- **Skill controls** — vibe mode, motion intensity, rarity filters, favorites, draft strategy, keyboard browsing, and copy actions
- **Draft Intelligence** — tested squad recommendations with stat summaries and shareable lineup text
- **Iterator behavior** — rotating hero copy, cyclic tactical prompts, and cyclic card deck navigation

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Verify

```bash
npm test
npm run build
```

## Structure

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Main showroom page (hero + controls + dome + glass + card picker) |
| `components/ui/DomeGallery.tsx` | React Bits dome globe |
| `components/ui/FluidGlass.tsx` | React Bits fluid glass lens |
| `components/ui/reactbits-effects.tsx` | Adapted aurora, reveal, spotlight, magnetic, and click-spark effects |
| `components/game/FighterCard.tsx` | Trading card UI |
| `components/game/AvatarPicker.tsx` | Card fan picker with filters, favorites, keyboard nav, and copy action |
| `components/game/DraftAssistant.tsx` | Strategy-based recommendation panel with copyable squad summaries |
| `lib/avatars.ts` | Fighter definitions |
| `lib/fighter-cards.ts` | Card stats / rarity metadata |
| `lib/iterator.ts` | Reusable cyclic iterator helpers |
| `lib/showroom.ts` | UI preference, favorite, filter, roster, and draft intelligence helpers |
| `public/avatars/` | PNG fighter and enemy portraits |
| `public/assets/3d/` | GLB models for FluidGlass (`lens.glb`, etc.) |

## GitHub Pages

The workflow at `.github/workflows/pages.yml` installs dependencies, runs tests, builds a static export, uploads `out`, and deploys through GitHub Pages actions.

For Pages builds, `GITHUB_PAGES=true` enables:

- `output: "export"`
- `basePath` / `assetPrefix`: `/surge`
- `NEXT_PUBLIC_BASE_PATH=/surge`
- unoptimized Next images for static hosting

Expected Pages URL: `https://maxk-cyber.github.io/surge/`.

If Pages is not already enabled in repository settings, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

## Notes

- Portraits use PNG assets from `public/avatars/`.
- Dome / glass sections use the same PNG paths via `lib/gallery-images.ts`.
- FluidGlass uses GLB files from `public/assets/3d/`.
- Motion respects `prefers-reduced-motion` and the in-app Calm/Showtime control.

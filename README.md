# Snack Surge — Premium Fighter Showroom

A standalone premium showcase of Snack Surge fighter cards and avatars — **no game**, no database, no Phaser.

Built with ReactBits-style interaction patterns:

- **DomeGallery** — draggable 3D dome of fighter portraits
- **FluidGlass** — CSS liquid lens refraction over generated avatar art
- **Aurora / spotlight / magnetic / click-spark / shiny text / star-border effects** — purposeful motion around the showroom
- **Pack Opening** — five-card reveal ritual with pack vibes, progress, favorites, and copy actions
- **Fighter cards** — full trading-card UI with generated vector portrait art
- **Skill controls** — vibe mode, pack vibe, motion intensity, rarity filters, favorites, keyboard browsing, and copy actions
- **Iterator behavior** — rotating hero copy, cyclic pack spotlight browsing, and cyclic card deck navigation

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
| `app/page.tsx` | Main showroom page (hero + controls + pack + dome + glass + card picker) |
| `components/ui/DomeGallery.tsx` | React Bits dome globe |
| `components/ui/FluidGlass.tsx` | React Bits-style CSS liquid glass lens |
| `components/ui/reactbits-effects.tsx` | Adapted aurora, reveal, spotlight, magnetic, shiny text, star-border, and click-spark effects |
| `components/game/FighterCard.tsx` | Trading card UI |
| `components/game/AvatarPicker.tsx` | Card fan picker with filters, favorites, keyboard nav, and copy action |
| `components/game/PackOpening.tsx` | Pack reveal cockpit with vibe modes, progress, favorites, and copy action |
| `lib/avatar-assets.ts` | Generated SVG data-URI portrait atlas |
| `lib/avatars.ts` | Fighter definitions |
| `lib/fighter-cards.ts` | Card stats / rarity metadata |
| `lib/iterator.ts` | Reusable cyclic iterator helpers |
| `lib/pack-opening.ts` | Pack lineup, spotlight, progress, and share helpers |
| `lib/showroom.ts` | UI preference, favorite, filter, and roster helpers |

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

- Portraits are generated as SVG data URLs in `lib/avatar-assets.ts`.
- Dome / glass sections use the same generated atlas via `lib/gallery-images.ts`.
- FluidGlass is DOM/CSS based and does not require GLB assets.
- Motion respects `prefers-reduced-motion` and the in-app Calm/Showtime control.

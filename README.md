# Snack Surge — Premium Fighter Showroom

A standalone premium showcase of Snack Surge fighter cards and avatars — **no game**, no database, no Phaser.

Built with ReactBits-style interaction patterns:

- **DomeGallery** — draggable 3D dome of fighter portraits
- **PrismWall** — GLB-free liquid-glass inspection wall over generated fighter art
- **Aurora / spotlight / magnetic / click-spark / shiny text / star border / ribbon effects** — purposeful motion around the showroom
- **Fighter cards** — full trading-card UI with generated SVG portrait art
- **Pack Theater** — lane-based five-card ritual with reveals, favorites, keyboard shortcuts, and copyable manifests
- **Skill controls** — vibe mode, motion intensity, rarity filters, favorites, pack lanes, keyboard browsing, and copy actions
- **Iterator behavior** — rotating hero copy, cyclic pack carousel, prism highlights, and card deck navigation

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
| `app/page.tsx` | Main showroom page (hero + controls + pack theater + dome + prism wall + card picker) |
| `components/ui/DomeGallery.tsx` | React Bits dome globe |
| `components/ui/PrismWall.tsx` | Lightweight liquid-glass prism wall |
| `components/ui/reactbits-effects.tsx` | Adapted aurora, reveal, spotlight, magnetic, click-spark, shiny text, star border, and ribbon effects |
| `components/game/FighterCard.tsx` | Trading card UI |
| `components/game/AvatarPicker.tsx` | Card fan picker with filters, favorites, keyboard nav, and copy action |
| `components/game/PackTheater.tsx` | Pack-opening theater with lane/reveal/favorite/copy interactions |
| `lib/avatars.ts` | Fighter definitions |
| `lib/avatar-assets.ts` | Deterministic generated SVG portrait data URIs |
| `lib/fighter-cards.ts` | Card stats / rarity metadata |
| `lib/iterator.ts` | Reusable cyclic iterator helpers |
| `lib/pack-theater.ts` | Pack lane, reveal progress, and manifest helpers |
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

- Portraits are generated SVG data URIs, so the showroom does not depend on missing binary avatar assets.
- Dome / prism sections use the same generated art via `lib/gallery-images.ts`.
- The prism wall intentionally avoids GLB runtime dependencies for static export reliability.
- Motion respects `prefers-reduced-motion` and the in-app Calm/Showtime control.

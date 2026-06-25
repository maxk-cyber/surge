# Snack Surge — Premium Fighter Showroom

A standalone premium showcase of Snack Surge fighter cards and avatars — **no game**, no database, no Phaser.

Built with ReactBits-style interaction patterns:

- **DomeGallery** — draggable 3D dome of fighter portraits
- **CSS FluidGlass prism wall** — deploy-safe refraction over generated avatar art
- **Aurora / spotlight / magnetic / click-spark / shiny text / star border / signal ribbon effects** — purposeful motion around the showroom
- **Fighter cards** — full trading-card UI with generated SVG portrait art
- **Pack Lab** — stat-weighted five-pull recommendations with lane selection, favorites, copyable drop codes, and cyclic spotlight browsing
- **Skill controls** — vibe mode, motion intensity, rarity filters, favorites, keyboard browsing, and copy actions
- **Iterator behavior** — rotating hero copy, Pack Lab spotlight cycling, and cyclic card deck navigation

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
| `app/page.tsx` | Main showroom page (hero + controls + Pack Lab + dome + glass + card picker) |
| `components/ui/DomeGallery.tsx` | React Bits dome globe |
| `components/ui/FluidGlass.tsx` | Lightweight CSS prism wall |
| `components/ui/reactbits-effects.tsx` | Adapted aurora, reveal, spotlight, magnetic, click-spark, shiny text, star border, and signal ribbon effects |
| `components/game/FighterCard.tsx` | Trading card UI |
| `components/game/AvatarPicker.tsx` | Card fan picker with filters, favorites, keyboard nav, and copy action |
| `components/game/PackLab.tsx` | Pack lane curation, cyclic spotlight, favorite, and copy interactions |
| `lib/avatars.ts` | Fighter definitions |
| `lib/avatar-assets.ts` | Generated SVG portrait atlas |
| `lib/fighter-cards.ts` | Card stats / rarity metadata |
| `lib/iterator.ts` | Reusable cyclic iterator helpers |
| `lib/pack-lab.ts` | Pack lane scoring, lineup, window, and share helpers |
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

- Portraits are generated as SVG data URIs in `lib/avatar-assets.ts`, so the static export has no missing avatar or GLB asset dependency.
- Dome / glass sections use the same generated art via `lib/gallery-images.ts`.
- FluidGlass is implemented as a lightweight CSS prism wall for static-host reliability.
- Motion respects `prefers-reduced-motion` and the in-app Calm/Showtime control.

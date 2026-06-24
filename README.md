# Snack Surge — Premium Fighter Showroom

A standalone premium showcase of Snack Surge fighter cards and avatars — **no game**, no database, no Phaser.

Built with ReactBits-style interaction patterns:

- **DomeGallery** — draggable 3D dome of fighter portraits
- **PlasmaWave / ShinyText / Dock / spotlight / magnetic / click-spark effects** — purposeful motion around the showroom
- **Prism vault** — responsive glass-card wall powered by generated SVG fighter art
- **Fighter cards** — full trading-card UI with self-contained generated portrait art
- **Skill controls** — strategy planner, vibe mode, motion intensity, rarity filters, favorites, keyboard browsing, and copy actions
- **Iterator behavior** — rotating hero copy, cyclic strategy scout spotlight, and cyclic card deck navigation

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
| `app/page.tsx` | Main showroom page (hero + controls + planner + dome + prism vault + card picker) |
| `components/ui/DomeGallery.tsx` | React Bits dome globe |
| `components/ui/reactbits-effects.tsx` | Adapted aurora, PlasmaWave, ShinyText, DockNav, reveal, spotlight, magnetic, and click-spark effects |
| `components/game/FighterCard.tsx` | Trading card UI |
| `components/game/AvatarPicker.tsx` | Card fan picker with filters, favorites, keyboard nav, and copy action |
| `lib/avatars.ts` | Fighter definitions |
| `lib/avatar-assets.ts` | Generated SVG portrait artwork |
| `lib/fighter-cards.ts` | Card stats / rarity metadata |
| `lib/iterator.ts` | Reusable cyclic iterator helpers |
| `lib/showroom.ts` | UI preference, favorite, filter, strategy recommendation, and roster helpers |

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

- Portraits are generated SVG data URIs, so GitHub Pages does not require avatar PNG or GLB assets.
- Dome / prism sections use the same generated portrait source via `lib/gallery-images.ts`.
- Motion respects `prefers-reduced-motion` and the in-app Calm/Showtime control.

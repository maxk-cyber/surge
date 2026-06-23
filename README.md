# Snack Surge — Premium Fighter Showroom

A standalone premium showcase of Snack Surge fighter cards and avatars — **no game**, no database, no Phaser.

Built with ReactBits-style interaction patterns:

- **DomeGallery** — draggable 3D dome of fighter portraits
- **FluidGlass** — scrollable lens refraction over avatar art
- **Aurora / spotlight / magnetic / click-spark effects** — purposeful motion around the showroom
- **Fighter cards** — full trading-card UI with generated SVG portrait art
- **Surge Pack Lab** — strategy-based, favorite-aware draft recommendations with copyable lineups
- **Skill controls** — vibe mode, motion intensity, rarity filters, favorites, keyboard browsing, and copy actions
- **Iterator behavior** — rotating hero copy, cyclic pack windows, and cyclic card deck navigation

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
| `app/page.tsx` | Main showroom page (hero + controls + pack lab + dome + glass + card picker) |
| `components/ui/DomeGallery.tsx` | React Bits dome globe |
| `components/ui/FluidGlass.tsx` | React Bits-style CSS fluid glass lens |
| `components/ui/reactbits-effects.tsx` | Adapted aurora, reveal, spotlight, magnetic, and click-spark effects |
| `components/game/FighterCard.tsx` | Trading card UI |
| `components/game/AvatarPicker.tsx` | Card fan picker with filters, favorites, keyboard nav, and copy action |
| `components/game/SurgePackLab.tsx` | Strategy-based pack recommendation cockpit |
| `lib/avatars.ts` | Fighter definitions |
| `lib/fighter-cards.ts` | Card stats / rarity metadata |
| `lib/iterator.ts` | Reusable cyclic iterator helpers |
| `lib/pack-lab.ts` | Pack recommendation, scoring, and lineup summary helpers |
| `lib/showroom.ts` | UI preference, favorite, filter, and roster helpers |
| `lib/avatar-assets.ts` | Generated data-URI SVG portrait assets |

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

- Portraits are generated SVG data URIs, so the static export has no missing avatar asset risk.
- Dome / glass sections use the same generated portrait URLs via `lib/gallery-images.ts`.
- FluidGlass is a lightweight CSS/React lens and does not require GLB files.
- Motion respects `prefers-reduced-motion` and the in-app Calm/Showtime control.

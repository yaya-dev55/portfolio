# Yinqi Li — Portfolio Site

A minimal, futuristic single-page portfolio in black / white / silver. The
hero shows one 3D piece at a time, at full original detail (no
decimation) — browse with the prev/next arrows, drag to rotate, scroll to
zoom, click to open that piece's own detail page.

## Run it locally

Because the page uses ES module imports, you can't just double-click
`index.html` — open it through a local server:

```
cd site
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

(Any static server works — `npx serve`, VS Code's "Live Server," etc.)

## File structure

```
site/
  index.html            — homepage structure & copy
  work/piece.html         — reusable detail page (?id=<piece> in the URL)
  css/style.css           — all styling (design tokens at the top of the file)
  js/scene.js             — hero viewer: one piece at a time, full detail
  js/piece-scene.js       — bigger rotating viewer used on each detail page
  js/pieces-data.js       — names, descriptions & filenames for all 8 pieces
  js/main.js              — nav toggle + scroll-reveal animations
  assets/*.glb            — the 8 pieces, full original triangle count
```

## The interaction

- The hero panel on the right shows **one piece at a time**, at its full
  original resolution.
- **Prev / next arrows** (or ← / → keys) switch pieces — the previous
  model is fully unloaded from memory before the next one loads, so you're
  never holding more than one in the browser at once.
- **Drag** the piece to turn it around; **scroll or pinch** to zoom, both
  clamped to sensible limits.
- **Click** the piece (a drag under ~6px still counts as a click), or the
  "View Piece" button, to open `work/piece.html?id=<piece>` with a larger
  viewer and the same drag/zoom controls.
- The viewer sits in its own panel on the right side of the hero — nothing
  overlaps your name or the intro copy on the left.

## About the 3D files — full detail, kept

You asked to keep full original detail rather than decimate, so that's
what shipped: each piece is welded (merging exactly-duplicate vertices,
which is lossless — it doesn't change the surface) and quantized at very
high precision (16-bit position, 12-bit normal — visually indistinguishable
from the raw floats), but **every triangle from your original files is
still there.**

| Piece | Triangles | File size |
|---|---|---|
| Necklace | 864,060 | 13.8 MB |
| Front Piece | 297,650 | 4.8 MB |
| Waist | 597,516 | 9.6 MB |
| Leg 1 | 546,710 | 8.7 MB |
| Bracelet | 550,524 | 8.8 MB |
| Bangle | 1,519,338 | 24.3 MB |
| Bangle 02 | 1,201,956 | 19.2 MB |
| Bangle 03 | 1,039,912 | 16.6 MB |
| **Total** | **~6.6M** | **~101 MB** |

Because only one piece loads at a time, the most anyone ever downloads in
one go is a single file (4.8–24.3MB) rather than the full 101MB — that's
what makes full detail workable in a browser at all. Loading all 8
simultaneously (like the very first version of this hero) is not
recommended at this resolution; it's what caused the size/performance
problem in the first place.

Your original `.stl` uploads are untouched — this is a separate, web-only
export.

## Editing names & descriptions

Everything shown in the piece panel and on each detail page comes from one
file: `js/pieces-data.js`. Change a `name`, `tagline`, `medium`, or `status`
there and it updates in both places automatically.

## Deploying

Simplest options, in order of ease:

- **Netlify Drop** — drag the `site` folder onto https://app.netlify.com/drop
- **GitHub Pages** — push `site/` contents to a repo, enable Pages on the
  `main` branch
- **Vercel** — `vercel deploy` from inside `site/`

All three are free for a static site like this — note the repo/deploy will
be ~101MB because of the full-resolution models, which is still well
within free-tier limits for all three.

## Customizing

- **Colors** — CSS variables at the top of `css/style.css` (`--black`,
  `--white`, `--silver`, etc.)
- **Fonts** — currently Unbounded (display), Inter (body), IBM Plex Mono
  (labels/eyebrows), loaded from Google Fonts in `index.html`
- **Piece order** — the order of entries in `js/pieces-data.js` is the
  order pieces appear in the hero browser
- **Copy** — hero/about/work/contact text lives directly in `index.html`;
  piece names & descriptions live in `js/pieces-data.js`

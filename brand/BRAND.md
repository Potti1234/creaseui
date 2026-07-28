# crease/ui — Brand Direction

**One-liner:** shadcn/ui for foldkit. The crease is where the fold becomes visible —
crease/ui is the visible, styled surface over foldkit's behavior.

## Idea

Everything in the brand comes from ONE motif: **a flat sheet with a single fold**.
Not full origami cranes — that's craft-project territory. One sheet, one decisive fold,
light on one side, shade on the other. It says: minimal material (the headless primitive)
plus one deliberate act (the styling layer) produces form.

Voice: precise, quiet, a little dry — same register as shadcn ("This is not a component
library. It is how you build your component library."). Never cute, never busy.

## Color

Paper-and-ink neutrals (aligned with the shadcn token scale the product ships), plus one
accent that nods to foldkit's green without copying it:

| Role | Value | Notes |
| --- | --- | --- |
| Paper | `oklch(0.985 0.002 95)` | warm off-white, page + logo field |
| Ink | `oklch(0.155 0.005 270)` | near-black, text + dark logo |
| Graphite | `oklch(0.556 0 0)` | muted text (= shadcn muted-foreground) |
| Crease shade | `oklch(0.90 0.004 95)` | the darker plane of a fold |
| Fold green (accent) | `oklch(0.62 0.15 145)` | sparingly: links, highlights, the accent edge of a fold |

Rule: any illustration is 90% neutrals; green appears on at most one folded plane.

## Typography

- **UI / body:** Inter (the product already ships it).
- **Display:** Inter Display (or Inter tight-tracked, `tracking-tight`, weight 600) —
  matches the product's headings; no second typeface to maintain.
- **Code:** JetBrains Mono or Geist Mono.
- Wordmark is typeset, not drawn: `crease/ui` lowercase, Inter 600, the `/` in accent
  green or graphite.

## Logo

Primary mark: **the folded corner** (see `logo-mark.svg`) — a square sheet whose top-right
corner folds inward along the diagonal; the flap reads darker. Geometry is exact (fold
reflection), so it stays crisp at 16px favicon size. Colorways: ink-on-paper,
paper-on-ink, and an accent version where the flap is fold green.

Lockups: mark + `crease/ui` horizontal (`logo-lockup.svg`). Favicon: mark alone.

## Illustration style

Flat two-tone paper planes with hard-edged diagonal shading; off-white background; thin
or no outlines; no gradients except a barely-there paper grain; generous negative space;
compositions built from creased sheets suggesting UI shapes (a folded chip = button, an
opening sheet = dialog, a pleated strip = list). One green plane maximum per image.

## Usage in the product

- Docs site header: mark at 20px + `crease/ui` wordmark.
- Hero: headline over a single large fold illustration, right-aligned, lots of paper.
- OG image: ink field, paper mark centered, wordmark under it.

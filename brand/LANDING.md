# crease/ui — Landing Page Brief

Decisions (2026-07-28): product-first positioning · live component collage hero ·
GitHub registry installation as the primary path, with direct source copy as a
fallback for unpublished items.

Voice: quiet, precise, a little dry. The boldest element on the page is a screenshot
comparison, not an adjective. No hype words, no emoji.

Page lives at creaseui.com root. The demo app (create board, charts, blocks) is the
same site — the landing links into it as living proof.

---

## 1. Hero

- **Headline:** Beautiful components for foldkit.
- **Subline:** The shadcn/ui design language, rebuilt on foldkit UI. Copy the code,
  own the code, ship.
- **CTAs:** [Get Started] (docs/installation) · [Browse Components] (demo pages)
- **Trust line (small, muted):** MIT licensed · Built on foldkit UI · Works with any
  shadcn theme
- **Visual:** live component collage — real rendered crease/ui components, slightly
  overlapping masonry, right-weighted (mirrors the brand hero's composition):
  a stats card with an ECharts area chart, an open dropdown menu, a calendar,
  a dialog (static open), a slider + switch stack, badges. All interactive where cheap.
  The fold-green accent appears exactly once (e.g. active menu item).

## 2. The receipts (signature section)

- **Heading:** Spot the difference.
- **Copy:** We rebuilt the ui.shadcn.com/create preview board — all 33 cards — on
  foldkit. Every card within a few pixels of the original. Drag to compare.
- **Element:** before/after slider between the two full-board screenshots
  (docs/comparison-*.png), with labels "shadcn/ui (React)" / "crease/ui (foldkit)".
- **Footnote link:** "How we measured" → short docs page with the per-card delta table.

## 3. How it works

- **Heading:** Three layers, no magic.
- **Diagram:** foldkit UI (behavior, accessibility) → crease/ui (the styled layer you
  copy) → your app. One fold illustration slot (spot-dialog.png works).
- **Command block:** `npx shadcn@latest add Potti1234/creaseui/button` with badge
  "GitHub registry". Below it: "The CLI copies the component into your project.
  It's yours."
- **Three bullets:** You own the code (no dependency to babysit) · shadcn-compatible
  tokens (your theme drops in) · every component is a plain foldkit view function.

## 4. Component wall

- **Heading:** Every component you expect.
- **Copy:** 49 components ported from shadcn/ui — buttons to dialogs to data tables —
  with the class strings you already know.
- **Element:** live grid of small demos, linking into the demo pages. Show a counter
  row: 49 components · 70 charts · 16 blocks.

## 5. Charts

- **Heading:** Charts without React.
- **Copy:** shadcn's charts are built on Recharts, which is React-only. We rebuilt the
  entire collection — all 70 variants — on Apache ECharts, with the same design
  language: the tokens, the tooltips, the grids. Canvas-rendered, framework-free.
- **Element:** one live interactive chart (area-interactive with its range select) +
  link to /charts/area.

## 6. Blocks

- **Heading:** Blocks, not just bricks.
- **Copy:** Full application shells — the shadcn sidebar blocks, rebuilt as foldkit
  pages. Collapsible, keyboard-friendly, yours to gut and rebuild.
- **Element:** one framed live block preview (sidebar-07) + link to /blocks/sidebar.

## 7. Theming

- **Heading:** Your theme already works.
- **Copy:** crease/ui uses shadcn's CSS token contract — --background, --primary,
  --radius and friends. Any shadcn theme, including generated ones, drops in with
  zero changes. Light and dark included.
- **Element:** theme switcher cycling 2-3 palettes over the same component card +
  dark-mode toggle.

## 8. The honest section

- **Heading:** No hidden state. Really, none.
- **Copy:** foldkit is an Elm-architecture framework: every dialog, dropdown and
  slider lives in your Model, changes through your update, renders from your view.
  You wire it explicitly — that's the cost. In exchange: state you can see, replay,
  and test. If that sentence made you nod, you're home.
- **Element:** compact side-by-side — React's <Dialog> usage vs the foldkit wiring
  (init/update arm/view call), presented without apology.

## 9. FAQ

- Is this affiliated with shadcn? — No. It's an independent MIT reimplementation of
  the design system on foldkit, with gratitude. The name "shadcn/ui" belongs to its
  author.
- Do I need React? — No. No React, no JSX, no virtual-DOM interop. foldkit only.
- Is it accessible? — Behavior and ARIA come from foldkit UI's headless primitives;
  crease/ui adds the styling layer on top.
- Can I use my shadcn theme? — Yes, unchanged (see Theming).
- License? — MIT, including everything the registry serves.

## 10. Footer

GitHub · foldkit.dev · Credits: shadcn/ui, foldkit UI, Apache ECharts, Lucide ·
"crease/ui — the visible layer." · © year, MIT

---

## Metadata

- <title>: crease/ui — Beautiful components for foldkit
- description: The shadcn/ui design language rebuilt on foldkit UI. Copy-paste
  components, ECharts-powered charts, and application blocks. MIT.
- OG image: brand/illustrations/og-image.png (exists)
- Fonts: Inter (already shipped). Favicon: logo mark (folded corner).

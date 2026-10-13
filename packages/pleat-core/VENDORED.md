# Vendored from Manzanita-Research/pleat

Source: https://github.com/Manzanita-Research/pleat, `packages/core`
Pinned revision: `7d579dcd63ac364eaf335c396fc583965474c897` (2026-10-09)
License: MIT (see `LICENSE`, preserved from upstream)

Local changes relative to upstream:

- `when.ts`: added `Rank.startingStyle` and the `startingStyle` condition
  (`@starting-style` enter-transition support, used by overlay animations).
- `when.ts`: widened `PSEUDO_SELECTOR` to admit `>` inside the argument list
  so `When.pseudo(':has(> .marker)')` can express direct-child `:has`
  conditions that have no dedicated `When.*` helper.
- `.ts` extensions stripped from import specifiers and files reformatted to
  this repo's `moduleResolution` and oxfmt configuration (mechanical).

Update by re-vendoring from upstream and reapplying the changes above rather
than editing in place.

# Vendored from Manzanita-Research/pleat

Source: https://github.com/Manzanita-Research/pleat, `packages/foldkit`
Pinned revision: `7d579dcd63ac364eaf335c396fc583965474c897` (2026-10-09)
License: MIT (see `LICENSE`, preserved from upstream)

Local changes relative to upstream (mechanical only, no behavior changes):

- `.ts` extensions stripped from import specifiers so the files typecheck and
  bundle under this repo's `moduleResolution` and oxfmt configuration.
- Formatting via this repo's oxfmt settings.

Update by re-vendoring from upstream rather than editing in place.

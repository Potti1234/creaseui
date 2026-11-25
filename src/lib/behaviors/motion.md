# Motion

Motion uses the native Animation behavior for enter and exit transitions.

- Schema state/generations reject stale Commands.
- `Dom.waitForAnimationSettled` observes CSS completion, not guessed timers.
- The optional grid-row `animateSize` view needs no height measurement.

Use `init({ id, isOpen })`, `show`/`hide`, and render while `isMounted(model)`.
Spread `attributes(model)` onto `id=model.id`; CSS owns reduced motion and
transitions (collapse grids on `data-closed`). Instant helpers skip animation;
initial mount emits nothing.
`Settled({ isOpen: false })` means exit finished and `isMounted` is false (ui-sdk's `exited`).
Pass `returnFocusTo` when hiding; on closed settlement bridge Popup with
`completedPopupExit(popupCapturedAtExitStart)`. The upstream `view` remains
available: wrap its messages with `Message.GotAnimationMessage`; it retains
content and hardcodes 200ms. For find-in-page, keep content mounted with
`hiddenAttributes(isOpen, true)` and `reveal(showMessage)` for beforematch.
`supportsHiddenUntilFound(document)` lets a custom view choose whether to
offer browser search for its collapsed content.
Demo (all renderers): `/docs/components/collapsible#motion-presence`.

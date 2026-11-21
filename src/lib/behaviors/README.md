# Behaviors

Behaviors are headless Foldkit Submodels or pure helpers.
State lives in a Schema Model, never in a mutable store or the DOM.
Messages describe facts; update returns the next Model and Commands.
DOM effects belong in Commands; DOM lifecycle resources belong in Mounts.
Views emit attribute bundles and leave roles and ARIA to components.
Components compose behaviors and own selection policy, semantics, and styling.
Bind key unions once with `create<Key>()`; pass item collections as view inputs.
Keep navigation helpers pure and test them independently of rendered views.
RovingFocus establishes this convention for subsequent behavior modules.

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu uses immediate unmount. Roles, event detection, positioning,
focus and layering belong to the component; keep Foldkit's Dialog and Popover
for overlays that already use their positioning and focus lifecycle.

## Motion

Motion wraps Foldkit Animation for panel presence instead of ui-sdk DOM callbacks:

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
Accordion was not migrated: its exact-shape/no-Command contracts would break.
Demo (all renderers): `/docs/components/collapsible#motion-presence`.

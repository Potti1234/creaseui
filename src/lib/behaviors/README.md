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

Motion (`motion.ts`) wraps Foldkit Animation for custom panels and presence.
It replaces ui-sdk's DOM-callback `bindPanel`, `animateIn` and `animateOut`
with a Schema Model and immutable update results. Foldkit already provides
generation counters that reject stale paint/animation Commands,
`Dom.waitForAnimationSettled` rather than guessed timers, and lifecycle
attributes. Its optional `animateSize` view uses grid rows, requiring no height
measurement. Reusing that state machine avoids maintaining a second mutable
DOM subscription/callback lifecycle.

Initialize with `init({ id, isOpen })`. Initially open means "mount": no
animation or settlement callback. `show`/`hide` animate; `showInstantly` and
`hideInstantly` settle immediately without Commands and invalidate in-flight
results. Repeated settled requests are no-ops. `update(model, message, options)`
also accepts `instant: true` for reduced-motion or Open All policy.

The result's optional `outMessage` is an **ordered array of facts**: entry emits
`Settled({ isOpen: true })`; exit emits `Settled({ isOpen: false })`, then
`Exited()`. This batches both callbacks into Foldkit's single OutMessage slot
without adding synthetic Messages. Nothing is emitted on initial mount, stale
results, or duplicate completions. Motion handles `StartedLeaveAnimating`
internally with `Animation.defaultLeaveCommand`; parents only route Commands
and observe facts.

Use `isMounted(model)` to retain content until exit finishes, then unmount it.
Spread `attributes(model)` onto the element with `id=model.id` whose CSS is
transitioning. The pure bundle contains `data-closed`, `data-enter`,
`data-leave`, and `data-transition`, plus ui-sdk aliases:
`data-starting-style` for EnterStart and `data-ending-style` for either leave
phase. For grid height transitions, collapse on `data-closed`, not the ending
alias: LeaveStart must first render at its open height. CSS duration, easing,
and `prefers-reduced-motion` belong to the caller. With transitions disabled,
Foldkit's settlement Command completes without waiting for a duration.

`view` is also re-exported unchanged for `h.submodel({ model, view: Motion.view,
viewInputs: { content, animateSize: true }, toParentMessage, slotId })`.
That upstream convenience wrapper hardcodes a 200ms grid-row transition and
keeps hidden content mounted; prefer the attribute bundle when reduced-motion
styling or unmount-after-exit is required.

Pass `{ returnFocusTo: triggerId }` to `hide` or `update` to emit `ReturnFocus`.
Its DOM effect only focuses the trigger if focus is still inside `model.id`;
missing elements and focus outside the panel are left alone. Instant helpers
emit no Commands; `hide(model, { instant: true, returnFocusTo })` explicitly
opts into the focus Command even though it skips animation. Its acknowledgement
uses a reserved generation of -1, which the state machine ignores (initialized
generations start at zero).

For Popup's `waitForExit`, capture the popup Model/version **when exit starts**
and send `completedPopupExit(capturedPopup)` on Motion's `Exited` fact. Do not
read a newer exit's version from an old callback. Popup rejects stale versions.

Find in page is opt-in: keep searchable content mounted, spread
`hiddenAttributes(isOpen, true)`, and attach `reveal(yourShowMessage)` to handle
`beforematch`. Foldkit supports string `hidden="until-found"` attributes and
custom event handlers, so this needs no mutable DOM binding. Browsers without
beforematch support cannot reveal a find result. Do not apply the closed
`hidden` attribute during animated exit, or it will hide the panel before the
transition finishes. The findable variant intentionally does not unmount.

The live **Motion presence** example is at
`/docs/components/collapsible#motion-presence` on all three renderer sites.
It uses Motion directly; Collapsible itself is unchanged. Accordion was not
migrated because its exact-shape Model and no-Command update contracts would
break when adding per-item animated presence state.

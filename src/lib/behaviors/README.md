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
Typeahead follows this convention with a version-guarded timeout and pure label search.

Connect tracks a port connection draft; components own ports, policy and saved
edges. Route `RequestedConnection` upward and send `Connected` only after saving
an accepted edge, so rejected requests never announce success. `Canceled` is
emitted only for an existing draft. Pass keys and `canConnect` to update and view;
self-connections are always rejected. `role` and `nearestInDirection` return
`Option`; they and `keyboardTarget` are pure.
The view bundles port attributes and a root Mount (document pointer listeners,
cached drag rectangles, 28px snapping); keyboard measurement and announcements
are Commands. Supply a unique root id and an `announcementId` for a component-owned
assertive live region. The DOM adapter emits client-pixel facts; convert point
facts and measured keyboard rectangles at the component boundary for canvas units.
Direct `Started`/`Targeted` facts already use caller units. Dispose the root Mount
with its canvas; roles, focus presentation and touch-action styling stay in the
component. Mount policy and radius are captured on insertion; remount the canvas
when changing these inputs. Update always revalidates current connection policy.
The renderer-neutral SVG demo is at `/docs/components/connect` on all sites.
Connect is a pure Model because `@foldkit/ui` 0.164.0 has no port-connection
equivalent: its `dragAndDrop` models list/container sorting, not connection edges.

Move ports ui-sdk's `createMove` for freeform 2D placement. Foldkit
DragAndDrop remains the better fit for ordering items or transferring them
between containers: it already handles drop targets, the drag ghost, and
keyboard pickup/drop. Move has no drop targets; it changes coordinates.

- Embed `Move.view` with `h.submodel` and route its messages through
  `Move.update`. Spread the surface attributes once on the common ancestor
  and the item attributes on each focusable handle. Put `touch-action: none`
  on those handles (not on the entire scroll surface). Pass the same disabled
  predicate to the view and update; cancel with `CancelledMove` if the active
  handle is removed while the surface stays mounted.
- Render the item's committed `position` and apply its separate draft
  `style` for live translation. Pointer commits snap to `step` and clamp
  to per-item `bounds`; `scale` converts client pixels to position units.
  Alt+arrow nudges the group, Shift uses the larger step, and Escape cancels
  the draft. Unmodified arrow keys remain available for focus navigation.
- Use `moveBy` and `moveTo` for programmatic moves (including disabled
  items); supply `canCommit` to veto a proposal atomically. Render the
  `MovedItems.announcement` in an assertive live region if appropriate.
  Roles, focus, grouping policy, and the live region belong to the caller.

Run `npm run dev` and open `/src/docs/examples/move/` to try the
[renderer-neutral Move example](../../docs/examples/move/main.ts).

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu uses immediate unmount. Roles, event detection, positioning,
focus and layering belong to the component; keep Foldkit's Dialog and Popover
for overlays that already use their positioning and focus lifecycle.

Selection ports the key-based behavior from [ui-sdk.dev](https://ui-sdk.dev/docs/core/behaviors/selection).
Bind keys with `Selection.create<Key>()` and embed `Selection.Model` in the
parent Schema. Call its pure transitions from update and commit the returned
Model only if the parent accepts the change. Use `reflect` for externally
supplied values; changing the selected keys starts the next range over.
Pass the current ordered keys for ranges or select-all. MultiSelector passes
the visible keys for select-all so a filter never clears hidden choices.

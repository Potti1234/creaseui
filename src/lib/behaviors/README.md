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

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu uses immediate unmount. Roles, event detection, positioning,
focus and layering belong to the component; keep Foldkit's Dialog and Popover
for overlays that already use their positioning and focus lifecycle.

## Observe, History and Agent

Components describe agent-visible state as data owned by the application.
Observe selects Commit changes by default, or Live steps when requested.
The component supplies the Commit's previous value from before the interaction.
History records Observe changes and emits Apply with values to restore.
The app maps those values to its own Messages; History never mutates controls.
Agent plans and validates steps against the current component descriptions.
RunStep asks the app to execute; RequestApproval asks a person to approve.
Report completion or failure back to Agent to advance or finish the run.
Use agentChange for source 'agent', and explicit secret flags for redaction.

Foldkit DevTools remains the better tool for development-time agent inspection.
Its MCP bridge offers Schema-typed Message dispatch and model time travel with
keyframes, and stays as is. It is dev-only and model-level, not the in-app,
user-facing agent and history these modules port: per-control undo by source,
confirmation and redaction.

Selection ports the key-based behavior from [ui-sdk.dev](https://ui-sdk.dev/docs/core/behaviors/selection).
Bind keys with `Selection.create<Key>()` and embed `Selection.Model` in the
parent Schema. Call its pure transitions from update and commit the returned
Model only if the parent accepts the change. Use `reflect` for externally
supplied values; changing the selected keys starts the next range over.
Pass the current ordered keys for ranges or select-all. MultiSelector passes
the visible keys for select-all so a filter never clears hidden choices.

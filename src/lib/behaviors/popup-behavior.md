# Anchored Popup

Use Anchored Popup for a floating surface inside the caller's DOM tree.
Store its Model in the parent and route its Messages through
`update(model, message, config)`. Lift the returned Commands. The OutMessages
report changes with their reason and report a prevented dismiss attempt.

## Build the parts

Call `parts(model, config, send, h)` to get Foldkit attributes for a trigger,
panel, title, description, close control, arrow, backdrop, and viewport.
Render the panel and its surrounding parts while `isMounted` is true. Choose
the panel role and styling for your surface.

Set `titleId` and `descriptionId` for the labels you render. The panel links to
the corresponding parts. The arrow uses the shared [Position](position.md)
behavior and receives placement data and CSS variables on the panel. The
backdrop sits outside the panel so an outside press participates in
[Layer](layer.md) dismissal. Style the viewport and backdrop for your layout.

Escape and an explicit close return focus to the trigger by default. An
outside press or focus leaving the panel keeps the user's chosen destination.
Use `initialFocus` to focus the panel or a descendant after placement.

Set `portal: 'top-layer'` to let the panel escape clipping ancestors through
the browser's top layer. The panel keeps its DOM parent and remains in the top
layer through exit. Style its padding, border, and background for your design.
For browsers without the Popover API, render the panel in a Foldkit-owned
outlet outside the clipping ancestor if clipping is a concern. Keep the outlet
in the same document or shadow root as the trigger.

## Keep the panel present through exit

Set `waitForExit: 'auto'` to keep the parts mounted while finite CSS
animations and transitions on the panel settle. Style the panel using
`[data-popup-exiting]`. The panel completes on the next frame when reduced
motion disables its animation. Keep exit motion on the panel itself.
Custom mounts can compose `exitCompletions(element)` and set
`data-popup-exit-version` to the current exit version while closing.

Set `waitForExit: true` to coordinate your own transition. Start it when the
behavior emits Closed and send
`Request.CompletedExit({ version })` with the closing model's `exitVersion`
when the transition settles. Use a completion even for reduced motion.
The exiting panel is inert and stale completions leave newer openings intact.

For a working example in local development, open
[Delivery details](/src/docs/examples/anchored-popup/). It uses this behavior
with a native button, a labelled panel, and a positioned arrow.

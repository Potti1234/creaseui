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

## Keep the panel present through exit

Enable `waitForExit` to keep the parts mounted during an exit transition. Start
your transition when the behavior emits Closed and send
`Request.CompletedExit({ version })` with the closing model's `exitVersion`
when the transition settles. Use a completion even for reduced motion.
The exiting panel is inert and stale completions leave newer openings intact.

For a working example in local development, open
[Delivery details](/src/docs/examples/anchored-popup/). It uses this behavior
with a native button, a labelled panel, and a positioned arrow.

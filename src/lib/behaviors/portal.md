# Portal

Use Portal to place a mounted surface in the browser's top layer while preserving
its DOM parent. Add `attributes(h)` to the surface for a styling hook. Call
`activate(element)` from a live Foldkit Mount and use the returned function to
release it when that mount stops. Acquire before measuring or positioning the
surface. Give the surface its own positioning and reset native popover styles as
needed.

`supportsTopLayer(element)` checks for the browser API. If the API is unavailable
or activation is refused, the surface stays in its original rendering location.
When you need to escape clipping in that case, render it in a Foldkit-owned
outlet outside the clipping ancestor. Anchored Popup composes Portal with Layer
for dismissal and Position for placement.

Existing overlays can use `portalToContainingRoot(element)` to relocate a
surface to a shared host in its document, shadow root, or enclosing dialog.
`portalBackdrop(element)` positions a dialog backdrop before the trigger's
wrapper so the trigger stays interactive. Invoke either helper from a scoped
mount and run its cleanup when the mount ends.

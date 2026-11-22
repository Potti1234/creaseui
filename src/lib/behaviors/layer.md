# Layer

[ui-sdk bindLayer](https://ui-sdk.dev/docs/core/behaviors/popups#layers-of-your-own)
is for floating elements whose open state and layout the owner controls.
`Layer.view({ insideIds: [triggerId], topLayer: true }, send, h)` supplies
a Mount that emits `RequestedDismissal` with Escape, outside press, or
window-blur reasons. Blur and the native top layer are opt-in. The last
mounted layer gets Escape; an outside press can dismiss several layers until
it reaches one it is inside. Modal layers consume the outside press.
`Layer.persistentView` exempts a region from the standalone dismissal stack.
Custom native-layer elements should reset the browser's default popover
inset, margin, padding, border, and background.

Prefer the Popover or Dialog behavior for full overlays: they already
coordinate focus entry and return, modal isolation, ARIA wiring, and
transitions. Neither exposes a standalone dismissal stack.
Layer does not replace their lifecycle or make an element outside a native
modal dialog interactive. Use native Dialog when modal input must be blocked
before handlers on a closed shadow host run. The
[Action Bar demo](https://creaseui.com/docs/components/action-bar) uses Layer
for Escape only and retains parent-owned selection and roving focus.

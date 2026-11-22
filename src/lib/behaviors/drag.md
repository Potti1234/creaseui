# Drag

Drag follows one pointer with capture and frame-coalesced samples. Use
`observeDrag` in a streaming Mount to convert samples to Schema Messages;
`bindDrag` is the lower-level resource for an already accepted press.
The binding owns listeners and animation frames, not UI state. Consumers
decide whether to react on press, wait for `dragThreshold` (3 CSS pixels
on either axis), or roll back on cancellation. A drop-target surface can
feed client coordinates to `createAutoScroll` and stop it on release,
cancellation, and unmount. Resizable, Drawer, Color Picker, and Lightbox
keep their own sizing, dismissal, channel, and pan policies.

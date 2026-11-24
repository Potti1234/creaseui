# Visual Viewport

Use `bindViewport(window, changed)` inside a Foldkit Mount to observe the
visible viewport. It reports dimensions, offsets, and zoom immediately and
on visual scroll and resize. The returned function releases the listeners.
When no visual viewport is available, it reports the layout viewport.

Avoid Keyboard uses this binding to remeasure after viewport changes. The
[Viewport](viewport.md) behavior owns canvas pan and zoom.

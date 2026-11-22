# Velocity and RubberBand

Velocity ports ui-sdk's tracker with immutable bounded samples in a Schema
Model. Use `init`, `addSample`, `velocity`, and `reset` in the owner's update.
Pass event timestamps in milliseconds and positions in CSS pixels; reads return
pixels per millisecond, or zero for stale samples. Invalid samples are ignored
and invalid configuration falls back to defaults. RubberBand exports the pure
`rubberBand`, `rubberBandInverse`, and `rubberBandSlope` helpers. Non-finite
inputs, nonpositive dimensions, and nonpositive coefficients return zero.
These helpers leave dismissal and snapping policy to components.

Drawer (`src/lib/drawer.ts`) and Sheet (`src/lib/sheet.ts`) consume Velocity for
release estimates, sampling rendered drag offsets with pointer-event timestamps.
Drawer retains square-root damping, distance thresholds, fast-swipe dismissal,
snap projection and nested-dialog behavior. Sheet retains body arming and 8px
promotion, detents and magnets, dismissal overshoot, upward resistance and
switcher retention. Neither consumer replaces its existing damping with
rubberBand; the shared helpers leave those feel and dismissal policies local.

Toast deliberately retains Foldkit's swipe engine; `src/lib/toast.ts` is the
wrapper around `@foldkit/ui/toast`. Its `Idle` / `Dragging` / `Settling` /
`Dismissing` swipe states are coupled to its queue, timer pause/resume, and
version-guarded settle/dismiss lifecycle. A local engine would duplicate that
state. Its distance-only release (40px by default), without velocity-based
dismissal, is the known gap rather than a reason to fork lifecycle ownership.

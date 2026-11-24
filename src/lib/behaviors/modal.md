# Modal

Compose Modal with a native `dialog` to share Foldkit's modal focus, Escape,
and scroll locking with your own component. The parent Model owns visibility.
Use `attributes(config, events, h)` with your dialog ID, visibility, and initial
focus selector. Add a label with `aria-labelledby` or `aria-label`.

Route the lifecycle Messages into the parent update. Handle `cancel` with your
dismissal policy and use `CloseDialog` when the surface should close. If the
surface stays visible during an exit animation, run the command when that exit
completes. For unmounts, `ReleaseDialogResources` releases resources by ID.

`ShowDialog` opens the surface when an update makes it visible.
`AcquireResources` also runs on mount, including when the application starts
with an already visible surface. Dialog and Alert Dialog use this lifecycle.

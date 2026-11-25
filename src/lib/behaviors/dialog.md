# Dialog and Popover

CreaseUI Dialog owns the Schema model, open and close messages, the native
`<dialog>` attributes, and enter and leave transitions. A parent routes
Dialog messages through `update` and runs the returned commands.
`Opened` and `Closed` report changes in requested visibility. During an
animated close, the panel stays rendered and modal resources remain active
until the exit settles.

Foldkit core DOM APIs manage background isolation, topmost Escape handling,
focus containment and restoration, and scroll locking. The Dialog mount
reacquires resources for an already-visible model and releases them on
unmount. Drawer, Sheet, Alert Dialog, Lightbox, and Mobile Nav use the same
behavior across Tailwind, StyleX, and Pleat.

CreaseUI Popover manages anchoring, optional modal resources, focus
restoration, and exit animation through its own popup behavior.

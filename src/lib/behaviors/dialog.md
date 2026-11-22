# Dialog and Popover

Dialog and Popover wrap `@foldkit/ui` instead of porting the UI SDK popup
controller. Foldkit Dialog manages the native dialog, focus containment and
restoration, inert background, and scroll locking for the dialog lifetime.
Foldkit Popover already combines collision-aware anchoring, optional modal
resources, and focus restoration with its exit lifecycle. The wrappers keep
these Commands and Mounts intact; each renderer supplies only the skin.

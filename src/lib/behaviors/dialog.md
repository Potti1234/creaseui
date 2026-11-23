# Dialog and Popover

CreaseUI Dialog drives enter and leave through shared animation state. It
uses Foldkit's native dialog view and resource commands for focus containment
and restoration, background isolation, and scroll locking. Drawer, Sheet,
and Alert Dialog use the same Dialog behavior while supplying their own
gestures and dismissal rules.

CreaseUI Popover manages anchoring, optional modal resources, focus
restoration, and exit animation through its own popup behavior.

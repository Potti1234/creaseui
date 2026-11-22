# Tooltip

Tooltip wraps Foldkit's focus and Escape handling, versioned show wait, and
anchoring instead of replicating them around a mutable store. The adapter
keeps CreaseUI's close wait and focus-visible policy; the renderers still
own the trigger and tooltip markup.

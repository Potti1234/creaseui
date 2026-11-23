# AvoidKeyboard

AvoidKeyboard is a Mount for a bar or footer covered by the on-screen keyboard.
Attach `AvoidKeyboard({})` with `Mount.mapMessage` and handle its completion in
the parent. It owns `translate` while mounted and restores the inline value on
cleanup. Leave translate without a transition; use a padded wrapper for a gap
above the keyboard. `data-keyboard` marks an open keyboard even when the element
needs no lift. Without visualViewport it does nothing. Geometry and translate
helpers are pure; layout space behind the lifted element belongs to the caller.

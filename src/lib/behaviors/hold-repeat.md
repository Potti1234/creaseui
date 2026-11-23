# HoldRepeat

HoldRepeat ports @ui-sdk/core's bindHold/bindRepeat timing: hold defaults to
500ms, repeat to 400ms then 60ms, without acceleration. Use `init`, `Message`,
`update`, and `attributes(h, toMessage)`. Pass `mode: 'hold'` for hold-only,
`disabled` to cancel, and `canStep: false` to refuse further steps at a bound.
Pointer ownership, keyboard identity, counts and timer versions live in Model;
the Mount only forwards DOM facts and cleans up listeners. Repeat pauses outside
the button and resumes on re-entry. Touch/pen tap on release, mouse/keyboard on
press. Components consume Stepped and own value/boundary policy.
Use `view` in a submodel boundary when the message lift depends on current view
inputs, so long-lived Mount listeners use the latest lift on each emission.

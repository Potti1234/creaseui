# Change and commit

Use `dispatch(action, context, policy)` for a cancellable action. The policy
can call `cancel()` before the parent proceeds. List Input accepts
`beforeRemove` in its update options to veto removal before emitting an
intent or announcement.

In a Foldkit parent update, pass the current model and a typed proposal to `Change.apply`. The proposal carries the value, reason, source, and optional attribution. Put that context in your Message or Command arguments to preserve it across asynchronous work.

Provide a reader and an immutable writer for the field. A `beforeWrite` policy can return false to veto the proposal. Identical values skip both the policy and the write. The default result reports a commit using the value read back from the new model, including any normalization by the writer.

For a continuous interaction, use the live phase and keep the initial value in your model. On release, call `Change.commit` with the initial value, the accepted final value, and the interaction context. The parent owns that final step and clears its draft or baseline when the interaction ends.

Add the control's ref, component, and key when converting the result with `Observe.change`. Mark secret fields here so their committed and previous values are both redacted before recording. Send only commits to History. The behavior demo uses this flow for its manual edits and agent actions.

[UI SDK Handle Changes](https://ui-sdk.dev/docs/core/kernel/handle-changes)

## Input attribution

Use `sourceOf(event)` to classify the event itself. A click with zero detail and no pointer type is virtual when the event offers no stronger evidence. A caller with a known keyboard or agent origin can pass that source explicitly in the change context.

When a mounted surface needs recent input or focus origin, call `bindInputSource(scope)` and return its `dispose` function from the Mount cleanup. Its `sourceOf()` returns the last key or pointer press seen inside the scope. Its `isFocusFromKeyboard()` reports whether focus arrived after keyboard input in that scope. Resolve the source at the event boundary and put it in the Message or Command before awaiting work.

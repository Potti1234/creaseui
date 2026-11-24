# Change and commit

In a Foldkit parent update, pass the current model and a typed proposal to `Change.apply`. The proposal carries the value, reason, source, and optional attribution. Put that context in your Message or Command arguments to preserve it across asynchronous work.

Provide a reader and an immutable writer for the field. A `beforeWrite` policy can return false to veto the proposal. Identical values skip both the policy and the write. The default result reports a commit using the value read back from the new model, including any normalization by the writer.

For a continuous interaction, use the live phase and keep the initial value in your model. On release, call `Change.commit` with the initial value, the accepted final value, and the interaction context. The parent owns that final step and clears its draft or baseline when the interaction ends.

Add the control's ref, component, and key when converting the result with `Observe.change`. Mark secret fields here so their committed and previous values are both redacted before recording. Send only commits to History. The behavior demo uses this flow for its manual edits and agent actions.

[UI SDK Handle Changes](https://ui-sdk.dev/docs/core/kernel/handle-changes)

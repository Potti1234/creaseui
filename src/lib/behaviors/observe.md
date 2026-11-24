# Observe

In Foldkit, the parent update receives accepted change records and routes them to consumers such as History. Use `Observe.accepts` or `Observe.filter` to select commits or live updates in that message flow. Keep reason, source, and attribution in the Message or Command arguments when work continues asynchronously.

To find an observed control in the DOM, mark its root or a representative part with `data-observe-ref` set to its change ref. Call `Observe.elementOf(root, change.ref)` from a Command or Mount. It returns the first exact match in the supplied scope, including the scope element itself, or `null` when the control is absent. Give each observed control one marker per scope. The behavior demo uses an after-commit Command to scroll to an accepted agent change.

[UI SDK Observe](https://ui-sdk.dev/docs/core/observe)

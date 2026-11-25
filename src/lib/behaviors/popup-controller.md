# Popup Controller

Use `make(dispatch)` to let effects ask a Foldkit model to open a popup and
await the result. Create one controller per owning runtime and route
`RequestedPopupOpen` through the owner's normal message dispatcher.

`openUntilClose(input)` dispatches with `settleOn: 'close'`. When the owner
accepts the request, keep its correlation ID and payload in the model. On a
committed close, call `settleClose(id, { reason, source, returnValue })` from
a Command. The optional return value is typed by the controller. If the
owner declines the open, call `rejectOpen(id, reason)` to finish with a typed
rejected result. Cancellation and disposal also settle as values.
The [anchored popup example](/src/docs/examples/anchored-popup/) uses a
Foldkit inbound Port and a reply Command for this round trip.

`requestOpen(input)` dispatches when run and waits for the opening decision.
The owner applies its existing popup
update and replies with `resolve(correlationId, outcome)` after it determines
whether the request opened the popup, found it already open, or was rejected.
If the owner needs to observe the rendered panel before replying, it can keep
the correlation ID in its model and resolve from a mount message instead.

Check `isPending(correlationId)` at the inbound Port or Subscription to
drop requests cancelled before they reach update. After the model accepts
a request, cancelling the caller settles its reply. Send the popup's own
close Message to dismiss its visible surface.

`cancel(correlationId)` settles one pending request as cancelled.
Interrupting the requesting fiber also removes its pending entry.
`dispose()` settles outstanding requests as `'disposed'` and prevents later
dispatches. Call it when the owner shuts down. Duplicate and late replies
return false.

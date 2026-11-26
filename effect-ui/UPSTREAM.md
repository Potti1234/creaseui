# Effect UI upstream findings

## Verified on an Effect UI snapshot

### A click handler added through `.forward()` inside a headless part runs on the parent

Reported upstream as [Effect UI #274](https://github.com/Effect-TS/ui/issues/274).
The tested fix is linked in the issue. GitHub reported that PR creation was
limited to collaborators and that `Potti1234` had read access on 2026-11-26.
[Fix commit](https://github.com/Potti1234/ui/commit/7a8d34eb1fa531a3c8466a9ec8fef23f30eb573a)

**Verified** on CreaseUI's pinned snapshot [`77dcd92`](https://github.com/Effect-TS/ui/commit/77dcd92f378930583e43debe36be7a203100d351)
and on upstream snapshots [`7ef6234`](https://github.com/Effect-TS/ui/commit/7ef62340bef8776d7d3f0d0668d64525ea8d434f)
and [`efdee07`](https://github.com/Effect-TS/ui/commit/efdee07133b4a64442a68cba69ef8c95cef33a95)
on 2026-11-26. The repros used Node 24.11.1 and Effect 4.1.5.

In a headless child's `p.part('button', ...)` decorator, passing the part's
builder to the kit's `Button` and setting `onPress` to a child message sends
that message to the parent. The parent's update throws
`TypeError: update[msg._tag] is not a function` because it has no handler for the
child's message. The expected result is that the child handles the click and
renders its updated state. The behavior was seen in Chromium while porting
Calendar and isolated with `HtmlPlay` using no CreaseUI code. The same error
occurs with plain `button.forward(node => node.on('click', message))`, which
reduces the repro to `@effect/ui`. The kit's Button uses `.forward()` to attach
`onPress`. [Button implementation](https://github.com/Effect-TS/ui/blob/7ef62340bef8776d7d3f0d0668d64525ea8d434f/packages/ui-kit/src/Button.ts)

From this repository's root, run the same interaction with both handlers.

```sh
npm --prefix effect-ui ci
node effect-ui/repros/button-inside-part.mjs
node effect-ui/repros/button-inside-part.mjs --forward
node effect-ui/repros/button-inside-part.mjs --direct
```

The first two runs exit with `RootCrashed` at `/Parent`. The direct run prints
`Child rendered Pressed`. Calendar uses the passing form and its test checks
that the part handles the click before emitting the selection. [Standalone repro](repros/button-inside-part.mjs) · [Calendar regression test](test/calendar.test.ts)

Searches of upstream issues and PRs for `p.part` with `onPress`, the error
string, and owner routing found no matching report on 2026-11-26. The earlier
headless-owner issue concerned a synchronous blur during teardown. It was
closed through a patch that skips closed owners during event lookup.
[Effect UI #143](https://github.com/Effect-TS/ui/issues/143) · [Fix #144](https://github.com/Effect-TS/ui/pull/144)

#### Issue reproduction

**Title** · A forwarded click handler in `p.part` sends the message to the parent update

A headless child's button part returns
`button.forward(node => node.on('click', ChildMessage.ChildPressed()))`.
Clicking it should send `ChildPressed` to the component that declared the
part. The parent receives it and throws `update[msg._tag] is not a function`.
Binding the same message directly with `button.on('click', ...)` updates the
child. I also saw this when composing the kit's Button inside the part.

To reproduce in an empty npm project, install the packages below, copy the
standalone repro into `repro.mjs`, and run both commands. The first run should
bring the status text from `Waiting` to `Pressed`. The second confirms the
message and part work when the handler is bound directly.

```sh
npm init -y
npm install effect@4.1.5 https://pkg.pr.new/Effect-TS/ui/@effect/ui@7ef6234
node repro.mjs --forward
node repro.mjs --direct
```

The failure reproduces in `HtmlPlay` on Node 24.11.1. For the issue body, include
the [repro source](repros/button-inside-part.mjs) as a code block so maintainers
can run it independently of the CreaseUI branch.

The proposed fix passed the upstream type-check, lint, and 41 focused tests.
The isolated core and kit suite passed 1,819 tests with three expected
failures. Its one unexpected failure, the NumberField `de-CH` parsing
assertion, also failed on unmodified upstream `efdee07`. [NumberField test](https://github.com/Effect-TS/ui/blob/efdee07133b4a64442a68cba69ef8c95cef33a95/packages/ui-kit/test/NumberField.test.ts)

## Foldkit regressions to carry into the port

The [original Foldkit notes](../docs/foldkit-upstream-findings.md) and the
[browser hardening log](../checklist-hardening.md) preserve the original repros
and status. The four fixes for input seeding, anchoring, typeahead, and hover
sync were merged in the CreaseUI author's Foldkit fork. The table records what
we have verified in the Effect UI port so far. [Foldkit fork PR #1](https://github.com/Potti1234/foldkit/pull/1)

| Foldkit finding                                                                                                       | Effect UI evidence and next check                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Combobox Enter with zero matches threw a schema validation error. The Foldkit notes record a bounds fix in 0.163.     | On `77dcd92`, Chromium could type a no-match query and press Enter without losing the committed selection or throwing. Keep this check with Combobox's empty-state coverage.                                                                                                                                 |
| A preselected Combobox displayed its placeholder until it opened and closed.                                          | On `77dcd92`, the CreaseUI adapter showed the committed label on first render. The adapter derives the input text from the selected item's label when no draft exists.                                                                                                                                       |
| A right-placed Popover overflowed at a 390 px viewport.                                                               | Recheck when porting Popover. Cover right-side placement, flipping or shifting at the viewport edge, and clipping ancestors.                                                                                                                                                                                 |
| Typing on a closed Select trigger did not match an option.                                                            | Recheck when porting Select, including disabled options. The old readonly ARIA report was dismissed after checking the attribute belonged to the listbox.                                                                                                                                                    |
| A readonly Slider thumb intercepted arrow keys without editing. The Foldkit notes record a key handling fix in 0.163. | Recheck when porting Slider. Establish the expected focus and page-scroll behavior before treating a difference as a defect.                                                                                                                                                                                 |
| Tooltip sometimes stopped opening after rapid hover and a preview remount.                                            | The original symptom was intermittent. Exercise remount and timer cleanup during the Tooltip port and collect a repeatable sequence if it recurs.                                                                                                                                                            |
| Deferred Foldkit renders could overwrite newer native input or starve rendering during sustained message traffic.     | A Chromium smoke check on `77dcd92` passed rapid edits and caret retention in the ported Combobox. The deterministic Foldkit queue-budget regression still needs an Effect UI equivalent. [Foldkit patch notes](../patches/README.md) · [Foldkit timing test](../scene/foldkit-deferred-input.scene.test.ts) |

## Effect UI compatibility observations

- The public preview distributes commit-pinned snapshots. The local registry
  installation successfully resolved both snapshot URLs and Effect 4.1.5.
  [Snapshot instructions](https://github.com/Effect-TS/ui#snapshots)
- The kit's Dialog uses a native top-layer portal. During Chromium verification
  the portal's textbox was visible and focused while Playwright's visibility
  wait on the outer `dialog` timed out. Use the visible popup content to test
  opening, `:popover-open` to test portal state, and the trigger to test focus
  restoration. [Dialog implementation](https://github.com/Effect-TS/ui/blob/77dcd92f378930583e43debe36be7a203100d351/packages/ui-kit/src/Dialog.ts)
- Calendar has no dedicated kit primitive in the checked snapshot. CreaseUI's
  port uses Effect UI parts and typed focus commands. The older
  `foldkit/calendar` date utilities and range and month/year modes remain
  relevant when carrying the rest of the date controls across.
  [Kit catalog](https://ui.effect.website/#the-ui-kit)

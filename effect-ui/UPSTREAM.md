# Effect UI upstream findings

## Verified on an Effect UI snapshot

### A click handler added through `.forward()` inside a headless part runs on the parent

Reported upstream as [Effect UI #274](https://github.com/Effect-TS/ui/issues/274).
Effect UI shipped its fix in the `4d6d7ec` snapshot. Calendar navigation
uses the kit's Button inside its owned part and has a regression test for
the forwarded click. [Merged upstream fix](https://github.com/Effect-TS/ui/pull/276)

The tested fix is linked in the issue. GitHub reported that PR creation was
limited to collaborators and that `Potti1234` had read access on 2026-11-26.
[Fix commit](https://github.com/Potti1234/ui/commit/7a8d34eb1fa531a3c8466a9ec8fef23f30eb573a)

**Verified** on CreaseUI's former pin [`77dcd92`](https://github.com/Effect-TS/ui/commit/77dcd92f378930583e43debe36be7a203100d351)
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

All three runs print `Child rendered Pressed` on `4d6d7ec`. On `77dcd92`, the
first two exited with `RootCrashed` at `/Parent` and the direct run passed.
[Standalone repro](repros/button-inside-part.mjs) · [Calendar regression test](test/calendar.test.ts)

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
assertion, also failed on unmodified upstream `efdee07` and is tracked in
[#278](https://github.com/Effect-TS/ui/issues/278).

### NumberField rejects straight apostrophes when grouping Swiss German numbers

Reported upstream as [Effect UI #278](https://github.com/Effect-TS/ui/issues/278)
with a standalone reproduction and the tested
[fix commit](https://github.com/Potti1234/ui/commit/771d9a8ad14e799c07f1811f1afd748def774ff9).
Effect UI released its fix in the `8986cd7` snapshot. Both repro inputs now
emit the expected value. [Merged upstream fix](https://github.com/Effect-TS/ui/pull/279)

Reproduced on [`77dcd92`](https://github.com/Effect-TS/ui/commit/77dcd92f378930583e43debe36be7a203100d351),
[`efdee07`](https://github.com/Effect-TS/ui/commit/efdee07133b4a64442a68cba69ef8c95cef33a95),
and [`4d6d7ec`](https://github.com/Effect-TS/ui/commit/4d6d7ec50244582eaf334d40aa6d17afeb5369c6)
with Node 24.11.1 and Effect 4.1.5.

With `locale: 'de-CH'`, entering `1'234.25` produces no `Updated` event.
Entering `1’234.25` emits `1234.25`. The parser already accepts both
apostrophes, but the typing and paste guard only allowed the character
returned by `Intl.NumberFormat.formatToParts`. The patch allows both
variants when the formatter uses an apostrophe for grouping.

From this repository's root, run the standalone repro against the pinned
snapshot.

```sh
npm --prefix effect-ui ci
node effect-ui/repros/numberfield-apostrophe.mjs
node effect-ui/repros/numberfield-apostrophe.mjs --curly
```

Both runs print that NumberField accepted the input as `1234.25` on
`8986cd7`. The straight-apostrophe run failed at `HtmlScene.emitted` on
`4d6d7ec`. Both upstream NumberField suites passed with the proposed patch (20 tests), along
with type-check and lint. The new document test covers both keyboard and
paste and verifies that `en-US` continues to reject both apostrophes.
[Standalone repro](repros/numberfield-apostrophe.mjs)

### Tooltip rejects native links as triggers

Reported as [Effect UI #283](https://github.com/Effect-TS/ui/issues/283) with a
[tested patch](https://github.com/Potti1234/ui/commit/fc0963b67058aaa51a8b6aa48b636c4086df8210).
On `8986cd7`, applying the Tooltip trigger part to an `<a>` throws
`/Tooltip: a part for <button> was given <a>`. The Foldkit Link component
uses native link triggers to describe linked labels.

```sh
node effect-ui/repros/tooltip-link-trigger.mjs
node effect-ui/repros/tooltip-link-trigger.mjs --button
```

The first run fails at render time, and the button control opens its
tooltip on keyboard focus. The patch preserves the native `href` and
description, opens the tooltip on keyboard focus, and leaves navigation
uncanceled when the link is activated. Both Tooltip suites passed with the
patch (30 tests), along with type-check and lint. [Standalone repro](repros/tooltip-link-trigger.mjs)

## Foldkit regressions to carry into the port

The [original Foldkit notes](../docs/foldkit-upstream-findings.md) and the
[browser hardening log](../checklist-hardening.md) preserve the original repros
and status. The four fixes for input seeding, anchoring, typeahead, and hover
sync were merged in the CreaseUI author's Foldkit fork. The table records what
we have verified in the Effect UI port so far. [Foldkit fork PR #1](https://github.com/Potti1234/foldkit/pull/1)

| Foldkit finding                                                                                                       | Effect UI evidence and next check                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Combobox Enter with zero matches threw a schema validation error. The Foldkit notes record a bounds fix in 0.163.     | On `77dcd92`, Chromium could type a no-match query and press Enter without losing the committed selection or throwing. Keep this check with Combobox's empty-state coverage.                                                                                                                                                                                                                                                                                                                        |
| A preselected Combobox displayed its placeholder until it opened and closed.                                          | On `77dcd92`, the CreaseUI adapter showed the committed label on first render. The adapter derives the input text from the selected item's label when no draft exists.                                                                                                                                                                                                                                                                                                                              |
| A right-placed Popover overflowed at a 390 px viewport.                                                               | On `77dcd92`, the ported Popover flipped and stayed inside the viewport at 390 px and 1,100 px in Chromium across Tailwind, StyleX, and Pleat. Escape dismissed the popup and returned focus to its trigger.                                                                                                                                                                                                                                                                                        |
| Typing on a closed Select trigger did not match an option.                                                            | On `77dcd92` and `efdee07`, `HtmlScene` picked the enabled match without opening and emitted nothing for a disabled-only match. The ported trigger also passed closed typeahead and keyboard opening checks in Chromium across all three renderers. The old readonly ARIA report was dismissed after checking the attribute belonged to the listbox. [Upstream Select test](https://github.com/Effect-TS/ui/blob/efdee07133b4a64442a68cba69ef8c95cef33a95/packages/ui-kit/test/Select.test.ts#L409) |
| A readonly Slider thumb intercepted arrow keys without editing. The Foldkit notes record a key handling fix in 0.163. | Recheck when porting Slider. Establish the expected focus and page-scroll behavior before treating a difference as a defect.                                                                                                                                                                                                                                                                                                                                                                        |
| Tooltip sometimes stopped opening after rapid hover and a preview remount.                                            | On `8986cd7`, Chromium verified hover, keyboard focus, Escape dismissal, and reopening after a reload in Tailwind, StyleX, and Pleat. The original same-page remount sequence still needs a repeatable case.                                                                                                                                                                                                                                                                                        |
| Deferred Foldkit renders could overwrite newer native input or starve rendering during sustained message traffic.     | A Chromium smoke check on `77dcd92` passed rapid edits and caret retention in the ported Combobox. The deterministic Foldkit queue-budget regression still needs an Effect UI equivalent. [Foldkit patch notes](../patches/README.md) · [Foldkit timing test](../scene/foldkit-deferred-input.scene.test.ts)                                                                                                                                                                                        |

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

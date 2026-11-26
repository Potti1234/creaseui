# Effect UI upstream findings

## Verified on an Effect UI snapshot

### Button inside a headless part sends its message to the parent

**Verified** on CreaseUI's pinned snapshot [`77dcd92`](https://github.com/Effect-TS/ui/commit/77dcd92f378930583e43debe36be7a203100d351)
and on upstream `main` snapshot [`7ef6234`](https://github.com/Effect-TS/ui/commit/7ef62340bef8776d7d3f0d0668d64525ea8d434f)
on 2026-11-26. Both used Node 24.11.1 and Effect 4.1.5.

In a headless child's `p.part('button', ...)` decorator, passing the part's
builder to the kit's `Button` and setting `onPress` to a child message sends
that message to the parent. The parent's update throws
`TypeError: update[msg._tag] is not a function` because it has no handler for the
child's message. The expected result is that the child handles the click and
renders its updated state. The behavior was seen in Chromium while porting
Calendar and isolated with `HtmlPlay` using no CreaseUI code.

From this repository's root, run the same interaction with both handlers.

```sh
npm --prefix effect-ui ci
node effect-ui/repros/button-inside-part.mjs
node effect-ui/repros/button-inside-part.mjs --direct
```

The first run exits with `RootCrashed` at `/Parent`. The second run prints
`Child rendered Pressed`. Calendar uses the passing form and its test checks
that the part handles the click before emitting the selection. [Standalone repro](repros/button-inside-part.mjs) · [Calendar regression test](test/calendar.test.ts)

Searches of upstream issues and PRs for `p.part` with `onPress`, the error
string, and owner routing found no matching report on 2026-11-26. The earlier
headless-owner issue concerned a synchronous blur during teardown. It was
closed through a patch that skips closed owners during event lookup.
[Effect UI #143](https://github.com/Effect-TS/ui/issues/143) · [Fix #144](https://github.com/Effect-TS/ui/pull/144)

#### Issue draft

**Title** · Kit Button inside `p.part` sends `onPress` to the parent update

A headless child's button part wraps its builder with `Button({ button }, {
onPress: ChildMessage.ChildPressed() })`. Clicking it should send
`ChildPressed` to the component that declared the part. Instead, the parent
receives it and throws `update[msg._tag] is not a function`. Binding the same
message directly with `button.on('click', ...)` updates the child.

To reproduce in an empty npm project, install the packages below, copy the
standalone repro into `repro.mjs`, and run both commands. The first run should
bring the status text from `Waiting` to `Pressed`.

```sh
npm init -y
npm install effect@4.1.5 https://pkg.pr.new/Effect-TS/ui/@effect/ui@7ef6234 https://pkg.pr.new/Effect-TS/ui/@effect/ui-kit@7ef6234
node repro.mjs
node repro.mjs --direct
```

The failure reproduces in `HtmlPlay` on Node 24.11.1. For the issue body, include
the [repro source](repros/button-inside-part.mjs) as a code block so maintainers
can run it independently of the CreaseUI branch.

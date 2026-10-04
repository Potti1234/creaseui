# Porting Base UI tests to creaseui scene tests

CreaseUI reimplements shadcn/ui components as Foldkit (Elm-style, no React)
modules. Each component ships two renderers — `src/ui/<comp>.ts` (Tailwind)
and `src/stylex/<comp>.ts` (StyleX) — over a shared behavior layer in
`src/lib/<comp>.ts` built on `@foldkit/ui` primitives. The goal is to port
Base UI's behavioral test cases so creaseui components demonstrably behave
the same.

## What to write

Create `scene/<comp>-baseui.scene.test.ts` — a vitest suite using the
`foldkit/scene` DSL — covering every _applicable_ case from the Base UI
suite(s) under `~/repos/base-ui/packages/react/src/<suite>/**/*.test.tsx`
(clone `https://github.com/mui/base-ui.git` — public).

Follow the worked example `scene/checkbox-baseui.scene.test.ts`:

- A `verifyRenderer(name, Module)` helper running the same suite against
  BOTH the Tailwind (`@/ui/<comp>`) and StyleX (`@/stylex/<comp>`) exports.
  If a component only exists in one skin, test only that one and note why.
- Group cases under `describe` blocks mirroring Base UI's own grouping
  (e.g. `prop: disabled`, `interactions`, `ARIA attributes`).
- Keep Base UI's test titles where they translate.

## Scene DSL quick reference

```ts
import * as Scene from 'foldkit/scene'

Scene.scene(
  { update: (model, msg) => ({ model: ... }), view: (model, h) => ... },
  Scene.given(initialModel),
  // interaction steps:
  Scene.click(locator), Scene.doubleClick(locator), Scene.contextMenu(locator),
  Scene.pointerDown(locator), Scene.pointerUp(locator), Scene.hover(locator),
  Scene.focus(locator), Scene.blur(locator),
  Scene.focusEnter(locator), Scene.focusLeave(locator),
  Scene.change(locator, value), Scene.submit(locator),
  Scene.type(locator, 'text'), Scene.keydown(locator, 'ArrowDown', {shiftKey:false}),
  Scene.inside(parentLocator, ...steps),
  // assertions:
  Scene.expectHandled(),            // last interaction dispatched a message
  Scene.expectIgnored(),            // last interaction hit no handler
  Scene.expect(locator).toHaveAttr('aria-expanded', 'true'),
  Scene.expect(locator).not.toExist(),
)
```

Locators: `Scene.role('button', {name: 'Save'})`, `Scene.selector('[data-slot="x"]')`,
`Scene.text('Foo')`, `Scene.getByRole/getByText/...`, `Scene.within`,
`Scene.first/last/nth/filter`.

Matchers: `toExist, toBeAbsent, toHaveText, toContainText, toHaveAttr,
toHaveClass, toHaveStyle, toHaveValue, toHaveId, toBeDisabled, toBeEnabled,
toBeEmpty, toBeVisible, toBeChecked, toHaveAccessibleName,
toHaveAccessibleDescription, toHaveHandler('OnClick'), toHaveHook('x')` —
all with a `.not.` variant.

## DSL semantics that matter (hard-won — read before writing tests)

- Steps inspect the **vnode tree** and invoke foldkit handlers directly;
  there is no real DOM event dispatch, no browser layout, no timers.
- `Scene.click` THROWS if the target (or an ancestor button) is disabled —
  including `aria-disabled` — and throws when no click handler exists on the
  target or its ancestors. To assert "does not respond", check
  `.not.toHaveHandler('click')` (and related event keys) instead of
  clicking. If a parent container DOES carry a click handler, the click
  lands there — check `expectHandled`/`expectIgnored` accordingly.
- `toHaveHandler(name)` takes the DOM event key — `'click'`, `'keydown'`,
  `'keyup'`, `'focus'`, `'input'` — NOT the foldkit attribute tag
  (`OnClick`, `OnKeyUpPreventDefault`). A tag name is vacuous: it never
  exists, so `.not.toHaveHandler('OnClick')` always passes.
- `Scene.keydown` emits `keydown` only. There is NO `keyup` step — foldkit
  activates buttons/checkboxes on `keyup`. Space-activation cases become
  `it.todo('… verify in e2e')`.
- `tabindex` is stored as the DOM prop `tabIndex`:
  `toHaveAttr('tabIndex', '0')`.
- `toBeDisabled` treats `disabled` and `aria-disabled` identically.
- `Scene.expectOutMessage(msg)` asserts a component emitted its OutMessage.
- No real focus movement, hover timing, animations, portals, scroll, or
  pointer capture exists — behaviors depending on them are e2e/N-A.
- Component icons render `svg aria-hidden="true"` inside triggers — scope
  `[aria-hidden]` assertions to a concrete element (e.g. `div[aria-hidden]`)
  or you'll match an icon.
- `Scene.selector` supports only simple selectors — a compound like
  `div[aria-hidden]` or `[data-slot="x"]` works; combinators are limited
  (descendant selectors match via `within`/`inside` instead).

## What to port vs skip

Port (write a real test):

- Roles, `aria-*` attributes, accessible names/descriptions, `data-*` hooks
- Interaction → message dispatch (click, keydown nav, focus, submit)
- Controlled state driven through the model; initial-state props
- disabled/readOnly removing handlers while keeping a11y attrs
- Form metadata: hidden inputs, name/value emission
- Keyboard navigation: arrow keys, Home/End, Enter/Space where keydown-based,
  Escape close, Tab/typeahead WHEN the component wires keydown handlers

Skip — record in the file's header comment and in your findings report:

- React internals: refs, contexts, StrictMode, React 17, suspense
- `render=` prop / element-substitution cases (foldkit fixes the element)
- Event-object payloads, `eventDetails.cancel()`, modifier reporting
  (foldkit dispatches plain messages — no DOM event)
- Props/Base UI features creaseui does not expose (name them)
- Timing (delay/duration), positioning, animation, scroll, pointer-drag,
  real form validation, file pickers — note whether an e2e check exists in
  `e2e/*.spec.ts` already

## Divergence handling

When creaseui observably differs from a Base UI expectation:

- Assert the **Base UI expectation** and mark the test `it.fails('…')`
  (vitest inverts it: green now, goes red-and-fails if creaseui is fixed).
  Prefix a `// DIVERGENCE:` comment describing both behaviors.
- If the capability is simply absent (not a bug), use `it.todo('… creaseui
has no X')`.
- If creaseui intentionally differs (documented design), assert the actual
  behavior with a `// DIVERGENCE (intentional):` comment.

## Process

1. `cd ~/repos/creaseui` — deps are installed; dev server not needed.
2. Clone the reference once: `cd ~/repos && git clone --depth 1 https://github.com/mui/base-ui.git`
3. Branch off the shared base: `git fetch origin devin/baseui-port-base && git checkout -b devin/baseui-port-<comp> origin/devin/baseui-port-base`
4. Read `src/ui/<comp>.ts`, `src/stylex/<comp>.ts`, `src/lib/<comp>.ts` to
   learn the creaseui API (prop names, emitted messages, rendered `data-slot`s).
5. Read the Base UI suite(s) for the component. List every `it`/`test` and
   classify: port / it.fails-divergence / it.todo-N-A / skip.
6. Write the test file, then `npx vitest run scene/<comp>-baseui.scene.test.ts`
   — iterate until green (fails+todo count toward green).
7. `npx eslint scene/<comp>-baseui.scene.test.ts --quiet` must pass.
8. Commit ONLY the new test file: `git add scene/<comp>-baseui.scene.test.ts`
   — never modify `src/`, existing tests, config, or lockfiles — push the
   branch. Do NOT open a PR.
9. Structured output: component name, counts (ported/todo/fails),
   divergences (Base UI expectation vs creaseui reality + severity), skipped
   groups, branch name, anything the parent must fix.

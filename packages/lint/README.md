# @creaseui/lint

Agent-first ESLint rules for Foldkit design systems using Tailwind or StyleX.

Unlike JSX-oriented design-system linters, this package understands Foldkit
component calls:

```ts
button({ class: 'mt-4' }, h)
Card.cardTitle({ class: 'text-lg' }, h)
StyleXButton.button({ layoutStyle: styles.fullWidth }, h)
```

It provides three ESLint flat-config helpers:

- `tailwind()` combines Foldkit component contracts with `@shadcn/lint`'s
  Tailwind theme and value rules.
- `stylex()` combines Foldkit component contracts with
  `@stylexjs/eslint-plugin`.
- `constrainedStylex()` closes raw StyleX and Foldkit composition escape
  hatches for agent-authored pages.

See the repository's `docs/design-system-lint.md` for configuration, rule
semantics, adoption, and exception policy.

## Optional rendered audit

`creaseui-lint audit` measures your running app in a browser. It is separate
from source lint: importing `@creaseui/lint` never loads browser tooling.
Install `playwright` (or `@playwright/test`) and Chromium in the consumer
project to use it.

```js
// creaseui-lint.audit.mjs
export default {
  renderer: 'pleat',
  viewports: [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
  ],
  themes: [
    { name: 'light' },
    { name: 'dark', apply: { kind: 'class', value: 'dark' } },
  ],
  cases: [
    {
      id: 'settings',
      url: 'http://localhost:5173/settings',
      ready: 'main',
      directions: ['ltr', 'rtl'],
      states: [
        { name: 'resting' },
        {
          name: 'dialog-open',
          run: page => page.click('#open-dialog'),
          expect: page => page.locator('[role="dialog"]').isVisible(),
        },
      ],
    },
  ],
  exceptions: [],
}
```

```sh
npx creaseui-lint audit --config creaseui-lint.audit.mjs --output audit.json
```

Each case runs once per theme × viewport × direction × state in a fresh
browser context. Theme setup can be `class`, `attribute` or `storage`.
A state with `run` must also declare `expect`; if that check fails, the case
counts as unvisited instead of passing. Unresolved measurements (for example
text over a gradient) and unsupported content (frames, open shadow roots) make
a combination `incomplete`; any unvisited or incomplete combination exits 2,
even with `--report-only`. Empty `viewports`, `themes`, `directions` or
`states` are rejected. To accept a known gap, add an exception with an owner
and reason (`rule: 'text-contrast'` for unresolved contrast,
`rule: 'unsupported-content'` for frames/shadow roots); it is recorded under
`excluded` in the report.

Rules: `accessible-name`, `label-reference`, `document-overflow`,
`overlay-bounds`, `target-size` (warning), `text-contrast` and
`numeric-text`. `numeric-text` applies only where a contract declares
numbers: Stat value/delta slots and elements marked `data-numeric` (or
`data-numeric="right"` etc. to also check alignment); it requires tabular
numerals and the declared physical alignment in LTR and RTL. Contrast is
measured against the actual composited background. Gradients, images and
partial opacity are reported as unresolved rather than guessed. Frames and
open shadow roots are listed as unsupported.

Exit codes: `0` complete and passing, `1` findings at `failOn` severity,
`2` invalid setup, unreachable page, failed readiness/state or incomplete
coverage. `--report-only` reports findings without failing on them, but
incomplete runs still exit `2`. Exceptions need `rule`, a specific
`selector`, `reason` and `owner`, with an optional case `scope`. Broad
selectors are rejected, and unused exceptions are reported.

## Host-page SDK (`@creaseui/lint/rendered`)

For tests that already drive the app, `@creaseui/lint/rendered` measures the
current document with the same engine and rules as `creaseui-lint audit`. The
caller owns navigation, themes and interactions; the SDK never imports
Playwright, and any page object with `url()` and `evaluate()` works.

```js
import { expectUI } from '@creaseui/lint/rendered'

test('settings dialog', async ({ page }, testInfo) => {
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Edit profile' }).click()
  await expectUI(page, testInfo, { state: 'dialog-open' })
})
```

`auditUI(page, { policy, state, timeout })` returns a report whose `outcome` is
`passed`, `failed` or `incomplete`. Unresolved or unsupported content (gradient
text, frames, open shadow roots) makes the report `incomplete`, which takes
precedence over findings, so `assertUI`/`expectUI` never pass it. Exceptions
need `rule`, a non-page-wide `selector`, `owner` and `reason`.

Migration from the earlier local LintApple adapter: the SDK keeps the
`auditUI`/`assertUI`/`expectUI`/`createUIPolicy`/`renderedRuleIds` surface and
the minimal host-page interface, but uses the bundled audit engine instead of
the optional `lintapple` peer (which required Node 22). Typography, spacing and
copy policies from that adapter are not ported; reports gain `coverage` and
`outcome`, and policy exceptions now require an owner.

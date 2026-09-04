# StyleX Component Documentation Example Parity

## Goal

Give every component documentation page the same authored examples under the
Tailwind and StyleX renderer tabs. Titles, descriptions, ordering, initial
state, behavior, and accessibility semantics must match. Only renderer-specific
component imports, view inputs, and layout-style adapters may differ.

Accordion is the reference implementation. Do not move component documentation
previews back into a shared catalog showcase; each component page owns its
renderer-specific examples.

## Reference architecture

Each migrated component owns a directory beside the other authored pages:

```text
src/docs/components/pages/<slug>/
  index.ts       # Node-safe page metadata and renderer example declarations
  shared.ts      # shared fixtures, copy, source builders, and state helpers
  tailwind.ts    # Tailwind preview program
  stylex.ts      # browser-transformed StyleX preview provider
```

Use `src/docs/components/pages/accordion/` as the canonical example.

The architectural boundary is important:

- `index.ts`, `shared.ts`, and `tailwind.ts` must remain importable by Node tests.
- `stylex.ts` may import `@/stylex/<slug>` and must only enter through the
  browser-transformed StyleX integration boundary.
- Shared example state continues to use the authored preview program so
  switching renderers preserves state where the component APIs are equivalent.
- `src/docs/components/stylex-integration.ts` may contain registration imports,
  but it must not contain component fixtures, rendering branches, or example
  implementation details.

## Phase 1: harden the shared infrastructure

Before migrating more pages, make the Accordion mechanism difficult to misuse.

1. Export a reusable `StyleXExamplePreviewProvider` type from the documentation
   infrastructure instead of duplicating provider signatures.
2. Keep the provider registry keyed by component slug.
3. Add a browser-only registration manifest for page-specific StyleX providers.
   It may be an explicit import list or generated manifest, but it must contain
   registration only. Rendering logic stays in each component's `stylex.ts`.
4. Treat a page with `stylexExamples` but no registered StyleX provider as a
   development error. Never silently render its Tailwind preview in the StyleX
   tab.
5. Add a parity helper/test that asserts for every migrated page:
   - Tailwind and StyleX example counts match.
   - Titles match in the same order.
   - Descriptions match.
   - StyleX source imports `@/stylex/<slug>`.
   - Tailwind source imports `@/ui/<slug>`.
6. Keep the existing generic single StyleX specimen as the fallback only for
   pages not yet migrated.

## Phase 2: migrate components in bounded batches

Process components in the authored-page order from
`src/docs/components/pages/index.ts`. Use small batches so regressions are easy
to identify. Accordion is already complete and should not be redone.

Recommended batches:

1. Stateless display primitives: Alert, Aspect Ratio, Avatar, Badge,
   Breadcrumb, Kbd, Label, Marker, Separator, Skeleton, Spinner, Typography.
2. Stateless or locally interactive controls: Button, Button Group, Input,
   Input OTP, Textarea, Toggle, Toggle Group, Checkbox, Switch, Radio Group,
   Native Select, Progress.
3. Disclosure and overlay families: Collapsible, Dialog, Alert Dialog, Drawer,
   Sheet, Popover, Hover Card, Tooltip.
4. Menu and selection families: Dropdown Menu, Context Menu, Menubar,
   Navigation Menu, Select, Combobox, Command.
5. Composite content components: Attachment, Bubble, Card, Empty, Item,
   Message, Message Scroller, Pagination, Scroll Area, Resizable, Tabs, Table.
6. Stateful and application recipes: Calendar, Carousel, Chart, Data Table,
   Date Picker, Direction, Field, Form, Input Group, Sidebar, Sonner, Toast.

If the actual page model shows that a component belongs in a different
complexity batch, move it; preserve the authored-page order within a batch when
practical.

## Per-component procedure

For each `<slug>`:

1. Read the current authored page and both implementations:
   `src/ui/<slug>.ts` and `src/stylex/<slug>.ts`.
2. Move the existing page into `pages/<slug>/index.ts` without changing its
   user-facing documentation unnecessarily.
3. Extract shared fixtures, titles, descriptions, source-generation helpers,
   and behavior-independent values into `shared.ts`.
4. Move the current preview program into `tailwind.ts`.
5. Create `stylex.ts` using the real `@/stylex/<slug>` implementation.
6. Declare a StyleX example for every Tailwind example. Generate both arrays
   from shared metadata where possible so their order and copy cannot drift.
7. Adapt renderer-specific view inputs deliberately:
   - Remove Tailwind `class`, `*Class`, and CVA inputs from StyleX examples.
   - Use the StyleX component's typed layout/style contracts where needed.
   - Do not place raw Tailwind component styling inside a StyleX preview.
   - Documentation-shell utility classes are acceptable for preview framing.
8. Register the component's StyleX provider through the browser-only manifest.
9. Preserve stable, example-indexed submodel slot IDs.
10. Confirm renderer switching retains valid state or explicitly reinitializes
    only when the two renderer models are genuinely incompatible.

## Source-example requirements

Copied examples are part of the product and must compile conceptually as
complete Foldkit applications.

- Preserve Model, Message, init, update, subscriptions, view, and runtime
  sections.
- Import the selected renderer from the correct path.
- Keep the same domain behavior in both renderers.
- Use StyleX-compatible component inputs in StyleX source; do not merely replace
  the import path if the Tailwind example passes class-string props.
- Keep parent/child message folding and OutMessage handling intact.
- Avoid placeholder code, elisions, and comments standing in for wiring.

## Verification after each batch

Run:

```powershell
npm run typecheck
npx eslint src/docs/components src/docs/components/pages/<changed-slugs> e2e/site.spec.ts
node --test --import tsx --import ./test/setup.ts test/catalog-coverage.test.ts test/stylex-catalog.test.ts
npm run build
```

Add or extend Playwright coverage for every component with meaningful state.
At minimum, each migrated page must verify:

- Switching to StyleX preserves all example sections.
- The generic `#stylex-specimen` section is absent.
- The first StyleX source block imports the correct module.
- One representative interaction works through the StyleX preview.
- Desktop and mobile Chromium pass.

Run the relevant focused Playwright tests after each batch, then run the full
component-docs suite before completion.

## Completion criteria

The migration is complete only when:

- Every authored component page declares renderer-parity examples.
- No component docs example implementation lives in `stylex-specimens.ts`.
- The generic StyleX specimen fallback is unused and can be removed from the
  component-page renderer.
- A parity test covers every component slug.
- Node tests do not execute uncompiled StyleX token setup.
- Typecheck, lint, unit tests, production build, and the full relevant
  Playwright suite pass.
- Any pre-existing build-size or Foldkit timing warnings are reported
  separately and are not presented as migration regressions unless worsened.

## Goal-agent operating instructions

Work batch by batch and do not stop after scaffolding. Finish implementation,
tests, and browser verification for each batch before starting the next. Preserve
unrelated user changes. Do not centralize component rendering logic. When a
renderer API mismatch is discovered, solve it in that component's shared and
renderer-specific modules, document the decision briefly, and continue unless
it requires changing the public component API.

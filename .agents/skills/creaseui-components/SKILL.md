---
name: creaseui-components
description: Discover, install, compose and customize CreaseUI components in a Foldkit project (Tailwind, StyleX or Pleat renderer). Use before building any UI in a project that has crease.lock.json or creaseui components.
---

# Building UI with CreaseUI

CreaseUI components are Foldkit views installed as source through the shadcn
registry. Use the installed source; do not re-create a component that exists.

## 1. Read the project

```sh
npx creaseui-lint info --catalog  # every installable component for this renderer, with install commands
npx creaseui-lint info            # renderer, aliases, Foldkit version, installed artifacts
npx creaseui-lint inspect --component sidebar
```

`inspect` lists the exact exports, contracts, variants, whether the component
is stateless or needs a parent Model/update, the styling owner and its
limitations. Do not guess React/shadcn props; read them here or in the
installed file.

## 2. Install what is missing

Registry item names: `<item>` (Tailwind), `stylex-<item>`, `pleat-<item>`.

```sh
npx shadcn@latest add Potti1234/creaseui/<prefix><item>
```

Refs are not inherited by registry dependencies. When pinning, pin the theme
and each Crease dependency at the same ref.

## 3. Compose

- Call the installed exports (`sidebar(...)`, `table(...)`, `chartContainer(...)`)
  from your view with props and the `HtmlBuilder`.
- Stateful components: the parent owns the Model, routes the component's
  Message through `update` and renders `view`.
- Metric/stat card rows: use Grid's adaptive columns
  (`{ minWidth: 240, max: 3, repeat: 'fit' }`) in a product-owned `metricGrid`
  wrapper, not `columns: 3`; fixed columns clip values on phones (see the
  "Adaptive metric cards" recipe in docs/registry.md).
- New domain patterns (an issue row, a status glyph) are built from installed
  components. Put them in an owned design file only when they need raw
  elements, and grant only those elements (`rawElements`).

## 4. Customize

Change the installed component file or the theme tokens. Do not add component
styles to global CSS, ad hoc classes on controls, or height/width overrides on
named-size controls.

## 5. Check

```sh
npx eslint .
npx creaseui-lint doctor
npx creaseui-lint css
```

Exit 1 means findings; exit 2 means the check could not cover the project
(ignored files, disabled rules, unverifiable code) and is not a pass. Do not
edit `crease.lock.json`, lint config, ignores or scripts to make a feature
pass; `creaseui-lint scope --baseline <ref>` reports those changes.

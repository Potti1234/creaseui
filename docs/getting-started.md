# Getting started

Crease UI copies typed Foldkit source into your application through the shadcn
CLI. The installed component is ordinary application code: you can inspect,
edit, test, and upgrade it without a Crease runtime dependency.

## 1. Prepare the application

Use Node 22 or newer, Foldkit, Foldkit UI, Effect, Vite, Tailwind CSS 4, and the
Foldkit Vite plugin. Add a `components.json` with TypeScript output and aliases;
the complete example is in the [registry guide](registry.md).

Your main stylesheet must load Tailwind:

```css
@import "tailwindcss";
```

## 2. Install a component

```sh
npx --yes shadcn@latest add Potti1234/creaseui/button --yes
```

The CLI copies `src/ui/button.ts`, the `cn` helper, and the complete Crease theme
token contract. It does not replace the Foldkit or Effect versions owned by the
application.

## 3. Render a stateless component

```ts
import type { Html, HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Button from '@/ui/button'

const Saved = m('Saved')
type Message = ReturnType<typeof Saved>

export const view = (h: HtmlBuilder<Message>): Html =>
  Button.button({ children: ['Save changes'], onClick: Saved() }, h)
```

Stateless helpers accept typed props and the current `HtmlBuilder`. They do not
need an artificial child model.

## 4. Embed a stateful component

Dialogs, menus, selects, calendars, and similar controls expose `Model`,
`Message`, `init`, and `update`. Store the child model in the parent model, wrap
its message in the parent message union, delegate updates, map commands back to
the parent, and map messages in the view. The
[architecture guide](architecture.md) explains why this explicit composition is
the Foldkit equivalent of shadcn's stateful primitives.

Every component page includes runnable examples, stable copyable source, a
composition outline, and an API table generated from the installed TypeScript
module.

## 5. Validate

```sh
npm run check
npm run test:browser
npm run test:registry
```

These layers cover source and metadata drift, unit and type contracts, browser
behavior and accessibility, and a clean consumer install.

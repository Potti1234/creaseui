import { Html } from '@effect/ui/html'

import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const view =
  (serverHint: boolean): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>) =>
    h.div
      .class('w-full max-w-sm rounded-lg border bg-card p-4')
      .children(
        h.p.class('mb-4 font-medium').children('Your pointer capabilities'),
        h.div
          .class('grid gap-2')
          .children(
            [
              ['pointer', serverHint ? 'coarse' : 'fine'] as const,
              ['hover', serverHint ? 'none' : 'hover'] as const,
              ['anyPointer', 'fine'] as const,
              ['anyHover', 'hover'] as const,
            ].map(([label, value]) =>
              h.div
                .key(label)
                .class('flex items-center justify-between gap-4')
                .children(
                  h.span.class('text-sm text-muted-foreground').children(label),
                  h.code
                    .class('rounded bg-muted px-1.5 py-0.5 text-xs')
                    .children(value),
                ),
            ),
          ),
        h.p
          .class('mt-4 rounded-md bg-muted px-3 py-2 text-sm font-medium')
          .children(serverHint ? 'Tap to open' : 'Hover to open'),
        h.p
          .class('mt-3 text-xs text-muted-foreground')
          .children(
            serverHint
              ? 'Seeded with Sec-CH-UA-Mobile: ?1, then reconciled with this device.'
              : 'Connect a mouse or switch devices. The values update automatically.',
          ),
      )
const source = exampleApplicationSource({
  imports: `import * as PointerKind from '@/lib/behaviors/pointer-kind'`,
  body: `h.div.children(
  h.p.children('pointer: ' + model.pointerKind.pointer),
  h.p.children(PointerKind.canHover(model.pointerKind) ? 'Hover to open' : 'Tap to open'),
)`,
})
export const componentDocs = defineComponentDocs({
  usage: `import * as PointerKind from '@/lib/behaviors/pointer-kind'\n\nPointerKind.canHover(model.pointerKind)`,
  examples: [
    { title: 'Live capabilities', view: view(false), source },
    { title: 'Server hints', view: view(true), source },
  ],
})

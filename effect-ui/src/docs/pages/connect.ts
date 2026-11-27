import { Html } from '@effect/ui/html'

import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const node = (
  h: Html.H<DocsMessage>,
  label: string,
  x: number,
  y: number,
  active = false,
) =>
  h.div
    .key(label)
    .class(
      active
        ? 'absolute rounded-lg border-2 border-primary bg-background px-3 py-2 text-sm font-medium shadow-sm'
        : 'absolute rounded-lg border bg-background px-3 py-2 text-sm font-medium shadow-sm',
    )
    .style({ left: `${x}px`, top: `${y}px` })
    .children(
      label,
      h.span
        .class(
          'absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rounded-full border bg-primary',
        )
        .attr('aria-hidden', 'true'),
    )
const view =
  (keyboard: boolean): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>) =>
    h.div
      .class('w-full max-w-lg')
      .children(
        h.div
          .class(
            'relative h-56 w-full overflow-hidden rounded-lg border bg-muted/30',
          )
          .children(
            h.div
              .class('absolute top-12 right-30 left-31 h-0.5 bg-primary')
              .attr('aria-hidden', 'true'),
            h.div
              .class(
                'absolute top-36 right-30 left-31 border-t-2 border-dashed border-border',
              )
              .attr('aria-hidden', 'true'),
            node(h, 'prompt:out', 24, keyboard ? 32 : 128, keyboard),
            node(h, 'answer:in', 300, keyboard ? 32 : 128),
          ),
        h.p
          .class('mt-3 text-sm text-muted-foreground')
          .children(
            keyboard
              ? 'Start with Enter, target a compatible port with an arrow key, and commit with Enter.'
              : 'Drag from an output port to a compatible input port to create a connection.',
          ),
      )
const source = exampleApplicationSource({
  imports: `import * as Connect from '@/lib/behaviors/connect'`,
  body: `h.submodel({
  model: model.connect,
  view: connect.view,
  viewInputs: { keys, id: 'connection-ports', canConnect },
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import * as Connect from '@/lib/behaviors/connect'\n\nconst connect = Connect.create<PortKey>()`,
  examples: [
    { title: 'Keyboard connections', view: view(true), source },
    { title: 'Pointer connections', view: view(false), source },
  ],
})

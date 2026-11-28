import { Html } from '@effect/ui/html'

import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const port = (h: Html.H<DocsMessage>, label: string, x: number, y: number) =>
  h.div.key(label).children(
    h.div
      .class('absolute size-6 rounded-full bg-foreground')
      .style({ left: `${x - 12}px`, top: `${y - 12}px` })
      .attr('aria-hidden', 'true'),
    h.div
      .class('absolute w-24 text-center text-xs text-foreground')
      .style({ left: `${x - 48}px`, top: `${y + 18}px` })
      .children(label.replace(':', ' ')),
  )
const view =
  (_keyboard: boolean): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>) =>
    h.div.children(
      h.p
        .class('m-0 text-base')
        .children(
          'Drag an output to an input. Or Tab to an output, press Enter, use arrows, then Enter. Escape or Tab cancels.',
        ),
      h.div
        .class('relative h-55 w-100')
        .children(
          port(h, 'prompt:out', 80, 60) as never,
          port(h, 'context:out', 80, 160) as never,
          port(h, 'answer:in', 320, 60) as never,
          port(h, 'summary:in', 320, 160) as never,
        ),
      h.p.class('m-0 text-base').children('Saved connections: 0'),
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

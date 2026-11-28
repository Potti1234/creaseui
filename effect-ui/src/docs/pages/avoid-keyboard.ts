import { Html } from '@effect/ui/html'

import { Input, Label } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const view =
  (padded: boolean): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    h.div.class('grid w-full max-w-sm gap-4').children(
      h.p
        .class('m-0 text-sm font-medium')
        .children('Keep the conversation in view'),
      h.div.class('grid gap-2').children(
        Label(h, { for: `${context.idPrefix}-message` }).children(
          'Message',
        ) as never,
        Input(h, {
          id: `${context.idPrefix}-message`,
          element: h.input.attrs({ placeholder: 'Write a message…' }),
          props: { value: '' },
          onUpdate: () => undefined,
        }) as never,
      ),
      h.p
        .class('m-0 text-xs text-muted-foreground')
        .children(
          'Try this on your phone. The bar rises only when the keyboard covers it.',
        ),
      h.div
        .class(padded ? 'pt-4 pb-4' : 'pt-4')
        .attr('data-keyboard-footer', '')
        .children(
          h.div
            .class(
              'flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background p-3 text-sm',
            )
            .children(
              h.span.children('Ready to send'),
              h.code
                .class('text-xs text-muted-foreground')
                .attr('data-keyboard-state', '')
                .children('data-keyboard: false'),
            ),
        ),
    )
const source = exampleApplicationSource({
  imports: `import * as AvoidKeyboard from '@/lib/behaviors/avoid-keyboard'`,
  body: `h.div
  .onMount(AvoidKeyboard.AvoidKeyboard({}))
  .children(h.p.children('Ready to send'))`,
})
export const componentDocs = defineComponentDocs({
  usage: `import * as AvoidKeyboard from '@/lib/behaviors/avoid-keyboard'\n\nh.div.onMount(AvoidKeyboard.AvoidKeyboard({}))`,
  examples: [
    { title: 'Keyboard-aware footer', view: view(false), source },
    { title: 'A little breathing room', view: view(true), source },
  ],
})

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
    h.div
      .class(
        'relative h-64 w-full max-w-sm overflow-hidden rounded-lg border bg-background',
      )
      .children(
        h.div.class('grid gap-2 p-4').children(
          Label(h, { for: `${context.idPrefix}-message` }).children(
            'Message',
          ) as never,
          Input(h, {
            id: `${context.idPrefix}-message`,
            element: h.input.attrs({ placeholder: 'Type a message…' }),
            props: { value: '' },
            onUpdate: () => undefined,
          }) as never,
        ),
        h.div
          .class(
            'absolute inset-x-0 bottom-0 border-t bg-background/95 p-3 backdrop-blur',
          )
          .class(padded ? 'pb-4' : undefined)
          .attrs({ 'data-keyboard-footer': '' })
          .children(
            h.div
              .class(
                'flex items-center justify-between rounded-md bg-muted px-3 py-2',
              )
              .children(
                h.span.class('text-sm font-medium').children('Ready to send'),
                h.span
                  .class('text-xs text-muted-foreground')
                  .children(padded ? '16px gap' : 'No gap'),
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

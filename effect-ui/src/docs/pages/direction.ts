import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Direction, Icon } from '#components'
import { defineComponentDocs } from '../types'
import { exampleApplicationSource } from './source'
import './direction.css'

const DirectionDemoMessage = UiSchema.TaggedEnum({ Pressed: {} })

const DirectionDemo = Html.component({
  name: 'DirectionDocsDemo',
  model: Schema.Number,
  message: DirectionDemoMessage,
}).make({
  init: () => 0,
  update: { Pressed: $ => $.set($.model + 1) },
  view: (h, count) =>
    Direction(h, {
      direction: 'rtl',
      className: 'direction-docs-row',
      children: [
        Button(h, { onPress: DirectionDemoMessage.Pressed() }).children(
          'التالي',
          Icon(h, { name: 'arrow-left' }),
        ),
        h.span
          .class('direction-docs-muted')
          .children(`Clicked ${String(count)} times`),
      ],
    }),
})

const interactiveSource = `import { UiSchema } from '@effect/ui'
import { BrowserHost, Html } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'
import { Button, Direction, Icon } from '@/ui/effect/ui'
import './direction.css'

const Message = UiSchema.TaggedEnum({ Pressed: {} })

const App = Html.component({
  name: 'DirectionExample',
  model: Schema.Number,
  message: Message,
}).make({
  init: () => 0,
  update: { Pressed: $ => $.set($.model + 1) },
  view: (h, count) =>
    Direction(h, {
      direction: 'rtl',
      className: 'direction-docs-row',
      children: [
        Button(h, { onPress: Message.Pressed() }).children('التالي', Icon(h, { name: 'arrow-left' })),
        h.span.class('direction-docs-muted').children(\`Clicked \${count} times\`),
      ],
    }),
})

const root = document.getElementById('root')
if (root === null) throw new Error('Missing root')
Layer.launch(BrowserHost.mount(App, {}, root)).pipe(Effect.runFork)`

export const componentDocs = defineComponentDocs({
  usage: `import { Direction } from '@/ui/effect/ui'

Direction(h, { direction: 'rtl', children: [content] })`,
  examples: [
    {
      title: 'Right to Left',
      view: (h, context) =>
        DirectionDemo(h, {
          key: `${context.idPrefix}-direction-demo`,
          props: {},
        }),
      source: interactiveSource,
    },
    {
      title: 'Mixed Direction',
      view: h =>
        Direction(h, {
          direction: 'rtl',
          children: [
            'الإصدار ',
            Direction(h, {
              direction: 'ltr',
              className: 'direction-docs-token',
              children: ['v0.163.0'],
            }),
          ],
        }),
      source: exampleApplicationSource({
        imports: `import { Direction } from '@/ui/effect/ui'
import './direction.css'`,
        body: `Direction(h, {
  direction: 'rtl',
  children: [
    'الإصدار ',
    Direction(h, {
      direction: 'ltr',
      className: 'direction-docs-token',
      children: ['v0.163.0'],
    }),
  ],
})`,
      }),
    },
  ],
})

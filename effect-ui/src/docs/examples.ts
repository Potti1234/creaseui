import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Accordion, Button } from '#components'
import type { DocsExample } from './types'

const ButtonMessage = UiSchema.TaggedEnum({ Pressed: {} })
const ButtonSample = Html.component({
  name: 'EffectDocsButtonSample',
  model: Schema.Number,
  message: ButtonMessage,
}).make({
  init: () => 0,
  update: { Pressed: $ => $.set($.model + 1) },
  view: (h, presses) =>
    h.div.class('docs-button-example').children(
      h.div.class('docs-button-row').children(
        Button(h, { onPress: ButtonMessage.Pressed() }).children(
          'Save changes',
        ),
        Button(h, {
          variant: 'outline',
          onPress: ButtonMessage.Pressed(),
        }).children('Apply'),
        Button(h, { variant: 'secondary', disabled: true }).children(
          'Disabled',
        ),
      ),
      h.output
        .attr('aria-live', 'polite')
        .children(
          presses === 0
            ? 'Choose an action to try the button.'
            : `Actions sent ${presses}`,
        ),
    ),
})

const buttonExample: DocsExample = {
  description:
    'Triggers an action with native button semantics and CreaseUI variants.',
  view: h => ButtonSample(h, { props: {} }),
  source: `Button(h, { onPress: Message.Save() }).children('Save changes')
Button(h, { variant: 'outline', onPress: Message.Apply() }).children('Apply')
Button(h, { variant: 'secondary', disabled: true }).children('Disabled')`,
}

const accordionExample: DocsExample = {
  description:
    'Groups related disclosures and opens each panel by its stable value.',
  view: h =>
    h.div.class('docs-accordion-example').children(
      Accordion(h, {
        props: { defaultValue: ['shipping'] },
        items: [
          {
            value: 'shipping',
            trigger: 'How does shipping work?',
            content: 'Orders leave our warehouse within two business days.',
          },
          {
            value: 'returns',
            trigger: 'Can I return my order?',
            content: 'Returns are available for thirty days after delivery.',
          },
          {
            value: 'support',
            trigger: 'How do I contact support?',
            content:
              'Send a message with your order number so the team can help.',
          },
        ],
      }),
    ),
  source: `Accordion(h, {
  props: { defaultValue: ['shipping'] },
  items: [
    {
      value: 'shipping',
      trigger: 'How does shipping work?',
      content: 'Orders leave our warehouse within two business days.',
    },
    {
      value: 'returns',
      trigger: 'Can I return my order?',
      content: 'Returns are available for thirty days after delivery.',
    },
  ],
})`,
}

export const examples: Readonly<Record<string, DocsExample>> = {
  button: buttonExample,
  accordion: accordionExample,
}

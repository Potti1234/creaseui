import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Checkbox, Label } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './label.css'

const Message = UiSchema.TaggedEnum({
  ToggledTerms: { checked: Schema.Boolean },
})
const TermsDemo = Html.component({
  name: 'DocsLabelTerms',
  props: Schema.Struct({ rtl: Schema.Boolean }),
  model: Schema.Struct({ checked: Schema.Boolean }),
  message: Message,
}).make({
  init: () => ({ checked: false }),
  update: { ToggledTerms: ($, { checked }) => $.evolve({ checked }) },
  view: (h, model) => {
    const id = `${h.props.rtl ? 'rtl-' : ''}terms-checkbox`
    return h.div
      .class('label-docs-row')
      .attrs({ dir: h.props.rtl ? 'rtl' : undefined })
      .children(
        Checkbox(h, {
          key: id,
          id,
          ariaLabel: h.props.rtl
            ? 'قبول الشروط والأحكام'
            : 'Accept terms and conditions',
          props: { checked: model.checked },
          onEmit: {
            Toggled: ({ checked }) => Message.ToggledTerms({ checked }),
          },
        }),
        Label(h, { for: id }).children(
          h.props.rtl ? 'قبول الشروط والأحكام' : 'Accept terms and conditions',
        ),
      )
  },
})

const terms =
  (rtl: boolean): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    TermsDemo(h, {
      key: `${context.idPrefix}-${rtl ? 'rtl' : 'basic'}`,
      props: { rtl },
    })

const field = (
  h: Html.H<DocsMessage>,
  label: string,
  children: View.Input<DocsMessage>,
  description?: string,
) =>
  h.div
    .class('label-docs-field')
    .children(
      h.label.class('label-docs-label').children(label),
      children,
      description === undefined
        ? undefined
        : h.p.class('label-docs-description').children(description),
    )

const input = (
  h: Html.H<DocsMessage>,
  context: string,
  id: string,
  placeholder: string,
  type = 'text',
) =>
  h.input
    .class('label-docs-control')
    .attrs({ id: `${context}-${id}`, type, placeholder })

const fieldExample: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('label-docs-wrapper').children(
    field(
      h,
      'Name',
      input(h, context.idPrefix, 'name', 'Evil Rabbit'),
      'Use your first and last name.',
    ),
    field(
      h,
      'Card number',
      input(h, context.idPrefix, 'card-number', '1234 5678 9012 3456'),
    ),
    h.div.class('label-docs-form-grid').children(
      field(h, 'CVV', input(h, context.idPrefix, 'cvv', 'CVV')),
      field(
        h,
        'Month',
        h.select
          .class('label-docs-control')
          .attrs({ id: `${context.idPrefix}-month` })
          .children(
            [
              '01',
              '02',
              '03',
              '04',
              '05',
              '06',
              '07',
              '08',
              '09',
              '10',
              '11',
              '12',
            ].map(m => h.option.attrs({ value: m }).children(m)),
          ),
      ),
      field(
        h,
        'Year',
        h.select
          .class('label-docs-control')
          .attrs({ id: `${context.idPrefix}-year` })
          .children(
            ['2024', '2025', '2026', '2027', '2028', '2029'].map(y =>
              h.option.attrs({ value: y }).children(y),
            ),
          ),
      ),
    ),
    field(
      h,
      'Comments',
      h.textarea.class('label-docs-control').attrs({
        id: `${context.idPrefix}-comments`,
        placeholder: 'Add any additional comments',
      }),
    ),
    h.div.class('label-docs-row').children(
      h.input.attrs({
        type: 'checkbox',
        id: `${context.idPrefix}-same-as-shipping`,
      }),
      Label(h, { for: `${context.idPrefix}-same-as-shipping` }).children(
        'Billing address is same as shipping',
      ),
    ),
  )

const source = exampleApplicationSource({
  imports: `import { Checkbox, Label } from '@/ui/effect/ui'
import './label.css'`,
  body: `h.div.class('label-docs-row').children(
  Checkbox(h, { key: 'terms', id: 'terms', props: { checked } }),
  Label(h, { for: 'terms' }).children('Accept terms and conditions'),
)`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Label } from '@/ui/effect/ui'

Label(h, { for: 'field-id' }).children('Field label')`,
  examples: [
    { title: 'Basic', view: terms(false), source },
    { title: 'Label in Field', view: fieldExample, source },
    { title: 'RTL', view: terms(true), source },
  ],
})

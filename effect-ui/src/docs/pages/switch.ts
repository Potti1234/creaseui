import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Switch } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './switch.css'

const Message = UiSchema.TaggedEnum({
  Toggled: { id: Schema.String, checked: Schema.Boolean },
})
const SwitchDemo = Html.component({
  name: 'DocsSwitchDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({
    states: Schema.Record(Schema.String, Schema.Boolean),
  }),
  message: Message,
}).make({
  init: () => ({ states: { 'switch-notifications': true } }),
  update: {
    Toggled: ($, { id, checked }) =>
      $.evolve({ states: { ...$.model.states, [id]: checked } }),
  },
  view: (h, model) => {
    const control = (
      id: string,
      options: {
        disabled?: boolean
        invalid?: boolean
        rtl?: boolean
        size?: 'default' | 'sm'
      } = {},
    ) =>
      Switch(h, {
        id: `${id}-control`,
        ariaLabel: id,
        ...(options.invalid === true ? { invalid: true } : {}),
        ...(options.rtl === true ? { direction: 'rtl' as const } : {}),
        ...(options.size === undefined ? {} : { size: options.size }),
        props: {
          checked: model.states[id] ?? false,
          disabled: options.disabled,
          name: id,
        },
        onToggle: ({ checked }) => Message.Toggled({ id, checked }),
      })
    const text = (id: string, label: string, description?: string) =>
      h.div
        .class('switch-docs-content')
        .children(
          h.label
            .class('switch-docs-label')
            .attr('for', `${id}-control`)
            .children(label),
          description === undefined
            ? undefined
            : h.p.class('switch-docs-description').children(description),
        )
    switch (h.props.kind) {
      case 'demo':
        return h.div
          .class('switch-docs-row')
          .children(
            control('airplane-mode'),
            h.label
              .class('switch-docs-label')
              .attr('for', 'airplane-mode-control')
              .children('Airplane Mode'),
          )
      case 'description':
        return h.div
          .class('switch-docs-horizontal')
          .children(
            text(
              'switch-focus-mode',
              'Share across devices',
              'Focus is shared across devices, and turns off when you leave the app.',
            ),
            control('switch-focus-mode'),
          )
      case 'choiceCard':
        return h.div.class('switch-docs-cards').children(
          (
            [
              [
                'switch-share',
                'Share across devices',
                'Focus is shared across devices, and turns off when you leave the app.',
              ],
              [
                'switch-notifications',
                'Enable notifications',
                'Receive notifications when focus mode is enabled or disabled.',
              ],
            ] as const
          ).map(([id, label, description]) =>
            h.label
              .class('switch-docs-card')
              .attr('for', `${id}-control`)
              .children(
                h.div
                  .class('switch-docs-content')
                  .children(
                    h.span.class('switch-docs-card-title').children(label),
                    h.p.class('switch-docs-description').children(description),
                  ),
                control(id),
              ),
          ),
        )
      case 'disabled':
        return h.div
          .class('switch-docs-row')
          .children(
            control('switch-disabled-unchecked', { disabled: true }),
            h.label
              .class('switch-docs-label')
              .attr('for', 'switch-disabled-unchecked-control')
              .children('Disabled'),
          )
      case 'invalid':
        return h.div
          .class('switch-docs-horizontal')
          .children(
            text(
              'switch-terms',
              'Accept terms and conditions',
              'You must accept the terms and conditions to continue.',
            ),
            control('switch-terms', { invalid: true }),
          )
      case 'size':
        return h.div
          .class('switch-docs-sizes')
          .children(
            h.div
              .class('switch-docs-row')
              .children(
                control('switch-size-sm', { size: 'sm' }),
                h.label
                  .class('switch-docs-label')
                  .attr('for', 'switch-size-sm-control')
                  .children('Small'),
              ),
            h.div
              .class('switch-docs-row')
              .children(
                control('switch-size-default'),
                h.label
                  .class('switch-docs-label')
                  .attr('for', 'switch-size-default-control')
                  .children('Default'),
              ),
          )
      case 'rtl':
        return h.div
          .class('switch-docs-horizontal switch-docs-rtl')
          .children(
            text(
              'switch-focus-mode-rtl',
              'المشاركة عبر الأجهزة',
              'يتم مشاركة التركيز عبر الأجهزة، ويتم إيقاف تشغيله عند مغادرة التطبيق.',
            ),
            control('switch-focus-mode-rtl', { rtl: true }),
          )
      default:
        return h.div
    }
  },
})

const source = exampleApplicationSource({
  imports: `import { Switch } from '@/ui/effect/ui'
import './switch.css'`,
  body: `Switch(h, {
  id: 'airplane-mode-control',
  label: 'Airplane Mode',
  props: { checked: model.airplaneMode, name: 'airplane-mode' },
  onToggle: ({ checked }) => Message.ToggledAirplaneMode({ checked }),
})`,
})

const examples: ReadonlyArray<readonly [string, string]> = [
  ['Basic', 'demo'],
  ['Description', 'description'],
  ['Choice Card', 'choiceCard'],
  ['Disabled', 'disabled'],
  ['Invalid', 'invalid'],
  ['Size', 'size'],
  ['RTL', 'rtl'],
]

export const componentDocs = defineComponentDocs({
  usage: `import { Switch } from '@/ui/effect/ui'

Switch(h, {
  id: 'airplane-mode-control',
  label: 'Airplane Mode',
  props: { checked: model.airplaneMode, name: 'airplane-mode' },
  onToggle: ({ checked }) => Message.ToggledAirplaneMode({ checked }),
})`,
  examples: examples.map(([title, kind]) => ({
    title,
    view: ((h, context) =>
      SwitchDemo(h, {
        key: `${context.idPrefix}-${kind}`,
        props: { kind },
      })) as DocsExampleImplementation['view'],
    source,
  })),
})

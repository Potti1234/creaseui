import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { SelectableCard } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './selectable-card.css'

const plans = [
  { id: 'basic', name: 'Basic', price: '$9/mo', desc: 'For individuals' },
  { id: 'pro', name: 'Pro', price: '$29/mo', desc: 'For small teams' },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99/mo',
    desc: 'For organizations',
  },
] as const
const elevatedPlans = [
  { id: 'starter', name: 'Starter' },
  { id: 'pro', name: 'Pro' },
] as const
const tags = [
  ['foldkit', 'Foldkit', 'blue'],
  ['typescript', 'TypeScript', 'cyan'],
  ['node', 'Node.js', 'green'],
  ['python', 'Python', 'yellow'],
  ['rust', 'Rust', 'orange'],
  ['go', 'Go', 'teal'],
] as const

const Message = UiSchema.TaggedEnum({
  SelectedPlan: { value: Schema.String },
  ToggledTag: { value: Schema.String },
})
const CardsDemo = Html.component({
  name: 'DocsSelectableCards',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({ selected: Schema.Array(Schema.String) }),
  message: Message,
}).make({
  init: ({ props }) => ({
    selected: props.kind === 'multi' ? ['foldkit', 'typescript'] : ['pro'],
  }),
  update: {
    SelectedPlan: ($, { value }) => $.evolve({ selected: [value] }),
    ToggledTag: ($, { value }) =>
      $.evolve({
        selected: $.model.selected.includes(value)
          ? $.model.selected.filter(v => v !== value)
          : [...$.model.selected, value],
      }),
  },
  view: (h, model) => {
    const selected = (id: string) => model.selected.includes(id)
    if (h.props.kind === 'multi')
      return h.div.class('selectable-card-docs-grid3').children(
        tags.map(([id, name, variant]) =>
          SelectableCard(h, {
            key: id,
            label: name,
            variant,
            padding: 2,
            props: { checked: selected(id) },
            onEmit: { Toggled: () => Message.ToggledTag({ value: id }) },
            children: [h.p.class('selectable-card-docs-bold').children(name)],
          }),
        ),
      )
    if (h.props.kind === 'elevated')
      return h.div.class('selectable-card-docs-grid2').children(
        elevatedPlans.map(plan =>
          SelectableCard(h, {
            key: plan.id,
            label: plan.name,
            elevation: 'low',
            props: { checked: selected(plan.id) },
            onEmit: { Toggled: () => Message.SelectedPlan({ value: plan.id }) },
            children: [
              h.p.class('selectable-card-docs-bold').children(plan.name),
              h.p
                .class('selectable-card-docs-supporting')
                .children(
                  'The resting shadow stays put — the selection ring layers on top.',
                ),
            ],
          }),
        ),
      )
    return h.div.class('selectable-card-docs-row').children(
      plans.map(plan =>
        SelectableCard(h, {
          key: plan.id,
          label: plan.name,
          width: '11.25rem',
          props: { checked: selected(plan.id) },
          onEmit: { Toggled: () => Message.SelectedPlan({ value: plan.id }) },
          children: [
            h.div
              .class('selectable-card-docs-plan')
              .children(
                h.h4.class('selectable-card-docs-heading').children(plan.name),
                h.p.class('selectable-card-docs-price').children(plan.price),
                h.p
                  .class('selectable-card-docs-supporting')
                  .children(plan.desc),
              ),
          ],
        }),
      ),
    )
  },
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    CardsDemo(h, { key: `${context.idPrefix}-${kind}`, props: { kind } })

const source = exampleApplicationSource({
  imports: `import { SelectableCard } from '@/ui/effect/ui'
import './selectable-card.css'`,
  body: `SelectableCard(h, {
  key: plan.id,
  label: plan.name,
  props: { checked: model.selected === plan.id },
  onEmit: { Toggled: () => SelectedPlan({ value: plan.id }) },
  children: [plan.name],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { SelectableCard } from '@/ui/effect/ui'

SelectableCard(h, { key: 'plan', label: 'Plan', props: { checked }, children })`,
  examples: [
    { title: 'SelectableCard', view: view('plans'), source },
    { title: 'SelectableCard — Elevated', view: view('elevated'), source },
    { title: 'SelectableCardMulti', view: view('multi'), source },
  ],
})

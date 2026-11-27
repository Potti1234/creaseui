import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { ActionBar, Button } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const sides = ['top', 'bottom'] as const
const aligns = ['start', 'center', 'end'] as const
const Message = UiSchema.TaggedEnum({
  ToggledSelection: {},
  ClosedActionBar: {},
  OpenedAt: { side: Schema.Literals(sides), align: Schema.Literals(aligns) },
})
const ActionBarDemo = Html.component({
  name: 'DocsActionBarDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({
    selected: Schema.Number,
    side: Schema.Literals(sides),
    align: Schema.Literals(aligns),
  }),
  message: Message,
}).make({
  init: () => ({ selected: 0, side: 'bottom', align: 'center' }),
  update: {
    ToggledSelection: $ =>
      $.evolve({ selected: $.model.selected === 0 ? 3 : 0 }),
    ClosedActionBar: $ => $.evolve({ selected: 0 }),
    OpenedAt: ($, { side, align }) => $.evolve({ selected: 3, side, align }),
  },
  view: (h, model) => {
    const actions = [
      {
        value: 'complete',
        label: 'Mark completed',
        onSelect: Message.ClosedActionBar(),
      },
      { value: 'assign', label: 'Assign', onSelect: Message.ClosedActionBar() },
      {
        value: 'archive',
        label: 'Archive',
        onSelect: Message.ClosedActionBar(),
      },
      {
        value: 'delete',
        label: 'Delete',
        variant: 'destructive' as const,
        onSelect: Message.ClosedActionBar(),
      },
    ]
    return h.div.class('flex flex-wrap justify-center gap-2').children(
      h.props.kind === 'positions'
        ? sides.flatMap(side =>
            aligns.map(align =>
              Button(h, { variant: 'outline' })
                .on('click', () => Message.OpenedAt({ side, align }))
                .children(
                  `${side === 'top' ? 'Top' : 'Bottom'} ${align === 'start' ? 'Left' : align === 'center' ? 'Center' : 'Right'}`,
                ),
            ),
          )
        : Button(h, { variant: 'outline' })
            .on('click', () => Message.ToggledSelection())
            .children(
              model.selected === 0 ? 'Select 3 tasks' : 'Clear selection',
            ),
      ActionBar(h, {
        key: 'selection-actions',
        open: model.selected > 0,
        label: 'Selection actions',
        side: model.side,
        align: model.align,
        alignOffset: model.align === 'center' ? 0 : 16,
        selection: h.span.children(`${model.selected} selected`),
        onClose: Message.ClosedActionBar(),
        closeLabel: 'Clear selection',
        items: actions,
      }),
    )
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    ActionBarDemo(h, { key: `${context.idPrefix}-${kind}`, props: { kind } })
const source = exampleApplicationSource({
  imports: `import { ActionBar, Button } from '@/ui/effect/ui'`,
  body: `ActionBar(h, {
  open: model.selected > 0,
  label: 'Selection actions',
  selection: [\`${'${model.selected}'} selected\`],
  onClose: ClosedActionBar(),
  items,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { ActionBar } from '@/ui/effect/ui'\n\nActionBar(h, { open, label: 'Selection actions', items })`,
  examples: [
    { title: 'Basic', view: view('basic'), source },
    { title: 'Positions', view: view('positions'), source },
  ],
})

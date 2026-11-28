import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { ColorPicker } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const presets = [
  { label: 'Ocean blue', value: '#3b82f6' },
  { label: 'Forest green', value: '#15803d' },
  { label: 'Rose pink', value: '#be185d' },
]
const initial: Record<string, string> = {
  swatch: '#3b82f6',
  button: '#22c55e',
  input: '#a855f7',
  inline: '#f97316',
  controlled: '#0ea5e9',
  withoutAlpha: '#ef4444',
  disabled: '#64748b',
}
const Message = UiSchema.TaggedEnum({
  PickedColor: { color: Schema.String },
})
const ColorPickerDemo = Html.component({
  name: 'DocsColorPickerDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({ value: Schema.String }),
  message: Message,
}).make({
  init: ({ props }) => ({ value: initial[props.kind] ?? '#3b82f6' }),
  update: {
    PickedColor: ($, { color }) => $.evolve({ value: color }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const picker = ColorPicker(h, {
      id: `${kind}-picker`,
      label: 'Color',
      inline: kind === 'inline',
      presets: kind === 'swatch' ? presets : [],
      showAlpha: kind !== 'withoutAlpha',
      triggerVariant:
        kind === 'button' ? 'button' : kind === 'input' ? 'input' : 'swatch',
      props: {
        value: model.value,
        disabled: kind === 'disabled',
      },
      onEmit: {
        Picked: ({ color }: any) => Message.PickedColor({ color }),
        OpenChanged: () => undefined,
      },
    } as any)
    return h.div
      .class('flex items-center gap-3')
      .children(
        picker as never,
        kind === 'controlled'
          ? h.span
              .class('font-mono text-xs text-muted-foreground')
              .children(model.value)
          : undefined,
      )
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    ColorPickerDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind },
    }) as never
const source = exampleApplicationSource({
  imports: `import { ColorPicker } from '@/ui/effect/ui'`,
  body: `ColorPicker(h, {
  id: 'color',
  label: 'Color',
  presets,
  props: { value: model.value },
  onEmit: {
    Picked: ({ color }) => PickedColor({ color }),
    OpenChanged: () => undefined,
  },
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { ColorPicker } from '@/ui/effect/ui'\n\nColorPicker(h, { id, label, props: { value }, onEmit })`,
  examples: [
    { title: 'Swatch Trigger', view: view('swatch'), source },
    { title: 'Swatch Trigger', view: view('swatch'), source },
    { title: 'Button Trigger', view: view('button'), source },
    { title: 'Input Trigger', view: view('input'), source },
    { title: 'Inline', view: view('inline'), source },
    { title: 'Controlled', view: view('controlled'), source },
    { title: 'Without Alpha', view: view('withoutAlpha'), source },
    { title: 'Disabled', view: view('disabled'), source },
  ],
})

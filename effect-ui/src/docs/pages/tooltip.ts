import type { Html } from '@effect/ui/html'

import { Button, Icon, Kbd, Tooltip } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './tooltip.css'

type Tip = Readonly<{
  id: string
  label: string
  side: 'top' | 'right' | 'bottom' | 'left'
  disabled?: boolean
  icon?: boolean
  kbd?: string
}>

const sides = (
  labels: readonly [string, string, string, string],
  prefix: string,
): ReadonlyArray<Tip> =>
  (['left', 'top', 'bottom', 'right'] as const).map((side, index) => ({
    id: `${prefix}-${side}`,
    label: labels[index] ?? side,
    side,
  }))

const tip = (
  h: Html.H<DocsMessage>,
  contextId: string,
  spec: Tip,
  content: string,
) =>
  Tooltip(h, {
    key: `${contextId}-${spec.id}`,
    props: { side: spec.side },
    trigger:
      spec.icon === true
        ? Button(h, { variant: 'outline', size: 'icon' }).children(
            Icon(h, { name: 'save' }),
          )
        : Button(h, {
            variant: 'outline',
            ...(spec.disabled === true ? { disabled: true } : {}),
          }).children(spec.label),
    content:
      spec.kbd === undefined
        ? content
        : h.span
            .class('tooltip-docs-content')
            .children(content, ' ', Kbd(h, { children: [spec.kbd] })),
  })

const one =
  (spec: Tip, content: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    h.div
      .class('tooltip-docs-row')
      .children(tip(h, context.idPrefix, spec, content))

const group =
  (
    tips: ReadonlyArray<Tip>,
    content: string,
    rtl = false,
  ): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    h.div
      .class('tooltip-docs-row', rtl ? 'tooltip-docs-rtl' : undefined)
      .children(tips.map(spec => tip(h, context.idPrefix, spec, content)))

const source = exampleApplicationSource({
  imports: `import { Button, Tooltip } from '@/ui/effect/ui'
import './tooltip.css'`,
  body: `Tooltip(h, {
  key: 'save-tooltip',
  props: { side: 'top' },
  trigger: Button(h, { variant: 'outline' }).children('Hover'),
  content: 'Add to library',
})`,
})

const examples: ReadonlyArray<
  readonly [string, DocsExampleImplementation['view']]
> = [
  [
    'Basic',
    one({ id: 'tip-hover', label: 'Hover', side: 'top' }, 'Add to library'),
  ],
  [
    'Side',
    group(sides(['Left', 'Top', 'Bottom', 'Right'], 'tip'), 'Add to library'),
  ],
  [
    'With Keyboard Shortcut',
    one(
      { id: 'tip-save', label: '', side: 'top', icon: true, kbd: 'S' },
      'Save Changes',
    ),
  ],
  [
    'Disabled Button',
    one(
      { id: 'tip-disabled', label: 'Disabled', side: 'top', disabled: true },
      'This feature is currently unavailable',
    ),
  ],
  [
    'RTL',
    group(
      sides(['يسار', 'أعلى', 'أسفل', 'يمين'], 'tip-rtl'),
      'إضافة إلى المكتبة',
      true,
    ),
  ],
]

export const componentDocs = defineComponentDocs({
  usage: `import { Tooltip } from '@/ui/effect/ui'

Tooltip(h, { key: 'tip', props: {}, trigger, content: 'Tooltip' })`,
  examples: examples.map(([title, view]) => ({ title, view, source })),
})

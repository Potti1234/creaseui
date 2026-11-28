import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { Popover } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Side = 'top' | 'right' | 'bottom' | 'left'
type Align = 'start' | 'center' | 'end'

const triggerButton = (
  h: Html.H<DocsMessage>,
  label: string,
  compact = false,
) =>
  h.button
    .class(
      compact
        ? 'rounded-md border bg-background px-3 py-1.5 text-sm'
        : 'rounded-md border bg-background px-4 py-2 text-sm font-medium',
    )
    .attrs({ type: 'button' })
    .children(label)

const headerContent = (h: Html.H<DocsMessage>, rtl = false) =>
  h.div
    .class('grid gap-2')
    .children(
      h.h4
        .class('font-medium text-base')
        .children(rtl ? 'الأبعاد' : 'Dimensions'),
      h.p
        .class('text-sm text-muted-foreground')
        .children(
          rtl ? 'تعيين الأبعاد للطبقة.' : 'Set the dimensions for the layer.',
        ),
    )

const popover = (
  h: Html.H<DocsMessage>,
  key: string,
  trigger: ReturnType<typeof triggerButton>,
  content: View.Input<DocsMessage>,
  options: {
    side?: Side
    align?: Align
    className?: string
    rtl?: boolean
  } = {},
) =>
  Popover(h, {
    key,
    trigger,
    content,
    ...(options.className === undefined
      ? {}
      : { className: options.className }),
    ...(options.rtl === true ? { direction: 'rtl' as const } : {}),
    props: {
      ...(options.side === undefined ? {} : { side: options.side }),
      ...(options.align === undefined ? {} : { align: options.align }),
    },
    onEmit: {
      RequestedOpen: () => undefined,
      RequestedClose: () => undefined,
      Settled: () => undefined,
    },
  }) as unknown as View.Content<DocsMessage>

const basic: DocsExampleImplementation['view'] = (h, context) =>
  popover(
    h,
    `${context.idPrefix}-basic`,
    triggerButton(h, 'Open Popover'),
    headerContent(h),
    { align: 'start' },
  )

const align: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('flex flex-wrap justify-center gap-6').children(
    (
      [
        ['start', 'Start', 'start', 'Aligned to start'],
        ['center', 'Center', 'center', 'Aligned to center'],
        ['end', 'End', 'end', 'Aligned to end'],
      ] as const
    ).map(([id, label, alignment, text]) =>
      popover(
        h,
        `${context.idPrefix}-${id}`,
        triggerButton(h, label, true),
        text,
        { side: 'bottom', align: alignment, className: 'w-40' },
      ),
    ),
  )

const inputRow = (
  h: Html.H<DocsMessage>,
  id: string,
  label: string,
  value: string,
) =>
  h.div
    .class('grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-2')
    .children(
      h.label
        .class('w-1/2 text-sm leading-none font-medium')
        .attr('for', id)
        .children(label),
      h.input
        .class(
          'h-8 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm',
        )
        .attrs({ id, value }),
    )

const form: DocsExampleImplementation['view'] = (h, context) =>
  popover(
    h,
    `${context.idPrefix}-form`,
    triggerButton(h, 'Open Popover'),
    h.div
      .class('grid gap-4')
      .children(
        headerContent(h),
        h.div
          .class('grid gap-4')
          .children(
            inputRow(h, `${context.idPrefix}-width`, 'Width', '100%'),
            inputRow(h, `${context.idPrefix}-height`, 'Height', '25px'),
          ),
      ),
    { align: 'start', className: 'w-64' },
  )

const interactiveContent = (h: Html.H<DocsMessage>) =>
  h.div
    .class('grid gap-2')
    .children(
      h.h4.class('font-medium text-base').children('Dimensions'),
      h.p
        .class('text-sm text-muted-foreground')
        .children('Set the dimensions for the layer.'),
      h.input
        .class('rounded-md border px-3 py-2')
        .attrs({ type: 'number', 'aria-label': 'Width' }),
    )

const legacy =
  (side: Side, alignment: Align): DocsExampleImplementation['view'] =>
  (h, context) =>
    popover(
      h,
      `${context.idPrefix}-legacy`,
      triggerButton(h, 'Open dimensions'),
      interactiveContent(h),
      { side, align: alignment },
    )

const rtl: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('flex flex-wrap justify-center gap-2').children(
    (
      [
        ['left', 'يسار', 'left'],
        ['top', 'أعلى', 'top'],
        ['bottom', 'أسفل', 'bottom'],
        ['right', 'يمين', 'right'],
      ] as const
    ).map(([id, label, side]) =>
      popover(
        h,
        `${context.idPrefix}-${id}`,
        triggerButton(h, label, true),
        headerContent(h, true),
        { side, align: 'center', className: 'w-40', rtl: true },
      ),
    ),
  )

const source = exampleApplicationSource({
  imports: `import { Popover } from '@/ui/effect/ui'`,
  body: `Popover(h, {
  key: 'dimensions',
  trigger,
  content,
  props: { align: 'start' },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Popover } from '@/ui/effect/ui'\n\nPopover(h, { key, trigger, content, props })`,
  examples: [
    { title: 'Basic', view: basic, source },
    { title: 'Align', view: align, source },
    { title: 'With Form', view: form, source },
    {
      title: 'Interactive content',
      view: legacy('bottom', 'start'),
      source,
    },
    { title: 'Right aligned', view: legacy('right', 'center'), source },
    { title: 'RTL', view: rtl, source },
  ],
})

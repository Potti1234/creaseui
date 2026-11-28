import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Input, Label, Sheet } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  ChangedSheetOpen: { id: Schema.String, open: Schema.Boolean },
  ChangedSheetValue: { id: Schema.String, value: Schema.String },
})
type SheetSpec = {
  readonly id: string
  readonly side: 'top' | 'right' | 'bottom' | 'left'
  readonly trigger: string
  readonly title: string
  readonly description?: string
  readonly rtl?: boolean
  readonly close?: boolean
  readonly kind?:
    | 'profile'
    | 'lorem'
    | 'bottom'
    | 'directions'
    | 'keyboard'
    | 'switcher'
  readonly snapPoints?: readonly (number | string)[]
  readonly modal?: boolean
}
const SheetDemo = Html.component({
  name: 'DocsSheetDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({
    open: Schema.Record(Schema.String, Schema.Boolean),
    values: Schema.Record(Schema.String, Schema.String),
  }),
  message: Message,
}).make({
  init: () => ({ open: {}, values: {} }),
  update: {
    ChangedSheetOpen: ($, { id, open }) =>
      $.evolve({ open: value => ({ ...value, [id]: open }) }),
    ChangedSheetValue: ($, { id, value }) =>
      $.evolve({ values: values => ({ ...values, [id]: value }) }),
  },
  view: (h, model) => {
    const prefix = h.props.idPrefix
    const lorem = Array.from(
      { length: 10 },
      () =>
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    )
    const inputField = (id: string, label: string, value: string) =>
      h.div.class('grid gap-3').children(
        Label(h, { for: `${prefix}-${id}` }).children(label) as never,
        Input(h, {
          id: `${prefix}-${id}`,
          props: { value: model.values[id] ?? value },
          onUpdate: ({ value: next }) =>
            Message.ChangedSheetValue({ id, value: next }),
        }) as never,
      )
    const content = (spec: SheetSpec) => () => {
      if (spec.kind === 'lorem')
        return h.div
          .class(
            'mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto px-4',
          )
          .children(
            lorem.map(text =>
              h.p.class('text-sm leading-relaxed').children(text),
            ),
          )
      if (spec.kind === 'directions')
        return h.div
          .class('grid flex-1 content-start gap-4 overflow-y-auto px-4')
          .children(
            [
              'Head northeast on Mission St',
              'Turn right onto 3rd St',
              'Continue onto Kearny St',
            ].map((label, index) =>
              h.div
                .class('rounded-lg border p-3')
                .children(
                  h.p.class('text-sm font-medium').children(label),
                  h.p
                    .class('text-xs text-muted-foreground')
                    .children(
                      [
                        'Toward 3rd St',
                        'Pass Yerba Buena Gardens on your left',
                        ' toward Grant Ave',
                      ][index],
                    ),
                ),
            ),
          )
      if (spec.kind === 'keyboard' || spec.kind === 'switcher')
        return h.div
          .class('grid flex-1 auto-rows-min gap-4 overflow-y-auto px-4')
          .children(
            inputField('name', 'Name', 'Pedro Duarte'),
            inputField('username', 'Username', '@peduarte'),
            inputField('email', 'Email', 'pedro@example.com'),
            inputField('bio', 'Bio', 'Product designer'),
          )
      if (spec.kind === 'bottom')
        return h.div
          .class('grid flex-1 auto-rows-min gap-4 px-4')
          .children(
            h.p
              .class('text-sm text-muted-foreground')
              .children(
                'Filter saved places by category, distance, and opening hours.',
              ),
            inputField('filter', 'Filter', 'Coffee near Mission'),
          )
      return h.div
        .class('grid flex-1 auto-rows-min gap-6 px-4')
        .children(
          inputField(
            'name',
            spec.rtl === true ? 'الاسم' : 'Name',
            'Pedro Duarte',
          ),
          inputField(
            'username',
            spec.rtl === true ? 'اسم المستخدم' : 'Username',
            '@peduarte',
          ),
        )
    }
    const sheet = (spec: SheetSpec) =>
      Sheet(h, {
        key: `${prefix}-${spec.id}`,
        side: spec.side,
        direction: spec.rtl === true ? 'rtl' : undefined,
        closeLabel: spec.close === false ? false : 'Close',
        props: {
          open: model.open[spec.id] === true,
          ...(spec.snapPoints === undefined
            ? {}
            : { snapPoints: spec.snapPoints }),
          ...(spec.modal === undefined ? {} : { modal: spec.modal }),
        },
        title: spec.title,
        description: spec.description,
        trigger: Button(h, { variant: 'outline' }).children(spec.trigger),
        content: content(spec),
        footer: () =>
          h.div
            .class('flex gap-2')
            .children(
              Button(h, {}).children(
                spec.rtl === true ? 'حفظ التغييرات' : 'Save changes',
              ),
              Button(h, { variant: 'outline' }).children(
                spec.rtl === true ? 'إغلاق' : 'Cancel',
              ),
            ),
        onEmit: {
          RequestedOpen: () =>
            Message.ChangedSheetOpen({ id: spec.id, open: true }),
          RequestedClose: () =>
            Message.ChangedSheetOpen({ id: spec.id, open: false }),
          Settled: () => undefined,
          Snapped: () => undefined,
        },
      } as any)
    const baseDescription =
      "Make changes to your profile here. Click save when you're done."
    const specs: Record<string, readonly SheetSpec[]> = {
      basic: [
        {
          id: 'profile',
          side: 'right',
          trigger: 'Open',
          title: 'Edit profile',
          description: baseDescription,
        },
      ],
      side: ['top', 'right', 'bottom', 'left'].map(side => ({
        id: side,
        side: side as SheetSpec['side'],
        trigger: side[0]!.toUpperCase() + side.slice(1),
        title: 'Edit profile',
        description: baseDescription,
        kind: 'lorem' as const,
      })),
      noClose: [
        {
          id: 'no-close',
          side: 'right',
          trigger: 'Open Sheet',
          title: 'No Close Button',
          description:
            "This sheet doesn't have a close button in the top-right corner. Click outside to close.",
          close: false,
          kind: 'bottom',
        },
      ],
      rtl: [
        {
          id: 'rtl',
          side: 'left',
          trigger: 'فتح',
          title: 'تعديل الملف الشخصي',
          description:
            'قم بإجراء تغييرات على ملفك الشخصي هنا. انقر حفظ عند الانتهاء.',
          rtl: true,
        },
      ],
      bottom: [
        {
          id: 'bottom',
          side: 'bottom',
          trigger: 'Open sheet',
          title: 'Filter places',
          description:
            'A mobile filter surface that rises from the bottom edge.',
          kind: 'bottom',
        },
      ],
      heights: [
        {
          id: 'heights',
          side: 'bottom',
          trigger: 'Open heights',
          title: 'Choose a height',
          description:
            'Hug fits short, bounded content. Capped starts at a comfortable mid-height.',
          kind: 'bottom',
          snapPoints: ['35%', '65%', '92%'],
        },
      ],
      noScrim: [
        {
          id: 'no-scrim',
          side: 'bottom',
          trigger: 'Show place details',
          title: 'Place details',
          description:
            'Keeps the page visible and interactive behind a non-modal bottom sheet.',
          kind: 'bottom',
          modal: false,
        },
      ],
      snapPoints: [
        {
          id: 'snap-points',
          side: 'bottom',
          trigger: 'Show directions',
          title: 'Directions to the Ferry Building',
          description:
            'Drag-to-resize stops for a half-height working surface.',
          kind: 'directions',
          snapPoints: ['30%', '60%', '92%'],
        },
      ],
      keyboard: [
        {
          id: 'keyboard',
          side: 'bottom',
          trigger: 'Edit profile',
          title: 'Edit profile',
          description:
            'Keeps focused controls visible above the mobile keyboard.',
          kind: 'keyboard',
          snapPoints: ['92%'],
        },
      ],
      switcher: [
        {
          id: 'switcher',
          side: 'bottom',
          trigger: 'Set up notifications',
          title: 'Set up notifications',
          description: 'A three-step flow inside one shared dialog.',
          kind: 'switcher',
          snapPoints: ['45%', '70%'],
        },
      ],
      reviewflow: [
        {
          id: 'reviewflow',
          side: 'bottom',
          trigger: 'Review settings',
          title: 'Review settings',
          description:
            'Review settings, confirm them, or move back without replacing the shared dialog.',
          kind: 'switcher',
          snapPoints: ['45%', '70%'],
        },
      ],
    }
    return h.div
      .class('flex flex-wrap items-center justify-center gap-2')
      .attrs({ dir: h.props.kind === 'rtl' ? 'rtl' : undefined })
      .children(
        (specs[h.props.kind] ?? specs.basic!).map(spec => sheet(spec) as never),
      )
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    SheetDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    }) as never
const source = exampleApplicationSource({
  imports: `import { Button, Input, Sheet } from '@/ui/effect/ui'`,
  body: `Sheet(h, {
  key: 'profile',
  side: 'right',
  props: { open: model.open },
  title: 'Edit profile',
  description: 'Make changes to your profile here.',
  trigger: Button(h, { variant: 'outline' }).children('Open'),
  content: () => ProfileFields(h),
  onEmit,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Sheet } from '@/ui/effect/ui'\n\nSheet(h, { key, side, props: { open }, title, trigger, content, onEmit })`,
  examples: [
    { title: 'Basic', view: view('basic'), source },
    { title: 'Side', view: view('side'), source },
    { title: 'No Close Button', view: view('noClose'), source },
    { title: 'RTL', view: view('rtl'), source },
    { title: 'Bottom', view: view('bottom'), source },
    { title: 'Bottom — Height Variants', view: view('heights'), source },
    { title: 'Bottom — No Scrim', view: view('noScrim'), source },
    { title: 'Bottom — Snap Points', view: view('snapPoints'), source },
    { title: 'Bottom — Mobile Keyboard', view: view('keyboard'), source },
    { title: 'Switcher', view: view('switcher'), source },
    { title: 'Switcher — Review Flow', view: view('reviewflow'), source },
  ],
})

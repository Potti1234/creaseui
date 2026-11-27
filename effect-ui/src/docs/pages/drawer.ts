import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Drawer, Input, Label } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  ChangedDrawerOpen: { id: Schema.String, open: Schema.Boolean },
  ChangedCalories: { delta: Schema.Number },
})
type Side = 'top' | 'right' | 'bottom' | 'left'
type Spec = {
  readonly id: string
  readonly side: Side
  readonly trigger: string
  readonly title: string
  readonly description?: string
  readonly kind: 'goal' | 'text' | 'scroll' | 'form'
  readonly handle?: boolean
  readonly snap?: readonly (number | string)[]
  readonly modal?: boolean
  readonly rtl?: boolean
  readonly nested?: boolean
}
const DrawerDemo = Html.component({
  name: 'DocsDrawerDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({
    open: Schema.Record(Schema.String, Schema.Boolean),
    calories: Schema.Number,
  }),
  message: Message,
}).make({
  init: () => ({ open: {}, calories: 350 }),
  update: {
    ChangedDrawerOpen: ($, { id, open }) =>
      $.evolve({ open: value => ({ ...value, [id]: open }) }),
    ChangedCalories: ($, { delta }) =>
      $.evolve({
        calories: value => Math.max(200, Math.min(500, value + delta)),
      }),
  },
  view: (h, model) => {
    const prefix = h.props.idPrefix
    const lorem =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    const goal = (rtl = false) =>
      h.div
        .class('mx-auto flex w-full max-w-sm flex-col items-center gap-6 px-4')
        .children(
          h.div.class('flex items-center justify-center gap-4').children(
            Button(h, {
              variant: 'outline',
              size: 'icon',
              onPress: Message.ChangedCalories({ delta: -10 }),
            }).children('−'),
            h.div
              .class('text-center')
              .children(
                h.div
                  .class('text-7xl font-semibold tracking-tighter')
                  .children(String(model.calories)),
                h.div
                  .class('text-sm text-muted-foreground')
                  .children(rtl ? 'سعرة حرارية في اليوم' : 'Calories per day'),
              ),
            Button(h, {
              variant: 'outline',
              size: 'icon',
              onPress: Message.ChangedCalories({ delta: 10 }),
            }).children('+'),
          ),
          h.div
            .class('flex h-24 w-full items-end justify-center gap-2')
            .children(
              [350, 350, 350, 350, 350, 350, 350].map((value, index) =>
                h.div
                  .key(String(index))
                  .class('w-6 rounded-t-md bg-muted')
                  .style({
                    height: `${36 + index * 7}%`,
                    opacity: index < 5 ? '1' : '.35',
                  }),
              ),
            ),
        )
    const content = (spec: Spec) => () => {
      if (spec.kind === 'goal') return goal(spec.rtl === true)
      if (spec.kind === 'scroll')
        return h.div
          .class('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4')
          .children(
            Array.from({ length: 12 }, (_, index) =>
              h.p
                .key(String(index))
                .class('text-sm leading-relaxed')
                .children(lorem),
            ),
          )
      if (spec.kind === 'form')
        return h.div.class('grid flex-1 auto-rows-min gap-5 px-4').children(
          h.div.class('grid gap-2').children(
            Label(h, { for: `${prefix}-drawer-name` }).children(
              'Name',
            ) as never,
            Input(h, {
              id: `${prefix}-drawer-name`,
              props: { value: 'Pedro Duarte' },
              onUpdate: () => undefined,
            }) as never,
          ),
          h.div.class('grid gap-2').children(
            Label(h, { for: `${prefix}-drawer-email` }).children(
              'Email',
            ) as never,
            Input(h, {
              id: `${prefix}-drawer-email`,
              props: { value: 'pedro@example.com' },
              onUpdate: () => undefined,
            }) as never,
          ),
        )
      return h.div
        .class('px-4')
        .children(
          h.p
            .class('text-sm leading-relaxed text-muted-foreground')
            .children(lorem),
        )
    }
    const drawer = (spec: Spec) =>
      Drawer(h, {
        key: `${prefix}-${spec.id}`,
        side: spec.side,
        direction: spec.rtl === true ? 'rtl' : undefined,
        showSwipeHandle: spec.handle,
        props: {
          open: model.open[spec.id] === true,
          ...(spec.snap === undefined ? {} : { snapPoints: spec.snap }),
          ...(spec.modal === undefined ? {} : { modal: spec.modal }),
          ...(spec.nested === true ? { nested: true } : {}),
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
                spec.rtl === true
                  ? 'حفظ'
                  : spec.kind === 'form'
                    ? 'Save changes'
                    : 'Submit',
              ),
              Button(h, { variant: 'outline' }).children(
                spec.rtl === true ? 'إلغاء' : 'Cancel',
              ),
            ),
        onEmit: {
          RequestedOpen: () =>
            Message.ChangedDrawerOpen({ id: spec.id, open: true }),
          RequestedClose: () =>
            Message.ChangedDrawerOpen({ id: spec.id, open: false }),
          Settled: () => undefined,
          Snapped: () => undefined,
        },
      } as any)
    const directions: readonly Side[] = ['top', 'right', 'bottom', 'left']
    const sideSet = (
      kind: Spec['kind'],
      prefixId: string,
      title: string,
      extra: Partial<Spec> = {},
    ) =>
      directions.map(side => ({
        id: `${prefixId}-${side}`,
        side,
        trigger: side[0]!.toUpperCase() + side.slice(1),
        title,
        kind,
        ...extra,
      }))
    const specs: Record<string, readonly Spec[]> = {
      goal: [
        {
          id: 'goal',
          side: 'bottom',
          trigger: 'Open Drawer',
          title: 'Move Goal',
          description: 'Set your daily activity goal.',
          kind: 'goal',
        },
      ],
      side: [
        {
          id: 'side',
          side: 'right',
          trigger: 'Open right drawer',
          title: 'Task details',
          description: 'A compact task presented from the right edge.',
          kind: 'text',
        },
      ],
      sides: sideSet('text', 'sides', 'Drawer from any edge'),
      swipe: sideSet('text', 'swipe', 'Swipe handle drawer', { handle: true }),
      custom: sideSet('text', 'custom', 'Custom dimensions'),
      scroll: sideSet('scroll', 'scroll', 'Scrollable content'),
      snap: [
        {
          id: 'snap',
          side: 'bottom',
          trigger: 'Open Snap Drawer',
          title: 'Snap points',
          description: 'Drag to snap between a compact peek and full height.',
          kind: 'scroll',
          snap: ['31rem', '100%'],
        },
      ],
      nested: sideSet('text', 'nested', 'Nested drawer', { nested: true }),
      nonmodal: [
        {
          id: 'nonmodal',
          side: 'right',
          trigger: 'Non Modal',
          title: 'Non-modal drawer',
          description: 'The page remains interactive behind this drawer.',
          kind: 'text',
          modal: false,
        },
      ],
      responsive: [
        {
          id: 'responsive',
          side: 'bottom',
          trigger: 'Edit Profile',
          title: 'Edit profile',
          description: 'Drawer presentation for smaller viewports.',
          kind: 'form',
        },
      ],
      rtl: [
        {
          id: 'rtl',
          side: 'bottom',
          trigger: 'افتح الدرج',
          title: 'تحديد الهدف',
          description: 'حدد هدفك من النشاط اليومي.',
          kind: 'goal',
          rtl: true,
        },
      ],
    }
    return h.div
      .class('flex flex-wrap items-center justify-center gap-2')
      .attrs({ dir: h.props.kind === 'rtl' ? 'rtl' : undefined })
      .children(
        (specs[h.props.kind] ?? specs.goal!).map(spec => drawer(spec) as never),
      )
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    DrawerDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    }) as never
const source = exampleApplicationSource({
  imports: `import { Button, Drawer } from '@/ui/effect/ui'`,
  body: `Drawer(h, {
  key: 'goal',
  side: 'bottom',
  props: { open: model.open },
  title: 'Move Goal',
  description: 'Set your daily activity goal.',
  trigger: Button(h, { variant: 'outline' }).children('Open Drawer'),
  content: () => GoalControls(h),
  onEmit,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Drawer } from '@/ui/effect/ui'\n\nDrawer(h, { key, side, props: { open }, title, trigger, content, onEmit })`,
  examples: [
    { title: 'Activity goal', view: view('goal'), source },
    { title: 'Side drawer', view: view('side'), source },
    { title: 'Position', view: view('sides'), source },
    { title: 'Swipe Handle', view: view('swipe'), source },
    { title: 'Custom Width and Height', view: view('custom'), source },
    { title: 'Scrollable Content', view: view('scroll'), source },
    { title: 'Snap Points', view: view('snap'), source },
    { title: 'Nested', view: view('nested'), source },
    { title: 'Non Modal', view: view('nonmodal'), source },
    { title: 'Responsive Dialog', view: view('responsive'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})

import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Toast } from '#components'
import { ToastBehavior } from '../../behaviors/toast'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Spec = Readonly<{
  label: string
  variant: 'default' | 'success' | 'info' | 'warning' | 'error' | 'promise'
  description?: string
  actionLabel?: string
  count?: number
  numbered?: boolean
  sticky?: boolean
  dismissAll?: boolean
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
}>
const title = (variant: Spec['variant']) =>
  variant === 'default' || variant === 'success' || variant === 'promise'
    ? 'Event has been created'
    : variant === 'info'
      ? 'Be there 10 minutes early'
      : variant === 'warning'
        ? 'Event starts before 8am'
        : 'Event has not been created'
const examples: Record<
  string,
  {
    buttons: readonly Spec[]
    stacked?: boolean
    limit?: number
    center?: boolean
  }
> = {
  basic: {
    buttons: [
      {
        label: 'Show Toast',
        variant: 'default',
        description: 'Sunday, December 03, 2023 at 9:00 AM',
        actionLabel: 'Undo',
      },
    ],
  },
  types: {
    buttons: [
      { label: 'Default', variant: 'default' },
      { label: 'Success', variant: 'success' },
      { label: 'Info', variant: 'info' },
      { label: 'Warning', variant: 'warning' },
      { label: 'Error', variant: 'error' },
      { label: 'Promise', variant: 'promise' },
    ],
  },
  description: {
    buttons: [
      {
        label: 'Show Toast',
        variant: 'default',
        description: 'Monday, January 3rd at 6:00pm',
      },
    ],
  },
  stacking: {
    buttons: [
      {
        label: 'Add toast',
        variant: 'default',
        numbered: true,
        sticky: true,
        description: 'Hover or focus the stack to expand it.',
      },
      {
        label: 'Add 6 toasts',
        variant: 'default',
        count: 6,
        numbered: true,
        sticky: true,
        description: 'Dismiss a visible toast to reveal the next queued one.',
      },
      { label: 'Clear toasts', variant: 'default', dismissAll: true },
    ],
  },
  expanded: {
    stacked: false,
    buttons: [
      {
        label: 'Add 6 expanded toasts',
        variant: 'default',
        count: 6,
        numbered: true,
        sticky: true,
        description:
          'Only the newest three are visible. The rest wait in the queue.',
      },
      { label: 'Clear toasts', variant: 'default', dismissAll: true },
    ],
  },
  limit: {
    limit: 5,
    buttons: [
      {
        label: 'Add 6 toasts with limit 5',
        variant: 'default',
        count: 6,
        numbered: true,
        sticky: true,
        description: 'This stack displays up to five toasts.',
      },
      { label: 'Clear toasts', variant: 'default', dismissAll: true },
    ],
  },
  position: {
    center: true,
    buttons: [
      { label: 'Top Left', variant: 'default', position: 'top-left' },
      { label: 'Top Center', variant: 'default', position: 'top-center' },
      { label: 'Top Right', variant: 'default', position: 'top-right' },
      { label: 'Bottom Left', variant: 'default', position: 'bottom-left' },
      { label: 'Bottom Center', variant: 'default', position: 'bottom-center' },
      { label: 'Bottom Right', variant: 'default', position: 'bottom-right' },
    ],
  },
}
const Message = UiSchema.TaggedEnum({
  ClickedToastButton: { index: Schema.Number },
  ClearedToasts: {},
})
const ToastDemo = Html.component({
  name: 'DocsToastControls',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({ counter: Schema.Number, reset: Schema.Number }),
  message: Message,
}).make({
  init: () => ({ counter: 0, reset: 0 }),
  update: {
    ClickedToastButton: ($, { index }) => {
      const spec = examples[$.props.kind]?.buttons[index]
      if (spec === undefined) return $.model
      if (spec.dismissAll === true)
        return $.evolve({ reset: current => current + 1 })
      const count = spec.count ?? 1
      let step: any = $.evolve({ counter: current => current + count })
      for (let offset = 0; offset < count; offset += 1) {
        const number = $.model.counter + offset + 1
        step = step.send(ToastBehavior, {
          _tag: 'RequestedAdd',
          toast: {
            id: `${$.props.kind}-${number}`,
            title:
              spec.variant === 'promise'
                ? 'Loading...'
                : spec.numbered === true
                  ? `Toast ${number}`
                  : title(spec.variant),
            ...(spec.description === undefined
              ? {}
              : { description: spec.description }),
            type:
              spec.variant === 'default'
                ? undefined
                : spec.variant === 'promise'
                  ? 'loading'
                  : spec.variant,
            timeout:
              spec.sticky === true || spec.variant === 'promise'
                ? 0
                : undefined,
          },
        })
      }
      return step
    },
    ClearedToasts: $ => $.evolve({ reset: current => current + 1 }),
  },
  view: (h, model) => {
    const fixture = examples[h.props.kind] ?? examples.basic!
    return h.div
      .class(
        fixture.center === true
          ? 'flex flex-wrap justify-center gap-2'
          : 'flex flex-wrap gap-2',
      )
      .children(
        fixture.buttons.map((spec, index) =>
          Button(h, { variant: 'outline' })
            .on('click', () => Message.ClickedToastButton({ index }))
            .children(spec.label),
        ),
      )
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) => {
    const fixture = examples[kind] ?? examples.basic!
    return Toast(h, {
      key: `${context.idPrefix}-${kind}-provider`,
      props: { limit: fixture.limit ?? 3 },
      position: 'bottom-end',
      stacked: fixture.stacked !== false,
      expanded: fixture.stacked === false,
      children: [
        ToastDemo(h, {
          key: `${context.idPrefix}-${kind}`,
          props: { kind },
        }) as never,
      ],
    })
  }
const source = exampleApplicationSource({
  imports: `import { Button, Toast } from '@/ui/effect/ui'\nimport { ToastBehavior } from '@/ui/effect/behaviors/toast'`,
  body: `Toast(h, {
  props: { limit: 3 },
  position: 'bottom-end',
  children,
})

// In update:
$.send(ToastBehavior, {
  _tag: 'RequestedAdd',
  toast: { id, title: 'Event has been created' },
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Toast } from '@/ui/effect/ui'\n\nToast(h, { props: {}, position: 'bottom-end', children })`,
  examples: [
    { title: 'Basic', view: view('basic'), source },
    { title: 'Types', view: view('types'), source },
    { title: 'Description', view: view('description'), source },
    { title: 'Stacking and queue', view: view('stacking'), source },
    { title: 'Expanded', view: view('expanded'), source },
    { title: 'Visible limit', view: view('limit'), source },
    { title: 'Position', view: view('position'), source },
  ],
})

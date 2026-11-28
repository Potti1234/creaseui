import { Component, Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Schema } from 'effect'

import { AlertDialog, Button, Icon } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './alert-dialog.css'

type Spec = Readonly<{
  triggerLabel: string
  triggerVariant: 'outline' | 'destructive'
  dialogTitle: string
  dialogDescription: string
  actionLabel: string
  cancelLabel: string
  size?: 'sm'
  mediaIcon?: string
  mediaVariant?: 'destructive'
  actionVariant?: 'destructive'
}>

const specs = {
  basic: {
    triggerLabel: 'Show Dialog',
    triggerVariant: 'outline',
    dialogTitle: 'Are you absolutely sure?',
    dialogDescription:
      'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
    actionLabel: 'Continue',
    cancelLabel: 'Cancel',
  },
  small: {
    triggerLabel: 'Show Dialog',
    triggerVariant: 'outline',
    dialogTitle: 'Allow accessory to connect?',
    dialogDescription:
      'Do you want to allow the USB accessory to connect to this device?',
    actionLabel: 'Allow',
    cancelLabel: "Don't allow",
    size: 'sm',
  },
  media: {
    triggerLabel: 'Share Project',
    triggerVariant: 'outline',
    dialogTitle: 'Share this project?',
    dialogDescription:
      'Anyone with the link will be able to view and edit this project.',
    actionLabel: 'Share',
    cancelLabel: 'Cancel',
    mediaIcon: 'circle-fading-plus',
  },
  smallMedia: {
    triggerLabel: 'Show Dialog',
    triggerVariant: 'outline',
    dialogTitle: 'Allow accessory to connect?',
    dialogDescription:
      'Do you want to allow the USB accessory to connect to this device?',
    actionLabel: 'Allow',
    cancelLabel: "Don't allow",
    size: 'sm',
    mediaIcon: 'bluetooth',
  },
  destructive: {
    triggerLabel: 'Delete Chat',
    triggerVariant: 'destructive',
    dialogTitle: 'Delete chat?',
    dialogDescription:
      'This will permanently delete this chat conversation. View Settings delete any memories saved during this chat.',
    actionLabel: 'Delete',
    cancelLabel: 'Cancel',
    size: 'sm',
    mediaIcon: 'trash-2',
    mediaVariant: 'destructive',
    actionVariant: 'destructive',
  },
  rtl: {
    triggerLabel: 'إظهار الحوار',
    triggerVariant: 'outline',
    dialogTitle: 'هل أنت متأكد تمامًا؟',
    dialogDescription:
      'لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك نهائيًا من خوادمنا.',
    actionLabel: 'متابعة',
    cancelLabel: 'إلغاء',
  },
  rtlSmall: {
    triggerLabel: 'إظهار الحوار (صغير)',
    triggerVariant: 'outline',
    dialogTitle: 'السماح للملحق بالاتصال؟',
    dialogDescription: 'هل تريد السماح لملحق USB بالاتصال بهذا الجهاز؟',
    actionLabel: 'السماح',
    cancelLabel: 'عدم السماح',
    size: 'sm',
    mediaIcon: 'bluetooth',
  },
  async: {
    triggerLabel: 'Delete project',
    triggerVariant: 'destructive',
    dialogTitle: 'Delete this project?',
    dialogDescription:
      'This action permanently removes releases, environments, and team access.',
    actionLabel: 'Delete project',
    cancelLabel: 'Cancel',
  },
} satisfies Record<string, Spec>

const Message = UiSchema.TaggedEnum({
  RequestedOpenDialog: {},
  RequestedCloseDialog: {},
  ConfirmedDialogAction: {},
  CompletedDialogAction: {},
})

const WaitBeforeCompletion = Mount.make(
  'WaitBeforeAlertDialogCompletion',
  { args: {} },
  (_node: HTMLSpanElement) => Effect.sleep('350 millis').pipe(Effect.asVoid),
)

const DemoProps = Schema.Struct({
  idPrefix: Schema.String,
  triggerLabel: Schema.String,
  triggerVariant: Schema.Literals(['outline', 'destructive']),
  dialogTitle: Schema.String,
  dialogDescription: Schema.String,
  actionLabel: Schema.String,
  cancelLabel: Schema.String,
  size: Schema.optional(Schema.Literal('sm')),
  mediaIcon: Schema.optional(Schema.String),
  mediaVariant: Schema.optional(Schema.Literal('destructive')),
  actionVariant: Schema.optional(Schema.Literal('destructive')),
  asyncFlow: Schema.Boolean,
})

const AlertDialogDemo = Html.component({
  name: 'DocsAlertDialogDemo',
  props: DemoProps,
  model: Schema.Struct({
    open: Schema.Boolean,
    status: Schema.Literals(['idle', 'pending', 'complete']),
  }),
  message: Message,
}).make({
  init: () => ({ open: false, status: 'idle' }),
  update: {
    RequestedOpenDialog: $ => $.evolve({ open: true }),
    RequestedCloseDialog: $ => $.evolve({ open: false }),
    ConfirmedDialogAction: $ =>
      $.props.asyncFlow
        ? $.evolve({ status: 'pending' })
        : $.evolve({ open: false }),
    CompletedDialogAction: $ => $.evolve({ open: false, status: 'complete' }),
  },
  view: (h, model) =>
    h.div.class('alert-dialog-docs-demo').children(
      AlertDialog(h, {
        key: `${h.props.idPrefix}-dialog`,
        props: { open: model.open },
        trigger: Button(h, { variant: h.props.triggerVariant }).children(
          h.props.triggerLabel,
        ),
        title: h.props.dialogTitle,
        description: h.props.dialogDescription,
        actionLabel: h.props.actionLabel,
        cancelLabel: h.props.cancelLabel,
        onAction: Message.ConfirmedDialogAction(),
        ...(h.props.size === undefined ? {} : { size: h.props.size }),
        ...(h.props.mediaIcon === undefined
          ? {}
          : {
              media: [
                Icon(h, { name: h.props.mediaIcon as never, size: 'lg' }),
              ],
            }),
        ...(h.props.mediaVariant === undefined
          ? {}
          : { mediaVariant: h.props.mediaVariant }),
        ...(h.props.actionVariant === undefined
          ? {}
          : { actionVariant: h.props.actionVariant }),
        ...(h.props.asyncFlow
          ? {
              pendingLabel: 'Deleting…',
              pending: model.status === 'pending',
            }
          : {}),
        onEmit: {
          RequestedOpen: () => Message.RequestedOpenDialog(),
          RequestedClose: () => Message.RequestedCloseDialog(),
          Settled: () => undefined,
        },
      }),
      h.props.asyncFlow
        ? h.p
            .attrs({ role: 'status' })
            .class('alert-dialog-docs-status')
            .children(
              model.status === 'complete'
                ? 'Project deleted.'
                : model.status === 'pending'
                  ? 'Working…'
                  : 'No action taken.',
            )
        : undefined,
      model.status === 'pending'
        ? h.span
            .class('alert-dialog-docs-timer')
            .onMount(
              WaitBeforeCompletion().pipe(
                Mount.map(() => Message.CompletedDialogAction()),
              ),
            )
        : undefined,
    ),
})

const demoProps = (idPrefix: string, spec: Spec, asyncFlow = false) => ({
  idPrefix,
  triggerLabel: spec.triggerLabel,
  triggerVariant: spec.triggerVariant,
  dialogTitle: spec.dialogTitle,
  dialogDescription: spec.dialogDescription,
  actionLabel: spec.actionLabel,
  cancelLabel: spec.cancelLabel,
  asyncFlow,
  ...(spec.size === undefined ? {} : { size: spec.size }),
  ...(spec.mediaIcon === undefined ? {} : { mediaIcon: spec.mediaIcon }),
  ...(spec.mediaVariant === undefined
    ? {}
    : { mediaVariant: spec.mediaVariant }),
  ...(spec.actionVariant === undefined
    ? {}
    : { actionVariant: spec.actionVariant }),
})

const example = (
  spec: Spec,
  asyncFlow = false,
): DocsExampleImplementation['view'] => {
  return (h, context) =>
    AlertDialogDemo(h, {
      key: `${context.idPrefix}-alert-dialog`,
      props: demoProps(context.idPrefix, spec, asyncFlow),
    })
}

const rtlExample: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .attrs({ dir: 'rtl' })
    .class('alert-dialog-docs-rtl')
    .children(
      AlertDialogDemo(h, {
        key: `${context.idPrefix}-rtl-main`,
        props: demoProps(`${context.idPrefix}-rtl-main`, specs.rtl),
      }),
      AlertDialogDemo(h, {
        key: `${context.idPrefix}-rtl-small`,
        props: demoProps(`${context.idPrefix}-rtl-small`, specs.rtlSmall),
      }),
    )

const source = exampleApplicationSource({
  imports: `import { AlertDialog, Button } from '@/ui/effect/ui'`,
  body: `AlertDialog(h, {
  key: 'delete-project',
  props: { open: model.open },
  trigger: Button(h, { variant: 'outline' }).children('Show Dialog'),
  title: 'Are you absolutely sure?',
  description: 'This action cannot be undone.',
  actionLabel: 'Continue',
  cancelLabel: 'Cancel',
  onAction: Message.ConfirmedDialogAction(),
  onEmit: {
    RequestedOpen: () => Message.RequestedOpenDialog(),
    RequestedClose: () => Message.RequestedCloseDialog(),
    Settled: () => undefined,
  },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { AlertDialog } from '@/ui/effect/ui'\n\nAlertDialog(h, { props: { open }, trigger, title, description, actionLabel, onAction, onEmit })`,
  examples: [
    { title: 'Basic', view: example(specs.basic), source },
    { title: 'Small', view: example(specs.small), source },
    { title: 'Media', view: example(specs.media), source },
    { title: 'Small with Media', view: example(specs.smallMedia), source },
    { title: 'Destructive', view: example(specs.destructive), source },
    { title: 'RTL', view: rtlExample, source },
    { title: 'Async deletion', view: example(specs.async, true), source },
  ],
})

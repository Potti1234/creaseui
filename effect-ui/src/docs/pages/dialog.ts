import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Dialog, Input } from '#components'
import { buttonClasses } from '../../ui/button'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const shareUrl = 'https://creaseui.com/docs/components/button'
const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
const rtlFields = [
  { id: 'name-1', label: 'الاسم', value: 'Pedro Duarte' },
  { id: 'username-1', label: 'اسم المستخدم', value: '@peduarte' },
] as const
const inviteErrorFor = (email: string, invited: readonly string[]) => {
  const address = email.trim()
  if (address === '') return 'Enter an email address.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(address))
    return 'Enter a valid email address.'
  if (invited.includes(address)) return `${address} is already invited.`
  return null
}

const Message = UiSchema.TaggedEnum({
  OpenedDialog: {},
  ClosedDialog: {},
  ChangedName: { value: Schema.String },
  ChangedUsername: { value: Schema.String },
  ChangedInviteEmail: { value: Schema.String },
  SubmittedInvite: {},
})
const DialogDemo = Html.component({
  name: 'DocsDialogDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({
    open: Schema.Boolean,
    name: Schema.String,
    username: Schema.String,
    inviteEmail: Schema.String,
    inviteError: Schema.NullOr(Schema.String),
    invited: Schema.Array(Schema.String),
  }),
  message: Message,
}).make({
  init: () => ({
    open: false,
    name: 'Pedro Duarte',
    username: '@peduarte',
    inviteEmail: '',
    inviteError: null,
    invited: [],
  }),
  update: {
    OpenedDialog: $ => $.evolve({ open: true }),
    ClosedDialog: $ =>
      $.evolve({ open: false, inviteEmail: '', inviteError: null }),
    ChangedName: ($, { value }) => $.evolve({ name: value }),
    ChangedUsername: ($, { value }) => $.evolve({ username: value }),
    ChangedInviteEmail: ($, { value }) =>
      $.evolve({ inviteEmail: value, inviteError: null }),
    SubmittedInvite: $ => {
      const error = inviteErrorFor($.model.inviteEmail, $.model.invited)
      return error === null
        ? $.evolve({
            open: false,
            inviteEmail: '',
            inviteError: null,
            invited: [...$.model.invited, $.model.inviteEmail.trim()],
          })
        : $.evolve({ inviteError: error })
    },
  },
  view: (h, model) => {
    const kind = h.props.kind
    const rtl = kind === 'rtl'
    const closeButton = (label: string, outline = true) =>
      Button(h, {
        variant: outline ? 'outline' : 'default',
        size: 'lg',
        onPress: Message.ClosedDialog(),
      }).children(label)
    const field = (
      id: string,
      label: string,
      value: string,
      onInput: (value: string) => typeof Message.Type,
    ) =>
      h.div
        .class('group/field flex w-full flex-col gap-2')
        .attr('data-slot', 'field')
        .children(
          h.label
            .class('text-sm leading-snug font-medium')
            .attrs({ for: id, 'data-slot': 'field-label' })
            .children(label),
          h.div
            .class('flex flex-1 flex-col gap-1.5 leading-snug')
            .attr('data-slot', 'field-content')
            .children(
              Input(h, {
                id,
                element: h.input,
                props: { value },
                onUpdate: ({ value: next }) => onInput(next),
              }),
            ),
        )
    const profileFields = rtl
      ? rtlFields.map((entry, index) =>
          field(
            `${h.props.idPrefix}-${entry.id}`,
            entry.label,
            index === 0 ? model.name : model.username,
            value =>
              index === 0
                ? Message.ChangedName({ value })
                : Message.ChangedUsername({ value }),
          ),
        )
      : [
          field(`${h.props.idPrefix}-name`, 'Name', model.name, value =>
            Message.ChangedName({ value }),
          ),
          field(
            `${h.props.idPrefix}-username`,
            'Username',
            model.username,
            value => Message.ChangedUsername({ value }),
          ),
        ]
    const footer = (children: unknown) =>
      h.div
        .class('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end')
        .attr('data-slot', 'dialog-footer')
        .children(children as never)
    const scrollable = () =>
      h.div
        .class('-mx-4 max-h-[50vh] overflow-y-auto px-4')
        .children(
          Array.from({ length: 10 }, (_, index) =>
            h.p.key(String(index)).class('mb-4 leading-normal').children(lorem),
          ),
        )
    const inviteForm = h.form
      .class('grid gap-6')
      .attrs({
        id: `${h.props.idPrefix}-invite-form`,
        'aria-label': 'Invite member',
      })
      .on('submit', Message.SubmittedInvite())
      .children(
        h.div.class('grid gap-2').children(
          h.label
            .class('text-sm leading-none font-medium')
            .attr('for', `${h.props.idPrefix}-invite-email`)
            .children('Email'),
          Input(h, {
            id: `${h.props.idPrefix}-invite-email`,
            element: h.input.attrs({
              type: 'email',
              name: 'email',
              autocomplete: 'email',
              required: '',
            }),
            props: { value: model.inviteEmail },
            onUpdate: ({ value }) => Message.ChangedInviteEmail({ value }),
          }),
          model.inviteError === null
            ? undefined
            : h.p
                .class('m-0 text-sm text-destructive')
                .children(model.inviteError),
        ),
      )
    const spec = (() => {
      switch (kind) {
        case 'compact':
          return {
            trigger: 'Review change',
            title: 'Review change',
            description: 'Confirm the updated workspace name.',
            className: 'sm:max-w-sm',
            content: [
              h.p
                .class('text-sm')
                .children('Dialog content remains ordinary Foldkit Html.'),
              footer([closeButton('Back'), closeButton('Confirm', false)]),
            ],
          }
        case 'share':
          return {
            trigger: 'Share',
            title: 'Share link',
            description: 'Anyone who has this link will be able to view this.',
            className: 'sm:max-w-md',
            content: [
              h.div.class('flex items-center gap-2').children(
                h.div.class('grid flex-1 gap-2').children(
                  h.label
                    .class('sr-only')
                    .attr('for', `${h.props.idPrefix}-link`)
                    .children('Link'),
                  Input(h, {
                    id: `${h.props.idPrefix}-link`,
                    element: h.input.attr('readonly', ''),
                    props: { value: shareUrl },
                    onUpdate: () => undefined,
                  }),
                ),
              ),
              footer([closeButton('Close')]),
            ],
          }
        case 'noClose':
          return {
            trigger: 'No Close Button',
            title: 'No Close Button',
            description:
              "This dialog doesn't have a close button in the top-right corner.",
            showCloseButton: false,
            content: [],
          }
        case 'sticky':
          return {
            trigger: 'Sticky Footer',
            title: 'Sticky Footer',
            description:
              'This dialog has a sticky footer that stays visible while the content scrolls.',
            content: [scrollable(), footer([closeButton('Close')])],
          }
        case 'scroll':
          return {
            trigger: 'Scrollable Content',
            title: 'Scrollable Content',
            description: 'This is a dialog with scrollable content.',
            content: [scrollable()],
          }
        case 'rtl':
          return {
            trigger: 'افتح الحوار',
            title: 'تعديل الملف الشخصي',
            description:
              'قم بإجراء تغييرات على ملفك الشخصي هنا. انقر على حفظ عند الانتهاء.',
            className: 'sm:max-w-sm',
            content: [
              h.div
                .attrs({ dir: 'rtl' })
                .class('grid gap-4')
                .children(
                  h.div
                    .class('flex w-full flex-col gap-7')
                    .attr('data-slot', 'field-group')
                    .children(profileFields as never),
                  footer([
                    closeButton('إلغاء'),
                    closeButton('حفظ التغييرات', false),
                  ]),
                ),
            ],
          }
        case 'invite':
          return {
            trigger: 'Invite member',
            variant: 'default' as const,
            title: 'Invite a team member',
            description: 'They get an email with a link to join.',
            className: 'sm:max-w-md',
            content: [
              inviteForm,
              footer([
                closeButton('Cancel'),
                h.button
                  .class(buttonClasses({}))
                  .attrs({
                    type: 'submit',
                    form: `${h.props.idPrefix}-invite-form`,
                    'data-slot': 'button',
                  })
                  .children('Send invite'),
              ]),
            ],
          }
        default:
          return {
            trigger: 'Open Dialog',
            title: 'Edit profile',
            description:
              "Make changes to your profile here. Click save when you're done.",
            className: 'sm:max-w-sm',
            content: [
              h.div
                .class('flex w-full flex-col gap-7')
                .attr('data-slot', 'field-group')
                .children(profileFields as never),
              footer([
                closeButton('Cancel'),
                closeButton('Save changes', false),
              ]),
            ],
          }
      }
    })()
    return h.div.children(
      Dialog(h, {
        key: `${h.props.idPrefix}-dialog`,
        title: spec.title,
        description: spec.description,
        trigger: Button(h, { variant: spec.variant ?? 'outline' }).children(
          spec.trigger,
        ),
        content: spec.content,
        ...(spec.className === undefined ? {} : { className: spec.className }),
        ...(spec.showCloseButton === undefined
          ? {}
          : { showCloseButton: spec.showCloseButton }),
        props: { open: model.open },
        onEmit: {
          Opened: () => Message.OpenedDialog(),
          Closed: () => Message.ClosedDialog(),
        },
      }),
      kind === 'invite'
        ? h.p
            .class('text-sm text-muted-foreground')
            .children(
              model.invited.length === 0
                ? 'No invites yet.'
                : `Invited: ${model.invited.join(', ')}`,
            )
        : undefined,
    )
  },
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h, context) =>
    DialogDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
    }) as never

const source = exampleApplicationSource({
  imports: `import { Button, Dialog, Input } from '@/ui/effect/ui'`,
  body: `Dialog(h, {
  key: 'profile-dialog',
  title: 'Edit profile',
  description: "Make changes to your profile here. Click save when you're done.",
  trigger: Button(h, { variant: 'outline' }).children('Open Dialog'),
  content: fields,
  props: { open },
  onEmit: { Opened: () => OpenedDialog(), Closed: () => ClosedDialog() },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Dialog } from '@/ui/effect/ui'\n\nDialog(h, { key, title, trigger, content, props, onEmit })`,
  examples: [
    { title: 'Edit profile', view: view('profile'), source },
    { title: 'Compact confirmation', view: view('compact'), source },
    { title: 'Custom Close Button', view: view('share'), source },
    { title: 'No Close Button', view: view('noClose'), source },
    { title: 'Sticky Footer', view: view('sticky'), source },
    { title: 'Scrollable Content', view: view('scroll'), source },
    { title: 'RTL', view: view('rtl'), source },
    { title: 'Invite member form', view: view('invite'), source },
  ],
})

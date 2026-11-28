import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Redacted, Schema } from 'effect'

import { Button, InputOtp } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Kind =
  | 'demo'
  | 'pattern'
  | 'separator'
  | 'disabled'
  | 'controlled'
  | 'invalid'
  | 'fourDigits'
  | 'alphanumeric'
  | 'form'
  | 'rtl'
const Message = UiSchema.TaggedEnum({ UpdatedOtp: { value: Schema.String } })
const OtpDemo = Html.component({
  name: 'DocsInputOtp',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ value: Schema.String }),
  message: Message,
}).make({
  init: ({ props }) => ({
    value:
      props.kind === 'controlled'
        ? '1234'
        : props.kind === 'disabled'
          ? '123456'
          : '',
  }),
  update: { UpdatedOtp: ($, { value }) => $.evolve({ value }) },
  view: (h, model) => {
    const kind = h.props.kind as Kind
    const length = kind === 'fourDigits' || kind === 'controlled' ? 4 : 6
    const otp = InputOtp(h, {
      key: 'otp',
      ariaLabel: kind === 'rtl' ? 'رمز التحقق' : 'One-time password',
      invalid: kind === 'invalid',
      ...(kind === 'pattern' ? { pattern: /\d/ } : {}),
      ...(kind === 'separator'
        ? {
            separator: (index: number) =>
              index === 3
                ? h.span.attr('aria-hidden', 'true').children('–')
                : undefined,
          }
        : {}),
      props: {
        value: Redacted.make(model.value),
        length,
        ...(kind === 'pattern' ? { validationType: 'numeric' as const } : {}),
        ...(kind === 'alphanumeric'
          ? { validationType: 'alphanumeric' as const }
          : {}),
        ...(kind === 'disabled' ? { disabled: true } : {}),
      },
      onEmit: {
        Updated: ({ value }) =>
          Message.UpdatedOtp({ value: Redacted.value(value) }),
        Completed: () => undefined,
        Rejected: () => undefined,
      },
    })
    const content =
      kind === 'controlled'
        ? h.div
            .class('grid gap-2 text-center')
            .children(
              otp,
              h.p
                .class('text-sm')
                .children(
                  model.value === ''
                    ? 'Enter the code'
                    : `Value: ${model.value}`,
                ),
            )
        : otp
    return h.div
      .attrs({ dir: kind === 'rtl' ? 'rtl' : undefined })
      .class('grid gap-3 justify-items-center')
      .children(
        kind === 'form'
          ? h.label.class('text-sm font-medium').children('Verification code')
          : undefined,
        content,
        kind === 'form'
          ? Button(h, { className: 'w-full' }).children('Verify')
          : undefined,
      )
  },
})
const view =
  (kind: Kind): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    OtpDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    })
const source = exampleApplicationSource({
  imports: `import { InputOtp } from '@/ui/effect/ui'`,
  body: `InputOtp(h, {
  key: 'otp',
  props: { value: model.otp, length: 6, validationType: 'numeric' },
  onEmit: { Updated: ({ value }) => UpdatedOtp({ value }) },
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { InputOtp } from '@/ui/effect/ui'\n\nInputOtp(h, { key: 'otp', props: { value, length: 6 }, onEmit })`,
  examples: (
    [
      ['Basic', 'demo'],
      ['Pattern', 'pattern'],
      ['Separator', 'separator'],
      ['Disabled', 'disabled'],
      ['Controlled', 'controlled'],
      ['Invalid', 'invalid'],
      ['Four Digits', 'fourDigits'],
      ['Alphanumeric', 'alphanumeric'],
      ['Form', 'form'],
      ['RTL', 'rtl'],
    ] as const
  ).map(([title, kind]) => ({ title, view: view(kind), source })),
})

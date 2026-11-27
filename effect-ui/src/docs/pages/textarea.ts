import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Textarea } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './textarea.css'

const Message = UiSchema.TaggedEnum({
  Changed: { id: Schema.String, value: Schema.String },
  KeyedHistory: { key: Schema.String, shift: Schema.Boolean },
  SentMessage: {},
})
const TextareaDemo = Html.component({
  name: 'DocsTextareaDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({
    values: Schema.Record(Schema.String, Schema.String),
    entries: Schema.Array(Schema.String),
    historyIndex: Schema.NullOr(Schema.Number),
  }),
  message: Message,
}).make({
  init: ({ props }) => ({
    values:
      props.kind === 'formResize'
        ? { 'profile-notes': 'First line\nSecond line' }
        : {},
    entries: ['Hello there!', 'Can you help me with my order?'],
    historyIndex: null,
  }),
  update: {
    Changed: ($, { id, value }) =>
      $.evolve({
        values: { ...$.model.values, [id]: value },
        historyIndex: null,
      }),
    KeyedHistory: ($, { key, shift }) => {
      if (key === 'Enter' && !shift) {
        const value = $.model.values['textarea-button'] ?? ''
        return value.trim() === ''
          ? $.model
          : $.evolve({
              entries: [...$.model.entries, value],
              values: { ...$.model.values, 'textarea-button': '' },
              historyIndex: null,
            })
      }
      if (key !== 'ArrowUp' && key !== 'ArrowDown') return $.model
      const entries = $.model.entries
      if (entries.length === 0) return $.model
      const current = $.model.historyIndex
      const next =
        key === 'ArrowUp'
          ? current === null
            ? entries.length - 1
            : Math.max(0, current - 1)
          : current === null
            ? null
            : current + 1 >= entries.length
              ? null
              : current + 1
      return $.evolve({
        historyIndex: next,
        values: {
          ...$.model.values,
          'textarea-button': next === null ? '' : (entries[next] ?? ''),
        },
      })
    },
    SentMessage: $ => {
      const value = $.model.values['textarea-button'] ?? ''
      return value.trim() === ''
        ? $.model
        : $.evolve({
            entries: [...$.model.entries, value],
            values: { ...$.model.values, 'textarea-button': '' },
            historyIndex: null,
          })
    },
  },
  view: (h, model) => {
    const area = (
      id: string,
      options: {
        label?: string
        description?: string
        placeholder?: string
        disabled?: boolean
        invalid?: boolean
        rtl?: boolean
        rows?: number
        resize?: 'none' | 'vertical' | 'horizontal' | 'both'
        readOnly?: boolean
        form?: string
        name?: string
        wrap?: string
        history?: boolean
      } = {},
    ) => {
      let element = h.textarea.attrs({
        placeholder: options.placeholder,
        rows: options.rows === undefined ? undefined : String(options.rows),
        form: options.form,
        name: options.name,
        wrap: options.wrap,
        dir: options.rtl === true ? 'rtl' : undefined,
      })
      if (options.history === true)
        element = element.on('keydown', ({ key, shift }) =>
          key === 'ArrowUp' || key === 'ArrowDown' || key === 'Enter'
            ? Message.KeyedHistory({ key, shift })
            : undefined,
        )
      return Textarea(h, {
        id,
        ...(options.label === undefined ? {} : { label: options.label }),
        ...(options.description === undefined
          ? {}
          : { description: options.description }),
        ...(options.invalid === true ? { invalid: true } : {}),
        ...(options.resize === undefined ? {} : { resize: options.resize }),
        element,
        value: model.values[id] ?? '',
        ...(options.disabled === undefined
          ? {}
          : { disabled: options.disabled }),
        ...(options.readOnly === undefined
          ? {}
          : { readOnly: options.readOnly }),
        onInput: value => Message.Changed({ id, value }),
      })
    }
    switch (h.props.kind) {
      case 'demo':
        return area('textarea-demo', { placeholder: 'Type your message here.' })
      case 'field':
        return area('textarea-message', {
          label: 'Message',
          description: 'Enter your message below.',
          placeholder: 'Type your message here.',
        })
      case 'disabled':
        return area('textarea-disabled', {
          label: 'Message',
          placeholder: 'Type your message here.',
          disabled: true,
        })
      case 'invalid':
        return area('textarea-invalid', {
          label: 'Message',
          description: 'Please enter a valid message.',
          placeholder: 'Type your message here.',
          invalid: true,
        })
      case 'button':
        return h.div.class('textarea-docs-frame').children(
          area('textarea-button', {
            label: 'Chat message',
            description:
              'Up/Down recalls messages at the first/last visual line. Enter sends; Shift+Enter adds a line.',
            placeholder: 'Type a message or press ArrowUp…',
            history: true,
          }),
          Button(h, { onPress: Message.SentMessage() }).children(
            'Send message',
          ),
        )
      case 'rtl':
        return h.div.class('textarea-docs-frame textarea-docs-rtl').children(
          area('feedback', {
            label: 'التعليقات',
            description: 'شاركنا أفكارك حول خدمتنا.',
            placeholder: 'تعليقاتك تساعدنا على التحسين...',
            rows: 4,
            rtl: true,
          }),
        )
      case 'formResize':
        return h.div.class('textarea-docs-wide').children(
          h.form.attr('id', 'textarea-profile'),
          area('profile-notes', {
            label: 'Deployment notes',
            rows: 5,
            resize: 'none',
            readOnly: true,
            form: 'textarea-profile',
            name: 'notes',
            wrap: 'hard',
          }),
        )
      default:
        return h.div
    }
  },
})

const source = exampleApplicationSource({
  imports: `import { Textarea } from '@/ui/effect/ui'
import './textarea.css'`,
  body: `Textarea(h, {
  id: 'message',
  label: 'Message',
  value: model.message,
  onInput: value => Message.ChangedMessage({ value }),
})`,
})

const examples: ReadonlyArray<readonly [string, string]> = [
  ['Basic', 'demo'],
  ['Field', 'field'],
  ['Disabled', 'disabled'],
  ['Invalid', 'invalid'],
  ['Chat History', 'button'],
  ['RTL', 'rtl'],
  ['Form And Resize', 'formResize'],
]

export const componentDocs = defineComponentDocs({
  usage: `import { Textarea } from '@/ui/effect/ui'

Textarea(h, {
  id: 'message',
  label: 'Message',
  value: model.message,
  onInput: value => Message.ChangedMessage({ value }),
})`,
  examples: examples.map(([title, kind]) => ({
    title,
    view: ((h, context) =>
      TextareaDemo(h, {
        key: `${context.idPrefix}-${kind}`,
        props: { kind },
      })) as DocsExampleImplementation['view'],
    source,
  })),
})

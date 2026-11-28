import { Command, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Schema } from 'effect'

export * from './code-tokenization'

const Message = UiSchema.TaggedEnum({
  CopyRequested: {},
  Copied: { code: Schema.String, success: Schema.Boolean },
  FeedbackCleared: {},
  Toggled: {},
})

const Copy = Command.make(
  'CreaseCopyCode',
  { args: { code: Schema.String }, mode: 'switch' },
  ({ code }) =>
    Effect.tryPromise(() => navigator.clipboard.writeText(code)).pipe(
      Effect.match({
        onSuccess: () => Message.Copied({ code, success: true }),
        onFailure: () => Message.Copied({ code, success: false }),
      }),
    ),
)
const Clear = Command.make(
  'CreaseClearCopyCode',
  { args: {}, mode: 'switch' },
  () => Effect.as(Effect.sleep('2 seconds'), Message.FeedbackCleared()),
)

export const CodeBlockBehavior = Html.component({
  name: 'CreaseCodeBlock',
  props: Schema.Struct({
    code: Schema.String,
    collapsed: Schema.optional(Schema.Boolean),
    defaultCollapsed: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({
    collapsed: Schema.Boolean,
    feedback: Schema.NullOr(
      Schema.Struct({
        code: Schema.String,
        success: Schema.Boolean,
      }),
    ),
  }),
  message: Message,
  events: UiSchema.TaggedEnum({
    CollapsedChanged: { collapsed: Schema.Boolean },
  }),
}).make({
  init: ({ props }) => ({
    collapsed: props.defaultCollapsed ?? false,
    feedback: null,
  }),
  update: {
    CopyRequested: $ =>
      $.evolve({ feedback: null })
        .run(Command.interrupt(Clear))
        .run(Copy.make({ code: $.props.code })),
    Copied: ($, { code, success }) =>
      $.evolve({ feedback: { code, success } }).run(Clear.make({})),
    FeedbackCleared: $ => $.evolve({ feedback: null }),
    Toggled: $ => {
      const collapsed = !($.props.collapsed ?? $.model.collapsed)
      return $.evolve({ collapsed }).emit({
        _tag: 'CollapsedChanged',
        collapsed,
      })
    },
  },
  parts: (p, model) => ({
    copied:
      model.feedback?.code === p.props.code ? model.feedback.success : null,
    collapsed: p.props.collapsed ?? model.collapsed,
    copy: p.part('button', element =>
      element.attr('type', 'button').on('click', Message.CopyRequested()),
    ),
    toggle: p.part('button', element =>
      element.attr('type', 'button').on('click', Message.Toggled()),
    ),
  }),
})

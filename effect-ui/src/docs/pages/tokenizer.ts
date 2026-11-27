import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Tokenizer } from '#components'
import { TokenizerToken } from '../../behaviors/tokenizer'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const users = [
  { id: '1', label: 'Alice Johnson' },
  { id: '2', label: 'Bob Smith' },
  { id: '3', label: 'Charlie Brown' },
  { id: '4', label: 'Diana Prince' },
  { id: '5', label: 'Eve Williams' },
  { id: '6', label: 'Frank Miller' },
]
const skills = [
  { id: '1', label: 'Foldkit' },
  { id: '2', label: 'TypeScript' },
  { id: '3', label: 'GraphQL' },
  { id: '4', label: 'Node.js' },
  { id: '5', label: 'Python' },
  { id: '6', label: 'Rust' },
  { id: '7', label: 'Go' },
  { id: '8', label: 'Swift' },
]
const tags = [
  { id: '1', label: 'Design' },
  { id: '2', label: 'Engineering' },
]
const states = [
  { label: 'Disabled field', disabled: true, seed: [0, 2] },
  {
    label: 'Error message',
    status: { type: 'error', message: 'At least one reviewer is required' },
    seed: [],
  },
  {
    label: 'Warning message',
    status: {
      type: 'warning',
      message: 'Consider adding at least 2 approvers',
    },
    seed: [0],
  },
  {
    label: 'Success message',
    status: { type: 'success', message: 'All required reviewers added' },
    seed: [1, 3],
  },
] as const
const Message = UiSchema.TaggedEnum({
  ChangedTokens: { value: Schema.Array(TokenizerToken) },
})
const TokenizerDemo = Html.component({
  name: 'DocsTokenizerDemo',
  props: Schema.Struct({
    kind: Schema.String,
    variant: Schema.optional(Schema.String),
    slot: Schema.optional(Schema.Number),
  }),
  model: Schema.Struct({ value: Schema.Array(TokenizerToken) }),
  message: Message,
}).make({
  init: ({ props }) => {
    const selected = (indexes: readonly number[]) =>
      indexes.map(index => users[index]!)
    return {
      value:
        props.kind === 'showcase'
          ? [...tags]
          : props.kind === 'clear'
            ? selected([0, 1])
            : props.kind === 'endContent' || props.kind === 'icon'
              ? selected([0, 2])
              : props.kind === 'maxEntries'
                ? [skills[0]!, skills[1]!]
                : props.kind === 'overflow'
                  ? [...users]
                  : props.kind === 'states'
                    ? selected(states[props.slot ?? 0]?.seed ?? [])
                    : [],
    }
  },
  update: {
    ChangedTokens: ($, { value }) => $.evolve({ value }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const state = kind === 'states' ? states[h.props.slot ?? 0] : undefined
    return Tokenizer(h, {
      id: `${kind}-${h.props.slot ?? 0}`,
      label:
        state?.label ??
        (kind === 'showcase' || kind === 'creatable'
          ? h.props.slot === 1
            ? 'Team Members'
            : 'Tags'
          : kind === 'maxEntries'
            ? 'Top Skills'
            : kind === 'overflow'
              ? h.props.slot === 1
                ? 'Layer Overflow'
                : 'Inline Overflow'
              : 'Team Members'),
      placeholder:
        kind === 'showcase'
          ? 'Search...'
          : kind === 'creatable'
            ? h.props.slot === 1
              ? 'Search or type a new name...'
              : 'Type a tag and press Enter...'
            : kind === 'maxEntries'
              ? 'Search skills...'
              : kind === 'overflow'
                ? 'Add more...'
                : 'Search people...',
      description: kind === 'maxEntries' ? 'Choose up to 3 skills' : undefined,
      showSearchIcon: kind === 'icon',
      showClear: kind === 'clear',
      tokenOverflowBehavior:
        kind === 'overflow'
          ? h.props.slot === 1
            ? 'unfocusedLayer'
            : 'unfocusedInline'
          : undefined,
      endContent:
        kind === 'endContent'
          ? h.button
              .class(
                'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground',
              )
              .attrs({ type: 'button' })
              .children('Apply')
          : undefined,
      width: 400,
      size: 'sm',
      ...(state && 'status' in state ? { status: state.status } : {}),
      props: {
        items:
          kind === 'showcase' || (kind === 'creatable' && h.props.slot !== 1)
            ? []
            : kind === 'maxEntries'
              ? skills
              : users,
        value: model.value,
        hasCreate: kind === 'creatable',
        hasEntriesOnFocus: kind === 'creatable' && h.props.slot === 1,
        maxEntries: kind === 'maxEntries' ? 3 : undefined,
        disabled: state && 'disabled' in state ? state.disabled : undefined,
        required: kind === 'states' && h.props.slot === 1,
      },
      onEmit: (event: any) =>
        event._tag === 'Changed'
          ? Message.ChangedTokens({ value: event.value })
          : undefined,
    } as any)
  },
})
const supporting = (text: string) => (h: Html.H<DocsMessage>) =>
  h.p.class('text-sm text-muted-foreground').children(text)
const one = (
  h: Html.H<DocsMessage>,
  context: any,
  kind: string,
  slot?: number,
) =>
  TokenizerDemo(h, {
    key: `${context.idPrefix}-${kind}-${slot ?? 0}`,
    props: { kind, ...(slot === undefined ? {} : { slot }) },
  })
const fixture = (h: Html.H<DocsMessage>, context: any, kind: string) => {
  const stack = (children: readonly unknown[]) =>
    h.div
      .class('grid w-full max-w-100 min-w-0 grid-cols-1 gap-4')
      .children(children as never)
  switch (kind) {
    case 'clear':
      return stack([
        supporting('Clear-all button appears when tokens are selected')(h),
        one(h, context, kind),
      ])
    case 'creatable':
      return stack([
        supporting('Free-text only')(h),
        one(h, context, kind, 0),
        supporting('Create or search')(h),
        one(h, context, kind, 1),
      ])
    case 'endContent':
      return stack([
        supporting('Action button in the end slot')(h),
        one(h, context, kind),
      ])
    case 'icon':
      return stack([
        supporting('Leading icon reinforces the search affordance')(h),
        one(h, context, kind),
      ])
    case 'maxEntries':
      return stack([
        supporting('Limited to 3 selections — 1 remaining')(h),
        one(h, context, kind),
      ])
    case 'overflow':
      return stack([
        supporting('Inline overflow — content shifts down on expand')(h),
        one(h, context, kind, 0),
        supporting('Layer overflow — expands as overlay, no layout shift')(h),
        one(h, context, kind, 1),
      ])
    case 'states':
      return stack(states.map((_, slot) => one(h, context, kind, slot)))
    default:
      return stack([one(h, context, kind)])
  }
}
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    fixture(h, context, kind) as never
const source = exampleApplicationSource({
  imports: `import { Tokenizer } from '@/ui/effect/ui'`,
  body: `Tokenizer(h, {
  id: 'team-members',
  label: 'Team Members',
  placeholder: 'Search people...',
  width: 400,
  props: { items: users, value: model.value },
  onEmit: (event: any) => event._tag === 'Changed' ? ChangedTokens({ value: event.value }) : undefined,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Tokenizer } from '@/ui/effect/ui'\n\nTokenizer(h, { id, label, props: { items, value }, onEmit })`,
  examples: [
    { title: 'Tokenizer', view: view('showcase'), source },
    { title: 'Clear', view: view('clear'), source },
    { title: 'Creatable', view: view('creatable'), source },
    { title: 'End Content', view: view('endContent'), source },
    { title: 'Icon', view: view('icon'), source },
    { title: 'Max Entries', view: view('maxEntries'), source },
    { title: 'Overflow', view: view('overflow'), source },
    { title: 'States', view: view('states'), source },
  ],
})

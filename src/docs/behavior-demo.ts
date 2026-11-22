import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Agent from '@/lib/behaviors/agent'
import * as History from '@/lib/behaviors/history'
import * as Observe from '@/lib/behaviors/observe'
import type * as Card from '@/ui/card'
import type * as Input from '@/ui/input'
import type * as Switch from '@/ui/switch'

export const Model = Schema.Struct({
  region: Schema.String,
  isPublic: Schema.Boolean,
  agent: Agent.Model,
  history: History.Model,
  status: Schema.String,
})
export type Model = typeof Model.Type
const Changes = Schema.Array(
  Schema.Struct({
    ref: Schema.String,
    key: Schema.String,
    value: Schema.Unknown,
  }),
)
export const Message = defineMessageUnion({
  StartedAgent: {},
  ChangedRegion: { value: Schema.String },
  ToggledPublic: { value: Schema.Boolean },
  GotAgentMessage: { message: Agent.Message },
  GotHistoryMessage: { message: History.Message },
  AppliedAgentAction: { action: Agent.Action },
  AppliedHistory: { changes: Changes },
})
export type Message = typeof Message.Type
export const init = (): Model => ({
  region: 'London',
  isPublic: false,
  agent: Agent.init(),
  history: History.init(),
  status: 'Ready to run',
})

export const components = (model: Model): readonly Agent.Component[] => [
  {
    ref: 'region',
    component: 'input',
    label: 'Region',
    state: { value: model.region },
    actions: ['setValue'],
  },
  {
    ref: 'public',
    component: 'switch',
    label: 'Public',
    state: { checked: model.isPublic },
    confirm: 'Make this workspace public?',
    actions: ['setChecked'],
  },
]
const ExecuteAction = Command.define('ExecuteBehaviorDemoAction', {
  args: { action: Agent.Action },
  messages: [Message.AppliedAgentAction],
  execute: ({ action }) =>
    Effect.succeed(Message.AppliedAgentAction({ action })),
})
const ApplyHistory = Command.define('ApplyBehaviorDemoHistory', {
  args: { changes: Changes },
  messages: [Message.AppliedHistory],
  execute: ({ changes }) => Effect.succeed(Message.AppliedHistory({ changes })),
})

const changed = (
  model: Model,
  ref: string,
  value: unknown,
  source: string,
): Readonly<{ model: Model; change: Observe.Change }> => {
  const isRegion = ref === 'region'
  const input = {
    ref,
    component: isRegion ? 'input' : 'switch',
    label: isRegion ? 'Region' : 'Public',
    key: isRegion ? 'value' : 'checked',
    value,
    previous: isRegion ? model.region : model.isPublic,
    reason: 'imperative',
    phase: 'Commit' as const,
  }
  const change =
    source === 'agent'
      ? Agent.agentChange(input)
      : Observe.change({ ...input, source })
  const history = Observe.accepts({}, change)
    ? History.update(model.history, History.Message.Recorded({ change })).model
    : model.history
  return {
    model: {
      ...model,
      region: isRegion ? String(value) : model.region,
      isPublic: isRegion ? model.isPublic : value === true,
      history,
    },
    change,
  }
}
const agentUpdate = (
  model: Model,
  message: Agent.Message,
): Update.Return<Model, Message> => {
  const result = Agent.update(model.agent, message, components(model), {
    allow: action => (action.confirm ? 'ask' : true),
  })
  const commands = Command.mapMessages(result.commands ?? [], message =>
    Message.GotAgentMessage({ message }),
  )
  const out = result.outMessage
  return {
    model: {
      ...model,
      agent: result.model,
      status:
        out?._tag === 'Finished'
          ? out.result.ok
            ? 'Agent finished · 2 changes applied'
            : (out.result.error?.message ?? 'Stopped')
          : out?._tag === 'RequestApproval'
            ? 'Waiting for your approval'
            : 'Agent is working',
    },
    commands:
      out?._tag === 'RunStep'
        ? [...commands, ExecuteAction({ action: out.action })]
        : commands,
  }
}
export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  Message.match<Update.Return<Model, Message>>(message, {
    StartedAgent: () =>
      agentUpdate(
        model,
        Agent.Message.RequestedAct({
          steps: [
            { ref: 'region', action: 'setValue', args: ['Frankfurt'] },
            { ref: 'public', action: 'setChecked', args: [true] },
          ],
        }),
      ),
    GotAgentMessage: ({ message }) => agentUpdate(model, message),
    ChangedRegion: ({ value }) => ({
      model: changed(model, 'region', value, 'keyboard').model,
    }),
    ToggledPublic: ({ value }) => ({
      model: changed(model, 'public', value, 'pointer').model,
    }),
    AppliedAgentAction: ({ action }) => {
      const result = changed(model, action.ref, action.args[0], 'agent')
      return agentUpdate(
        result.model,
        Agent.Message.CompletedStep({ changes: [result.change] }),
      )
    },
    GotHistoryMessage: ({ message }) => {
      const result = History.update(model.history, message)
      return {
        model: {
          ...model,
          history: result.model,
          status:
            message._tag === 'UndidSource'
              ? 'Agent changes undone · your edits stay'
              : 'History position updated',
        },
        commands: result.outMessage
          ? [ApplyHistory({ changes: result.outMessage.changes })]
          : [],
      }
    },
    AppliedHistory: ({ changes }) => ({
      model: changes.reduce(
        (model, change) => ({
          ...model,
          ...(change.ref === 'region'
            ? { region: String(change.value) }
            : change.ref === 'public'
              ? { isPublic: change.value === true }
              : {}),
        }),
        model,
      ),
    }),
  })

export type Kit = Readonly<{
  button: <Msg>(
    props: Readonly<{
      children: readonly (Html | string)[]
      onClick: Msg
      isDisabled: boolean
      variant: 'default' | 'outline'
      size: 'sm'
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  text: <Msg>(
    props: Readonly<{
      children: readonly (Html | string)[]
      type: 'supporting'
      color: 'secondary' | 'primary'
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  input: typeof Input.input
  switchControl: typeof Switch.switchControl
  card: typeof Card.card
  cardHeader: typeof Card.cardHeader
  cardTitle: typeof Card.cardTitle
  cardDescription: typeof Card.cardDescription
  cardContent: typeof Card.cardContent
  stack: <Msg>(
    props: Readonly<{
      children: readonly Html[]
      gap?: 2 | 3 | 4 | 6
      direction?: 'horizontal' | 'vertical'
      wrap?: 'wrap'
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>
export const view = <Msg>(
  model: Model,
  toParent: (message: Message) => Msg,
  kit: Kit,
  h: HtmlBuilder<Msg>,
): Html => {
  const button = (
    label: string,
    message: Message,
    disabled = false,
    primary = false,
  ) =>
    kit.button(
      {
        children: [label],
        onClick: toParent(message),
        isDisabled: disabled,
        variant: primary ? 'default' : 'outline',
        size: 'sm',
      },
      h,
    )
  const text = (value: string, secondary = false) =>
    kit.text(
      {
        children: [value],
        type: 'supporting',
        color: secondary ? 'secondary' : 'primary',
      },
      h,
    )
  const approval = Option.getOrUndefined(model.agent.maybeApproval)
  return h.div(
    [h.DataAttribute('testid', 'behavior-demo')],
    [
      kit.card(
        {
          children: [
            kit.cardHeader(
              {
                children: [
                  kit.cardTitle(
                    { children: ['A little help. Your permission.'] },
                    h,
                  ),
                  kit.cardDescription(
                    {
                      children: [
                        'An agent can edit these settings. Publishing still needs you.',
                      ],
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
            kit.cardContent(
              {
                children: [
                  kit.stack(
                    {
                      gap: 6,
                      children: [
                        kit.input(
                          {
                            id: 'behavior-region',
                            label: 'Region',
                            value: model.region,
                            onInput: value =>
                              toParent(Message.ChangedRegion({ value })),
                            isDisabled: model.agent.running,
                          },
                          h,
                        ),
                        kit.switchControl(
                          {
                            id: 'behavior-public',
                            label: 'Public',
                            description: 'Let anyone discover this workspace.',
                            isChecked: model.isPublic,
                            onToggle: value =>
                              toParent(Message.ToggledPublic({ value })),
                            isDisabled: model.agent.running,
                          },
                          h,
                        ),
                        kit.stack(
                          {
                            direction: 'horizontal',
                            wrap: 'wrap',
                            gap: 2,
                            children: [
                              button(
                                'Run agent',
                                Message.StartedAgent(),
                                model.agent.running,
                                true,
                              ),
                              button(
                                'Undo agent',
                                Message.GotHistoryMessage({
                                  message: History.Message.UndidSource({
                                    source: 'agent',
                                  }),
                                }),
                                model.agent.running ||
                                  model.history.position === 0,
                              ),
                              button(
                                'Back',
                                Message.GotHistoryMessage({
                                  message: History.Message.Sought({
                                    to: model.history.position - 1,
                                  }),
                                }),
                                model.agent.running ||
                                  model.history.position === 0,
                              ),
                              button(
                                'Forward',
                                Message.GotHistoryMessage({
                                  message: History.Message.Sought({
                                    to: model.history.position + 1,
                                  }),
                                }),
                                model.agent.running ||
                                  model.history.position ===
                                    model.history.entries.length,
                              ),
                            ],
                          },
                          h,
                        ),
                        ...(approval
                          ? [
                              kit.stack(
                                {
                                  gap: 3,
                                  children: [
                                    text(
                                      approval.action.confirm ??
                                        'Allow this action?',
                                    ),
                                    kit.stack(
                                      {
                                        direction: 'horizontal',
                                        gap: 2,
                                        children: [
                                          button(
                                            'Approve',
                                            Message.GotAgentMessage({
                                              message: Agent.Message.Allowed({
                                                requestId: approval.requestId,
                                              }),
                                            }),
                                            false,
                                            true,
                                          ),
                                          button(
                                            'Refuse',
                                            Message.GotAgentMessage({
                                              message: Agent.Message.Refused({
                                                requestId: approval.requestId,
                                              }),
                                            }),
                                          ),
                                        ],
                                      },
                                      h,
                                    ),
                                  ],
                                },
                                h,
                              ),
                            ]
                          : []),
                        h.div([h.Role('status')], [text(model.status, true)]),
                        kit.stack(
                          {
                            gap: 3,
                            children: [
                              text(
                                `History · ${model.history.position} / ${model.history.entries.length}`,
                              ),
                              ...(model.history.entries.length
                                ? model.history.entries.map((entry, index) =>
                                    text(
                                      `${index + 1}. ${History.describeEntry(entry)}${entry.reverted ? ' · undone' : index >= model.history.position ? ' · not applied' : ''}`,
                                      entry.reverted ||
                                        index >= model.history.position,
                                    ),
                                  )
                                : [
                                    text(
                                      'No changes yet. Try the agent, or edit a setting yourself.',
                                      true,
                                    ),
                                  ]),
                            ],
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
          ],
        },
        h,
      ),
    ],
  )
}

import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { afterCommit } from 'foldkit/render'

import * as Agent from '@/lib/behaviors/agent'
import * as Change from '@/lib/behaviors/change'
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
  AppliedAgentAction: {
    action: Agent.Action,
    context: Schema.optionalKey(Change.Context),
  },
  AppliedHistory: { changes: Changes },
  RevealedObservedControl: {},
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
const agentContext: Change.Context = {
  reason: 'imperative',
  source: 'agent',
  attribution: 'behavior-demo-agent',
}

const ExecuteAction = Command.define('ExecuteBehaviorDemoAction', {
  args: { action: Agent.Action, context: Change.Context },
  messages: [Message.AppliedAgentAction],
  execute: ({ action, context }) =>
    Effect.succeed(Message.AppliedAgentAction({ action, context })),
})
const ApplyHistory = Command.define('ApplyBehaviorDemoHistory', {
  args: { changes: Changes },
  messages: [Message.AppliedHistory],
  execute: ({ changes }) => Effect.succeed(Message.AppliedHistory({ changes })),
})

const demoId = 'observe-behavior-demo'

const RevealObservedControl = Command.define('RevealObservedControl', {
  args: { ref: Schema.String },
  messages: [Message.RevealedObservedControl],
  execute: ({ ref }) =>
    afterCommit.pipe(
      Effect.andThen(
        Effect.sync(() => {
          const root = document.getElementById(demoId)
          if (root)
            Observe.elementOf(root, ref)?.scrollIntoView({ block: 'nearest' })
        }),
      ),
      Effect.as(Message.RevealedObservedControl()),
    ),
})

const changed = (
  model: Model,
  ref: string,
  value: unknown,
  context: Change.Context,
) => {
  if (ref !== 'region' && ref !== 'public')
    return { model, status: 'vetoed' as const }

  const isRegion = ref === 'region'
  const result = Change.apply<Model, unknown>(
    model,
    { ...context, value },
    {
      read: model => (isRegion ? model.region : model.isPublic),
      beforeWrite: ({ value }) =>
        isRegion ? typeof value === 'string' : typeof value === 'boolean',
      write: (model, value) =>
        isRegion
          ? { ...model, region: String(value) }
          : { ...model, isPublic: value === true },
    },
  )
  if (result.status !== 'committed') return result
  const change = Observe.change({
    ...result.change,
    ref,
    component: isRegion ? 'input' : 'switch',
    label: isRegion ? 'Region' : 'Public',
    key: isRegion ? 'value' : 'checked',
  })
  const history = History.update(
    result.model.history,
    History.Message.Recorded({ change }),
  ).model
  return { ...result, model: { ...result.model, history }, change }
}
const agentFinished = (result: Agent.Result): string => {
  const count = result.steps.reduce(
    (sum, step) => sum + (step.changes?.length ?? 0),
    0,
  )
  return `Agent finished · ${count} ${count === 1 ? 'change' : 'changes'} applied`
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
            ? agentFinished(out.result)
            : (out.result.error?.message ?? 'Stopped')
          : out?._tag === 'RequestApproval'
            ? 'Waiting for your approval'
            : 'Agent is working',
    },
    commands:
      out?._tag === 'RunStep'
        ? [
            ...commands,
            ExecuteAction({ action: out.action, context: agentContext }),
          ]
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
      model: changed(model, 'region', value, {
        reason: 'input',
        source: 'keyboard',
      }).model,
    }),
    ToggledPublic: ({ value }) => ({
      model: changed(model, 'public', value, {
        reason: 'item-press',
        source: 'pointer',
      }).model,
    }),
    AppliedAgentAction: ({ action, context = agentContext }) => {
      const result = changed(model, action.ref, action.args[0], context)
      const next = agentUpdate(
        result.model,
        result.status === 'vetoed'
          ? Agent.Message.FailedStep({ message: 'Invalid workspace setting' })
          : Agent.Message.CompletedStep({
              changes: result.status === 'committed' ? [result.change] : [],
            }),
      )
      return result.status === 'committed' && result.change.source === 'agent'
        ? {
            ...next,
            commands: [
              ...(next.commands ?? []),
              RevealObservedControl({ ref: result.change.ref }),
            ],
          }
        : next
    },
    RevealedObservedControl: () => ({ model }),
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
    [h.Id(demoId), h.DataAttribute('testid', 'behavior-demo')],
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
                        h.div(
                          [h.DataAttribute('observe-ref', 'region')],
                          [
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
                          ],
                        ),
                        h.div(
                          [h.DataAttribute('observe-ref', 'public')],
                          [
                            kit.switchControl(
                              {
                                id: 'behavior-public',
                                label: 'Public',
                                description:
                                  'Let anyone discover this workspace.',
                                isChecked: model.isPublic,
                                onToggle: value =>
                                  toParent(Message.ToggledPublic({ value })),
                                isDisabled: model.agent.running,
                              },
                              h,
                            ),
                          ],
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

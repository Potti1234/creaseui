import { Effect, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import type { ChildAttribute, Html, TagName } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Render from 'foldkit/render'
import { defineView } from 'foldkit/submodel'

export const Model = S.Struct({
  id: S.String,
  isShowing: S.Boolean,
  transitionState: S.Literals([
    'Idle',
    'EnterStart',
    'EnterAnimating',
    'LeaveStart',
    'LeaveAnimating',
  ]),
  transitionGeneration: S.Number,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  Showed: {},
  Hid: {},
  CompletedWaitForPaint: { generation: S.Number },
  EndedAnimation: { generation: S.Number },
})
export type Message = typeof Message.Type

const OutMessage = defineMessageUnion({
  StartedLeaveAnimating: { generation: S.Number },
  TransitionedOut: {},
})
type OutMessage = typeof OutMessage.Type

export const init = ({
  id,
  isShowing = false,
}: Readonly<{ id: string; isShowing?: boolean }>): Model => ({
  id,
  isShowing,
  transitionState: 'Idle',
  transitionGeneration: 0,
})

export const WaitForPaint = Command.define('WaitForPaint', {
  args: { generation: S.Number },
  messages: [Message.CompletedWaitForPaint],
  execute: ({ generation }) =>
    Render.afterPaint.pipe(
      Effect.as(Message.CompletedWaitForPaint({ generation })),
    ),
})

export const WaitForAnimationSettled = Command.define(
  'WaitForAnimationSettled',
  {
    args: { id: S.String, generation: S.Number },
    messages: [Message.EndedAnimation],
    execute: ({ id, generation }) =>
      Effect.suspend(() =>
        Dom.waitForAnimationSettled(`#${CSS.escape(id)}`),
      ).pipe(Effect.as(Message.EndedAnimation({ generation }))),
  },
)

export const defaultLeaveCommand = (model: Model) =>
  WaitForAnimationSettled({
    id: model.id,
    generation: model.transitionGeneration,
  })

export const update = (
  model: Model,
  message: Message,
): Update.ReturnWithOutMessage<Model, Message, OutMessage> => {
  if (message._tag === 'Showed' || message._tag === 'Hid') {
    const isShowing = message._tag === 'Showed'
    if (model.isShowing === isShowing) return { model }
    const generation = model.transitionGeneration + 1
    return {
      model: {
        ...model,
        isShowing,
        transitionGeneration: generation,
        transitionState: isShowing ? 'EnterStart' : 'LeaveStart',
      },
      commands: [WaitForPaint({ generation })],
    }
  }
  const { generation } = message
  if (generation !== model.transitionGeneration) return { model }

  if (message._tag === 'CompletedWaitForPaint') {
    if (model.transitionState === 'EnterStart')
      return {
        model: { ...model, transitionState: 'EnterAnimating' },
        commands: [WaitForAnimationSettled({ id: model.id, generation })],
      }
    if (model.transitionState === 'LeaveStart')
      return {
        model: { ...model, transitionState: 'LeaveAnimating' },
        outMessage: OutMessage.StartedLeaveAnimating({ generation }),
      }
  } else {
    if (model.transitionState === 'EnterAnimating')
      return { model: { ...model, transitionState: 'Idle' } }
    if (model.transitionState === 'LeaveAnimating')
      return {
        model: { ...model, transitionState: 'Idle' },
        outMessage: OutMessage.TransitionedOut(),
      }
  }
  return { model }
}

type ViewInputs = Readonly<{
  content: Html
  className?: string
  attributes?: ReadonlyArray<ChildAttribute>
  element?: Exclude<TagName, 'textarea'>
  animateSize?: boolean
}>

export const view = defineView<Model, Message, ViewInputs>(
  (model, props, h) => {
    const { id, transitionState: phase } = model
    const entering = phase === 'EnterStart' || phase === 'EnterAnimating'
    const leaving = phase === 'LeaveStart' || phase === 'LeaveAnimating'
    const visible = model.isShowing || leaving
    const closed = phase === 'EnterStart' || phase === 'LeaveAnimating'
    if (!visible && !props.animateSize) return h.empty
    const content = h.keyed(props.element ?? 'div')(
      id,
      [
        h.Id(id),
        ...(closed || (!visible && props.animateSize)
          ? [h.DataAttribute('closed', '')]
          : []),
        ...(entering ? [h.DataAttribute('enter', '')] : []),
        ...(leaving ? [h.DataAttribute('leave', '')] : []),
        ...(phase === 'Idle' ? [] : [h.DataAttribute('transition', '')]),
        ...(props.className ? [h.Class(props.className)] : []),
        ...(props.attributes ?? []),
      ],
      [props.content],
    )
    return props.animateSize
      ? h.div(
          [
            h.Style({
              display: 'grid',
              gridTemplateRows: closed || !visible ? '0fr' : '1fr',
              transition: 'grid-template-rows 200ms ease-out',
              overflow: 'hidden',
            }),
          ],
          [
            h.div(
              [
                h.Style({ minHeight: '0px', overflow: 'hidden' }),
                ...(!visible ? [h.AriaHidden(true)] : []),
              ],
              [content],
            ),
          ],
        )
      : content
  },
)

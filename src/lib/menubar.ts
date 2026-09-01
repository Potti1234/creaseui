import { Effect, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

export const Model = S.Struct({ id: S.String, activeIndex: S.Number })
export type Model = typeof Model.Type

export const Moved = m('MovedMenubarFocus', { index: S.Number, triggerId: S.String })
export const Focused = m('FocusedMenubarTrigger', { index: S.Number })
export const CompletedFocus = m('CompletedFocusMenubarTrigger')
export const Message = S.Union([Moved, Focused, CompletedFocus])
export type Message = typeof Message.Type

export const MovedTo = m('MovedToMenubar', { index: S.Number })
export type OutMessage = typeof MovedTo.Type

export const init = (config: Readonly<{ id: string; activeIndex?: number }>): Model => ({
  id: config.id,
  activeIndex: Math.max(0, config.activeIndex ?? 0),
})

export const FocusTrigger = Command.define('FocusMenubarTrigger', {
  args: { triggerId: S.String },
  messages: [CompletedFocus],
  execute: ({ triggerId }) => Dom.focus(`[id="${triggerId}"]`).pipe(
    Effect.ignore,
    Effect.as(CompletedFocus()),
  ),
})

type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
  Option.Option<OutMessage>,
]

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'MovedMenubarFocus':
      return [
        { ...model, activeIndex: Math.max(0, message.index) },
        [FocusTrigger({ triggerId: message.triggerId })],
        Option.some(MovedTo({ index: Math.max(0, message.index) })),
      ]
    case 'FocusedMenubarTrigger':
      return [{ ...model, activeIndex: Math.max(0, message.index) }, [], Option.none()]
    case 'CompletedFocusMenubarTrigger':
      return [model, [], Option.none()]
  }
}

export type MenuFocusInfo = Readonly<{
  index: number
  isActive: boolean
  attributes: ReadonlyArray<ChildAttribute>
}>

export type ViewInputs = Readonly<{
  triggerIds: ReadonlyArray<string>
  direction?: 'ltr' | 'rtl'
  shouldMoveTopLevel?: (index: number, key: string) => boolean
  toView: (menus: ReadonlyArray<MenuFocusInfo>) => Html
}>

const view: SubmodelView<Model, Message, ViewInputs> = defineView((model, inputs, h) => {
  const count = inputs.triggerIds.length
  const activeIndex = count === 0 ? 0 : Math.min(model.activeIndex, count - 1)
  const move = (index: number, key: string) => {
    if (count === 0) return Option.none<Message>()
    if (inputs.shouldMoveTopLevel?.(index, key) === false) return Option.none<Message>()
    const forward = inputs.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const backward = inputs.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
    const target = key === 'Home'
      ? 0
      : key === 'End'
        ? count - 1
        : key === forward
          ? (index + 1) % count
          : key === backward
            ? (index - 1 + count) % count
            : undefined
    const triggerId = target === undefined ? undefined : inputs.triggerIds[target]
    return target === undefined || triggerId === undefined
      ? Option.none<Message>()
      : Option.some(Moved({ index: target, triggerId }))
  }
  return inputs.toView(inputs.triggerIds.map((_id, index) => ({
    index,
    isActive: index === activeIndex,
    attributes: childAttributes([
      h.OnFocus(Focused({ index })),
      h.OnKeyDownPreventDefault((key) => move(index, key)),
    ]),
  })))
})

export const behavior = { view, update }

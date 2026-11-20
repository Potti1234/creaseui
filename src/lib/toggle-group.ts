import { Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import {
  childAttributes,
  type Attribute,
  type ChildAttribute,
  type Html,
  type HtmlBuilder,
} from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as RovingFocus from '@/lib/behaviors/roving-focus'

export const Model = Schema.Struct({ rovingFocus: RovingFocus.Model })
export type Model = typeof Model.Type
export const Message = defineMessageUnion({
  GotRovingFocusMessage: { message: RovingFocus.Message },
  PressedItem: { value: Schema.String, index: Schema.Number },
})
export type Message = typeof Message.Type
export const OutMessage = defineMessageUnion({
  Selected: { value: Schema.String, index: Schema.Number },
})
export type OutMessage<Value extends string = string> = Readonly<{
  _tag: 'Selected'
  value: Value
  index: number
}>

export const init = (config: Readonly<{ id: string }>): Model => ({
  rovingFocus: RovingFocus.init(config),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const updateGroup = (model: Model, message: Message): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    GotRovingFocusMessage: ({ message }) => {
      const next = RovingFocus.update(model.rovingFocus, message)
      return {
        model: { ...model, rovingFocus: next.model },
        commands: Command.mapMessages(next.commands, child =>
          Message.GotRovingFocusMessage({ message: child }),
        ),
      }
    },
    PressedItem: ({ value, index }) => ({
      model,
      outMessage: OutMessage.Selected({ value, index }),
    }),
  })

export type ToggleGroupBehaviorItem<Value extends string> = Readonly<{
  value: Value
  isDisabled?: boolean
}>

export type ToggleGroupItemState<Value extends string> = Readonly<{
  value: Value
  index: number
  isPressed: boolean
  isFocused: boolean
  isDisabled: boolean
  attributes: ReadonlyArray<ChildAttribute>
}>

export type ToggleGroupBehaviorProps<Value extends string, Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  selectedValues: ReadonlyArray<Value>
  items: ReadonlyArray<ToggleGroupBehaviorItem<Value>>
  ariaLabel: string
  direction?: 'ltr' | 'rtl'
  orientation?: 'vertical'
}>

export type ToggleGroupVisualAttributes<Msg> = Readonly<{
  group: ReadonlyArray<Attribute<Msg>>
  item: (item: ToggleGroupItemState<string>) => ReadonlyArray<Attribute<Msg>>
}>

const renderToggleGroup = <Value extends string, Msg>(
  bundle: RovingFocus.Bundle<Value>,
  props: ToggleGroupBehaviorProps<Value, Msg>,
  visual: ToggleGroupVisualAttributes<Msg>,
  toItem: (item: ToggleGroupItemState<Value>, h: HtmlBuilder<Msg>) => Html,
  h: HtmlBuilder<Msg>,
): Html => {
  const orderedItems =
    props.direction === 'rtl' ? [...props.items].reverse() : props.items
  const firstEnabled = orderedItems.find(
    item => item.isDisabled !== true,
  )?.value
  const focusedValue =
    orderedItems.find(
      item =>
        item.isDisabled !== true && props.selectedValues.includes(item.value),
    )?.value ??
    firstEnabled ??
    orderedItems[0]?.value

  if (focusedValue === undefined) {
    return h.div(
      [h.Role('group'), h.AriaLabel(props.ariaLabel), ...visual.group],
      [],
    )
  }

  return h.submodel({
    slotId: props.model.rovingFocus.id,
    model: props.model.rovingFocus,
    view: bundle.view,
    viewInputs: {
      keys: orderedItems.map(item => item.value),
      preferredKey: focusedValue,
      orientation: props.orientation === 'vertical' ? 'Vertical' : 'Horizontal',
      isDisabled: value =>
        props.items.find(item => item.value === value)?.isDisabled === true,
      toView: items =>
        h.div(
          [
            h.Role('group'),
            h.AriaLabel(props.ariaLabel),
            ...(props.direction === undefined
              ? []
              : [h.Dir(props.direction === 'rtl' ? 'ltr' : props.direction)]),
            ...visual.group,
          ],
          items.flatMap(item => {
            const config = props.items.find(config => config.value === item.key)
            if (config === undefined) return []
            const state: ToggleGroupItemState<Value> = {
              value: item.key,
              index: item.index,
              isPressed: props.selectedValues.includes(item.key),
              isFocused: item.isTabStop,
              isDisabled: item.isDisabled,
              attributes: [
                ...item.attributes,
                ...childAttributes([
                  h.Type('button'),
                  ...(item.key === focusedValue
                    ? [h.DataAttribute('selected', '')]
                    : []),
                  ...(item.isDisabled
                    ? [
                        h.Disabled(true),
                        h.AriaDisabled(true),
                        h.DataAttribute('disabled', ''),
                      ]
                    : [
                        h.OnClick(
                          props.toParentMessage(
                            Message.PressedItem({
                              value: item.key,
                              index: item.index,
                            }),
                          ),
                        ),
                      ]),
                ]),
              ],
            }
            return [toItem(state, h)]
          }),
        ),
    },
    toParentMessage: message =>
      props.toParentMessage(Message.GotRovingFocusMessage({ message })),
  })
}

export type Bundle<Value extends string> = Readonly<{
  update: (
    model: Model,
    message: Message,
  ) => Update.ReturnWithOutMessage<Model, Message, OutMessage<Value>>
  render: <Msg>(
    props: ToggleGroupBehaviorProps<Value, Msg>,
    visual: ToggleGroupVisualAttributes<Msg>,
    toItem: (item: ToggleGroupItemState<Value>, h: HtmlBuilder<Msg>) => Html,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

export const create = <Value extends string = string>(): Bundle<Value> => {
  const bundle = RovingFocus.create<Value>()
  type GenericReturn = Update.ReturnWithOutMessage<
    Model,
    Message,
    OutMessage<Value>
  >
  const cast = (result: UpdateReturn): GenericReturn => result as GenericReturn

  return {
    update: (model, message) => cast(updateGroup(model, message)),
    render: (props, visual, toItem, h) =>
      renderToggleGroup(bundle, props, visual, toItem, h),
  }
}

const StringToggleGroup = create<string>()
export const update = StringToggleGroup.update
export const render = StringToggleGroup.render

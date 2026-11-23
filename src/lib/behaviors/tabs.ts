import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView, type View } from 'foldkit/submodel'

import { navigate, navigationIntent } from './roving-focus'

const ActivationMode = Schema.Literals(['Automatic', 'Manual'])

export const Model = Schema.Struct({
  id: Schema.String,
  maybeFocusedIndex: Schema.Option(Schema.Number),
  activationMode: ActivationMode,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  SelectedTab: { index: Schema.Number, value: Schema.String },
  FocusedTab: { index: Schema.Number },
  CompletedFocusTab: {},
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

export const init = (
  config: Readonly<{
    id: string
    activationMode?: typeof ActivationMode.Type
  }>,
): Model => ({
  id: config.id,
  maybeFocusedIndex: Option.none(),
  activationMode: config.activationMode ?? 'Automatic',
})

const tabId = (id: string, index: number) => `${id}-tab-${index}`
const panelId = (id: string, index: number) => `${id}-panel-${index}`

export const FocusTab = Command.define('FocusTab', {
  args: { id: Schema.String, index: Schema.Number },
  messages: [Message.CompletedFocusTab],
  execute: ({ id, index }) =>
    Dom.focus(`#${CSS.escape(tabId(id, index))}`).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedFocusTab()),
    ),
})

type TabInfo<Value extends string> = Readonly<{
  value: Value
  index: number
  isActive: boolean
  isDisabled: boolean
  tab: ReadonlyArray<ChildAttribute>
  panel: ReadonlyArray<ChildAttribute>
}>

type ViewInputs<Value extends string> = Readonly<{
  tabs: ReadonlyArray<Value>
  selectedValue: Value
  ariaLabel: string
  orientation?: 'Horizontal' | 'Vertical'
  isTabDisabled: (value: Value) => boolean
  toView: (
    parts: Readonly<{
      tablist: ReadonlyArray<ChildAttribute>
      tabs: ReadonlyArray<TabInfo<Value>>
      activeIndex: number
    }>,
  ) => Html
}>

export type Bundle<Value extends string> = Readonly<{
  view: View<Model, Message, ViewInputs<Value>>
  update: (
    model: Model,
    message: Message,
  ) => Update.ReturnWithOutMessage<Model, Message, OutMessage<Value>>
}>

export const create = <Value extends string = string>(): Bundle<Value> => ({
  update: (model, message) =>
    Message.match<ReturnType<Bundle<Value>['update']>>(message, {
      SelectedTab: ({ index, value }) => ({
        model: { ...model, maybeFocusedIndex: Option.none() },
        commands: [FocusTab({ id: model.id, index })],
        // The shared schema accepts strings. The view emits this bundle's values.
        outMessage: { _tag: 'Selected', index, value: value as Value },
      }),
      FocusedTab: ({ index }) => ({
        model: { ...model, maybeFocusedIndex: Option.some(index) },
        commands: [FocusTab({ id: model.id, index })],
      }),
      CompletedFocusTab: () => ({ model }),
    }),
  view: defineView<Model, Message, ViewInputs<Value>>((model, inputs, h) => {
    const { id, activationMode, maybeFocusedIndex } = model
    const {
      tabs,
      selectedValue,
      ariaLabel,
      orientation = 'Horizontal',
    } = inputs
    const activeIndex = Math.max(0, tabs.indexOf(selectedValue))
    const focusedIndex = maybeFocusedIndex.pipe(
      Option.filter(index => index >= 0 && index < tabs.length),
      Option.getOrElse(() => activeIndex),
    )
    const disabled = tabs.map(inputs.isTabDisabled)
    const keys = tabs.map((_, index) => index)
    const allDisabled = disabled.every(Boolean)

    const select = (index: number): Option.Option<Message> =>
      Option.fromUndefinedOr(tabs[index]).pipe(
        Option.map(value => Message.SelectedTab({ index, value })),
      )

    const onKeyDown = (key: string): Option.Option<Message> => {
      if (key === 'Enter' || key === ' ') return select(focusedIndex)

      const pressedKey =
        key === 'PageUp' ? 'Home' : key === 'PageDown' ? 'End' : key
      const navigation = { pressedKey, orientation }
      // Preserve the existing cursor fallback when every tab is disabled.
      const target = allDisabled
        ? Option.map(navigationIntent(navigation), () => focusedIndex)
        : navigate({
            ...navigation,
            keys,
            currentKey: focusedIndex,
            isDisabled: index => disabled[index] ?? false,
          })
      return Option.flatMap(target, index =>
        activationMode === 'Manual'
          ? Option.some(Message.FocusedTab({ index }))
          : select(index),
      )
    }

    return inputs.toView({
      activeIndex,
      tablist: childAttributes([
        h.Role('tablist'),
        h.AriaOrientation(
          orientation === 'Horizontal' ? 'horizontal' : 'vertical',
        ),
        h.AriaLabel(ariaLabel),
      ]),
      tabs: tabs.map((value, index) => {
        const isActive = index === activeIndex
        const isDisabled = disabled[index] ?? false
        const selected = isActive ? [h.DataAttribute('selected', '')] : []
        return {
          value,
          index,
          isActive,
          isDisabled,
          tab: childAttributes([
            h.Id(tabId(id, index)),
            h.Role('tab'),
            h.Type('button'),
            h.AriaSelected(isActive),
            ...(isActive ? [h.AriaControls(panelId(id, index))] : []),
            h.Tabindex(index === focusedIndex ? 0 : -1),
            ...selected,
            ...(isDisabled
              ? [
                  h.Disabled(true),
                  h.AriaDisabled(true),
                  h.DataAttribute('disabled', ''),
                ]
              : [h.OnClick(Message.SelectedTab({ index, value }))]),
            h.OnKeyDownPreventDefault(onKeyDown),
          ]),
          panel: childAttributes([
            h.Id(panelId(id, index)),
            h.Role('tabpanel'),
            h.AriaLabelledBy(tabId(id, index)),
            h.Tabindex(isActive ? 0 : -1),
            ...selected,
          ]),
        }
      }),
    })
  }),
})

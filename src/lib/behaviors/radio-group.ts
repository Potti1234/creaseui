import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView, type View } from 'foldkit/submodel'

export const Model = Schema.Struct({
  id: Schema.String,
  maybeFocusedIndex: Schema.Option(Schema.Number),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  SelectedOption: { index: Schema.Number, value: Schema.String },
  FocusedOption: { index: Schema.Number },
  CompletedFocusOption: {},
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

export const Orientation = Schema.Literals(['Horizontal', 'Vertical'])
export type Orientation = typeof Orientation.Type
export const Direction = Schema.Literals(['ltr', 'rtl'])
export type Direction = typeof Direction.Type

export type InitConfig = Readonly<{ id: string }>
export const init = ({ id }: InitConfig): Model => ({
  id,
  maybeFocusedIndex: Option.none(),
})

export const optionId = (id: string, index: number): string =>
  `${id}-option-${index}`

const optionSelector = (id: string, index: number): string =>
  `[id="${optionId(id, index).replace(
    /["\\\n\r\f]/gu,
    character => `\\${character.charCodeAt(0).toString(16)} `,
  )}"]`

export const FocusOption = Command.define('FocusOption', {
  args: { id: Schema.String, index: Schema.Number },
  messages: [Message.CompletedFocusOption],
  execute: ({ id, index }) =>
    Dom.focus(optionSelector(id, index)).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedFocusOption()),
    ),
})

export type OptionInfo<Value extends string = string> = Readonly<{
  value: Value
  index: number
  isSelected: boolean
  isActive: boolean
  isDisabled: boolean
  isReadOnly: boolean
  option: ReadonlyArray<ChildAttribute>
  label: ReadonlyArray<ChildAttribute>
  description: ReadonlyArray<ChildAttribute>
}>

export type RenderInfo<Value extends string = string> = Readonly<{
  group: ReadonlyArray<ChildAttribute>
  options: ReadonlyArray<OptionInfo<Value>>
  selectedValue: Option.Option<Value>
  hiddenInput: ReadonlyArray<ChildAttribute>
}>

export type ViewInputs<Value extends string = string> = Readonly<{
  options: ReadonlyArray<Value>
  selectedValue: Option.Option<Value>
  ariaLabel: string
  toView: (render: RenderInfo<Value>) => Html
  orientation?: Orientation
  direction?: Direction
  isOptionDisabled?: (value: Value, index: number) => boolean
  hasOptionDescription?: (value: Value, index: number) => boolean
  isDisabled?: boolean
  isReadOnly?: boolean
  name?: string
}>

export type Bundle<Value extends string = string> = Readonly<{
  view: View<Model, Message, ViewInputs<Value>>
  update: (
    model: Model,
    message: Message,
  ) => Update.ReturnWithOutMessage<Model, Message, OutMessage<Value>>
}>

/** Both arrow axes navigate. Inline arrows follow the reading direction. */
export const toOrientationKey = (
  orientation: Orientation,
  direction: Direction,
): ((key: string) => string) => {
  const [next, previous] =
    orientation === 'Horizontal'
      ? ['ArrowRight', 'ArrowLeft']
      : ['ArrowDown', 'ArrowUp']
  const [forward, back] =
    direction === 'rtl'
      ? ['ArrowLeft', 'ArrowRight']
      : ['ArrowRight', 'ArrowLeft']
  return key =>
    key === 'ArrowDown' || key === forward
      ? next
      : key === 'ArrowUp' || key === back
        ? previous
        : key
}

const navigationTarget = (
  key: string,
  enabled: ReadonlyArray<number>,
  activeIndex: number,
): number | undefined => {
  switch (key) {
    case 'Home':
    case 'PageUp':
      return enabled[0]
    case 'End':
    case 'PageDown':
      return enabled.at(-1)
    case 'ArrowDown':
      return enabled[enabled.indexOf(activeIndex) + 1] ?? enabled[0]
    case 'ArrowUp':
      return enabled[enabled.indexOf(activeIndex) - 1] ?? enabled.at(-1)
    default:
      return undefined
  }
}

export const create = <Value extends string = string>(): Bundle<Value> => ({
  update: (model, message) =>
    Message.match<ReturnType<Bundle<Value>['update']>>(message, {
      SelectedOption: ({ index, value }) => ({
        model: { ...model, maybeFocusedIndex: Option.none() },
        commands: [FocusOption({ id: model.id, index })],
        // The shared message schema accepts strings. The view emits values
        // from this bundle's typed options.
        outMessage: { _tag: 'Selected', index, value: value as Value },
      }),
      FocusedOption: ({ index }) => ({
        model: { ...model, maybeFocusedIndex: Option.some(index) },
        commands: [FocusOption({ id: model.id, index })],
      }),
      CompletedFocusOption: () => ({ model }),
    }),
  view: defineView<Model, Message, ViewInputs<Value>>((model, inputs, h) => {
    const {
      options,
      selectedValue,
      ariaLabel,
      orientation = 'Vertical',
      direction = 'ltr',
      isDisabled: groupDisabled = false,
      isReadOnly = false,
      isOptionDisabled,
      hasOptionDescription,
      name,
      toView,
    } = inputs
    const selectedIndex = Option.isSome(selectedValue)
      ? options.indexOf(selectedValue.value)
      : -1
    const disabled = options.map(
      (value, index) =>
        groupDisabled || isOptionDisabled?.(value, index) === true,
    )
    const enabled = disabled.flatMap((isDisabled, index) =>
      isDisabled ? [] : [index],
    )
    const activeIndex = Option.getOrElse(
      Option.filter(
        model.maybeFocusedIndex,
        index => disabled[index] === false,
      ),
      () =>
        disabled[selectedIndex] === false ? selectedIndex : (enabled[0] ?? 0),
    )
    const normalizeKey = toOrientationKey('Vertical', direction)
    const onKeyDown = (
      index: number,
      value: Value,
      key: string,
    ): Option.Option<Message> => {
      if (key === ' ' && !isReadOnly)
        return Option.some(Message.SelectedOption({ index, value }))
      const target = navigationTarget(normalizeKey(key), enabled, activeIndex)
      if (target === undefined) return Option.none()
      if (isReadOnly)
        return Option.some(Message.FocusedOption({ index: target }))
      const targetValue = options[target]
      return targetValue === undefined
        ? Option.none()
        : Option.some(
            Message.SelectedOption({ index: target, value: targetValue }),
          )
    }

    return toView({
      group: childAttributes([
        h.Role('radiogroup'),
        h.AriaOrientation(
          orientation === 'Horizontal' ? 'horizontal' : 'vertical',
        ),
        h.AriaLabel(ariaLabel),
        ...(isReadOnly
          ? [h.AriaReadonly(true), h.DataAttribute('readonly', '')]
          : []),
      ]),
      options: options.map((value, index) => {
        const id = optionId(model.id, index)
        const labelId = `${id}-label`
        const descriptionId = `${id}-description`
        const isSelected = index === selectedIndex
        const isActive = index === activeIndex
        const isDisabled = disabled[index] === true

        return {
          value,
          index,
          isSelected,
          isActive,
          isDisabled,
          isReadOnly,
          option: childAttributes([
            h.Id(id),
            h.Type('button'),
            h.Role('radio'),
            h.AriaChecked(isSelected),
            h.AriaLabelledBy(labelId),
            ...(hasOptionDescription?.(value, index) === true
              ? [h.AriaDescribedBy(descriptionId)]
              : []),
            h.Tabindex(isActive ? 0 : -1),
            ...(isSelected ? [h.DataAttribute('checked', '')] : []),
            ...(isActive ? [h.DataAttribute('active', '')] : []),
            ...(isDisabled
              ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
              : []),
            ...(isReadOnly ? [h.DataAttribute('readonly', '')] : []),
            ...(isDisabled || isReadOnly
              ? []
              : [h.OnClick(Message.SelectedOption({ index, value }))]),
            ...(isDisabled
              ? []
              : [
                  h.OnKeyDownPreventDefault(key =>
                    onKeyDown(index, value, key),
                  ),
                ]),
          ]),
          label: childAttributes([h.Id(labelId)]),
          description: childAttributes([h.Id(descriptionId)]),
        }
      }),
      selectedValue,
      hiddenInput: childAttributes(
        name !== undefined && Option.isSome(selectedValue)
          ? [h.Type('hidden'), h.Name(name), h.Value(selectedValue.value)]
          : [],
      ),
    })
  }),
})

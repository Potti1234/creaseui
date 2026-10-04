import type { Option } from 'effect'
import type { Attribute, ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'
import { RadioGroup as RadioGroupPrimitive } from '@foldkit/ui'

/* Behavior for SegmentedControl: Astryx's control is a single-selection
   horizontal radio group with roving tabindex and selection-follows-focus —
   the exact contract of the shared RadioGroup primitive. */

export type SegmentedControlOption<Value extends string = string> = Readonly<{
  value: Value
  isDisabled?: boolean
}>

export const Model = RadioGroupPrimitive.Model
export type Model = typeof Model.Type
export const Message = RadioGroupPrimitive.Message
export type Message = typeof Message.Type
export type OutMessage<Value extends string = string> =
  RadioGroupPrimitive.OutMessage<Value>
export const init = RadioGroupPrimitive.init

export type SegmentedControlOptionState<Value extends string = string> =
  Readonly<{
    value: Value
    index: number
    isSelected: boolean
    isActive: boolean
    isDisabled: boolean
    attributes: ReadonlyArray<ChildAttribute>
    labelAttributes: ReadonlyArray<ChildAttribute>
  }>

export type SegmentedControlBehaviorProps<
  Value extends string,
  Msg,
> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  selectedValue: Option.Option<Value>
  options: ReadonlyArray<SegmentedControlOption<Value>>
  ariaLabel: string
  isDisabled?: boolean
  name?: string
}>

export type SegmentedControlVisualAttributes<Msg> = Readonly<{
  group: ReadonlyArray<Attribute<Msg>>
}>

const renderSegmentedControl = <Value extends string, Msg>(
  bundle: RadioGroupPrimitive.Bundle<Value>,
  props: SegmentedControlBehaviorProps<Value, Msg>,
  visual: SegmentedControlVisualAttributes<Msg>,
  toItem: (
    option: SegmentedControlOptionState<Value>,
    h: HtmlBuilder<Msg>,
  ) => Html,
  h: HtmlBuilder<Msg>,
): Html =>
  h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: bundle.view,
    viewInputs: {
      selectedValue: props.selectedValue,
      options: props.options.map(option => option.value),
      ariaLabel: props.ariaLabel,
      orientation: 'Horizontal',
      isDisabled: props.isDisabled ?? false,
      isOptionDisabled: (_value, index) =>
        props.options[index]?.isDisabled === true,
      ...(props.name === undefined ? {} : { name: props.name }),
      toView: ({ group, options, hiddenInput }) =>
        h.div(
          [...group, ...visual.group],
          [
            ...options.map(option =>
              toItem(
                {
                  value: option.value,
                  index: option.index,
                  isSelected: option.isSelected,
                  isActive: option.isActive,
                  isDisabled: option.isDisabled,
                  attributes: option.option,
                  labelAttributes: option.label,
                },
                h,
              ),
            ),
            ...(props.name === undefined ? [] : [h.input([...hiddenInput])]),
          ],
        ),
    },
    toParentMessage: props.toParentMessage,
  })

export type Bundle<Value extends string> = Readonly<{
  update: ReturnType<typeof RadioGroupPrimitive.create<Value>>['update']
  render: <Msg>(
    props: SegmentedControlBehaviorProps<Value, Msg>,
    visual: SegmentedControlVisualAttributes<Msg>,
    toItem: (
      option: SegmentedControlOptionState<Value>,
      h: HtmlBuilder<Msg>,
    ) => Html,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

export const create = <Value extends string = string>(): Bundle<Value> => {
  const bundle = RadioGroupPrimitive.create<Value>()
  return {
    update: bundle.update,
    render: (props, visual, toItem, h) =>
      renderSegmentedControl(bundle, props, visual, toItem, h),
  }
}

const StringSegmentedControl = create<string>()
export const update = StringSegmentedControl.update
export const render = StringSegmentedControl.render

import { RadioGroup as RadioGroupPrimitive } from '@foldkit/ui'
import { Schema } from 'effect'
import type { ChildAttribute } from 'foldkit/html'
import type { View } from 'foldkit/submodel'

/* RadioGroup keeps the @foldkit/ui primitive (see README). This module is
   the seam components consume it through and adds the APG both-axes arrow
   keys and reading direction the primitive does not handle. */
export const Model = RadioGroupPrimitive.Model
export type Model = typeof Model.Type
export const Message = RadioGroupPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = RadioGroupPrimitive.OutMessage
export type OutMessage<Value extends string = string> =
  RadioGroupPrimitive.OutMessage<Value>
export const Orientation = RadioGroupPrimitive.Orientation
export type Orientation = typeof Orientation.Type
export const Direction = Schema.Literals(['ltr', 'rtl'])
export type Direction = typeof Direction.Type
export const FocusOption = RadioGroupPrimitive.FocusOption
export type InitConfig = RadioGroupPrimitive.InitConfig
export type RenderInfo<Value extends string = string> =
  RadioGroupPrimitive.RenderInfo<Value>
export type OptionInfo<Value extends string = string> =
  RadioGroupPrimitive.OptionInfo<Value>
export const init = RadioGroupPrimitive.init

export type ViewInputs<Value extends string = string> =
  RadioGroupPrimitive.ViewInputs<Value> & Readonly<{ direction?: Direction }>

export type Bundle<Value extends string = string> = Readonly<{
  view: View<Model, Message, ViewInputs<Value>>
  update: RadioGroupPrimitive.Bundle<Value>['update']
}>

/** Maps a pressed key onto the primitive's orientation axis: APG radio
 * groups move with both arrow axes, inline arrows follow `direction`. */
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

type KeyDownHandler = (key: string, modifiers: unknown) => unknown

const isKeyDownAttribute = (
  value: unknown,
): value is Readonly<{ _tag: 'OnKeyDownPreventDefault'; f: KeyDownHandler }> =>
  typeof value === 'object' &&
  value !== null &&
  '_tag' in value &&
  value._tag === 'OnKeyDownPreventDefault' &&
  'f' in value &&
  typeof value.f === 'function'

const withOrientationKeys = (
  attribute: ChildAttribute,
  toKey: (key: string) => string,
): ChildAttribute => {
  const value = attribute.attribute
  if (!isKeyDownAttribute(value)) return attribute
  const f: KeyDownHandler = (key, modifiers) => value.f(toKey(key), modifiers)
  return { ...attribute, attribute: { ...value, f } }
}

/** Binds the Value union once, like the primitive's `create`. */
export const create = <Value extends string = string>(): Bundle<Value> => {
  const primitive = RadioGroupPrimitive.create<Value>()
  const view = ((model, { direction = 'ltr', ...inputs }, h) => {
    const toKey = toOrientationKey(inputs.orientation ?? 'Vertical', direction)
    return primitive.view(
      model,
      {
        ...inputs,
        toView: render =>
          inputs.toView({
            ...render,
            options: render.options.map(option => ({
              ...option,
              option: option.option.map(attribute =>
                withOrientationKeys(attribute, toKey),
              ),
            })),
          }),
      },
      h,
    )
  }) as Bundle<Value>['view']
  return { view, update: primitive.update }
}

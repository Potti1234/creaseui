import { Option } from 'effect'
import type {
  Attribute,
  ChildAttribute,
  Html,
  HtmlBuilder,
  KeyboardModifiers,
} from 'foldkit/html'
import { RadioGroup as RadioGroupPrimitive } from '@foldkit/ui'

export type RadioGroupOption = Readonly<{
  value: string
  label: Html | string
  description?: Html | string
  isDisabled?: boolean
  isInvalid?: boolean
}>

export const Model = RadioGroupPrimitive.Model
export type Model = typeof Model.Type
export const Message = RadioGroupPrimitive.Message
export type Message = typeof Message.Type
export type OutMessage = RadioGroupPrimitive.OutMessage<string>
export const init = RadioGroupPrimitive.init
const StringRadioGroup = RadioGroupPrimitive.create<string>()
export const update = StringRadioGroup.update

export type RadioGroupBehaviorProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  selectedValue: Option.Option<string>
  ariaLabel: string
  options: ReadonlyArray<RadioGroupOption>
  isDisabled?: boolean
  isReadOnly?: boolean
  name?: string
  orientation?: RadioGroupPrimitive.Orientation
  direction?: 'ltr' | 'rtl'
}>

type OptionState = Readonly<{
  index: number
  isSelected: boolean
  isDisabled: boolean
  isReadOnly: boolean
}>

const childAttributeTag = (attribute: ChildAttribute): string | undefined => {
  const value = attribute.attribute
  return typeof value === 'object' && value !== null && '_tag' in value &&
      typeof value._tag === 'string'
    ? value._tag
    : undefined
}

export type RadioGroupVisualAttributes<Msg> = Readonly<{
  group: ReadonlyArray<Attribute<Msg>>
  row: ReadonlyArray<Attribute<Msg>>
  item: (state: OptionState) => ReadonlyArray<Attribute<Msg>>
  indicator: ReadonlyArray<Attribute<Msg>>
  text: ReadonlyArray<Attribute<Msg>>
  label: ReadonlyArray<Attribute<Msg>>
  description: ReadonlyArray<Attribute<Msg>>
}>

export const renderRadioGroup = <Msg>(
  props: RadioGroupBehaviorProps<Msg>,
  visual: RadioGroupVisualAttributes<Msg>,
  toIndicator: (isSelected: boolean, h: HtmlBuilder<Msg>) => Html,
  h: HtmlBuilder<Msg>,
): Html =>
  h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: StringRadioGroup.view,
    viewInputs: {
      selectedValue: props.selectedValue,
      options: props.options.map((option) => option.value),
      ariaLabel: props.ariaLabel,
      isDisabled: props.isDisabled ?? false,
      isReadOnly: props.isReadOnly ?? false,
      isOptionDisabled: (_value, index) => props.options[index]?.isDisabled === true,
      hasOptionDescription: (_value, index) => props.options[index]?.description !== undefined,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.orientation === undefined ? {} : { orientation: props.orientation }),
      toView: ({ group, options, hiddenInput }) => {
        // Base UI composite keynav: all four arrows move regardless of the
        // rendered orientation, horizontal arrows flip under rtl, disabled
        // options are skipped and navigation wraps. An arrow press held with
        // Meta/Ctrl/Alt, or one that resolves back to the already-focused
        // option, falls through unhandled (no preventDefault).
        const focusedIndex =
          options.find((option) => option.isActive)?.index ?? 0
        const isRtl = props.direction === 'rtl'
        const horizontalForwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight'
        const horizontalBackwardKey = isRtl ? 'ArrowRight' : 'ArrowLeft'
        const isDisabledIndex = (index: number): boolean =>
          options[index]?.isDisabled !== false
        const wrapIndex = (index: number): number =>
          ((index % options.length) + options.length) % options.length
        const findEnabledIndex = (
          startIndex: number,
          direction: 1 | -1,
        ): number => {
          for (let step = 0; step < options.length; step++) {
            const index = wrapIndex(startIndex + step * direction)
            if (!isDisabledIndex(index)) return index
          }
          return focusedIndex
        }
        const firstEnabledIndex = findEnabledIndex(0, 1)
        const lastEnabledIndex = findEnabledIndex(options.length - 1, -1)
        const resolveNavIndex = (key: string): number | undefined => {
          if (key === 'ArrowDown' || key === horizontalForwardKey)
            return findEnabledIndex(focusedIndex + 1, 1)
          if (key === 'ArrowUp' || key === horizontalBackwardKey)
            return findEnabledIndex(focusedIndex - 1, -1)
          if (key === 'Home' || key === 'PageUp') return firstEnabledIndex
          if (key === 'End' || key === 'PageDown') return lastEnabledIndex
          return undefined
        }
        const isReadOnly = props.isReadOnly ?? false
        const selectedOptionAt = (index: number): Option.Option<Msg> =>
          Option.fromNullishOr(options[index]?.value).pipe(
            Option.map((value) =>
              props.toParentMessage(
                RadioGroupPrimitive.Message.SelectedOption({ index, value }),
              ),
            ),
          )
        const handleKeyDown =
          (currentIndex: number) =>
          (key: string, modifiers: KeyboardModifiers): Option.Option<Msg> => {
            if (modifiers.metaKey || modifiers.ctrlKey || modifiers.altKey)
              return Option.none()
            const navIndex = resolveNavIndex(key)
            if (navIndex !== undefined) {
              if (navIndex === focusedIndex) return Option.none()
              return isReadOnly
                ? Option.some(
                    props.toParentMessage(
                      RadioGroupPrimitive.Message.FocusedOption({
                        index: navIndex,
                      }),
                    ),
                  )
                : selectedOptionAt(navIndex)
            }
            return key === ' ' && !isReadOnly
              ? selectedOptionAt(currentIndex)
              : Option.none()
          }
        return h.div(
          [
            ...group,
            h.DataAttribute('slot', 'radio-group'),
            ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
            ...(props.isDisabled === true
              ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
              : []),
            ...visual.group,
          ],
          [
            ...options.map((option) => {
              const content = props.options[option.index]
              if (content === undefined) return h.empty
              return h.div([...visual.row], [
                h.button(
                  [
                    ...option.option.filter(
                      (attribute) =>
                        childAttributeTag(attribute) !==
                          'OnKeyDownPreventDefault' &&
                        (content.description !== undefined ||
                          childAttributeTag(attribute) !== 'AriaDescribedBy'),
                    ),
                    ...(option.isDisabled
                      ? []
                      : [
                          h.OnKeyDownPreventDefault(
                            handleKeyDown(option.index),
                          ),
                        ]),
                    h.Type('button'),
                    h.DataAttribute('slot', 'radio-group-item'),
                    ...(content.isInvalid === true ? [h.AriaInvalid(true)] : []),
                    ...visual.item(option),
                  ],
                  [
                    h.span(
                      [h.DataAttribute('slot', 'radio-group-indicator'), ...visual.indicator],
                      [toIndicator(option.isSelected, h)],
                    ),
                  ],
                ),
                h.div([...visual.text], [
                  h.label(
                    [
                      ...option.label,
                      h.For(`${props.model.id}-option-${String(option.index)}`),
                      ...visual.label,
                    ],
                    [content.label],
                  ),
                  ...(content.description === undefined
                    ? []
                    : [h.p([...option.description, ...visual.description], [content.description])]),
                ]),
              ])
            }),
            ...(props.name === undefined ? [] : [h.input([...hiddenInput])]),
          ],
        )
      },
    },
    toParentMessage: props.toParentMessage,
  })

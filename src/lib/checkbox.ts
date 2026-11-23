import { Option } from 'effect'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

export type CheckboxBehaviorProps<Msg> = Readonly<{
  id: string
  isChecked: boolean
  /** Optional only because a read-only checkbox is decorative and its
   *  toggle can never fire. */
  onToggle?: (isChecked: boolean) => Msg
  label?: Html | string
  description?: Html | string
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  isIndeterminate?: boolean
  name?: string
  value?: string
}>

export type CheckboxVisualAttributes<Msg> = Readonly<{
  root: ReadonlyArray<Attribute<Msg>>
  control: ReadonlyArray<Attribute<Msg>>
  indicator: ReadonlyArray<Attribute<Msg>>
  text: ReadonlyArray<Attribute<Msg>>
  label: ReadonlyArray<Attribute<Msg>>
  description: ReadonlyArray<Attribute<Msg>>
}>

const canToggle = <Msg>(props: CheckboxBehaviorProps<Msg>): boolean =>
  props.isDisabled !== true && props.isReadOnly !== true

const toggle = <Msg>(props: CheckboxBehaviorProps<Msg>): Msg => {
  if (props.onToggle === undefined)
    throw new Error('checkbox: a toggleable checkbox needs onToggle')
  return props.onToggle(!props.isChecked)
}

export const checkboxControlAttributes = <Msg>(
  props: CheckboxBehaviorProps<Msg>,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Attribute<Msg>> => {
  return [
    h.Type('button'),
    h.Role('checkbox'),
    h.AriaChecked(props.isIndeterminate === true ? 'mixed' : props.isChecked),
    h.Tabindex(0),
    ...(props.isIndeterminate === true
      ? [h.DataAttribute('indeterminate', '')]
      : props.isChecked
        ? [h.DataAttribute('checked', '')]
        : []),
    ...(props.isDisabled === true
      ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
      : []),
    ...(props.isReadOnly === true
      ? [h.AriaReadonly(true), h.DataAttribute('readonly', '')]
      : []),
    ...(canToggle(props)
      ? [
          h.OnClick(toggle(props)),
          h.OnKeyUpPreventDefault(key =>
            key === ' ' ? Option.some(toggle(props)) : Option.none(),
          ),
        ]
      : []),
  ]
}

export const renderCheckbox = <Msg>(
  props: CheckboxBehaviorProps<Msg>,
  visual: CheckboxVisualAttributes<Msg>,
  indicator: Html,
  h: HtmlBuilder<Msg>,
): Html => {
  const labelId = `${props.id}-label`
  const descriptionId = `${props.id}-description`
  const label = [
    h.Id(labelId),
    ...(canToggle(props) ? [h.OnClick(toggle(props))] : []),
  ]
  const description = [h.Id(descriptionId)]
  const hiddenInput = props.name
    ? [
        h.Type('hidden'),
        h.Name(props.name),
        h.Value(props.isChecked ? (props.value ?? 'on') : ''),
      ]
    : []
  return h.div(
    [h.DataAttribute('slot', 'checkbox-field'), ...visual.root],
    [
      h.button(
        [
          ...checkboxControlAttributes(props, h),
          h.Id(props.id),
          h.AriaLabelledBy(labelId),
          ...(props.description === undefined
            ? []
            : [h.AriaDescribedBy(descriptionId)]),
          h.DataAttribute('slot', 'checkbox'),
          h.AriaInvalid(props.isInvalid ?? false),
          ...visual.control,
        ],
        [
          h.span(
            [
              h.DataAttribute('slot', 'checkbox-indicator'),
              ...visual.indicator,
            ],
            [indicator],
          ),
        ],
      ),
      ...(props.label === undefined && props.description === undefined
        ? []
        : [
            h.div(
              [...visual.text],
              [
                ...(props.label === undefined
                  ? []
                  : [h.label([...label, ...visual.label], [props.label])]),
                ...(props.description === undefined
                  ? []
                  : [
                      h.p(
                        [...description, ...visual.description],
                        [props.description],
                      ),
                    ]),
              ],
            ),
          ]),
      ...(props.name === undefined ? [] : [h.input([...hiddenInput])]),
    ],
  )
}

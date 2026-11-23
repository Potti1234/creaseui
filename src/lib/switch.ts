import { Option } from 'effect'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

export type SwitchBehaviorProps<Msg> = Readonly<{
  id: string
  isChecked: boolean
  onToggle: (isChecked: boolean) => Msg
  label?: Html | string
  description?: Html | string
  /** For a switch without an internal label, e.g. an icon-only control. */
  ariaLabel?: string
  /** IDs of externally composed labels/descriptions. Internal labels use switchIds(id). */
  labelledBy?: string
  describedBy?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  name?: string
  value?: string
  direction?: 'ltr' | 'rtl'
}>

export const switchIds = (
  id: string,
): Readonly<{
  controlId: string
  labelId: string
  descriptionId: string
}> => ({
  controlId: `${id}-control`,
  labelId: `${id}-label`,
  descriptionId: `${id}-description`,
})

export type SwitchVisualAttributes<Msg> = Readonly<{
  root: ReadonlyArray<Attribute<Msg>>
  control: ReadonlyArray<Attribute<Msg>>
  thumb: ReadonlyArray<Attribute<Msg>>
  text: ReadonlyArray<Attribute<Msg>>
  label: ReadonlyArray<Attribute<Msg>>
  description: ReadonlyArray<Attribute<Msg>>
}>

export const renderSwitch = <Msg>(
  props: SwitchBehaviorProps<Msg>,
  visual: SwitchVisualAttributes<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const canToggle = props.isDisabled !== true && props.isReadOnly !== true
  const labelId = `${props.id}-label`
  const descriptionId = `${props.id}-description`
  const nextMessage = () => props.onToggle(!props.isChecked)
  const button = [
    h.Role('switch'),
    h.AriaChecked(props.isChecked),
    h.AriaLabelledBy(labelId),
    ...(props.description === undefined
      ? []
      : [h.AriaDescribedBy(descriptionId)]),
    h.Tabindex(0),
    ...(props.isChecked ? [h.DataAttribute('checked', '')] : []),
    ...(props.isDisabled === true
      ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
      : []),
    ...(props.isReadOnly === true
      ? [h.AriaReadonly(true), h.DataAttribute('readonly', '')]
      : []),
    ...(canToggle
      ? [
          h.OnClick(nextMessage()),
          h.OnKeyUpPreventDefault(key =>
            key === ' ' ? Option.some(nextMessage()) : Option.none(),
          ),
        ]
      : []),
  ]
  const label = [
    h.Id(labelId),
    ...(canToggle ? [h.OnClick(nextMessage())] : []),
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
    [
      h.DataAttribute('slot', 'switch-field'),
      ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
      ...visual.root,
    ],
    [
      h.button(
        [
          h.Id(switchIds(props.id).controlId),
          ...button.filter(attribute => {
            if (attribute._tag === 'AriaLabelledBy')
              return (
                props.ariaLabel === undefined && props.labelledBy === undefined
              )
            if (attribute._tag === 'AriaDescribedBy')
              return (
                props.description !== undefined &&
                props.describedBy === undefined
              )
            return true
          }),
          ...(props.labelledBy === undefined
            ? []
            : [h.AriaLabelledBy(props.labelledBy)]),
          ...(props.ariaLabel === undefined
            ? []
            : [h.AriaLabel(props.ariaLabel)]),
          ...(props.describedBy === undefined
            ? []
            : [h.AriaDescribedBy(props.describedBy)]),
          h.Type('button'),
          h.DataAttribute('slot', 'switch'),
          ...((props.isInvalid ?? false) ? [h.AriaInvalid(true)] : []),
          ...visual.control,
        ],
        [
          h.span(
            [h.DataAttribute('slot', 'switch-thumb'), ...visual.thumb],
            [],
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
                  : [
                      h.label(
                        [
                          h.For(switchIds(props.id).controlId),
                          ...label,
                          ...visual.label,
                        ],
                        [props.label],
                      ),
                    ]),
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

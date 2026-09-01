import { Checkbox as CheckboxPrimitive } from '@foldkit/ui'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

export type CheckboxBehaviorProps<Msg> = Readonly<{
  id: string
  isChecked: boolean
  onToggle: (isChecked: boolean) => Msg
  label: Html | string
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

export const renderCheckbox = <Msg>(
  props: CheckboxBehaviorProps<Msg>,
  visual: CheckboxVisualAttributes<Msg>,
  indicator: Html,
  h: HtmlBuilder<Msg>,
): Html =>
  CheckboxPrimitive.view(
    {
      id: props.id,
      isChecked: props.isChecked,
      onToggle: props.onToggle,
      isDisabled: props.isDisabled ?? false,
      isReadOnly: props.isReadOnly ?? false,
      isIndeterminate: props.isIndeterminate ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.value === undefined ? {} : { value: props.value }),
      toView: ({ checkbox, label, description, hiddenInput }) =>
        h.div(
          [h.DataAttribute('slot', 'checkbox-field'), ...visual.root],
          [
            h.button(
              [
                ...checkbox.filter(
                  (attribute) =>
                    props.description !== undefined ||
                    attribute._tag !== 'AriaDescribedBy',
                ),
                h.Type('button'),
                h.DataAttribute('slot', 'checkbox'),
                h.AriaInvalid(props.isInvalid ?? false),
                ...visual.control,
              ],
              [
                h.span(
                  [h.DataAttribute('slot', 'checkbox-indicator'), ...visual.indicator],
                  [indicator],
                ),
              ],
            ),
            h.div([...visual.text], [
              h.label([...label, ...visual.label], [props.label]),
              ...(props.description === undefined
                ? []
                : [h.p([...description, ...visual.description], [props.description])]),
            ]),
            ...(props.name === undefined ? [] : [h.input([...hiddenInput])]),
          ],
        ),
    },
    h,
  )

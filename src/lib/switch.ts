import { Switch as SwitchPrimitive } from '@foldkit/ui'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

export type SwitchBehaviorProps<Msg> = Readonly<{
  id: string
  isChecked: boolean
  onToggle: (isChecked: boolean) => Msg
  label: Html | string
  description?: Html | string
  isDisabled?: boolean
  isReadOnly?: boolean
  name?: string
  value?: string
  direction?: 'ltr' | 'rtl'
}>

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
): Html =>
  SwitchPrimitive.view(
    {
      id: props.id,
      isChecked: props.isChecked,
      onToggle: props.onToggle,
      isDisabled: props.isDisabled ?? false,
      isReadOnly: props.isReadOnly ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.value === undefined ? {} : { value: props.value }),
      toView: ({ button, label, description, hiddenInput }) =>
        h.div(
          [
            h.DataAttribute('slot', 'switch-field'),
            ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
            ...visual.root,
          ],
          [
            h.button(
              [
                ...button.filter(
                  (attribute) =>
                    props.description !== undefined ||
                    attribute._tag !== 'AriaDescribedBy',
                ),
                h.Type('button'),
                h.DataAttribute('slot', 'switch'),
                ...visual.control,
              ],
              [h.span([h.DataAttribute('slot', 'switch-thumb'), ...visual.thumb], [])],
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

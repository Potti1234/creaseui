import type {
  Attribute,
  Html,
  HtmlBuilder,
  TextareaAttribute,
} from 'foldkit/html'

export type ResizePolicy = 'none' | 'vertical' | 'horizontal' | 'both'
export type WrapPolicy = 'soft' | 'hard' | 'off'

export type TextareaBehaviorProps<Msg> = Readonly<{
  id: string
  value: string
  onInput?: (value: string) => Msg
  onChange?: (value: string) => Msg
  label?: Html | string
  description?: Html | string
  placeholder?: string
  name?: string
  form?: string
  rows?: number
  wrap?: WrapPolicy
  resize?: ResizePolicy
  describedBy?: string
  direction?: 'ltr' | 'rtl'
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  isAutofocus?: boolean
  /** Extra attributes for the textarea element itself, after crease's own:
   *  an event the props do not name (`h.OnBlur`, `h.OnKeyDown`), a data or
   *  ARIA attribute. */
  attributes?: ReadonlyArray<TextareaAttribute<Msg>>
}>

export type TextareaVisualAttributes<Msg> = Readonly<{
  field: ReadonlyArray<Attribute<Msg>>
  label: ReadonlyArray<Attribute<Msg>>
  textarea: ReadonlyArray<TextareaAttribute<Msg>>
  description: ReadonlyArray<Attribute<Msg>>
}>

const descriptionIds = <Msg>(
  props: TextareaBehaviorProps<Msg>,
): string | undefined => {
  const ids = [
    ...(props.description === undefined ? [] : [`${props.id}-description`]),
    ...(props.describedBy === undefined ? [] : [props.describedBy]),
  ]

  return ids.length === 0 ? undefined : [...new Set(ids)].join(' ')
}

export const renderTextarea = <Msg>(
  props: TextareaBehaviorProps<Msg>,
  visual: TextareaVisualAttributes<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const isInteractive = props.isDisabled !== true && props.isReadOnly !== true
  const describedBy = descriptionIds(props)
  const control = h.textarea([
    h.Id(props.id),
    ...(props.isDisabled === true
      ? [h.Disabled(true), h.DataAttribute('disabled', '')]
      : []),
    ...(props.isReadOnly === true
      ? [h.Readonly(true), h.DataAttribute('readonly', '')]
      : []),
    ...(props.isInvalid === true
      ? [h.AriaInvalid(true), h.DataAttribute('invalid', '')]
      : []),
    ...(props.onInput === undefined || !isInteractive
      ? []
      : [h.OnInput(props.onInput)]),
    h.Value(props.value),
    ...(props.isAutofocus === true ? [h.Autofocus(true)] : []),
    ...(props.name === undefined ? [] : [h.Name(props.name)]),
    ...(props.rows === undefined ? [] : [h.Rows(props.rows)]),
    ...(props.placeholder === undefined
      ? []
      : [h.Placeholder(props.placeholder)]),
    h.DataAttribute('slot', 'textarea'),
    h.DataAttribute('resize', props.resize ?? 'vertical'),
    ...(props.onChange === undefined || !isInteractive
      ? []
      : [h.OnChange(props.onChange)]),
    ...(props.form === undefined ? [] : [h.FormAttr(props.form)]),
    ...(props.wrap === undefined ? [] : [h.Wrap(props.wrap)]),
    ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
    ...(describedBy === undefined ? [] : [h.AriaDescribedBy(describedBy)]),
    ...visual.textarea,
    ...(props.attributes ?? []),
  ])

  if (props.label === undefined && props.description === undefined)
    return control

  return h.div(
    [
      h.DataAttribute('slot', 'textarea-field'),
      h.DataAttribute('state', props.isInvalid === true ? 'invalid' : 'valid'),
      ...visual.field,
    ],
    [
      ...(props.label === undefined
        ? []
        : [
            h.label(
              [
                h.DataAttribute('slot', 'textarea-label'),
                h.For(props.id),
                ...visual.label,
              ],
              [props.label],
            ),
          ]),
      control,
      ...(props.description === undefined
        ? []
        : [
            h.p(
              [
                h.DataAttribute('slot', 'textarea-description'),
                h.Id(`${props.id}-description`),
                ...visual.description,
              ],
              [props.description],
            ),
          ]),
    ],
  )
}

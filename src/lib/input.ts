import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import * as InputHints from './behaviors/input-hints'

export type InputMode =
  | 'none'
  | 'text'
  | 'decimal'
  | 'numeric'
  | 'tel'
  | 'search'
  | 'email'
  | 'url'

export type InputBehaviorProps<Msg> = Readonly<{
  id: string
  value: string
  onInput?: (value: string) => Msg
  onChange?: (value: string) => Msg
  label?: Html | string
  description?: Html | string
  placeholder?: string
  type?: string
  name?: string
  form?: string
  autocomplete?: string
  inputMode?: InputMode
  hintKind?: InputHints.Kind
  enterKeyHint?: InputHints.EnterKeyHint
  describedBy?: string
  /** Extra WAI-ARIA role for composite inputs (e.g. 'searchbox', 'combobox'). */
  role?: string
  ariaLabel?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  isAutofocus?: boolean
  isRequired?: boolean
  /** Extra attributes for the input element itself, after crease's own: an
   *  event the props do not name (`h.OnBlur`, `h.OnKeyDown`), a data or ARIA
   *  attribute. */
  attributes?: ReadonlyArray<Attribute<Msg>>
}>

export type InputVisualAttributes<Msg> = Readonly<{
  field: ReadonlyArray<Attribute<Msg>>
  label: ReadonlyArray<Attribute<Msg>>
  input: ReadonlyArray<Attribute<Msg>>
  description: ReadonlyArray<Attribute<Msg>>
}>

const descriptionIds = <Msg>(
  props: InputBehaviorProps<Msg>,
): string | undefined => {
  const ids = [
    ...(props.description === undefined ? [] : [`${props.id}-description`]),
    ...(props.describedBy === undefined ? [] : [props.describedBy]),
  ]

  return ids.length === 0 ? undefined : [...new Set(ids)].join(' ')
}

export const renderInput = <Msg>(
  props: InputBehaviorProps<Msg>,
  visual: InputVisualAttributes<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const isInteractive = props.isDisabled !== true && props.isReadOnly !== true
  const describedBy = descriptionIds(props)
  const control = h.input([
    h.Id(props.id),
    h.Type(props.type ?? 'text'),
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
    ...(props.placeholder === undefined
      ? []
      : [h.Placeholder(props.placeholder)]),
    h.DataAttribute('slot', 'input'),
    ...(props.onChange === undefined || !isInteractive
      ? []
      : [h.OnChange(props.onChange)]),
    ...(props.isRequired === true
      ? [h.Required(true), h.AriaRequired(true)]
      : []),
    ...(props.form === undefined ? [] : [h.FormAttr(props.form)]),
    ...(props.hintKind === undefined
      ? [
          ...(props.autocomplete === undefined
            ? []
            : [h.Autocomplete(props.autocomplete)]),
          ...(props.inputMode === undefined
            ? []
            : [h.InputMode(props.inputMode)]),
          ...(props.enterKeyHint === undefined
            ? []
            : [h.EnterKeyHint(props.enterKeyHint)]),
        ]
      : InputHints.attributes(props.hintKind, h, {
          ...(props.autocomplete === undefined
            ? {}
            : { autocomplete: props.autocomplete }),
          ...(props.inputMode === undefined ? {} : { mode: props.inputMode }),
          ...(props.enterKeyHint === undefined
            ? {}
            : { enter: props.enterKeyHint }),
        })),
    ...(props.role === undefined ? [] : [h.Role(props.role)]),
    ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]),
    ...(describedBy === undefined ? [] : [h.AriaDescribedBy(describedBy)]),
    ...visual.input,
    ...(props.attributes ?? []),
  ])

  if (props.label === undefined && props.description === undefined)
    return control

  return h.div(
    [
      h.DataAttribute('slot', 'input-field'),
      h.DataAttribute('state', props.isInvalid === true ? 'invalid' : 'valid'),
      ...visual.field,
    ],
    [
      ...(props.label === undefined
        ? []
        : [
            h.label(
              [
                h.DataAttribute('slot', 'input-label'),
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
                h.DataAttribute('slot', 'input-description'),
                h.Id(`${props.id}-description`),
                ...visual.description,
              ],
              [props.description],
            ),
          ]),
    ],
  )
}

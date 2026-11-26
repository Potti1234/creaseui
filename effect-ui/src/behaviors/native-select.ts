import type { Html } from '@effect/ui/html'

export type NativeSelectOption = {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

export type NativeSelectGroup = {
  readonly label: string
  readonly options: readonly NativeSelectOption[]
  readonly disabled?: boolean
}

export type NativeSelectBehaviorProps<Msg, R = never> = {
  readonly value: string
  readonly onChange?: (value: string) => Msg
  readonly options?: readonly NativeSelectOption[]
  readonly groups?: readonly NativeSelectGroup[]
  readonly element?: Html.Element<
    Msg,
    R,
    Html.EventsOf<'select'>,
    HTMLSelectElement,
    'select'
  >
}

export const NativeSelectBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    value,
    onChange,
    options = [],
    groups = [],
    element = h.select,
  }: NativeSelectBehaviorProps<NoInfer<Msg>, R>,
) => {
  const option = ({ value: key, label, disabled }: NativeSelectOption) =>
    h.option
      .key(key)
      .attrs({
        value: key,
        disabled: disabled ? '' : undefined,
        selected: key === value ? '' : undefined,
        'data-slot': 'native-select-option',
      })
      .children(label)
  const control = element.value(value).attr('data-slot', 'native-select')
  return (
    onChange === undefined
      ? control
      : control.on('change', ({ value }) => onChange(value))
  ).children(
    options.map(option),
    groups.map(({ label, disabled, options }) =>
      h.optgroup
        .key(label)
        .attrs({
          label,
          disabled: disabled ? '' : undefined,
          'data-slot': 'native-select-optgroup',
        })
        .children(options.map(option)),
    ),
  )
}

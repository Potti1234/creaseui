import type { Html } from '@effect/ui/html'

export type TextareaBehaviorProps<Msg, R = never> = {
  readonly value: string
  readonly onInput?: (value: string) => Msg
  readonly onChange?: (value: string) => Msg
  readonly disabled?: boolean
  readonly readOnly?: boolean
  readonly element?: Html.Element<
    Msg,
    R,
    Html.EventsOf<'textarea'>,
    HTMLTextAreaElement,
    'textarea'
  >
}

export const TextareaBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    value,
    onInput,
    onChange,
    disabled,
    readOnly,
    element = h.textarea,
  }: TextareaBehaviorProps<NoInfer<Msg>, R>,
) => {
  const inactive = disabled || readOnly
  let control = element.value(value).attrs({
    disabled:
      disabled === undefined
        ? element.elementAttrs.disabled
        : disabled
          ? ''
          : undefined,
    readonly:
      readOnly === undefined
        ? element.elementAttrs.readonly
        : readOnly
          ? ''
          : undefined,
    'data-disabled': disabled ? '' : undefined,
    'data-readonly': readOnly ? '' : undefined,
    'data-slot': 'textarea',
  })
  if (!inactive && onInput !== undefined)
    control = control.on('input', ({ value }) => onInput(value))
  if (!inactive && onChange !== undefined)
    control = control.on('change', ({ value }) => onChange(value))
  return control
}

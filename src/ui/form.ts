import { type Html, html } from 'foldkit/html'

import * as Field from '@/ui/field'
import { cn } from '@/lib/utils'

type Slot = Readonly<{ class?: string; children: ReadonlyArray<Html | string> }>

export type FormProps<Msg> = Slot & Readonly<{ onSubmit?: Msg; ariaLabel?: string }>

export const form = <Msg>(props: FormProps<Msg>): Html => {
  const h = html<Msg>()
  return h.form(
    [
      h.DataAttribute('slot', 'form'),
      ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]),
      ...(props.onSubmit === undefined ? [] : [h.OnSubmit(props.onSubmit)]),
      h.Class(cn('space-y-6', props.class)),
    ],
    [...props.children],
  )
}

export type FormItemProps = Slot & Readonly<{ id: string; isInvalid?: boolean; isDisabled?: boolean }>

export const formItem = <Msg>(props: FormItemProps): Html =>
  Field.field<Msg>({
    ...(props.isInvalid === undefined ? {} : { isInvalid: props.isInvalid }),
    ...(props.isDisabled === undefined ? {} : { isDisabled: props.isDisabled }),
    ...(props.class === undefined ? {} : { class: props.class }),
    children: props.children,
  })

export type FormLabelProps = Slot & Readonly<{ for: string }>

export const formLabel = <Msg>(props: FormLabelProps): Html =>
  Field.fieldLabel<Msg>({
    for: props.for,
    ...(props.class === undefined ? {} : { class: props.class }),
    children: props.children,
  })

export type FormDescriptionProps = Slot & Readonly<{ id?: string }>

export const formDescription = <Msg>(props: FormDescriptionProps): Html => {
  const h = html<Msg>()
  return h.p(
    [
      ...(props.id === undefined ? [] : [h.Id(props.id)]),
      h.DataAttribute('slot', 'form-description'),
      h.Class(cn('text-sm text-muted-foreground', props.class)),
    ],
    [...props.children],
  )
}

export type FormMessageProps = Readonly<{
  id?: string
  class?: string
  message?: string
  errors?: ReadonlyArray<Field.FieldError>
}>

export const formMessage = <Msg>(props: FormMessageProps = {}): Html => {
  const h = html<Msg>()
  const content = Field.fieldError<Msg>({
    ...(props.class === undefined ? {} : { class: props.class }),
    children: props.message === undefined ? [] : [props.message],
    ...(props.errors === undefined ? {} : { errors: props.errors }),
  })

  return props.id === undefined
    ? content
    : h.div([h.Id(props.id), h.DataAttribute('slot', 'form-message')], [content])
}

export const formControlIds = (id: string): Readonly<{
  descriptionId: string
  messageId: string
  describedBy: string
}> => {
  const descriptionId = `${id}-description`
  const messageId = `${id}-message`
  return { descriptionId, messageId, describedBy: `${descriptionId} ${messageId}` }
}

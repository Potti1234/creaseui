import { type Html, html } from 'foldkit/html'

import { Checkbox as CheckboxPrimitive } from '@foldkit/ui'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

export const Model = CheckboxPrimitive.Model
export type Model = typeof Model.Type
export const Message = CheckboxPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = CheckboxPrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = CheckboxPrimitive.init
export const update = CheckboxPrimitive.update
export const setChecked = CheckboxPrimitive.setChecked
export const reflectChecked = CheckboxPrimitive.reflectChecked

const CHECKBOX_CLASS =
  "peer group size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[checked]:bg-primary"

const INDICATOR_CLASS =
  'hidden place-content-center text-current transition-none group-data-[checked]:grid group-data-[indeterminate]:grid'

const LABEL_CLASS =
  'text-sm leading-none font-medium select-none peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-50'

const DESCRIPTION_CLASS = 'text-muted-foreground text-sm'

export type CheckboxProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  label: string
  description?: string
  isDisabled?: boolean
  isIndeterminate?: boolean
  name?: string
  value?: string
  class?: string
}>

export const checkbox = <Msg>(props: CheckboxProps<Msg>): Html => {
  const h = html<Msg>()

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: CheckboxPrimitive.view,
    viewInputs: {
      isDisabled: props.isDisabled ?? false,
      isIndeterminate: props.isIndeterminate ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.value === undefined ? {} : { value: props.value }),
      toView: ({ checkbox: checkboxAttributes, label, description, hiddenInput }) => {
        const hc = html<Message>()

        return hc.div(
          [hc.Class('flex items-start gap-2')],
          [
            hc.button(
              [
                ...checkboxAttributes,
                hc.Type('button'),
                hc.DataAttribute('slot', 'checkbox'),
                hc.Class(cn(CHECKBOX_CLASS, props.class)),
              ],
              [
                hc.span(
                  [
                    hc.DataAttribute('slot', 'checkbox-indicator'),
                    hc.Class(INDICATOR_CLASS),
                  ],
                  [Icon.check<Message>({ class: 'size-3.5' })],
                ),
              ],
            ),
            hc.div(
              [hc.Class('grid gap-1.5')],
              [
                hc.label([...label, hc.Class(LABEL_CLASS)], [props.label]),
                ...(props.description === undefined
                  ? []
                  : [
                      hc.p(
                        [...description, hc.Class(DESCRIPTION_CLASS)],
                        [props.description],
                      ),
                    ]),
              ],
            ),
            ...(props.name === undefined ? [] : [hc.input([...hiddenInput])]),
          ],
        )
      },
    },
    toParentMessage: props.toParentMessage,
  })
}

/*
Model: { checkbox: Checkbox.init({ id: 'terms' }) }
Update: Checkbox.update(model.checkbox, message)
View: Checkbox.checkbox({ model: model.checkbox, toParentMessage: GotCheckboxMessage, label: 'Accept terms' })
*/

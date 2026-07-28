import { type Html, html } from 'foldkit/html'

import { RadioGroup as RadioGroupPrimitive } from '@foldkit/ui'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

export const Model = RadioGroupPrimitive.Model
export type Model = typeof Model.Type
export const Message = RadioGroupPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = RadioGroupPrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = RadioGroupPrimitive.init

const StringRadioGroup = RadioGroupPrimitive.create<string>()

export const update = StringRadioGroup.update
export const select = StringRadioGroup.select
export const reflectSelectedValue = StringRadioGroup.reflectSelectedValue

const GROUP_CLASS = 'grid gap-3'

const ITEM_CLASS =
  'group aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40'

const INDICATOR_CLASS =
  'relative hidden items-center justify-center group-data-[checked]:flex'

const LABEL_CLASS = 'text-sm leading-none font-medium select-none'

const DESCRIPTION_CLASS = 'text-muted-foreground text-sm'

export type RadioGroupOption = Readonly<{
  value: string
  label: string
  description?: string
}>

export type RadioGroupProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  ariaLabel: string
  options: ReadonlyArray<RadioGroupOption>
  isDisabled?: boolean
  name?: string
  orientation?: RadioGroupPrimitive.Orientation
  class?: string
}>

export const radioGroup = <Msg>(props: RadioGroupProps<Msg>): Html => {
  const h = html<Msg>()

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: StringRadioGroup.view,
    viewInputs: {
      options: props.options.map(option => option.value),
      ariaLabel: props.ariaLabel,
      isDisabled: props.isDisabled ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.orientation === undefined
        ? {}
        : { orientation: props.orientation }),
      toView: ({ group, options, hiddenInput }) => {
        const hr = html<Message>()

        return hr.div(
          [
            ...group,
            hr.DataAttribute('slot', 'radio-group'),
            hr.Class(cn(GROUP_CLASS, props.class)),
          ],
          [
            ...options.map(option => {
              const content = props.options[option.index]

              if (content === undefined) {
                return hr.span([], [])
              }

              return hr.div(
                [hr.Class('flex items-start gap-2')],
                [
                  hr.button(
                    [
                      ...option.option,
                      hr.Type('button'),
                      hr.DataAttribute('slot', 'radio-group-item'),
                      hr.Class(ITEM_CLASS),
                    ],
                    [
                      hr.span(
                        [
                          hr.DataAttribute(
                            'slot',
                            'radio-group-indicator',
                          ),
                          hr.Class(INDICATOR_CLASS),
                        ],
                        [
                          Icon.circleIcon<Message>({
                            class:
                              'absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary',
                          }),
                        ],
                      ),
                    ],
                  ),
                  hr.div(
                    [hr.Class('grid gap-1.5')],
                    [
                      hr.label(
                        [...option.label, hr.Class(LABEL_CLASS)],
                        [content.label],
                      ),
                      ...(content.description === undefined
                        ? []
                        : [
                            hr.p(
                              [
                                ...option.description,
                                hr.Class(DESCRIPTION_CLASS),
                              ],
                              [content.description],
                            ),
                          ]),
                    ],
                  ),
                ],
              )
            }),
            ...(props.name === undefined ? [] : [hr.input([...hiddenInput])]),
          ],
        )
      },
    },
    toParentMessage: props.toParentMessage,
  })
}

/*
Model: { plan: RadioGroup.init({ id: 'plan', selectedValue: 'basic' }) }
Update: RadioGroup.update(model.plan, message)
View: RadioGroup.radioGroup({ model: model.plan, toParentMessage: GotRadioMessage, ariaLabel: 'Plan', options: [{ value: 'basic', label: 'Basic' }] })
*/

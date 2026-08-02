import { Option } from 'effect'
import { type Html, html } from 'foldkit/html'

import { RadioGroup as RadioGroupPrimitive } from '@foldkit/ui'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

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
  id: string
  selectedValue: Option.Option<string>
  onSelect: (value: string) => Msg
  ariaLabel: string
  options: ReadonlyArray<RadioGroupOption>
  isDisabled?: boolean
  name?: string
  orientation?: RadioGroupPrimitive.Orientation
  class?: string
}>

export const radioGroup = <Msg>(props: RadioGroupProps<Msg>): Html => {
  const h = html<Msg>()

  return RadioGroupPrimitive.view({
      id: props.id,
      selectedValue: props.selectedValue,
      onSelect: props.onSelect,
      options: props.options.map(option => option.value),
      ariaLabel: props.ariaLabel,
      isDisabled: props.isDisabled ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.orientation === undefined
        ? {}
        : { orientation: props.orientation }),
      toView: ({ group, options, hiddenInput }) => {
        return h.div(
          [
            ...group,
            h.DataAttribute('slot', 'radio-group'),
            h.Class(cn(GROUP_CLASS, props.class)),
          ],
          [
            ...options.map(option => {
              const content = props.options[option.index]

              if (content === undefined) {
                return h.span([], [])
              }

              return h.div(
                [h.Class('flex items-start gap-2')],
                [
                  h.button(
                    [
                      ...option.option,
                      h.Type('button'),
                      h.DataAttribute('slot', 'radio-group-item'),
                      h.Class(ITEM_CLASS),
                    ],
                    [
                      h.span(
                        [
                          h.DataAttribute(
                            'slot',
                            'radio-group-indicator',
                          ),
                          h.Class(INDICATOR_CLASS),
                        ],
                        [
                          Icon.circleIcon<Msg>({
                            class:
                              'absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary',
                          }),
                        ],
                      ),
                    ],
                  ),
                  h.div(
                    [h.Class('grid gap-1.5')],
                    [
                      h.label(
                        [...option.label, h.Class(LABEL_CLASS)],
                        [content.label],
                      ),
                      ...(content.description === undefined
                        ? []
                        : [
                            h.p(
                              [
                                ...option.description,
                                h.Class(DESCRIPTION_CLASS),
                              ],
                              [content.description],
                            ),
                          ]),
                    ],
                  ),
                ],
              )
            }),
            ...(props.name === undefined ? [] : [h.input([...hiddenInput])]),
          ],
        )
      },
  })
}

/*
Model: { selectedPlan: 'basic' }
Update: store the value emitted by onSelect in selectedPlan
View: RadioGroup.radioGroup({ model: model.plan, toParentMessage: GotRadioMessage, ariaLabel: 'Plan', options: [{ value: 'basic', label: 'Basic' }] })
*/

import { type Html, html } from 'foldkit/html'

import { Switch as SwitchPrimitive } from '@foldkit/ui'

import { cn } from '@/lib/utils'

export const Model = SwitchPrimitive.Model
export type Model = typeof Model.Type
export const Message = SwitchPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = SwitchPrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = SwitchPrimitive.init
export const update = SwitchPrimitive.update
export const setChecked = SwitchPrimitive.setChecked
export const reflectChecked = SwitchPrimitive.reflectChecked

export type SwitchSize = 'sm' | 'default'

const SWITCH_CLASS =
  'peer group inline-flex shrink-0 items-center rounded-full border border-transparent bg-input shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[checked]:bg-primary dark:bg-input/80 dark:data-[checked]:bg-primary'

const THUMB_CLASS =
  'pointer-events-none block translate-x-0 rounded-full bg-background ring-0 transition-transform group-data-[size=default]:size-4 group-data-[size=sm]:size-3 group-data-[checked]:translate-x-[calc(100%-2px)] dark:bg-foreground dark:group-data-[checked]:bg-primary-foreground'

const LABEL_CLASS =
  'text-sm leading-none font-medium select-none peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-50'

const DESCRIPTION_CLASS = 'text-muted-foreground text-sm'

export type SwitchProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  label: string
  description?: string
  size?: SwitchSize
  isDisabled?: boolean
  name?: string
  value?: string
  class?: string
}>

export const switchControl = <Msg>(props: SwitchProps<Msg>): Html => {
  const h = html<Msg>()
  const size = props.size ?? 'default'

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: SwitchPrimitive.view,
    viewInputs: {
      isDisabled: props.isDisabled ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.value === undefined ? {} : { value: props.value }),
      toView: ({ button, label, description, hiddenInput }) => {
        const hs = html<Message>()

        return hs.div(
          [hs.Class('flex items-start gap-2')],
          [
            hs.button(
              [
                ...button,
                hs.Type('button'),
                hs.DataAttribute('slot', 'switch'),
                hs.DataAttribute('size', size),
                hs.Class(cn(SWITCH_CLASS, props.class)),
              ],
              [
                hs.span(
                  [
                    hs.DataAttribute('slot', 'switch-thumb'),
                    hs.Class(THUMB_CLASS),
                  ],
                  [],
                ),
              ],
            ),
            hs.div(
              [hs.Class('grid gap-1.5')],
              [
                hs.label([...label, hs.Class(LABEL_CLASS)], [props.label]),
                ...(props.description === undefined
                  ? []
                  : [
                      hs.p(
                        [...description, hs.Class(DESCRIPTION_CLASS)],
                        [props.description],
                      ),
                    ]),
              ],
            ),
            ...(props.name === undefined ? [] : [hs.input([...hiddenInput])]),
          ],
        )
      },
    },
    toParentMessage: props.toParentMessage,
  })
}

export { switchControl as switch }

/*
Model: { notifications: Switch.init({ id: 'notifications' }) }
Update: Switch.update(model.notifications, message)
View: Switch.switch({ model: model.notifications, toParentMessage: GotSwitchMessage, label: 'Notifications' })
*/

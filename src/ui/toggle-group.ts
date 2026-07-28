import { type Html, html } from 'foldkit/html'

import { Button as ButtonPrimitive } from '@foldkit/ui'

import { cn } from '@/lib/utils'
import { type ToggleVariants, toggleVariants } from '@/ui/toggle'

export type ToggleGroupItem = Readonly<{
  value: string
  children: ReadonlyArray<Html | string>
  isDisabled?: boolean
  class?: string
}>

type SingleSelection = Readonly<{
  value: string
  values?: never
}>

type MultipleSelection = Readonly<{
  value?: never
  values: ReadonlyArray<string>
}>

export type ToggleGroupProps<Msg> = Readonly<{
  items: ReadonlyArray<ToggleGroupItem>
  onToggle: (itemValue: string) => Msg
  variant?: ToggleVariants['variant']
  size?: ToggleVariants['size']
  class?: string
}> &
  (SingleSelection | MultipleSelection)

const GROUP_CLASS =
  'group/toggle-group flex w-fit items-center gap-0 rounded-md data-[variant=outline]:shadow-xs'

const ITEM_CLASS =
  'w-auto min-w-0 shrink-0 rounded-none px-3 shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 first:data-[variant=outline]:border-l'

export const toggleGroup = <Msg>(props: ToggleGroupProps<Msg>): Html => {
  const h = html<Msg>()
  const variant = props.variant ?? 'default'
  const size = props.size ?? 'default'
  const selectedValues =
    props.values === undefined ? [props.value] : props.values

  return h.div(
    [
      h.DataAttribute('slot', 'toggle-group'),
      h.DataAttribute('variant', variant),
      h.DataAttribute('size', size),
      h.DataAttribute('spacing', '0'),
      h.Class(cn(GROUP_CLASS, props.class)),
    ],
    props.items.map(item =>
      ButtonPrimitive.view({
        onClick: props.onToggle(item.value),
        isDisabled: item.isDisabled ?? false,
        type: 'button',
        toView: ({ button }) =>
          h.button(
            [
              ...button,
              h.DataAttribute('slot', 'toggle-group-item'),
              h.DataAttribute('variant', variant),
              h.DataAttribute('size', size),
              h.DataAttribute('spacing', '0'),
              h.AriaPressed(
                selectedValues.includes(item.value) ? 'true' : 'false',
              ),
              h.Class(
                cn(
                  toggleVariants({ variant, size }),
                  ITEM_CLASS,
                  item.class,
                ),
              ),
            ],
            [...item.children],
          ),
      }),
    ),
  )
}

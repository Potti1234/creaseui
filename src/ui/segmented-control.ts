/* Ported from Meta Astryx SegmentedControl (packages/core/src/SegmentedControl/SegmentedControl.tsx, SegmentedControlItem.tsx) — examples and visual spec adapted to Crease UI tokens.
   PORT-NOTE: astryx's forced-colors overrides (Highlight/HighlightText on the selected
   segment) are dropped — no Crease theme color maps them, and system colors are banned
   by the design-system lint. */

import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  type Bundle as BehaviorBundle,
  Message,
  Model,
  type OutMessage,
  create as createBehavior,
  init,
  type SegmentedControlOptionState,
} from '@/lib/segmented-control'
import { cn } from '@/lib/utils'

export { Message, Model, init }
export type { OutMessage }

export type SegmentedControlSize = 'sm' | 'md' | 'lg'
export type SegmentedControlLayout = 'hug' | 'fill'

export type SegmentedControlItem<Value extends string = string> = Readonly<{
  value: Value
  /** Visible label; also the accessible name when `isLabelHidden` is set. */
  label: string
  /** Icon element displayed before the label. */
  icon?: Html
  isLabelHidden?: boolean
  isDisabled?: boolean
}>

export type SegmentedControlProps<Value extends string, Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  /** The currently selected value (controlled). */
  value: Value
  /** Accessible label for the radio group (used as aria-label, never rendered visually). */
  ariaLabel: string
  options: ReadonlyArray<SegmentedControlItem<Value>>
  size?: SegmentedControlSize
  layout?: SegmentedControlLayout
  isDisabled?: boolean
  /** Renders a hidden form input carrying the selected value. */
  name?: string
  class?: string
}>

const GROUP_CLASS =
  'inline-flex w-fit items-center gap-0.5 rounded-[calc(var(--radius)-2px)] bg-muted p-0.5 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[layout=fill]:flex data-[layout=fill]:w-full'

const ITEM_BASE_CLASS =
  'relative inline-flex cursor-pointer items-center justify-center gap-1 rounded-[calc(var(--radius)-4px)] border-0 bg-transparent [font-family:inherit] font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,box-shadow] duration-150 ease-in-out outline-hidden select-none focus-visible:ring-3 focus-visible:ring-ring/50 not-data-[checked]:not-aria-disabled:hover:bg-foreground/5 aria-disabled:cursor-default aria-disabled:opacity-50 data-[checked]:bg-background data-[checked]:text-foreground data-[checked]:font-semibold data-[checked]:shadow-sm data-[layout=fill]:min-w-0 data-[layout=fill]:flex-1'

const ITEM_SIZE_CLASS: Readonly<Record<SegmentedControlSize, string>> = {
  sm: 'h-6 px-2 text-xs',
  md: 'h-7 px-3 text-sm',
  lg: 'h-8 px-3 text-sm',
}

const ICON_BOX_CLASS: Readonly<Record<SegmentedControlSize, string>> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-[18px]',
}

const renderSegmentedControl = <Value extends string, Msg>(
  behavior: BehaviorBundle<Value>,
  props: SegmentedControlProps<Value, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const size = props.size ?? 'md'
  const layout = props.layout ?? 'hug'
  const isDisabled = props.isDisabled ?? false

  return behavior.render(
    {
      model: props.model,
      toParentMessage: props.toParentMessage,
      selectedValue: Option.some(props.value),
      ariaLabel: props.ariaLabel,
      isDisabled,
      options: props.options.map(option => ({
        value: option.value,
        ...(option.isDisabled === true ? { isDisabled: true } : {}),
      })),
      ...(props.name === undefined ? {} : { name: props.name }),
    },
    {
      group: [
        h.DataAttribute('slot', 'segmented-control'),
        h.DataAttribute('size', size),
        h.DataAttribute('layout', layout),
        ...(isDisabled
          ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
          : []),
        h.Class(cn(GROUP_CLASS, props.class)),
      ],
    },
    (option, ht) => {
      const content = props.options[option.index]
      if (content === undefined) return ht.empty
      return ht.button(
        [
          ...option.attributes,
          ht.DataAttribute('slot', 'segmented-control-item'),
          ht.DataAttribute('value', content.value),
          ht.DataAttribute('layout', layout),
          ht.Class(cn(ITEM_BASE_CLASS, ITEM_SIZE_CLASS[size])),
        ],
        [
          ...(content.icon === undefined
            ? []
            : [
                ht.span(
                  [
                    ht.DataAttribute('slot', 'segmented-control-item-icon'),
                    ht.Class(
                      cn(
                        'inline-flex shrink-0 items-center justify-center [&_svg]:size-full',
                        ICON_BOX_CLASS[size],
                      ),
                    ),
                  ],
                  [content.icon],
                ),
              ]),
          ht.span(
            [
              ...option.labelAttributes,
              ht.Class(
                content.isLabelHidden === true
                  ? 'sr-only'
                  : 'min-w-0 overflow-hidden text-ellipsis',
              ),
            ],
            [content.label],
          ),
        ],
      )
    },
    h,
  )
}

export type SegmentedControlBundle<Value extends string> = Readonly<{
  update: ReturnType<typeof createBehavior<Value>>['update']
  segmentedControl: <Msg>(
    props: SegmentedControlProps<Value, Msg>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

export const create = <
  Value extends string = string,
>(): SegmentedControlBundle<Value> => {
  const behavior = createBehavior<Value>()
  return {
    update: behavior.update,
    segmentedControl: (props, h) => renderSegmentedControl(behavior, props, h),
  }
}

const StringBundle = create<string>()
export const update = StringBundle.update
export const segmentedControl = StringBundle.segmentedControl

/* Ported from Meta Astryx SegmentedControl (packages/core/src/SegmentedControl/SegmentedControl.tsx, SegmentedControlItem.tsx) — examples and visual spec adapted to Crease UI tokens. */

import * as stylex from '@stylexjs/stylex'
import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { ComponentLayoutStyle } from './contracts'
import {
  type Bundle as BehaviorBundle,
  Message,
  Model,
  type OutMessage,
  create as createBehavior,
  init,
  type SegmentedControlOptionState,
} from '@/lib/segmented-control'
import { foundationTokens } from './foundations-tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { tokens } from './tokens.stylex'
import { className } from './style'

export { Message, Model, init }
export type { OutMessage }

/* PORT-NOTE: needs tokens 'forcedColorSurface' = Highlight and
   'forcedColorInk' = HighlightText — the selected segment's Windows
   forced-colors override cannot be expressed through Crease's token set. */

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
  layoutStyle?: ComponentLayoutStyle
}>

const styles = stylex.create({
  group: {
    padding: '0.125rem',
    borderRadius: foundationTokens.radiusMd,
    gap: '0.125rem',
    alignItems: 'center',
    backgroundColor: tokens.muted,
    display: 'inline-flex',
    width: 'fit-content',
  },
  groupFill: {
    display: 'flex',
    width: '100%',
  },
  groupDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  item: {
    borderRadius: foundationTokens.radiusSm,
    borderStyle: 'none',
    borderWidth: 0,
    gap: '0.25rem',
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover:not(:is([data-checked], [aria-disabled="true"]))': foundationTokens.foregroundSoft,
      ':is([data-checked])': tokens.background,
    },
    boxShadow: { default: 'none', ':is([data-checked])': foundationTokens.shadowSm },
    color: { default: tokens.mutedForeground, ':is([data-checked])': tokens.foreground },
    cursor: { default: interactionTokens.cursorAction, ':is([aria-disabled="true"])': interactionTokens.cursorDefault },
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontWeight: { default: 500, ':is([data-checked])': 600 },
    justifyContent: 'center',
    opacity: { default: 1, ':is([aria-disabled="true"])': 0.5 },
    outlineColor: { default: 'transparent', ':focus-visible': tokens.ring },
    outlineOffset: { default: null, ':focus-visible': '-1px' },
    outlineStyle: { default: null, ':focus-visible': 'solid' },
    outlineWidth: { default: null, ':focus-visible': '3px' },
    position: 'relative',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, box-shadow',
    transitionTimingFunction: interactionTokens.easingStandard,
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  itemFill: {
    flexBasis: '0%',
    flexGrow: '1',
    flexShrink: '1',
    justifyContent: 'center',
    minWidth: 0,
  },
  itemIcon: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
  },
  itemLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  itemLabelHidden: {
    margin: '-1px',
    padding: 0,
    borderWidth: 0,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    clipPath: 'inset(50%)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: '1px',
    width: '1px',
  },
  itemSizeSm: {
    paddingInline: '0.5rem',
    fontSize: '0.75rem', lineHeight: '1rem',
    height: '1.5rem',
  },
  itemSizeMd: {
    paddingInline: '0.75rem',
    fontSize: '0.875rem', lineHeight: '1.25rem',
    height: '1.75rem',
  },
  itemSizeLg: {
    paddingInline: '0.75rem',
    fontSize: '0.875rem', lineHeight: '1.25rem',
    height: '2rem',
  },
  iconSizeSm: { height: '0.875rem', width: '0.875rem' },
  iconSizeMd: { height: '1rem', width: '1rem' },
  iconSizeLg: { height: '1.125rem', width: '1.125rem' },
})

const ITEM_SIZE_STYLE: Readonly<Record<SegmentedControlSize, unknown>> = {
  sm: styles.itemSizeSm,
  md: styles.itemSizeMd,
  lg: styles.itemSizeLg,
}

const ICON_SIZE_STYLE: Readonly<Record<SegmentedControlSize, unknown>> = {
  sm: styles.iconSizeSm,
  md: styles.iconSizeMd,
  lg: styles.iconSizeLg,
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
      options: props.options.map((option) => ({
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
        ...(isDisabled ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')] : []),
        h.Class(
          className(
            styles.group,
            layout === 'fill' && styles.groupFill,
            isDisabled && styles.groupDisabled,
            props.layoutStyle,
          ),
        ),
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
          ht.Class(
            className(
              styles.item,
              ITEM_SIZE_STYLE[size] as ComponentLayoutStyle,
              layout === 'fill' && styles.itemFill,
            ),
          ),
        ],
        [
          ...(content.icon === undefined
            ? []
            : [
                ht.span(
                  [
                    ht.DataAttribute('slot', 'segmented-control-item-icon'),
                    ht.Class(
                      className(styles.itemIcon, ICON_SIZE_STYLE[size] as ComponentLayoutStyle),
                    ),
                  ],
                  [content.icon],
                ),
              ]),
          ht.span(
            [
              ...option.labelAttributes,
              ht.Class(
                className(
                  content.isLabelHidden === true ? styles.itemLabelHidden : styles.itemLabel,
                ),
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

export const create = <Value extends string = string>(): SegmentedControlBundle<Value> => {
  const behavior = createBehavior<Value>()
  return {
    update: behavior.update,
    segmentedControl: (props, h) => renderSegmentedControl(behavior, props, h),
  }
}

const StringBundle = create<string>()
export const update = StringBundle.update
export const segmentedControl = StringBundle.segmentedControl

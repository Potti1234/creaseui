/* Ported from Meta Astryx CheckboxList + CheckboxListItem
   (packages/core/src/CheckboxList) — examples and visual spec adapted to
   Crease UI tokens.

   PORT-NOTE: astryx's tint-hover overlays (border/box tint on row hover) are
   approximated with color-mix() over Crease tokens; duration-fast (130ms) maps
   to interactionTokens.motionFast (150ms); ease-standard maps to
   interactionTokens.easingStandard. */

import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  renderCheckboxList,
  renderCheckboxListItem,
  type CheckboxListDensity,
  type CheckboxListEntry,
  type CheckboxListItem,
  type CheckboxListItemState,
  type CheckboxListItemVisualAttributes,
  type CheckboxListProps,
} from '@/lib/checkbox-list'
import * as Icon from '@/lib/icon'
import { statusIconName } from '@/lib/input-status'

import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { className } from './style'
import { tokens } from './tokens.stylex'

export type {
  CheckboxListDensity,
  CheckboxListEntry,
  CheckboxListItem,
  CheckboxListProps,
}
export { checkboxListDivider } from '@/lib/checkbox-list'
export type { InputStatus } from '@/lib/input-status'

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
})

const styles = stylex.create({
  field: {
    gap: '0.25rem',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  label: {
    color: tokens.mutedForeground,
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
  },
  labelDisabled: {
    opacity: 0.5,
  },
  srOnly: {
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: '1px',
    width: '1px',
  },
  labelIndicator: {
    fontSize: '0.75rem',
    fontWeight: 400,
  },
  description: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
  },
  list: {
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
  },
  listGap: {
    gap: '0.125rem',
  },
  divider: {
    marginInline: '0.5rem',
    backgroundColor: tokens.border,
    height: '1px',
  },
  itemRoot: {
    borderRadius: foundationTokens.radiusMd,
    gap: '0.5rem',
    paddingInline: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    fontSize: '0.875rem',
    position: 'relative',
  },
  itemCompact: {
    paddingBlock: '0.25rem',
  },
  itemBalanced: {
    paddingBlock: '0.5rem',
  },
  itemSpacious: {
    paddingBlock: '0.75rem',
    paddingInline: '0.75rem',
  },
  itemInteractive: {
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.accent,
    },
    cursor: interactionTokens.cursorAction,
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  itemSelected: {
    backgroundColor: {
      default: `color-mix(in oklab, ${tokens.primary} 20%, transparent)`,
      ':hover': `color-mix(in oklab, ${tokens.primary} 25%, transparent)`,
    },
  },
  itemDisabled: {
    cursor: interactionTokens.cursorDefault,
    pointerEvents: 'none',
  },
  itemDivided: {
    borderBlockEndColor: {
      default: tokens.border,
      ':last-child': 'transparent',
    },
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: {
      default: 1,
      ':last-child': 0,
    },
  },
  controlBase: {
    borderRadius: foundationTokens.checkboxRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    outlineStyle: 'none',
    position: 'relative',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'background-color, border-color, box-shadow',
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  controlSm: {
    height: '1.25rem',
    width: '1.25rem',
  },
  controlMd: {
    height: '1.5rem',
    width: '1.5rem',
  },
  controlUnchecked: {
    borderColor: {
      default: tokens.input,
      ':focus-visible': tokens.ring,
      ':hover': `color-mix(in oklab, ${tokens.input}, ${tokens.foreground} 20%)`,
    },
    backgroundColor: {
      default: tokens.background,
      ':hover': tokens.muted,
    },
    boxShadow: {
      default: tokens.shadowNone,
      ':focus-visible': tokens.focusRingShadow,
    },
  },
  controlChecked: {
    borderColor: {
      default: tokens.primary,
      ':focus-visible': tokens.ring,
      ':hover': `color-mix(in oklab, ${tokens.primary}, ${tokens.foreground} 15%)`,
    },
    backgroundColor: {
      default: tokens.primary,
      ':hover': `color-mix(in oklab, ${tokens.primary}, ${tokens.foreground} 15%)`,
    },
    boxShadow: {
      default: tokens.shadowNone,
      ':focus-visible': tokens.focusRingShadow,
    },
    color: tokens.primaryForeground,
  },
  controlDisabled: {
    borderColor: {
      default: tokens.border,
      ':hover': tokens.border,
    },
    backgroundColor: {
      default: tokens.muted,
      ':hover': tokens.muted,
    },
    opacity: 0.5,
  },
  itemContent: {
    gap: 0,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
  itemLabel: {
    color: tokens.foreground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  itemDescription: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
  },
  contentDisabled: {
    opacity: 0.5,
  },
  endContent: {
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
  indicatorBar: {
    borderRadius: foundationTokens.radiusFull,
    backgroundColor: tokens.primaryForeground,
    display: 'block',
    height: '0.125rem',
    width: '0.625rem',
  },
  checkIcon: {
    display: 'block',
    height: '1rem',
    width: '1rem',
  },
  checkIconSm: {
    height: '0.75rem',
    width: '0.75rem',
  },
  checkHidden: {
    opacity: 0,
  },
  statusRoot: {
    padding: '0.5rem',
    borderRadius: foundationTokens.radiusLg,
    gap: '0.25rem',
    alignItems: 'flex-start',
    display: 'flex',
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
    marginBlockStart: '0.25rem',
  },
  statusError: {
    backgroundColor: `color-mix(in oklab, ${tokens.destructive} 10%, transparent)`,
    color: tokens.destructive,
  },
  statusWarning: {
    backgroundColor: `color-mix(in oklab, ${tokens.alertWarning} 15%, transparent)`,
    color: tokens.alertWarning,
  },
  statusSuccess: {
    backgroundColor: `color-mix(in oklab, ${tokens.alertSuccess} 15%, transparent)`,
    color: tokens.alertSuccess,
  },
  statusIcon: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    height: '1.25rem',
  },
  statusText: {
    flexGrow: 1,
  },
  spinner: {
    animationDuration: interactionTokens.motionLoopFast,
    animationIterationCount: 'infinite',
    animationName: spin,
    animationTimingFunction: interactionTokens.easingLinear,
    color: tokens.mutedForeground,
  },
})

const densityStyle: Record<CheckboxListDensity, stylex.StaticStyles> = {
  compact: styles.itemCompact,
  balanced: styles.itemBalanced,
  spacious: styles.itemSpacious,
}

const itemVisuals = <Msg>(
  density: CheckboxListDensity,
  isDisabledContext: boolean,
  h: HtmlBuilder<Msg>,
): CheckboxListItemVisualAttributes<Msg> => {
  const size = density === 'compact' ? 'sm' : 'md'
  return {
    root: (state) => [
      h.Class(
        className(
          styles.itemRoot,
          densityStyle[density],
          state.isInteractive &&
            !state.checked &&
            styles.itemInteractive,
          state.isInteractive &&
            state.checked &&
            !state.isDisabled &&
            styles.itemSelected,
          state.isDisabled && styles.itemDisabled,
        ),
      ),
    ],
    control: (state) => [
      h.Class(
        className(
          styles.controlBase,
          size === 'sm' ? styles.controlSm : styles.controlMd,
          state.checked || state.isIndeterminate
            ? styles.controlChecked
            : styles.controlUnchecked,
          state.isDisabled && styles.controlDisabled,
        ),
      ),
    ],
    content: [
      h.Class(
        className(styles.itemContent, isDisabledContext && styles.contentDisabled),
      ),
    ],
    label: [h.Class(className(styles.itemLabel))],
    description: [h.Class(className(styles.itemDescription))],
    endContent: [h.Class(className(styles.endContent))],
  }
}

const checkIndicator = <Msg>(
  item: CheckboxListItem<Msg>,
  density: CheckboxListDensity,
  state: CheckboxListItemState,
  h: HtmlBuilder<Msg>,
): Html => {
  const size = density === 'compact' ? 'sm' : 'md'
  if (item.isLoading === true) {
    return Icon.loaderCircle(
      {
        class: className(
          styles.spinner,
          size === 'sm' ? styles.checkIconSm : styles.checkIcon,
        ),
      },
      h,
    )
  }
  if (state.isIndeterminate) {
    return h.span([
      h.DataAttribute('slot', 'checkbox-list-item-indicator'),
      h.Class(className(styles.indicatorBar)),
    ])
  }
  return Icon.check(
    {
      class: className(
        size === 'sm' ? styles.checkIconSm : styles.checkIcon,
        state.checked ? undefined : styles.checkHidden,
      ),
    },
    h,
  )
}

export const checkboxListItem = <Msg>(
  item: CheckboxListItem<Msg>,
  h: HtmlBuilder<Msg>,
  options?: Readonly<{
    id?: string
    density?: CheckboxListDensity
    isDisabled?: boolean
    isReadOnly?: boolean
  }>,
): Html => {
  const density = options?.density ?? 'balanced'
  return renderCheckboxListItem(
    item,
    itemVisuals(density, options?.isDisabled === true, h),
    (state, hh) => checkIndicator(item, density, state, hh),
    h,
    {
      id: options?.id ?? 'checkbox-list-item',
      isDisabled: options?.isDisabled,
      isReadOnly: options?.isReadOnly,
    },
  )
}

export type CheckboxListUiProps<Msg> = CheckboxListProps<Msg> &
  Readonly<{ layoutStyle?: ComponentLayoutStyle }>

export const checkboxList = <Msg>(
  props: CheckboxListUiProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const density = props.density ?? 'balanced'
  const collection = { value: props.value, onChange: props.onChange }
  const visuals = itemVisuals(density, props.isDisabled === true, h)
  const visualWithDividers: CheckboxListItemVisualAttributes<Msg> = {
    ...visuals,
    root: (state) => [
      ...visuals.root(state),
      h.Class(className(props.hasDividers === true && styles.itemDivided)),
    ],
  }

  return renderCheckboxList(
    props,
    {
      field: [
        h.Class(className(styles.field, props.layoutStyle)),
      ],
      label: [
        h.Class(
          className(
            styles.label,
            props.isLabelHidden === true && styles.srOnly,
            props.isDisabled === true && styles.labelDisabled,
          ),
        ),
      ],
      labelIndicator: [h.Class(className(styles.labelIndicator))],
      description: [h.Class(className(styles.description))],
      group: [],
      list: [
        h.Class(className(styles.list, props.hasDividers !== true && styles.listGap)),
      ],
      divider: [h.Class(className(styles.divider))],
      status: {
        root: (type) => [
          h.Class(
            className(
              styles.statusRoot,
              type === 'error' && styles.statusError,
              type === 'warning' && styles.statusWarning,
              type === 'success' && styles.statusSuccess,
            ),
          ),
        ],
        icon: [h.Class(className(styles.statusIcon))],
        text: [h.Class(className(styles.statusText))],
      },
    },
    (item, index) =>
      renderCheckboxListItem(
        item,
        visualWithDividers,
        (state, hh) => checkIndicator(item, density, state, hh),
        h,
        {
          id: `${props.id}-item-${index}`,
          collection,
          isDisabled: props.isDisabled,
          isReadOnly: props.isReadOnly,
        },
      ),
    Icon.icon(
      statusIconName(props.status?.type ?? 'error'),
      { class: className(styles.checkIconSm) },
      h,
    ),
    h,
  )
}

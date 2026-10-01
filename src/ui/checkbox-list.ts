/* Ported from Meta Astryx CheckboxList + CheckboxListItem
   (packages/core/src/CheckboxList) — examples and visual spec adapted to
   Crease UI tokens. */

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
import { cn } from '@/lib/utils'

export type {
  CheckboxListDensity,
  CheckboxListEntry,
  CheckboxListItem,
  CheckboxListProps,
}
export { checkboxListDivider } from '@/lib/checkbox-list'
export type { InputStatus } from '@/lib/input-status'

const densityPadding: Record<CheckboxListDensity, string> = {
  compact: 'py-1',
  balanced: 'py-2',
  spacious: 'py-3',
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
        cn(
          'group/item relative flex items-center gap-2 px-2 text-sm',
          densityPadding[density],
          density === 'spacious' && 'px-3',
          'rounded-lg',
          state.isInteractive && 'cursor-pointer transition-colors duration-150',
          state.isInteractive && !state.checked && 'hover:bg-accent',
          state.checked && !state.isDisabled && 'bg-primary/20 hover:bg-primary/25',
          state.isDisabled && 'pointer-events-none',
        ),
      ),
    ],
    control: (state) => [
      h.Class(
        cn(
          'relative flex shrink-0 items-center justify-center rounded-[4px] border outline-none transition-[background-color,border-color,box-shadow] duration-150',
          size === 'sm' ? 'size-5' : 'size-6',
          state.checked || state.isIndeterminate
            ? 'border-primary bg-primary text-primary-foreground group-hover/item:border-[color-mix(in_oklab,var(--primary),var(--foreground)_15%)] group-hover/item:bg-[color-mix(in_oklab,var(--primary),var(--foreground)_15%)]'
            : 'border-input bg-background group-hover/item:bg-muted group-hover/item:border-[color-mix(in_oklab,var(--input),var(--foreground)_20%)]',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          state.isDisabled &&
            'group-hover/item:border-border group-hover/item:bg-muted border-border bg-muted opacity-50',
        ),
      ),
    ],
    content: [h.Class('flex min-w-0 flex-1 flex-col gap-0')],
    label: [
      h.Class(
        cn(
          'text-sm leading-5 text-foreground',
          isDisabledContext && 'opacity-50',
        ),
      ),
    ],
    description: [
      h.Class(
        cn(
          'text-xs leading-5 text-muted-foreground',
          isDisabledContext && 'opacity-50',
        ),
      ),
    ],
    endContent: [h.Class('shrink-0 ms-auto')],
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
        class: cn(
          size === 'sm' ? 'size-3' : 'size-4',
          'animate-spin text-muted-foreground',
        ),
      },
      h,
    )
  }
  if (state.isIndeterminate) {
    return h.span([
      h.DataAttribute('slot', 'checkbox-list-item-indicator'),
      h.Class('block h-0.5 w-2.5 rounded-full bg-primary-foreground'),
    ])
  }
  return Icon.check(
    {
      class: cn(size === 'sm' ? 'size-3' : 'size-4', state.checked ? '' : 'opacity-0'),
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
  Readonly<{ class?: string }>

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
      h.Class(
        cn(
          props.hasDividers === true &&
            'border-b border-border last:border-b-0',
        ),
      ),
    ],
  }

  return renderCheckboxList(
    props,
    {
      field: [h.Class(cn('flex w-full flex-col gap-1', props.class))],
      label: [
        h.Class(
          cn(
            'text-sm leading-5 font-medium text-muted-foreground',
            props.isLabelHidden === true && 'sr-only',
            props.isDisabled === true && 'opacity-50',
          ),
        ),
      ],
      labelIndicator: [h.Class('text-xs font-normal')],
      description: [h.Class('text-xs leading-5 text-muted-foreground')],
      group: [],
      list: [
        h.Class(
          cn(
            'm-0 flex list-none flex-col p-0',
            props.hasDividers === true ? 'gap-0' : 'gap-0.5',
          ),
        ),
      ],
      divider: [h.Class('mx-2 h-px bg-border')],
      status: {
        root: (type) => [
          h.Class(
            cn(
              'mt-1 flex items-start gap-1 rounded-lg p-2 text-xs leading-5',
              type === 'error' && 'bg-destructive/10 text-destructive',
              type === 'warning' && 'bg-chart-4/15 text-chart-4',
              type === 'success' && 'bg-chart-2/15 text-chart-2',
            ),
          ),
        ],
        icon: [h.Class('flex h-5 shrink-0 items-center')],
        text: [h.Class('flex-1')],
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
    Icon.icon(statusIconName(props.status?.type ?? 'error'), { class: 'size-3' }, h),
    h,
  )
}

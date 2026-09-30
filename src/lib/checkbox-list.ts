import { Checkbox as CheckboxPrimitive } from '@foldkit/ui'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import type { FieldStatusVisualAttributes, InputStatus } from '@/lib/input-status'
import { renderDetachedStatus } from '@/lib/input-status'

/* Ported from Meta Astryx CheckboxList + CheckboxListItem
   (packages/core/src/CheckboxList) — checkbox group with list semantics.
   Structure and props follow astryx; visuals arrive via renderer-supplied
   attribute bundles. */

export type CheckboxListDensity = 'compact' | 'balanced' | 'spacious'
export type CheckboxListSize = 'sm' | 'md'

export type CheckboxListItem<Msg> = Readonly<{
  /** Row label. Used as the checkbox's accessible name when `aria-label` is
     absent. */
  label: Html | string
  /** Collection-mode key. When the list's `value` is set, membership in it
     decides the checked state. */
  value?: string
  /** Standalone-mode checked state: true, false, or 'indeterminate'. */
  isChecked?: boolean | 'indeterminate'
  /** Standalone-mode toggle callback. */
  onToggle?: (isChecked: boolean) => Msg
  description?: Html | string
  endContent?: Html
  isDisabled?: boolean
  isReadOnly?: boolean
  isLoading?: boolean
  name?: string
  'aria-label'?: string
}>

/** Literal separator between rows (astryx `<Divider/>` inside the list). */
export type CheckboxListDivider = 'divider'
export const checkboxListDivider: CheckboxListDivider = 'divider'

export type CheckboxListEntry<Msg> = CheckboxListItem<Msg> | CheckboxListDivider
export const isCheckboxListDivider = <Msg>(
  entry: CheckboxListEntry<Msg>,
): entry is CheckboxListDivider => entry === 'divider'

export type CheckboxListCollectionProps<Msg> = Readonly<{
  /** Checked values for collection mode (astryx `value` + `onChange`). */
  value?: ReadonlyArray<string> | undefined
  onChange?: ((values: ReadonlyArray<string>) => Msg) | undefined
}>

/** Astrx CheckboxListItem checked resolution: context value → own isChecked → false. */
export const resolveItemChecked = <Msg>(
  collection: CheckboxListCollectionProps<Msg>,
  item: CheckboxListItem<Msg>,
): boolean | 'indeterminate' => {
  if (collection.value !== undefined && item.value !== undefined) {
    return collection.value.includes(item.value)
  }
  return item.isChecked ?? false
}

/** Resolves the toggle message: collection mode updates `value`, standalone
    mode calls the item's own `onToggle`. */
export const resolveItemToggle = <Msg>(
  collection: CheckboxListCollectionProps<Msg>,
  item: CheckboxListItem<Msg>,
  current: boolean | 'indeterminate',
): ((next: boolean) => Msg) | undefined => {
  const next = current !== true
  if (collection.value !== undefined && item.value !== undefined) {
    const onChange = collection.onChange
    if (onChange === undefined) return undefined
    const values = collection.value
    return () =>
      onChange(next ? [...values, item.value as string] : values.filter(v => v !== item.value))
  }
  const onToggle = item.onToggle
  return onToggle === undefined ? undefined : () => onToggle(next)
}

export type CheckboxListItemState = Readonly<{
  checked: boolean
  isIndeterminate: boolean
  isInteractive: boolean
  isDisabled: boolean
}>

export type CheckboxListVisualAttributes<Msg> = Readonly<{
  field: ReadonlyArray<Attribute<Msg>>
  label: ReadonlyArray<Attribute<Msg>>
  labelIndicator: ReadonlyArray<Attribute<Msg>>
  description: ReadonlyArray<Attribute<Msg>>
  group: ReadonlyArray<Attribute<Msg>>
  list: ReadonlyArray<Attribute<Msg>>
  divider: ReadonlyArray<Attribute<Msg>>
  status: FieldStatusVisualAttributes<Msg>
}>

export type CheckboxListItemVisualAttributes<Msg> = Readonly<{
  /** The focusable control — carries the bordered box visuals and the
      focus-visible ring, since focus lands on it. */
  root: (state: CheckboxListItemState) => ReadonlyArray<Attribute<Msg>>
  control: (state: CheckboxListItemState) => ReadonlyArray<Attribute<Msg>>
  content: ReadonlyArray<Attribute<Msg>>
  label: ReadonlyArray<Attribute<Msg>>
  description: ReadonlyArray<Attribute<Msg>>
  endContent: ReadonlyArray<Attribute<Msg>>
}>

export const checkboxListIds = (id: string) => ({
  label: `${id}-label`,
  description: `${id}-description`,
  status: `${id}-status`,
})

const isOnClick = <Msg>(attribute: Attribute<Msg>): boolean =>
  '_tag' in attribute && attribute._tag === 'OnClick'

/**
 * Standalone row (astryx `CheckboxListItem`): a single tab stop whose whole
 * row delegates clicks to the checkbox control. The control's own click is
 * re-registered with propagation stopped so it does not also fire the row's
 * delegated handler.
 */
export const renderCheckboxListItem = <Msg>(
  item: CheckboxListItem<Msg>,
  visual: CheckboxListItemVisualAttributes<Msg>,
  toIndicator: (state: CheckboxListItemState, h: HtmlBuilder<Msg>) => Html,
  h: HtmlBuilder<Msg>,
  options: Readonly<{
    id: string
    collection?: CheckboxListCollectionProps<Msg>
    isDisabled?: boolean | undefined
    isReadOnly?: boolean | undefined
  }>,
): Html => {
  const checked = resolveItemChecked(options.collection ?? {}, item)
  const isIndeterminate = checked === 'indeterminate'
  const isDisabled =
    options.isDisabled === true || item.isDisabled === true || item.isLoading === true
  const isReadOnly = options.isReadOnly === true || item.isReadOnly === true
  const toggle = resolveItemToggle(options.collection ?? {}, item, checked)
  const isInteractive = !isDisabled && !isReadOnly && toggle !== undefined
  const state: CheckboxListItemState = {
    checked: checked === true,
    isIndeterminate,
    isInteractive,
    isDisabled,
  }
  const ariaLabel = item['aria-label'] ?? (typeof item.label === 'string' ? item.label : undefined)

  return CheckboxPrimitive.view(
    {
      id: options.id,
      isChecked: checked === true,
      isIndeterminate,
      isDisabled: isDisabled || !isInteractive,
      isReadOnly,
      hasDescription: item.description !== undefined,
      /* Non-interactive rows force the primitive's isDisabled, so the
         required onToggle can never dispatch when toggle is absent. */
      onToggle: toggle as (isChecked: boolean) => Msg,
      ...(item.name === undefined ? {} : { name: item.name }),
      ...(item.value === undefined ? {} : { value: item.value }),
      toView: ({ checkbox, description, hiddenInput }) =>
        h.li(
          [
            h.DataAttribute('slot', 'checkbox-list-item'),
            ...(isInteractive && toggle !== undefined
              ? [h.OnClick(toggle(checked !== true), { propagation: 'Bubble' })]
              : []),
            ...visual.root(state),
          ],
          [
            h.button(
              [
                ...checkbox.filter(attribute => !isOnClick(attribute)),
                ...(isInteractive && toggle !== undefined
                  ? [h.OnClick(toggle(checked !== true), { propagation: 'Stop' })]
                  : []),
                ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
                h.DataAttribute('slot', 'checkbox-list-item-control'),
                ...visual.control(state),
              ],
              [toIndicator(state, h)],
            ),
            h.div([h.DataAttribute('slot', 'checkbox-list-item-content'), ...visual.content], [
              h.span(
                [
                  h.Id(CheckboxPrimitive.labelId(options.id)),
                  h.DataAttribute('slot', 'checkbox-list-item-label'),
                  ...visual.label,
                ],
                [item.label],
              ),
              ...(item.description === undefined
                ? []
                : [
                    h.p(
                      [
                        ...description,
                        h.DataAttribute('slot', 'checkbox-list-item-description'),
                        ...visual.description,
                      ],
                      [item.description],
                    ),
                  ]),
            ]),
            ...(item.endContent === undefined
              ? []
              : [
                  h.div(
                    [h.DataAttribute('slot', 'checkbox-list-item-end-content'), ...visual.endContent],
                    [item.endContent],
                  ),
                ]),
            ...(item.name === undefined ? [] : [h.input([...hiddenInput])]),
          ],
        ),
    },
    h,
  )
}

export type CheckboxListProps<Msg> = CheckboxListCollectionProps<Msg> &
  Readonly<{
    id: string
    label: Html | string
    items: ReadonlyArray<CheckboxListEntry<Msg>>
    isLabelHidden?: boolean
    description?: Html | string
    status?: InputStatus
    density?: CheckboxListDensity
    hasDividers?: boolean
    isDisabled?: boolean
    isReadOnly?: boolean
    isOptional?: boolean
    isRequired?: boolean
    size?: CheckboxListSize
  }>

/**
 * The astryx CheckboxList field: optional group label/description/status
 * wrapped around the item `<ul>`. Rows are rendered by the caller-supplied
 * `renderItem` so each renderer keeps its own visuals.
 */
export const renderCheckboxList = <Msg>(
  props: CheckboxListProps<Msg>,
  visual: CheckboxListVisualAttributes<Msg>,
  renderItem: (item: CheckboxListItem<Msg>, index: number) => Html,
  statusIcon: Html,
  h: HtmlBuilder<Msg>,
): Html => {
  const ids = checkboxListIds(props.id)
  const describedBy =
    [
      props.description === undefined ? null : ids.description,
      props.status?.message === undefined ? null : ids.status,
    ]
      .filter(Boolean)
      .join(' ') || undefined
  const indicator =
    props.isOptional === true
      ? ' ∙ Optional'
      : props.isRequired === true
        ? ' ∙ Required'
        : undefined

  const rows: Array<Html> = []
  props.items.forEach((entry, index) => {
    rows.push(
      isCheckboxListDivider(entry)
        ? h.li(
            [
              h.Attribute('role', 'presentation'),
              h.DataAttribute('slot', 'checkbox-list-divider-item'),
            ],
            [h.div([...visual.divider])],
          )
        : renderItem(entry, index),
    )
  })

  return h.div(
    [h.DataAttribute('slot', 'checkbox-list'), ...visual.field],
    [
      ...(props.label === undefined && indicator === undefined
        ? []
        : [
            h.span(
              [
                h.Id(ids.label),
                h.DataAttribute('slot', 'checkbox-list-label'),
                ...visual.label,
              ],
              [
                props.label ?? '',
                ...(indicator === undefined
                  ? []
                  : [
                      h.span(
                        [
                          h.DataAttribute('slot', 'checkbox-list-label-indicator'),
                          h.Attribute('aria-hidden', 'true'),
                          ...visual.labelIndicator,
                        ],
                        [indicator],
                      ),
                    ]),
              ],
            ),
          ]),
      ...(props.description === undefined
        ? []
        : [
            h.p(
              [
                h.Id(ids.description),
                h.DataAttribute('slot', 'checkbox-list-description'),
                ...visual.description,
              ],
              [props.description],
            ),
          ]),
      h.div(
        [
          h.Attribute('role', 'group'),
          h.AriaLabelledBy(ids.label),
          ...(describedBy === undefined ? [] : [h.AriaDescribedBy(describedBy)]),
          h.DataAttribute('slot', 'checkbox-list-group'),
          ...visual.group,
        ],
        [
          h.ul(
            [
              h.DataAttribute('slot', 'checkbox-list-items'),
              ...visual.list,
            ],
            rows,
          ),
        ],
      ),
      ...(props.status?.message === undefined
        ? []
        : [renderDetachedStatus(props.status, visual.status, statusIcon, h, ids.status)]),
    ],
  )
}

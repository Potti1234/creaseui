import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  type Bundle as BehaviorBundle,
  Message,
  Model,
  type OutMessage,
  create as createBehavior,
  init,
} from '@/lib/toggle-group'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import type { ToggleVariants } from './toggle'
import { tokens } from './tokens.stylex'

export { Message, Model, init }
export type { OutMessage }

export type ToggleGroupItem<Value extends string = string> = Readonly<{
  value: Value
  children: ReadonlyArray<Html | string>
  ariaLabel?: string
  isDisabled?: boolean
  layoutStyle?: ComponentLayoutStyle
}>
type SingleSelection<Value extends string> = Readonly<{ value: Value; values?: never }>
type MultipleSelection<Value extends string> = Readonly<{ value?: never; values: ReadonlyArray<Value> }>
type SharedProps<Value extends string> = Readonly<{
  ariaLabel?: string
  items: ReadonlyArray<ToggleGroupItem<Value>>
  direction?: 'ltr' | 'rtl'
  arrangement?: 'joined' | 'wrapped'
  variant?: ToggleVariants['variant']
  size?: ToggleVariants['size']
  layoutStyle?: ComponentLayoutStyle
}> & (SingleSelection<Value> | MultipleSelection<Value>)
export type ToggleGroupProps<Value extends string, Msg> = SharedProps<Value> & Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  ariaLabel: string
}>
type LegacyToggleGroupProps<Value extends string, Msg> = SharedProps<Value> & Readonly<{
  onToggle: (value: Value) => Msg
}>

const styles = stylex.create({
  group: { borderRadius: foundationTokens.radiusMd, gap: 0, alignItems: 'center', display: 'flex', width: 'fit-content' },
  groupWrapped: { gap: '0.25rem', flexWrap: 'wrap' },
  outlineGroup: { boxShadow: foundationTokens.shadowXs },
  item: { borderColor: foundationTokens.transparent, borderRadius: '0px', borderStyle: 'solid', borderWidth: 0, gap: '0.5rem', paddingInline: '0.75rem', alignItems: 'center', backgroundColor: { default: foundationTokens.transparent, ':hover': foundationTokens.muted }, color: tokens.foreground, display: 'inline-flex', fontSize: '0.875rem', fontWeight: 500, justifyContent: 'center', height: '2.25rem', minWidth: 0 },
  itemWrapped: { borderRadius: foundationTokens.radiusMd },
  outline: { borderColor: tokens.input, borderWidth: 1 },
  pressed: { backgroundColor: tokens.accent, color: tokens.accentForeground },
  disabled: { opacity: 0.5, pointerEvents: 'none' },
  sm: { height: '2rem' },
  lg: { height: '2.5rem' },
})

const selectedValues = <Value extends string>(props: SharedProps<Value>): ReadonlyArray<Value> =>
  props.values === undefined ? [props.value] : props.values

const itemAttributes = <Value extends string, Msg>(
  props: SharedProps<Value>,
  item: ToggleGroupItem<Value>,
  isPressed: boolean,
  h: HtmlBuilder<Msg>,
) => {
  const variant = props.variant ?? 'default'
  const size = props.size ?? 'default'
  const wrapped = props.arrangement === 'wrapped'
  return [
    h.DataAttribute('slot', 'toggle-group-item'),
    h.DataAttribute('variant', variant),
    h.DataAttribute('size', size),
    h.AriaPressed(isPressed ? 'true' : 'false'),
    ...(item.ariaLabel === undefined ? [] : [h.AriaLabel(item.ariaLabel)]),
    h.Class(className(styles.item, wrapped && styles.itemWrapped, variant === 'outline' && styles.outline, size === 'sm' && styles.sm, size === 'lg' && styles.lg, isPressed && styles.pressed, item.isDisabled && styles.disabled, item.layoutStyle)),
  ]
}

const groupAttributes = <Value extends string, Msg>(props: SharedProps<Value>, h: HtmlBuilder<Msg>) => {
  const variant = props.variant ?? 'default'
  const size = props.size ?? 'default'
  const wrapped = props.arrangement === 'wrapped'
  return [
    h.DataAttribute('slot', 'toggle-group'),
    h.DataAttribute('variant', variant),
    h.DataAttribute('size', size),
    h.DataAttribute('arrangement', wrapped ? 'wrapped' : 'joined'),
    h.Class(className(styles.group, wrapped && styles.groupWrapped, variant === 'outline' && styles.outlineGroup, props.layoutStyle)),
  ]
}

const renderToggleGroup = <Value extends string, Msg>(behavior: BehaviorBundle<Value>, props: ToggleGroupProps<Value, Msg>, h: HtmlBuilder<Msg>): Html =>
  behavior.render(
    { model: props.model, toParentMessage: props.toParentMessage, selectedValues: selectedValues(props), items: props.items, ariaLabel: props.ariaLabel, ...(props.direction === undefined ? {} : { direction: props.direction }) },
    { group: groupAttributes(props, h), item: () => [] },
    (state, ht) => {
      const item = props.items.find((candidate) => candidate.value === state.value)
      return item === undefined ? ht.empty : ht.button([...state.attributes, ...(props.direction === undefined ? [] : [ht.Dir(props.direction)]), ...itemAttributes(props, item, state.isPressed, ht)], [...item.children])
    },
    h,
  )

const renderLegacy = <Value extends string, Msg>(props: LegacyToggleGroupProps<Value, Msg>, h: HtmlBuilder<Msg>): Html => {
  const selected = selectedValues(props)
  return h.div(
    [h.Role('group'), ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]), ...(props.direction === undefined ? [] : [h.Dir(props.direction)]), ...groupAttributes(props, h)],
    props.items.map((item) => h.button([h.Type('button'), h.OnClick(props.onToggle(item.value)), h.Disabled(item.isDisabled ?? false), ...itemAttributes(props, item, selected.includes(item.value), h)], [...item.children])),
  )
}

export type ToggleGroupBundle<Value extends string> = Readonly<{
  update: BehaviorBundle<Value>['update']
  toggleGroup: <Msg>(props: ToggleGroupProps<Value, Msg>, h: HtmlBuilder<Msg>) => Html
}>
export const create = <Value extends string = string>(): ToggleGroupBundle<Value> => {
  const behavior = createBehavior<Value>()
  return { update: behavior.update, toggleGroup: (props, h) => renderToggleGroup(behavior, props, h) }
}
const StringToggleGroup = create<string>()
export const update = StringToggleGroup.update
export function toggleGroup<Msg, Value extends string = string>(props: LegacyToggleGroupProps<Value, Msg>, h: HtmlBuilder<Msg>): Html
export function toggleGroup<Value extends string, Msg>(props: ToggleGroupProps<Value, Msg>, h: HtmlBuilder<Msg>): Html
export function toggleGroup<Msg>(props: ToggleGroupProps<string, Msg> | LegacyToggleGroupProps<string, Msg>, h: HtmlBuilder<Msg>): Html {
  return 'model' in props ? StringToggleGroup.toggleGroup(props, h) : renderLegacy(props, h)
}

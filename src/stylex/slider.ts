import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Slider as SliderPrimitive } from '@foldkit/ui'

import { normalizeRange, normalizeRangeValues, updateRangeValue } from '@/lib/slider'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

export const Model = SliderPrimitive.Model
export type Model = typeof Model.Type
export const Message = SliderPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = SliderPrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type
export const init = SliderPrimitive.init
export const update = SliderPrimitive.update
export const reflectRange = SliderPrimitive.reflectRange
export const snapAndClamp = SliderPrimitive.snapAndClamp
export const subscriptions = SliderPrimitive.subscriptions
export const subscriptionsForRoot = SliderPrimitive.subscriptionsForRoot
export const fractionOfValue = SliderPrimitive.fractionOfValue

const styles = stylex.create({
  control: { alignItems: 'center', display: 'flex', position: 'relative', touchAction: 'none', userSelect: 'none', width: '100%' },
  disabled: { opacity: 0.5 },
  filled: { backgroundColor: tokens.primary, position: 'absolute', height: '100%', },
  horizontal: { height: '1.25rem', width: '100%' },
  input: { margin: 0, appearance: 'none', backgroundColor: tokens.transparent, pointerEvents: 'none', position: 'absolute', },
  inputHorizontal: { transform: 'translateY(-50%)', height: '1rem', left: 0, right: 0, top: '50%', width: '100%', },
  inputVertical: { transform: 'translateX(-50%)', writingMode: 'vertical-lr', height: '100%', left: '50%', top: 0, width: '1rem', },
  label: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1, userSelect: 'none' },
  labeled: { gap: '0.5rem', display: 'grid', },
  range: { borderRadius: tokens.radius, backgroundColor: tokens.primary, position: 'absolute', },
  root: { alignItems: 'center', display: 'flex', position: 'relative', touchAction: 'none', userSelect: 'none', width: '100%' },
  thumb: { borderColor: tokens.primary, borderRadius: '50%', borderStyle: 'solid', borderWidth: 1, backgroundColor: tokens.background, boxShadow: { default: tokens.shadowSm, ':focus-visible': tokens.focusRingShadow, ':hover': tokens.focusRingShadow }, flexShrink: 0, outlineStyle: 'none', height: '1rem', width: '1rem', },
  track: { borderRadius: tokens.radius, overflow: 'hidden', backgroundColor: tokens.input, flexGrow: 1, position: 'relative', height: '0.375rem', width: '100%', },
  trackHorizontal: { transform: 'translateY(-50%)', height: '0.375rem', left: 0, right: 0, top: '50%', },
  trackVertical: { transform: 'translateX(-50%)', bottom: 0, left: '50%', top: 0, width: '0.375rem', },
  vertical: { height: '11rem', width: '1.25rem' },
})

export type SliderProps<Msg> = Readonly<{ model: Model; value: number; toParentMessage: (message: Message) => Msg; label?: string; ariaLabel?: string; formatValue?: (value: number) => string; isDisabled?: boolean; isReadOnly?: boolean; name?: string; layoutStyle?: ComponentLayoutStyle }>
export type RangeSliderProps<Msg> = Readonly<{ values: readonly [number, number]; min: number; max: number; step?: number; onInput: (values: readonly [number, number]) => Msg; orientation?: 'horizontal' | 'vertical'; direction?: 'ltr' | 'rtl'; ariaLabels?: readonly [string, string]; formatValue?: (value: number, index: 0 | 1) => string; isDisabled?: boolean; isReadOnly?: boolean; name?: string; layoutStyle?: ComponentLayoutStyle }>

export const rangeSlider = <Msg>(props: RangeSliderProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  const range = normalizeRange(props.min, props.max, props.step); const [lower, upper] = normalizeRangeValues(props.values, range); const span = Math.max(range.max - range.min, 1); const start = ((lower - range.min) / span) * 100; const end = ((upper - range.min) / span) * 100; const orientation = props.orientation ?? 'horizontal'
  const input = (index: 0 | 1, value: number): Html => h.input([h.Type('range'), h.Min(String(range.min)), h.Max(String(range.max)), h.Step(String(range.step)), h.Value(String(value)), h.AriaLabel(props.ariaLabels?.[index] ?? (index === 0 ? 'Minimum value' : 'Maximum value')), ...(props.formatValue === undefined ? [] : [h.AriaValuetext(props.formatValue(value, index))]), ...(props.isReadOnly === true ? [h.AriaReadonly(true)] : []), h.Disabled(props.isDisabled ?? false), ...(props.name === undefined ? [] : [h.Name(`${props.name}[${String(index)}]`)]), h.OnInput((next) => props.onInput(props.isReadOnly === true ? [lower, upper] : updateRangeValue([lower, upper], index, Number(next), range))), h.Class(className(styles.input, orientation === 'horizontal' ? styles.inputHorizontal : styles.inputVertical))])
  return h.div([h.DataAttribute('slot', 'slider'), h.DataAttribute('orientation', orientation), ...(props.direction === undefined ? [] : [h.Dir(props.direction)]), ...(props.isDisabled === true ? [h.DataAttribute('disabled', '')] : []), ...(props.isReadOnly === true ? [h.DataAttribute('readonly', '')] : []), h.Class(className(styles.control, orientation === 'horizontal' ? styles.horizontal : styles.vertical, props.isDisabled === true && styles.disabled, props.layoutStyle))], [h.div([h.DataAttribute('slot', 'slider-track'), h.Class(className(styles.track, orientation === 'horizontal' ? styles.trackHorizontal : styles.trackVertical))], [h.div([h.DataAttribute('slot', 'slider-range'), h.Class(className(styles.range)), h.Style(orientation === 'horizontal' ? { left: `${start}%`, right: `${100 - end}%`, insetBlock: '0' } : { bottom: `${start}%`, top: `${100 - end}%`, insetInline: '0' })], [])]), input(0, lower), input(1, upper)])
}

export const slider = <Msg>(props: SliderProps<Msg>, h: HtmlBuilder<Msg>): Html => h.submodel({ slotId: props.model.id, model: props.model, view: SliderPrimitive.view, viewInputs: { value: props.value, isDisabled: props.isDisabled ?? false, isReadOnly: props.isReadOnly ?? false, ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }), ...(props.formatValue === undefined ? {} : { formatValue: props.formatValue }), ...(props.name === undefined ? {} : { name: props.name }), toView: ({ root, track, filledTrack, thumb, label, hiddenInput }) => { const control = h.div([...root, h.DataAttribute('slot', 'slider'), h.Class(className(styles.root, props.isDisabled === true && styles.disabled, props.layoutStyle))], [h.div([...track, h.DataAttribute('slot', 'slider-track'), h.Class(className(styles.track))], [h.div([...filledTrack, h.DataAttribute('slot', 'slider-range'), h.Class(className(styles.filled))], [])]), h.span([...thumb, h.DataAttribute('slot', 'slider-thumb'), h.Class(className(styles.thumb))], []), ...(props.name === undefined ? [] : [h.input([...hiddenInput])])]); return props.label === undefined ? control : h.div([h.Class(className(styles.labeled))], [h.label([...label, h.Class(className(styles.label))], [props.label]), control]) } }, toParentMessage: props.toParentMessage })

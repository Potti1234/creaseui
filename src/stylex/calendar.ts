import * as stylex from '@stylexjs/stylex'
import type { Option } from 'effect'
import { Match as M } from 'effect'
import type * as FoldkitCalendar from 'foldkit/calendar'
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'
import { Calendar as CalendarPrimitive } from '@foldkit/ui'

import * as CalendarBehavior from '@/lib/calendar'
import * as Icon from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

export const Model = CalendarPrimitive.Model
export type Model = typeof Model.Type
export const Message = CalendarPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = CalendarPrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type
export const init = CalendarPrimitive.init
export const update = CalendarPrimitive.update
export const selectDate = CalendarPrimitive.selectDate
export const focusDate = CalendarPrimitive.focusDate
export const reflectMinDate = CalendarPrimitive.reflectMinDate
export const reflectMaxDate = CalendarPrimitive.reflectMaxDate
export const reflectDisabledDates = CalendarPrimitive.reflectDisabledDates
export const reflectDisabledDaysOfWeek = CalendarPrimitive.reflectDisabledDaysOfWeek
export const dropToDays = CalendarPrimitive.dropToDays
export * from '@/lib/calendar'

const styles = stylex.create({
  caption: { paddingInline: '2rem', alignItems: 'center', display: 'flex', justifyContent: 'center', height: '2rem', width: '100%', },
  captionComfortable: { paddingInline: { default: '2rem', '@media (min-width: 768px)': '2.5rem' }, height: { default: '2rem', '@media (min-width: 768px)': '2.5rem' } },
  captionButton: { borderRadius: tokens.controlRadius, gap: '0.25rem', alignItems: 'center', display: 'flex', fontSize: '0.875rem', fontWeight: 500, height: '2rem', paddingLeft: '0.5rem', paddingRight: '0.25rem', },
  captionButtonComfortable: { height: { default: '2rem', '@media (min-width: 768px)': '2.5rem' } },
  dayButton: { borderColor: { default: tokens.transparent, ':focus-visible': tokens.ring }, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, gap: '0.25rem', alignItems: 'center', backgroundColor: { default: tokens.transparent, ':hover': tokens.accent }, boxShadow: { default: tokens.shadowNone, ':focus-visible': tokens.focusRingShadow }, color: { default: tokens.foreground, ':hover': tokens.accentForeground }, display: 'flex', flexDirection: 'column', fontWeight: 400, justifyContent: 'center', outlineStyle: 'none', height: '100%', minWidth: '2rem', width: '100%', },
  dayButtonComfortable: { minWidth: { default: '2rem', '@media (min-width: 768px)': '2.5rem' } },
  dayCell: { padding: 0, alignItems: 'center', aspectRatio: '1 / 1', backgroundColor: { default: tokens.transparent, ':is([data-selected])': tokens.primary, ':is([data-today])': tokens.accent, }, color: { default: tokens.foreground, ':is([data-outside-month])': tokens.mutedForeground, ':is([data-selected])': tokens.primaryForeground }, display: 'flex', justifyContent: 'center', opacity: { default: 1, ':is([data-disabled])': 0.5 }, position: 'relative', textAlign: 'center', height: '2rem', width: '2rem', },
  dayCellComfortable: { height: { default: '2rem', '@media (min-width: 768px)': '2.5rem' }, width: { default: '2rem', '@media (min-width: 768px)': '2.5rem' } },
  dayRange: { backgroundColor: tokens.accent },
  dayRangeStart: { borderBottomLeftRadius: tokens.controlRadius, borderTopLeftRadius: tokens.controlRadius },
  dayRangeEnd: { borderBottomRightRadius: tokens.controlRadius, borderTopRightRadius: tokens.controlRadius },
  dayRangeSingle: { borderRadius: tokens.controlRadius },
  grid: { borderCollapse: 'collapse', outlineStyle: 'none', width: '100%' },
  headerRow: { display: 'flex' },
  heading: { fontSize: '0.875rem', fontWeight: 500 },
  icon: { height: '0.875rem', width: '0.875rem' },
  month: { gap: '1rem', display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', },
  nav: { gap: '0.25rem', alignItems: 'center', display: 'flex', justifyContent: 'space-between', position: 'absolute', left: 0, right: 0, top: 0, width: '100%', },
  navButton: { padding: 0, borderRadius: tokens.controlRadius, alignItems: 'center', backgroundColor: { default: tokens.transparent, ':hover': tokens.accent }, display: 'flex', justifyContent: 'center', height: '2rem', width: '2rem', },
  navButtonComfortable: { height: { default: '2rem', '@media (min-width: 768px)': '2.5rem' }, width: { default: '2rem', '@media (min-width: 768px)': '2.5rem' } },
  pickerButton: { borderRadius: tokens.controlRadius, paddingInline: '0.5rem', backgroundColor: { default: tokens.transparent, ':hover': tokens.accent }, fontWeight: 400, height: '2rem', width: '100%', },
  pickerCell: { alignItems: 'center', backgroundColor: { default: tokens.transparent, ':is([data-selected])': tokens.primary, ':is([data-today])': tokens.accent, }, color: { default: tokens.foreground, ':is([data-disabled])': tokens.mutedForeground, ':is([data-selected])': tokens.primaryForeground }, display: 'flex', fontSize: '0.875rem', justifyContent: 'center', opacity: { default: 1, ':is([data-disabled])': 0.5 }, height: '2rem', },
  pickerGrid: { gap: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', outlineStyle: 'none', },
  root: { padding: '0.75rem', backgroundColor: tokens.background, width: 'fit-content', },
  week: { display: 'flex', marginTop: '0.5rem', width: '100%' },
  weekday: { borderRadius: tokens.controlRadius,
 alignItems: 'center',
 color: tokens.mutedForeground,
 display: 'flex',
 flexBasis: '0%',
 flexGrow: '1',
 flexShrink: '1',
 fontSize: '0.8rem',
 fontWeight: 400,
 justifyContent: 'center',
 height: '2rem',
 width: '2rem', },
  weekdayComfortable: { height: { default: '2rem', '@media (min-width: 768px)': '2.5rem' }, width: { default: '2rem', '@media (min-width: 768px)': '2.5rem' } },
})

export type CalendarViewOptions = Readonly<{ direction?: 'ltr' | 'rtl'; layoutStyle?: ComponentLayoutStyle; range?: CalendarBehavior.CalendarRange; size?: 'default' | 'comfortable' }>
const navigationButton = <Msg>(attributes: ReadonlyArray<ChildAttribute>, direction: 'previous' | 'next', options: CalendarViewOptions, h: HtmlBuilder<Msg>): Html => h.button([...attributes, h.Class(className(styles.navButton, options.size === 'comfortable' && styles.navButtonComfortable))], [(direction === 'previous') !== (options.direction === 'rtl') ? Icon.chevronLeft({ class: className(styles.icon) }, h) : Icon.chevronRight({ class: className(styles.icon) }, h)])

const daysView = <Msg>(attributes: CalendarPrimitive.DaysModeAttributes, options: CalendarViewOptions, h: HtmlBuilder<Msg>): Html => {
  const weekdays = attributes.columnHeaders.map((column) => h.div([...column.attributes, h.Class(className(styles.weekday, options.size === 'comfortable' && styles.weekdayComfortable))], [column.name]))
  const weeks = attributes.weeks.map((week) => h.div(
    [...week.attributes, h.Class(className(styles.week))],
    week.cells.map((cell) => { const position = CalendarBehavior.rangePosition(cell.date, options.range); return h.div([...cell.cellAttributes, h.DataAttribute('range', position), h.Class(className(styles.dayCell, options.size === 'comfortable' && styles.dayCellComfortable, position !== 'outside' && styles.dayRange, position === 'start' && styles.dayRangeStart, position === 'end' && styles.dayRangeEnd, position === 'single' && styles.dayRangeSingle))], [h.button([...cell.buttonAttributes, h.Class(className(styles.dayButton, options.size === 'comfortable' && styles.dayButtonComfortable))], [cell.label])]) }),
  ))
  return h.div([...attributes.root, ...(options.direction === undefined ? [] : [h.Dir(options.direction)]), h.DataAttribute('slot', 'calendar'), h.Class(className(styles.root, options.layoutStyle))], [h.div([h.Class(className(styles.month))], [
    h.div([h.Class(className(styles.nav))], [navigationButton(attributes.previousMonthButton, 'previous', options, h), navigationButton(attributes.nextMonthButton, 'next', options, h)]),
    h.div([h.Class(className(styles.caption, options.size === 'comfortable' && styles.captionComfortable))], [h.button([...attributes.headingButton, h.Id(attributes.heading.id), h.Class(className(styles.captionButton, options.size === 'comfortable' && styles.captionButtonComfortable))], [attributes.heading.text, Icon.chevronDown({ class: className(styles.icon) }, h)])]),
    h.div([...attributes.grid, h.Class(className(styles.grid))], [h.div([...attributes.headerRow, h.Class(className(styles.headerRow))], weekdays), ...weeks]),
  ])])
}

const pickerView = <Msg>(attributes: CalendarPrimitive.MonthsModeAttributes, options: CalendarViewOptions, h: HtmlBuilder<Msg>): Html => h.div([...attributes.root, ...(options.direction === undefined ? [] : [h.Dir(options.direction)]), h.DataAttribute('slot', 'calendar'), h.Class(className(styles.root, options.layoutStyle))], [h.div([h.Class(className(styles.month))], [h.div([h.Class(className(styles.caption))], [h.button([...attributes.headingButton, h.Id(attributes.heading.id), h.Class(className(styles.captionButton))], [attributes.heading.text, Icon.chevronDown({ class: className(styles.icon) }, h)])]), h.div([...attributes.grid, h.Class(className(styles.pickerGrid))], attributes.cells.map((cell) => h.div([...cell.cellAttributes, h.Class(className(styles.pickerCell))], [h.button([...cell.buttonAttributes, h.Class(className(styles.pickerButton))], [cell.shortLabel])])))] )])

const yearsView = <Msg>(attributes: CalendarPrimitive.YearsModeAttributes, options: CalendarViewOptions, h: HtmlBuilder<Msg>): Html => h.div([...attributes.root, ...(options.direction === undefined ? [] : [h.Dir(options.direction)]), h.DataAttribute('slot', 'calendar'), h.Class(className(styles.root, options.layoutStyle))], [h.div([h.Class(className(styles.month))], [h.div([h.Class(className(styles.nav))], [navigationButton(attributes.previousPageButton, 'previous', options, h), navigationButton(attributes.nextPageButton, 'next', options, h)]), h.div([h.Class(className(styles.caption))], [h.div([h.Id(attributes.heading.id), h.Class(className(styles.heading))], [attributes.heading.text])]), h.div([...attributes.grid, h.Class(className(styles.pickerGrid))], attributes.cells.map((cell) => h.div([...cell.cellAttributes, h.Class(className(styles.pickerCell))], [h.button([...cell.buttonAttributes, h.Class(className(styles.pickerButton))], [cell.label])])))] )])

export const calendarView = <Msg>(attributes: CalendarPrimitive.CalendarAttributes, options: CalendarViewOptions, h: HtmlBuilder<Msg>): Html => M.value(attributes).pipe(M.withReturnType<Html>(), M.tagsExhaustive({ Days: (days) => daysView(days, options, h), Months: (months) => pickerView(months, options, h), Years: (years) => yearsView(years, options, h) }))

export type CalendarProps<Msg> = Readonly<{ model: Model; maybeSelectedDate: Option.Option<FoldkitCalendar.CalendarDate>; toParentMessage: (message: Message) => Msg; direction?: 'ltr' | 'rtl'; range?: CalendarBehavior.CalendarRange; layoutStyle?: ComponentLayoutStyle; size?: 'default' | 'comfortable'; previousMonthLabel?: string; nextMonthLabel?: string; previousYearsPageLabel?: string; nextYearsPageLabel?: string; daysHeadingButtonLabel?: string; monthsHeadingButtonLabel?: string }>
export const calendar = <Msg>(props: CalendarProps<Msg>, h: HtmlBuilder<Msg>): Html => h.submodel({ slotId: props.model.id, model: props.model, view: CalendarPrimitive.view, viewInputs: { maybeSelectedDate: props.maybeSelectedDate, toView: (attributes) => calendarView(attributes, { ...(props.direction === undefined ? {} : { direction: props.direction }), ...(props.range === undefined ? {} : { range: props.range }), ...(props.layoutStyle === undefined ? {} : { layoutStyle: props.layoutStyle }), ...(props.size === undefined ? {} : { size: props.size }) }, h), ...(props.previousMonthLabel === undefined ? {} : { previousMonthLabel: props.previousMonthLabel }), ...(props.nextMonthLabel === undefined ? {} : { nextMonthLabel: props.nextMonthLabel }), ...(props.previousYearsPageLabel === undefined ? {} : { previousYearsPageLabel: props.previousYearsPageLabel }), ...(props.nextYearsPageLabel === undefined ? {} : { nextYearsPageLabel: props.nextYearsPageLabel }), ...(props.daysHeadingButtonLabel === undefined ? {} : { daysHeadingButtonLabel: props.daysHeadingButtonLabel }), ...(props.monthsHeadingButtonLabel === undefined ? {} : { monthsHeadingButtonLabel: props.monthsHeadingButtonLabel }) }, toParentMessage: props.toParentMessage })

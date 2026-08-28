import * as stylex from '@stylexjs/stylex'
import EmblaCarousel, { type EmblaOptionsType, type EmblaPluginType } from 'embla-carousel'
import { Effect, Queue, Schema as S, Stream } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Icon from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

export const Model = S.Struct({ id: S.String, index: S.Number, count: S.Number })
export type Model = typeof Model.Type
export const Previous = m('Previous')
export const Next = m('Next')
export const WentTo = m('WentTo', { index: S.Number })
export const Message = S.Union([Previous, Next, WentTo])
export type Message = typeof Message.Type
export const init = (id: string, count: number, index = 0): Model => ({ id, count: Math.max(0, count), index: Math.max(0, Math.min(index, count - 1)) })
export const update = (model: Model, message: Message): Model => {
  if (model.count === 0) return model
  switch (message._tag) {
    case 'Previous': return { ...model, index: Math.max(0, model.index - 1) }
    case 'Next': return { ...model, index: Math.min(model.count - 1, model.index + 1) }
    case 'WentTo': return { ...model, index: Math.max(0, Math.min(message.index, model.count - 1)) }
  }
}

export type CarouselProps<Msg> = Readonly<{
  model: Model; toParentMessage: (message: Message) => Msg; items: ReadonlyArray<Html | string>; ariaLabel?: string; orientation?: 'horizontal' | 'vertical'; loop?: boolean
  options?: Omit<EmblaOptionsType, 'axis' | 'direction' | 'loop' | 'slidesToScroll'>; plugins?: ReadonlyArray<EmblaPluginType>; slidesToScroll?: number; itemSize?: number | ((index: number) => number); keyboardNavigation?: boolean; previousLabel?: string; nextLabel?: string; layoutStyle?: ComponentLayoutStyle
}>

const styles = stylex.create({
  button: { borderColor: tokens.border, borderRadius: '50%', borderStyle: 'solid', borderWidth: 1, alignItems: 'center', backgroundColor: { default: tokens.background, ':hover': tokens.accent }, boxShadow: tokens.shadowSm, display: 'flex', justifyContent: 'center', position: 'absolute', height: '2rem', width: '2rem', },
  buttonDisabled: { opacity: 0.5, pointerEvents: 'none' },
  content: { overflow: 'hidden', outlineStyle: 'none', },
  contentVertical: { height: '100%' },
  horizontalItem: { paddingLeft: '1rem' },
  horizontalPrevious: { transform: 'translateY(-50%)', left: '-3rem', top: '50%', },
  horizontalNext: { transform: 'translateY(-50%)', right: '-3rem', top: '50%', },
  item: { flexGrow: 0, flexShrink: 0, scrollSnapAlign: 'start', minWidth: 0, },
  root: { boxShadow: { default: tokens.shadowNone, ':focus-visible': tokens.focusRingShadow }, outlineStyle: 'none', position: 'relative' },
  srOnly: { margin: -1, padding: 0, overflow: 'hidden', position: 'absolute', height: 1, width: 1, },
  track: { display: 'flex', touchAction: 'pan-y', marginLeft: '-1rem', },
  trackVertical: { flexDirection: 'column', touchAction: 'pan-x', height: '100%', marginLeft: 0, marginTop: '-1rem', },
  verticalItem: { minHeight: 0, paddingTop: '1rem' },
  verticalPrevious: { transform: 'translateX(-50%)', left: '50%', top: '-3rem', },
  verticalNext: { transform: 'translateX(-50%)', bottom: '-3rem', left: '50%', },
})

const clampPercent = (value: number): number => Math.max(1, Math.min(100, value))

export const carousel = <Msg>(props: CarouselProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  const vertical = props.orientation === 'vertical'; const count = Math.min(props.model.count, props.items.length); const step = Math.max(1, Math.floor(props.slidesToScroll ?? 1)); const sizeAt = (index: number) => clampPercent(typeof props.itemSize === 'function' ? props.itemSize(index) : (props.itemSize ?? 100))
  return h.section([h.Role('region'), h.AriaRoleDescription('carousel'), h.AriaLabel(props.ariaLabel ?? 'Carousel'), h.DataAttribute('slot', 'carousel'), h.Class(className(styles.root, props.layoutStyle))], [
    h.div([h.Tabindex(props.keyboardNavigation === false ? -1 : 0), h.DataAttribute('slot', 'carousel-content'), h.Class(className(styles.content, vertical && styles.contentVertical)), h.OnMount({ name: `embla-carousel-${props.model.id}`, f: (element) => element instanceof HTMLElement ? emblaStream({ viewport: element, orientation: vertical ? 'vertical' : 'horizontal', direction: element.closest('[dir="rtl"]') ? 'rtl' : 'ltr', loop: props.loop ?? false, slidesToScroll: step, initialIndex: props.model.index, keyboardNavigation: props.keyboardNavigation !== false, plugins: props.plugins ?? [], options: props.options, toMessage: props.toParentMessage }) : Stream.empty })], [
      h.div([h.Class(className(styles.track, vertical && styles.trackVertical))], props.items.map((item, index) => h.div([h.Role('group'), h.AriaRoleDescription('slide'), h.AriaLabel(`${index + 1} of ${props.items.length}`), h.DataAttribute('slot', 'carousel-item'), h.Style({ flexBasis: `${sizeAt(index)}%` }), h.Class(className(styles.item, vertical ? styles.verticalItem : styles.horizontalItem))], [item]))),
    ]),
    carouselButton({ direction: 'previous', isDisabled: count === 0 || (props.model.index === 0 && props.loop !== true), vertical, label: props.previousLabel ?? 'Previous slide' }, h),
    carouselButton({ direction: 'next', isDisabled: count === 0 || (props.model.index >= count - 1 && props.loop !== true), vertical, label: props.nextLabel ?? 'Next slide' }, h),
  ])
}

const emblaStream = <Msg>(props: Readonly<{ viewport: HTMLElement; orientation: 'horizontal' | 'vertical'; direction: 'ltr' | 'rtl'; loop: boolean; slidesToScroll: number; initialIndex: number; keyboardNavigation: boolean; plugins: ReadonlyArray<EmblaPluginType>; options?: CarouselProps<Msg>['options']; toMessage: (message: Message) => Msg }>): Stream.Stream<Msg> => Stream.callback((queue) => Effect.acquireRelease(Effect.sync(() => {
  const root = props.viewport.parentElement; const previousButton = root?.querySelector<HTMLElement>('[data-slot="carousel-previous"]'); const nextButton = root?.querySelector<HTMLElement>('[data-slot="carousel-next"]')
  const api = EmblaCarousel(props.viewport, { ...props.options, axis: props.orientation === 'vertical' ? 'y' : 'x', direction: props.direction, loop: props.loop, slidesToScroll: props.slidesToScroll, startIndex: props.initialIndex }, [...props.plugins])
  const emitSelection = () => Queue.offerUnsafe(queue, props.toMessage(WentTo({ index: api.selectedScrollSnap() })))
  const updateButtons = () => { if (previousButton instanceof HTMLButtonElement) previousButton.disabled = !api.canScrollPrev(); if (nextButton instanceof HTMLButtonElement) nextButton.disabled = !api.canScrollNext() }
  const previous = () => api.scrollPrev(); const next = () => api.scrollNext(); const onKeyDown = (event: KeyboardEvent) => { if (!props.keyboardNavigation) return; const previousKey = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'; const nextKey = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'; if (event.key === previousKey) api.scrollPrev(); else if (event.key === nextKey) api.scrollNext(); else if (event.key === 'Home') api.scrollTo(0); else if (event.key === 'End') api.scrollTo(api.scrollSnapList().length - 1); else return; event.preventDefault() }
  previousButton?.addEventListener('click', previous); nextButton?.addEventListener('click', next); props.viewport.addEventListener('keydown', onKeyDown); api.on('select', emitSelection); api.on('select', updateButtons); api.on('reInit', updateButtons); updateButtons()
  return () => { previousButton?.removeEventListener('click', previous); nextButton?.removeEventListener('click', next); props.viewport.removeEventListener('keydown', onKeyDown); api.destroy() }
}), (cleanup) => Effect.sync(cleanup)).pipe(Effect.flatMap(() => Effect.never)))

const carouselButton = <Msg>(props: Readonly<{ direction: 'previous' | 'next'; isDisabled: boolean; vertical: boolean; label: string }>, h: HtmlBuilder<Msg>): Html => {
  const previous = props.direction === 'previous'; const placement = props.vertical ? (previous ? styles.verticalPrevious : styles.verticalNext) : (previous ? styles.horizontalPrevious : styles.horizontalNext)
  return h.button([h.Type('button'), h.Disabled(props.isDisabled), h.DataAttribute('slot', `carousel-${props.direction}`), h.Class(className(styles.button, placement, props.isDisabled && styles.buttonDisabled))], [props.vertical ? previous ? Icon.arrowUp<Msg>({}, h) : Icon.arrowDown<Msg>({}, h) : previous ? Icon.arrowLeft<Msg>({}, h) : Icon.arrowRight<Msg>({}, h), h.span([h.Class(className(styles.srOnly))], [props.label])])
}


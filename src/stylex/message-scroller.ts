import * as stylex from '@stylexjs/stylex'
import { Effect, Schema as S, Stream } from 'effect'
import { Command } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Subscription from 'foldkit/subscription'

import * as Icon from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'

export const Model = S.Struct({ id: S.String, scrollTop: S.Number, scrollHeight: S.Number, clientHeight: S.Number })
export type Model = typeof Model.Type
export const Scrolled = m('Scrolled', { scrollTop: S.Number, scrollHeight: S.Number, clientHeight: S.Number })
export const RequestedScroll = m('RequestedScroll', { direction: S.Literals(['start', 'end']) })
export const CompletedMessageScrollerScrollTo = m('CompletedMessageScrollerScrollTo')
export const Message = S.Union([Scrolled, RequestedScroll, CompletedMessageScrollerScrollTo])
export type Message = typeof Message.Type
export const init = (id: string): Model => ({ id, scrollTop: 0, scrollHeight: 0, clientHeight: 0 })

const ScrollTo = Command.define('MessageScrollerScrollTo', { args: { id: S.String, direction: S.Literals(['start', 'end']) }, messages: [CompletedMessageScrollerScrollTo], execute: ({ id, direction }) => Effect.sync(() => { const viewport = document.getElementById(`${id}-viewport`); if (viewport instanceof HTMLElement) viewport.scrollTo({ top: direction === 'start' ? 0 : viewport.scrollHeight, behavior: 'smooth' }) }).pipe(Effect.as(CompletedMessageScrollerScrollTo())) })
type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Scrolled': return [{ ...model, scrollTop: message.scrollTop, scrollHeight: message.scrollHeight, clientHeight: message.clientHeight }, []]
    case 'RequestedScroll': return [model, [ScrollTo({ id: model.id, direction: message.direction })]]
    case 'CompletedMessageScrollerScrollTo': return [model, []]
  }
}

type ChildrenProps = Readonly<{ children: ReadonlyArray<Html | string>; layoutStyle?: ComponentLayoutStyle }>
const styles = stylex.create({
  button: { borderColor: tokens.border, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, alignItems: 'center', backgroundColor: tokens.background, color: tokens.foreground, display: 'flex', justifyContent: 'center', position: 'absolute', transform: 'translateX(-50%)', transitionDuration: interactionTokens.motionModerate, transitionProperty: 'transform, opacity', zIndex: 10, height: '2rem', left: '50%', width: '2rem', },
  buttonEnd: { bottom: '1rem' },
  buttonInactive: { opacity: 0, pointerEvents: 'none', transform: 'translateX(-50%) scale(0.95)' },
  buttonStart: { top: '1rem' },
  content: { gap: '2rem', display: 'flex', flexDirection: 'column', height: 'max-content', minHeight: '100%', },
  item: { containIntrinsicSize: 'auto 10rem', contentVisibility: 'auto', flexShrink: 0, minWidth: 0 },
  root: { overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', minHeight: 0, width: '100%', },
  srOnly: { margin: -1, padding: 0, overflow: 'hidden', position: 'absolute', height: 1, width: 1, },
  viewport: { overscrollBehavior: 'contain', height: '100%', minHeight: 0, minWidth: 0, overflowY: 'auto', width: '100%', },
})

export const messageScroller = <Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html => h.div([h.DataAttribute('slot', 'message-scroller'), h.Class(className(styles.root, props.layoutStyle))], [...props.children])
export const messageScrollerViewport = <Msg>(props: ChildrenProps & Readonly<{ model: Model; toParentMessage: (message: Message) => Msg }>, h: HtmlBuilder<Msg>): Html => h.div([
  h.Id(`${props.model.id}-viewport`), h.DataAttribute('slot', 'message-scroller-viewport'), h.Class(className(styles.viewport, props.layoutStyle)),
  h.OnMount({ name: `message-scroller-${props.model.id}`, f: (element) => element instanceof HTMLElement ? Subscription.fromEvent<Event, Msg>({ target: element, type: 'scroll', toMessage: () => props.toParentMessage(Scrolled({ scrollTop: element.scrollTop, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight })), options: { passive: true } }) : Stream.empty }),
], [...props.children])
export const messageScrollerContent = <Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html => h.div([h.DataAttribute('slot', 'message-scroller-content'), h.Class(className(styles.content, props.layoutStyle))], [...props.children])
export const messageScrollerItem = <Msg>(props: ChildrenProps & Readonly<{ scrollAnchor?: boolean }>, h: HtmlBuilder<Msg>): Html => h.div([h.DataAttribute('slot', 'message-scroller-item'), ...(props.scrollAnchor === true ? [h.DataAttribute('scroll-anchor', '')] : []), h.Class(className(styles.item, props.layoutStyle))], [...props.children])
export const messageScrollerButton = <Msg>(props: Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; direction?: 'start' | 'end'; layoutStyle?: ComponentLayoutStyle }>, h: HtmlBuilder<Msg>): Html => {
  const direction = props.direction ?? 'end'; const isAtStart = props.model.scrollTop <= 1; const isAtEnd = props.model.scrollHeight === 0 || props.model.scrollTop + props.model.clientHeight >= props.model.scrollHeight - 1; const isActive = direction === 'start' ? !isAtStart : !isAtEnd
  return h.button([h.Type('button'), h.OnClick(props.toParentMessage(RequestedScroll({ direction }))), h.DataAttribute('slot', 'message-scroller-button'), h.DataAttribute('direction', direction), h.DataAttribute('active', String(isActive)), h.AriaHidden(!isActive), h.Tabindex(isActive ? 0 : -1), h.Class(className(styles.button, direction === 'start' ? styles.buttonStart : styles.buttonEnd, !isActive && styles.buttonInactive, props.layoutStyle))], [Icon.arrowDown<Msg>({}, h), h.span([h.Class(className(styles.srOnly))], [direction === 'end' ? 'Scroll to end' : 'Scroll to start'])])
}



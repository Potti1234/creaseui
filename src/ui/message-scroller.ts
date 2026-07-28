import { Effect, Schema as S, Stream } from 'effect'
import { Command } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Subscription from 'foldkit/subscription'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

export const Model = S.Struct({
  id: S.String,
  scrollTop: S.Number,
  scrollHeight: S.Number,
  clientHeight: S.Number,
})
export type Model = typeof Model.Type

export const Scrolled = m('Scrolled', {
  scrollTop: S.Number,
  scrollHeight: S.Number,
  clientHeight: S.Number,
})
export const RequestedScroll = m('RequestedScroll', {
  direction: S.Literals(['start', 'end']),
})
export const CompletedScroll = m('CompletedScroll')
export const Message = S.Union([Scrolled, RequestedScroll, CompletedScroll])
export type Message = typeof Message.Type

export const init = (id: string): Model => ({
  id,
  scrollTop: 0,
  scrollHeight: 0,
  clientHeight: 0,
})

const ScrollTo = Command.define(
  'MessageScrollerScrollTo',
  { id: S.String, direction: S.Literals(['start', 'end']) },
  CompletedScroll,
)(({ id, direction }) =>
  Effect.sync(() => {
    const viewport = document.getElementById(`${id}-viewport`)
    if (viewport instanceof HTMLElement) {
      viewport.scrollTo({
        top: direction === 'start' ? 0 : viewport.scrollHeight,
        behavior: 'smooth',
      })
    }
  }).pipe(Effect.as(CompletedScroll())),
)

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Scrolled':
      return [
        {
          ...model,
          scrollTop: message.scrollTop,
          scrollHeight: message.scrollHeight,
          clientHeight: message.clientHeight,
        },
        [],
      ]
    case 'RequestedScroll':
      return [model, [ScrollTo({ id: model.id, direction: message.direction })]]
    case 'CompletedScroll':
      return [model, []]
  }
}

type ChildrenProps = Readonly<{ children: ReadonlyArray<Html | string>; class?: string }>

export const messageScroller = <Msg>(props: ChildrenProps): Html => {
  const h = html<Msg>()
  return h.div([h.DataAttribute('slot', 'message-scroller'), h.Class(cn('group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden', props.class))], [...props.children])
}

export const messageScrollerViewport = <Msg>(props: ChildrenProps & Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
}>): Html => {
  const h = html<Msg>()
  return h.div(
    [
      h.Id(`${props.model.id}-viewport`),
      h.DataAttribute('slot', 'message-scroller-viewport'),
      h.Class(cn('size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain', props.class)),
      h.OnMount({
        name: `message-scroller-${props.model.id}`,
        f: element =>
          element instanceof HTMLElement
            ? Subscription.fromEvent<Event, Msg>({
                target: element,
                type: 'scroll',
                toMessage: () =>
                  props.toParentMessage(
                    Scrolled({
                      scrollTop: element.scrollTop,
                      scrollHeight: element.scrollHeight,
                      clientHeight: element.clientHeight,
                    }),
                  ),
                options: { passive: true },
              })
            : Stream.empty,
      }),
    ],
    [...props.children],
  )
}

export const messageScrollerContent = <Msg>(props: ChildrenProps): Html => {
  const h = html<Msg>()
  return h.div([h.DataAttribute('slot', 'message-scroller-content'), h.Class(cn('flex h-max min-h-full flex-col gap-8', props.class))], [...props.children])
}

export const messageScrollerItem = <Msg>(props: ChildrenProps & Readonly<{ scrollAnchor?: boolean }>): Html => {
  const h = html<Msg>()
  return h.div([h.DataAttribute('slot', 'message-scroller-item'), ...(props.scrollAnchor === true ? [h.DataAttribute('scroll-anchor', '')] : []), h.Class(cn('min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]', props.class))], [...props.children])
}

export const messageScrollerButton = <Msg>(props: Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  direction?: 'start' | 'end'
  class?: string
}>): Html => {
  const h = html<Msg>()
  const direction = props.direction ?? 'end'
  const isAtStart = props.model.scrollTop <= 1
  const isAtEnd =
    props.model.scrollHeight === 0 ||
    props.model.scrollTop + props.model.clientHeight >= props.model.scrollHeight - 1
  const isActive = direction === 'start' ? !isAtStart : !isAtEnd

  return h.button(
    [
      h.Type('button'),
      h.OnClick(props.toParentMessage(RequestedScroll({ direction }))),
      h.DataAttribute('slot', 'message-scroller-button'),
      h.DataAttribute('direction', direction),
      h.DataAttribute('active', String(isActive)),
      h.AriaHidden(!isActive),
      h.Tabindex(isActive ? 0 : -1),
      h.Class(
        cn(
          'absolute left-1/2 z-10 flex size-8 -translate-x-1/2 items-center justify-center rounded-md border bg-background text-foreground transition-[transform,opacity] duration-200 data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[direction=end]:bottom-4 data-[direction=start]:top-4 data-[direction=start]:[&_svg]:rotate-180',
          props.class,
        ),
      ),
    ],
    [
      Icon.arrowDown<Msg>({ class: 'size-4' }),
      h.span([h.Class('sr-only')], [direction === 'end' ? 'Scroll to end' : 'Scroll to start']),
    ],
  )
}

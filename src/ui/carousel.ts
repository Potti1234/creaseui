import { Schema as S } from 'effect'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

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
  model: Model
  toParentMessage: (message: Message) => Msg
  items: ReadonlyArray<Html | string>
  ariaLabel?: string
  orientation?: 'horizontal' | 'vertical'
  class?: string
}>

export const carousel = <Msg>(props: CarouselProps<Msg>): Html => {
  const h = html<Msg>()
  const vertical = props.orientation === 'vertical'
  const transform = vertical ? `translateY(-${props.model.index * 100}%)` : `translateX(-${props.model.index * 100}%)`
  return h.section(
    [h.Role('region'), h.AriaRoleDescription('carousel'), h.AriaLabel(props.ariaLabel ?? 'Carousel'), h.DataAttribute('slot', 'carousel'), h.Class(cn('relative', props.class))],
    [
      h.div([h.DataAttribute('slot', 'carousel-content'), h.Class('overflow-hidden')], [
        h.div([h.Class(cn('flex transition-transform duration-300 ease-out', vertical ? 'h-full flex-col' : '-ml-4')), h.Style({ transform })], props.items.map((item, index) =>
          h.div([h.Role('group'), h.AriaRoleDescription('slide'), h.AriaLabel(`${index + 1} of ${props.items.length}`), h.DataAttribute('slot', 'carousel-item'), h.Class(cn('min-w-0 shrink-0 grow-0 basis-full', vertical ? 'pt-4' : 'pl-4'))], [item]),
        )),
      ]),
      carouselButton({ direction: 'previous', isDisabled: props.model.index === 0, onClick: props.toParentMessage(Previous()), vertical }),
      carouselButton({ direction: 'next', isDisabled: props.model.index >= props.model.count - 1, onClick: props.toParentMessage(Next()), vertical }),
    ],
  )
}

const carouselButton = <Msg>(props: Readonly<{ direction: 'previous' | 'next'; isDisabled: boolean; onClick: Msg; vertical: boolean }>): Html => {
  const h = html<Msg>()
  const previous = props.direction === 'previous'
  return h.button(
    [h.Type('button'), h.Disabled(props.isDisabled), h.OnClick(props.onClick), h.DataAttribute('slot', `carousel-${props.direction}`), h.Class(cn('absolute flex size-8 items-center justify-center rounded-full border bg-background shadow-xs hover:bg-accent disabled:pointer-events-none disabled:opacity-50', props.vertical ? `left-1/2 -translate-x-1/2 ${previous ? '-top-12 rotate-90' : '-bottom-12 rotate-90'}` : `top-1/2 -translate-y-1/2 ${previous ? '-left-12' : '-right-12'}`))],
    [previous ? Icon.arrowLeft<Msg>({ class: 'size-4' }) : Icon.arrowRight<Msg>({ class: 'size-4' }), h.span([h.Class('sr-only')], [previous ? 'Previous slide' : 'Next slide'])],
  )
}

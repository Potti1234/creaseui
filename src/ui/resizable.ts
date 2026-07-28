import { Option, Schema as S } from 'effect'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

const Drag = S.Struct({ start: S.Number, initialSize: S.Number })
export const Model = S.Struct({ id: S.String, firstSize: S.Number, drag: S.Option(Drag) })
export type Model = typeof Model.Type
export const StartedResize = m('StartedResize', { position: S.Number })
export const DraggedResize = m('DraggedResize', { position: S.Number, extent: S.Number })
export const EndedResize = m('EndedResize')
export const NudgedResize = m('NudgedResize', { delta: S.Number })
export const Message = S.Union([StartedResize, DraggedResize, EndedResize, NudgedResize])
export type Message = typeof Message.Type

const clamp = (value: number): number => Math.max(10, Math.min(90, value))
export const init = (id: string, firstSize = 50): Model => ({ id, firstSize: clamp(firstSize), drag: Option.none() })
export const update = (model: Model, message: Message): Model => {
  switch (message._tag) {
    case 'StartedResize': return { ...model, drag: Option.some({ start: message.position, initialSize: model.firstSize }) }
    case 'DraggedResize': return Option.match(model.drag, { onNone: () => model, onSome: drag => ({ ...model, firstSize: clamp(drag.initialSize + ((message.position - drag.start) / Math.max(1, message.extent)) * 100) }) })
    case 'EndedResize': return { ...model, drag: Option.none() }
    case 'NudgedResize': return { ...model, firstSize: clamp(model.firstSize + message.delta) }
  }
}

export type ResizableProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  first: Html | string
  second: Html | string
  direction?: 'horizontal' | 'vertical'
  withHandle?: boolean
  class?: string
}>

export const resizable = <Msg>(props: ResizableProps<Msg>): Html => {
  const h = html<Msg>()
  const vertical = props.direction === 'vertical'
  const dragging = Option.isSome(props.model.drag)
  return h.div(
    [
      h.DataAttribute('slot', 'resizable-panel-group'), h.DataAttribute('direction', vertical ? 'vertical' : 'horizontal'),
      h.OnPointerMove((screenX, screenY) => dragging ? Option.some(props.toParentMessage(DraggedResize({ position: vertical ? screenY : screenX, extent: vertical ? window.innerHeight : window.innerWidth }))) : Option.none()),
      h.OnPointerUp(() => dragging ? Option.some(props.toParentMessage(EndedResize())) : Option.none()),
      h.Class(cn('flex size-full overflow-hidden rounded-lg border data-[direction=vertical]:flex-col', dragging ? 'select-none' : undefined, props.class)),
    ],
    [
      panel({ size: props.model.firstSize, children: props.first }),
      h.div(
        [h.Role('separator'), h.AriaOrientation(vertical ? 'horizontal' : 'vertical'), h.AriaValuemin(10), h.AriaValuemax(90), h.AriaValuenow(Math.round(props.model.firstSize)), h.Tabindex(0), h.DataAttribute('slot', 'resizable-handle'), h.OnPointerDown((_type, button, screenX, screenY) => button === 0 ? Option.some(props.toParentMessage(StartedResize({ position: vertical ? screenY : screenX }))) : Option.none()), h.OnKeyDownPreventDefault(key => key === (vertical ? 'ArrowUp' : 'ArrowLeft') ? Option.some(props.toParentMessage(NudgedResize({ delta: -2 }))) : key === (vertical ? 'ArrowDown' : 'ArrowRight') ? Option.some(props.toParentMessage(NudgedResize({ delta: 2 }))) : Option.none()), h.Class(cn('relative flex w-px items-center justify-center bg-border outline-none focus-visible:ring-1 focus-visible:ring-ring data-[direction=vertical]:h-px data-[direction=vertical]:w-full', vertical ? 'h-px w-full' : 'h-full w-px'))],
        props.withHandle === true ? [h.div([h.Class('z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border')], [Icon.gripVertical<Msg>({ class: cn('size-2.5', vertical ? 'rotate-90' : undefined) })])] : [],
      ),
      panel({ size: 100 - props.model.firstSize, children: props.second }),
    ],
  )
}

const panel = <Msg>(props: Readonly<{ size: number; children: Html | string }>): Html => {
  const h = html<Msg>()
  return h.div([h.DataAttribute('slot', 'resizable-panel'), h.Style({ flexBasis: `${props.size}%` }), h.Class('min-h-0 min-w-0 shrink-0 overflow-auto')], [props.children])
}

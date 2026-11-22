import type { Update } from 'foldkit'
import { Effect, Option, Queue, Schema as S, Stream } from 'effect'
import * as Command from 'foldkit/command'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'
import { Dialog } from '@foldkit/ui'

import * as Drag from '@/lib/behaviors/drag'

/* Renderer-neutral state for the Lightbox port of Meta Astryx's Lightbox:
   gallery index, 1x↔2x zoom, and pointer/keyboard pan while zoomed. */

export const ZOOMED_SCALE = 2
export const KEYBOARD_PAN_STEP = 50

export const PanAnchor = S.Struct({
  x: S.Number,
  y: S.Number,
  panX: S.Number,
  panY: S.Number,
})
export type PanAnchor = typeof PanAnchor.Type

const MediaSize = S.Struct({
  width: S.Number,
  height: S.Number,
  frameWidth: S.Number,
  frameHeight: S.Number,
})

export const Model = S.Struct({
  dialog: Dialog.Model,
  mediaCount: S.Number,
  index: S.Number,
  zoom: S.Number,
  panX: S.Number,
  panY: S.Number,
  panAnchor: S.Option(PanAnchor),
  mediaSize: S.Option(MediaSize),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  GotLightboxDialogMessage: { message: Dialog.Message },
  NavigatedPrevious: {},
  NavigatedNext: {},
  WentToIndex: { index: S.Number },
  ToggledZoom: {},
  ZoomedIn: {},
  ZoomedOut: {},
  PannedBy: { dx: S.Number, dy: S.Number },
  StartedPan: { x: S.Number, y: S.Number },
  MovedPan: { x: S.Number, y: S.Number },
  EndedPan: {},
  CancelledPan: {},
  MeasuredMedia: { size: MediaSize },
})
export type Message = typeof Message.Type
export const OutMessage = Dialog.OutMessage
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Dialog.InitConfig &
  Readonly<{
    mediaCount?: number
    index?: number
  }>

export const init = (config: InitConfig): Model => ({
  dialog: Dialog.init(config),
  mediaCount: Math.max(1, config.mediaCount ?? 1),
  index: Math.max(0, config.index ?? 0),
  zoom: 1,
  panX: 0,
  panY: 0,
  panAnchor: Option.none(),
  mediaSize: Option.none(),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const mapDialogResult = (
  model: Model,
  result: ReturnType<typeof Dialog.update>,
): UpdateReturn => {
  const { model: dialog, commands: dialogCommands, outMessage } = result
  const commands = dialogCommands ?? []
  return {
    model: { ...model, dialog },
    commands: Command.mapMessages(commands, message =>
      Message['GotLightboxDialogMessage']({ message }),
    ),
    ...(outMessage === undefined ? {} : { outMessage }),
  }
}

const clampIndex = (model: Model, index: number): number =>
  Math.min(Math.max(0, index), Math.max(0, model.mediaCount - 1))

const restMedia = (model: Model): Model => ({
  ...model,
  zoom: 1,
  panX: 0,
  panY: 0,
  panAnchor: Option.none(),
})

const boundedPan = (model: Model, panX: number, panY: number) => {
  if (Option.isNone(model.mediaSize)) return { panX: 0, panY: 0 }
  const size = model.mediaSize.value
  const maxX = Math.max(0, (size.width * model.zoom - size.frameWidth) / 2)
  const maxY = Math.max(0, (size.height * model.zoom - size.frameHeight) / 2)
  return {
    panX: maxX === 0 ? 0 : Math.max(-maxX, Math.min(maxX, panX)),
    panY: maxY === 0 ? 0 : Math.max(-maxY, Math.min(maxY, panY)),
  }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotLightboxDialogMessage':
      return mapDialogResult(
        model,
        Dialog.update(model.dialog, message.message),
      )
    case 'NavigatedPrevious': {
      if (model.index <= 0) return { model }
      return { model: restMedia({ ...model, index: model.index - 1 }) }
    }
    case 'NavigatedNext': {
      if (model.index >= model.mediaCount - 1) return { model }
      return { model: restMedia({ ...model, index: model.index + 1 }) }
    }
    case 'WentToIndex': {
      const index = clampIndex(model, message.index)
      if (index === model.index) return { model }
      return { model: restMedia({ ...model, index }) }
    }
    case 'ToggledZoom': {
      const zoomed = model.zoom > 1
      return {
        model: {
          ...model,
          zoom: zoomed ? 1 : ZOOMED_SCALE,
          panX: zoomed ? 0 : model.panX,
          panY: zoomed ? 0 : model.panY,
          panAnchor: Option.none(),
        },
      }
    }
    case 'ZoomedIn':
      return { model: { ...model, zoom: ZOOMED_SCALE } }
    case 'ZoomedOut':
      return { model: restMedia(model) }
    case 'PannedBy': {
      if (model.zoom <= 1) return { model }
      return {
        model: {
          ...model,
          ...boundedPan(
            model,
            model.panX + message.dx,
            model.panY + message.dy,
          ),
        },
      }
    }
    case 'StartedPan': {
      if (model.zoom <= 1) return { model }
      return {
        model: {
          ...model,
          panAnchor: Option.some({
            x: message.x,
            y: message.y,
            panX: model.panX,
            panY: model.panY,
          }),
        },
      }
    }
    case 'MovedPan': {
      if (model.panAnchor._tag === 'None') return { model }
      const anchor = model.panAnchor.value
      const pan = boundedPan(
        model,
        anchor.panX + (message.x - anchor.x),
        anchor.panY + (message.y - anchor.y),
      )
      return {
        model: {
          ...model,
          ...pan,
          panAnchor: Option.some({ x: message.x, y: message.y, ...pan }),
        },
      }
    }
    case 'EndedPan':
    case 'CancelledPan':
      return { model: { ...model, panAnchor: Option.none() } }
    case 'MeasuredMedia': {
      const measured = { ...model, mediaSize: Option.some(message.size) }
      const pan = boundedPan(measured, model.panX, model.panY)
      return {
        model: {
          ...measured,
          ...pan,
          panAnchor: Option.map(model.panAnchor, anchor => ({
            ...anchor,
            ...pan,
          })),
        },
      }
    }
  }
}

export const open = (model: Model, index?: number): UpdateReturn =>
  mapDialogResult(
    restMedia({
      ...model,
      index: index === undefined ? model.index : clampIndex(model, index),
    }),
    Dialog.open(model.dialog),
  )

export const close = (model: Model): UpdateReturn =>
  mapDialogResult(restMedia(model), Dialog.close(model.dialog))

const observeMediaSize = (element: HTMLElement) =>
  Stream.callback<typeof Message.MeasuredMedia.Type>(queue =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const image = element.querySelector('img')
        if (!image) return undefined
        const emit = () => {
          if (image.offsetWidth === 0 || image.offsetHeight === 0) return
          Queue.offerUnsafe(
            queue,
            Message.MeasuredMedia({
              size: {
                width: image.offsetWidth,
                height: image.offsetHeight,
                frameWidth: element.clientWidth,
                frameHeight: element.clientHeight,
              },
            }),
          )
        }
        const resize = new ResizeObserver(emit)
        resize.observe(element)
        resize.observe(image)
        image.addEventListener('load', emit)
        emit()
        return () => {
          resize.disconnect()
          image.removeEventListener('load', emit)
        }
      }),
      cleanup => Effect.sync(() => cleanup?.()),
    ).pipe(Effect.andThen(Effect.never)),
  )

type PanMessage = Extract<
  Message,
  { _tag: 'StartedPan' | 'MovedPan' | 'EndedPan' | 'CancelledPan' }
>

export const ObserveMedia = Mount.defineStream('ObserveLightboxMedia', {
  messages: [
    Message.MeasuredMedia,
    Message.StartedPan,
    Message.MovedPan,
    Message.EndedPan,
    Message.CancelledPan,
  ],
  execute: ({ element }) =>
    !(element instanceof HTMLElement)
      ? Stream.empty
      : Stream.merge(
          observeMediaSize(element),
          Drag.observeDrag<PanMessage>(element, (down, send) => {
            if (element.getAttribute('aria-pressed') !== 'true') return
            send(Message.StartedPan({ x: down.clientX, y: down.clientY }))
            return {
              onMove: ({ x, y }) => send(Message.MovedPan({ x, y })),
              onEnd: (event, canceled) => {
                if (canceled) send(Message.CancelledPan())
                else {
                  send(Message.MovedPan({ x: event.clientX, y: event.clientY }))
                  send(Message.EndedPan())
                }
              },
            }
          }),
        ),
})

export const mediaMount = <Msg>(toParentMessage: (message: Message) => Msg) =>
  Mount.mapMessage(ObserveMedia(), toParentMessage)

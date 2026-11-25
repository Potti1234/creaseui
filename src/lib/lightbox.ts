import type { Update } from 'foldkit'
import { Effect, Option, Queue, Schema as S, Stream } from 'effect'
import * as Command from 'foldkit/command'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'
import * as Dialog from '@/lib/behaviors/dialog'

import * as Viewport from '@/lib/behaviors/viewport'

/* Renderer-neutral state for the Lightbox port of Meta Astryx's Lightbox:
   gallery index, 1x↔2x zoom, and pointer/keyboard pan while zoomed. Pan and
   zoom compose the Viewport behavior; the zoom frame is its surface and the
   image its world, bounded so the scaled image always covers the frame. */

export const ZOOMED_SCALE = 2
export const KEYBOARD_PAN_STEP = 50

export const Model = S.Struct({
  dialog: Dialog.Model,
  mediaCount: S.Number,
  index: S.Number,
  viewport: Viewport.Model,
  media: S.Option(Viewport.Rect),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  GotLightboxDialogMessage: { message: Dialog.Message },
  GotViewportMessage: { message: Viewport.Message },
  NavigatedPrevious: {},
  NavigatedNext: {},
  WentToIndex: { index: S.Number },
  ToggledZoom: {},
  ZoomedIn: {},
  ZoomedOut: {},
  PannedBy: { dx: S.Number, dy: S.Number },
  MeasuredMedia: { rect: Viewport.Rect },
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
  viewport: Viewport.init(),
  media: Option.none(),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const zoom = (model: Model): number => model.viewport.viewport.zoom
export const isZoomed = (model: Model): boolean => zoom(model) > 1
export const isPanning = (model: Model): boolean =>
  isZoomed(model) && Viewport.isGesturing(model.viewport)

/** The image's style: the viewport transform, scaled about the frame's top-left corner. */
export const mediaStyle = (model: Model): Record<string, string> => {
  const media = Option.getOrUndefined(model.media)
  return {
    ...Viewport.style(model.viewport),
    transformOrigin: `${String(-(media?.left ?? 0))}px ${String(-(media?.top ?? 0))}px`,
  }
}

const viewportOptions = (model: Model): Viewport.Options => ({
  minZoom: 1,
  maxZoom: ZOOMED_SCALE,
  ...Option.match(model.media, {
    onNone: () => ({}),
    onSome: bounds => ({ bounds }),
  }),
})

const withViewport = (
  model: Model,
  { model: viewport }: ReturnType<typeof Viewport.update>,
): UpdateReturn => ({ model: { ...model, viewport } })

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
  viewport: {
    ...model.viewport,
    viewport: Viewport.identity,
    gesture: Option.none(),
  },
})

const canPan = (model: Model): boolean =>
  isZoomed(model) && Option.isSome(model.media)

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotLightboxDialogMessage':
      return mapDialogResult(
        model,
        Dialog.update(model.dialog, message.message),
      )
    case 'GotViewportMessage': {
      if (message.message._tag === 'PressedSurface' && !canPan(model))
        return { model }
      return withViewport(
        model,
        Viewport.update(
          model.viewport,
          message.message,
          viewportOptions(model),
        ),
      )
    }
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
    case 'ToggledZoom':
      return isZoomed(model)
        ? { model: restMedia(model) }
        : update(model, Message.ZoomedIn())
    case 'ZoomedIn':
      return withViewport(
        model,
        Viewport.zoomTo(
          { ...model.viewport, gesture: Option.none() },
          ZOOMED_SCALE,
          Option.none(),
          viewportOptions(model),
        ),
      )
    case 'ZoomedOut':
      return { model: restMedia(model) }
    case 'PannedBy': {
      if (!canPan(model)) return { model }
      return withViewport(
        model,
        Viewport.panBy(
          model.viewport,
          { x: message.dx, y: message.dy },
          viewportOptions(model),
        ),
      )
    }
    case 'MeasuredMedia': {
      const measured = { ...model, media: Option.some(message.rect) }
      return withViewport(
        measured,
        Viewport.setViewport(
          measured.viewport,
          measured.viewport.viewport,
          viewportOptions(measured),
          'resize',
        ),
      )
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

/* The image's box inside the frame at 1x: the canvas rect the viewport keeps covering the frame. */
const observeMedia = (image: HTMLElement) =>
  Stream.callback<typeof Message.MeasuredMedia.Type>(queue =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const emit = () => {
          if (image.offsetWidth === 0 || image.offsetHeight === 0) return
          Queue.offerUnsafe(
            queue,
            Message.MeasuredMedia({
              rect: {
                left: image.offsetLeft,
                top: image.offsetTop,
                right: image.offsetLeft + image.offsetWidth,
                bottom: image.offsetTop + image.offsetHeight,
              },
            }),
          )
        }
        const resize = new ResizeObserver(emit)
        resize.observe(image)
        if (image.offsetParent) resize.observe(image.offsetParent)
        image.addEventListener('load', emit)
        emit()
        return () => {
          resize.disconnect()
          image.removeEventListener('load', emit)
        }
      }),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.andThen(Effect.never)),
  )

export const ObserveMedia = Mount.defineStream('ObserveLightboxMedia', {
  messages: [Message.MeasuredMedia],
  execute: ({ element }) =>
    element instanceof HTMLElement ? observeMedia(element) : Stream.empty,
})

/** Mount on the zoom frame: the Viewport surface, without wheel or zoom keys, which the lightbox maps itself. */
export const frameMount = <Msg>(toParentMessage: (message: Message) => Msg) =>
  Mount.mapMessage(Viewport.Surface({ wheel: false, keys: false }), message =>
    toParentMessage(Message.GotViewportMessage({ message })),
  )

/** Mount on the image; the frame must be its offset parent. */
export const mediaMount = <Msg>(toParentMessage: (message: Message) => Msg) =>
  Mount.mapMessage(ObserveMedia(), toParentMessage)

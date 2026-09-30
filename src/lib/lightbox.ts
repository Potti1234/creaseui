import type { Update } from 'foldkit'
import { Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'
import { Dialog } from '@foldkit/ui'

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

export const Model = S.Struct({
  dialog: Dialog.Model,
  mediaCount: S.Number,
  index: S.Number,
  zoom: S.Number,
  panX: S.Number,
  panY: S.Number,
  panAnchor: S.Option(PanAnchor),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  'GotLightboxDialogMessage': { message: Dialog.Message },
  'NavigatedPrevious': {},
  'NavigatedNext': {},
  'WentToIndex': { index: S.Number },
  'ToggledZoom': {},
  'ZoomedIn': {},
  'ZoomedOut': {},
  'PannedBy': { dx: S.Number, dy: S.Number },
  'StartedPan': { x: S.Number, y: S.Number },
  'MovedPan': { x: S.Number, y: S.Number },
  'EndedPan': {},
  'CancelledPan': {},
});
export type Message = typeof Message.Type
export const OutMessage = Dialog.OutMessage
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Dialog.InitConfig & Readonly<{
  mediaCount?: number;
  index?: number;
}>

export const init = (config: InitConfig): Model => ({
  dialog: Dialog.init(config),
  mediaCount: Math.max(1, config.mediaCount ?? 1),
  index: Math.max(0, config.index ?? 0),
  zoom: 1,
  panX: 0,
  panY: 0,
  panAnchor: Option.none(),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const mapDialogResult = (model: Model, result: ReturnType<typeof Dialog.update>): UpdateReturn => {
  const { model: dialog, commands: dialogCommands, outMessage } = result
  const commands = dialogCommands ?? []
  return {
    model: { ...model, dialog },
    commands: Command.mapMessages(commands, message => Message['GotLightboxDialogMessage']({ message })),
    ...(outMessage === undefined ? {} : { outMessage }),
  }
}

const clampIndex = (model: Model, index: number): number =>
  Math.min(Math.max(0, index), Math.max(0, model.mediaCount - 1))

const restMedia = (model: Model): Model => ({ ...model, zoom: 1, panX: 0, panY: 0, panAnchor: Option.none() })

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotLightboxDialogMessage':
      return mapDialogResult(model, Dialog.update(model.dialog, message.message))
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
      return { model: { ...model, panX: model.panX + message.dx, panY: model.panY + message.dy } }
    }
    case 'StartedPan': {
      if (model.zoom <= 1) return { model }
      return {
        model: {
          ...model,
          panAnchor: Option.some({ x: message.x, y: message.y, panX: model.panX, panY: model.panY }),
        },
      }
    }
    case 'MovedPan': {
      if (model.panAnchor._tag === 'None') return { model }
      const anchor = model.panAnchor.value
      return {
        model: {
          ...model,
          panX: anchor.panX + (message.x - anchor.x),
          panY: anchor.panY + (message.y - anchor.y),
        },
      }
    }
    case 'EndedPan':
    case 'CancelledPan':
      return { model: { ...model, panAnchor: Option.none() } }
  }
}

export const open = (model: Model, index?: number): UpdateReturn =>
  mapDialogResult(
    restMedia({ ...model, index: index === undefined ? model.index : clampIndex(model, index) }),
    Dialog.open(model.dialog),
  )

export const close = (model: Model): UpdateReturn =>
  mapDialogResult(restMedia(model), Dialog.close(model.dialog))

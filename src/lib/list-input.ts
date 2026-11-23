import { Option, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import type { Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as FocusRecovery from '@/lib/behaviors/focus-recovery'
import * as Reorder from '@/lib/behaviors/reorder'
import * as Announce from '@/lib/behaviors/announce'

export const removeId = (id: string, key: string): string =>
  `${id}-remove-${key}`
export const addId = (id: string): string => `${id}-add`
export const reorderId = (id: string, key: string): string =>
  `${id}-reorder-${key}`
export const focusMount = <Msg>(send: (message: Message) => Msg) =>
  FocusRecovery.collectionMount(
    {
      keyAttribute: 'data-list-input-row',
      actionSelector: '[data-list-input-remove]:not(:disabled)',
    },
    message => send(Message.GotFocusRecoveryMessage({ message })),
  )

/* Ported from Meta Astryx ListInput (packages/lab/src/ListInput) — column
   definitions, mutation intents, keyboard reorder state, and live-region
   announcements. Item values stay consumer-owned (`S.Any` payloads); the
   submodel tracks only reorder progress and the last announcement. */

export type ListInputColumn<T, Msg> = Readonly<{
  /** Stable column identifier, forwarded to getFieldStatus. */
  key: string
  /** Field label shown on the first record and repeated when rows stack. */
  header: string
  /** Track width: `{type:'pixel',value}` → `Npx`; `{type:'proportional',value}` → `minmax(140px, Nfr)`. */
  width?: Readonly<{ type: 'pixel' | 'proportional'; value: number }>
  /** Renders the editable control for one cell (parent-boundary). */
  renderInput: (context: ListInputRenderContext<T, Msg>) => Html
}>

export type ListInputValueContext<T> = Readonly<{
  /** Current record. */
  item: T
  /** Current visual position. */
  index: number
  /** Accessible cell label, including the record position. */
  label: string
  /** True because the list row owns the visible column label. */
  isLabelHidden: boolean
}>

export type ListInputRenderContext<T, Msg> = ListInputValueContext<T> &
  Readonly<{
    /** The column's `key` for this cell. */
    columnKey: string
    /** Complete validation status scoped to this field. */
    status?: { type: 'warning' | 'error' | 'success'; message?: string }
    /** Forward to the rendered control so status uses its native tooltip. */
    statusVariant: 'tooltip'
    isDisabled: boolean
    isLoading: boolean
    /** Message factory replacing this record: `(nextItem, columnKey?) => Msg`. */
    updateItem: (nextItem: T, columnKey?: string) => Msg
  }>

export type ListInputChange =
  | Readonly<{ type: 'add'; index: number }>
  | Readonly<{ type: 'update'; index: number; columnKey?: string }>
  | Readonly<{ type: 'remove'; index: number }>
  | Readonly<{ type: 'reorder'; fromIndex: number; toIndex: number }>

export const resolveColumnTrack = (
  width?: Readonly<{ type: 'pixel' | 'proportional'; value: number }>,
): string => {
  if (width?.type === 'pixel') return `${width.value}px`
  const proportion = width?.value ?? 1
  return `minmax(140px, ${proportion}fr)`
}

/** Moves `fromIndex` to `toIndex`, used by the parent's reorder fold. */
export const moveItem = <T>(
  items: ReadonlyArray<T>,
  fromIndex: number,
  toIndex: number,
): ReadonlyArray<T> => {
  const next = [...items]
  const [item] = next.splice(fromIndex, 1)
  if (item === undefined) return items
  next.splice(toIndex, 0, item)
  return next
}

/* --- Submodel ----------------------------------------------------------- */

export const Model = S.Struct({
  id: S.String,
  reorder: Reorder.Model,
  announcement: S.Option(S.String),
  announcer: Announce.Model,
  focusRecovery: FocusRecovery.CollectionModel,
})
export type Model = typeof Model.Type

export type InitConfig = Readonly<{ id: string }>
export const init = (config: InitConfig): Model => ({
  id: config.id,
  reorder: Reorder.init(),
  announcement: Option.none(),
  announcer: Announce.init(),
  focusRecovery: FocusRecovery.initCollection(),
})

export const Message = defineMessageUnion({
  GotFocusRecoveryMessage: { message: FocusRecovery.CollectionMessage },
  /* The new item rides the message: messages must be data because previews
     route them through JSON.stringify, which drops function payloads
     (astryx invokes createItem() inside the click handler; the view samples
     it when it builds the Add intent). */
  AddRequested: {
    item: S.Unknown,
    itemName: S.String,
    position: S.Number,
  },
  RemoveRequested: { index: S.Number, itemName: S.String, position: S.Number },
  FieldEdited: { index: S.Number, nextItem: S.Unknown, columnKey: S.String },
  /* Arrow keys on the handle while not grabbed: immediate one-position move. */
  MoveRequested: {
    key: S.String,
    fromIndex: S.Number,
    toIndex: S.Number,
    itemName: S.String,
    total: S.Number,
  },
  AlreadyAtBoundary: { itemName: S.String, boundary: S.String },
  ReorderRequested: {
    message: Reorder.Message,
    keys: S.Array(S.String),
    itemName: S.String,
  },
  GotAnnouncementMessage: { message: Announce.Message },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  ItemAdded: { item: S.Unknown },
  ItemRemoved: { index: S.Number },
  ItemUpdated: { index: S.Number, nextItem: S.Unknown, columnKey: S.String },
  ItemReordered: { fromIndex: S.Number, toIndex: S.Number },
})
export type OutMessage = typeof OutMessage.Type

export type UpdateReturn = Update.ReturnWithOutMessage<
  Model,
  Message,
  OutMessage
>

const keepReorderFocus = (id: string, key: string) =>
  Command.mapMessages(
    [
      FocusRecovery.RecoverFocus({
        targetId: reorderId(id, key),
        lostId: reorderId(id, key),
      }),
    ],
    message => Message.GotFocusRecoveryMessage({ message }),
  )

export const update = (model: Model, message: Message): UpdateReturn => {
  const result = updateModel(model, message)
  if (
    result.model.announcement === model.announcement ||
    Option.isNone(result.model.announcement)
  )
    return result
  const announced = Announce.update(
    result.model.announcer,
    Announce.Message.RequestedAnnouncement({
      text: result.model.announcement.value,
      priority: 'assertive',
    }),
  )
  return {
    ...result,
    model: { ...result.model, announcer: announced.model },
    commands: [
      ...(result.commands ?? []),
      ...Command.mapMessages(announced.commands ?? [], message =>
        Message.GotAnnouncementMessage({ message }),
      ),
    ],
  }
}

const updateModel = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotAnnouncementMessage': {
      const result = Announce.update(model.announcer, message.message)
      return {
        model: { ...model, announcer: result.model },
        commands: Command.mapMessages(result.commands ?? [], message =>
          Message.GotAnnouncementMessage({ message }),
        ),
      }
    }
    case 'GotFocusRecoveryMessage': {
      const result = FocusRecovery.updateCollection(
        model.focusRecovery,
        message.message,
        { itemId: key => removeId(model.id, key), fallbackId: addId(model.id) },
      )
      return {
        model: { ...model, focusRecovery: result.model },
        commands: Command.mapMessages(result.commands ?? [], message =>
          Message.GotFocusRecoveryMessage({ message }),
        ),
      }
    }
    case 'AddRequested':
      return {
        model: {
          ...model,
          announcement: Option.some(
            `Added ${message.itemName} ${message.position}.`,
          ),
        },
        outMessage: OutMessage.ItemAdded({ item: message.item }),
      }
    case 'RemoveRequested':
      return {
        model: {
          ...model,
          announcement: Option.some(
            `Removed ${message.itemName} ${message.position}.`,
          ),
        },
        outMessage: OutMessage.ItemRemoved({ index: message.index }),
      }
    case 'FieldEdited':
      return {
        model,
        outMessage: OutMessage.ItemUpdated({
          index: message.index,
          nextItem: message.nextItem,
          columnKey: message.columnKey,
        }),
      }
    case 'MoveRequested':
      return {
        commands: keepReorderFocus(model.id, message.key),
        model: {
          ...model,
          announcement: Option.some(
            `${message.itemName} moved to position ${message.toIndex + 1} of ${message.total}.`,
          ),
        },
        outMessage: OutMessage.ItemReordered({
          fromIndex: message.fromIndex,
          toIndex: message.toIndex,
        }),
      }
    case 'AlreadyAtBoundary':
      return {
        model: {
          ...model,
          announcement: Option.some(
            `This ${message.itemName} is already ${message.boundary}.`,
          ),
        },
      }
    case 'ReorderRequested': {
      const reflected = Reorder.update(
        model.reorder,
        Reorder.Message.Reflect({}),
        { value: message.keys },
      ).model
      const result = Reorder.update(reflected, message.message, {
        value: message.keys,
      })
      let announcement = model.announcement
      let outMessage: OutMessage | undefined
      for (const out of result.outMessages) {
        if (out._tag === 'CommittedOrder') {
          const key = Option.match(reflected.maybeDraft, {
            onNone: () =>
              message.message._tag === 'Move' ? message.message.key : '',
            onSome: draft => draft.key,
          })
          outMessage = OutMessage.ItemReordered({
            fromIndex: message.keys.indexOf(key),
            toIndex: out.order.indexOf(key),
          })
        } else {
          const { type, position, total } = out.announcement
          announcement = Option.some(
            type === 'grab'
              ? `${message.itemName} ${position} grabbed. Use arrow keys to move, Space or Enter to drop, and Escape to cancel.`
              : type === 'cancel'
                ? 'Reordering cancelled.'
                : type === 'move' || message.message._tag === 'Move'
                  ? `${message.itemName} moved to position ${position} of ${total}.`
                  : outMessage
                    ? `${message.itemName} dropped at position ${position} of ${total}.`
                    : `${message.itemName} returned to position ${position}.`,
          )
        }
      }
      const maybeFocus =
        message.message._tag === 'Move' && outMessage
          ? Option.some(message.message.key)
          : result.maybeFocus
      return {
        model: { ...model, reorder: result.model, announcement },
        ...(outMessage ? { outMessage } : {}),
        commands: Option.match(maybeFocus, {
          onNone: () => [],
          onSome: key => keepReorderFocus(model.id, key),
        }),
      }
    }
  }
}

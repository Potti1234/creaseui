import { Command, type Component, Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import {
  Drawer,
  DrawerDismissReason,
  DrawerEvents,
  DrawerProps,
  DrawerSnapPoint,
} from '@effect/ui-kit'
import { Effect, Schema, Stream } from 'effect'

export { DrawerEvents as SheetEvents }

export const SheetPurpose = Schema.Literals(['info', 'form', 'required'])
export type SheetPurpose = typeof SheetPurpose.Type
export const SheetBehaviorProps = Schema.Struct({
  ...DrawerProps.fields,
  purpose: Schema.optional(SheetPurpose),
})
export type SheetBehaviorProps = typeof SheetBehaviorProps.Type

type DrawerParts = Component.Headless.Parts<typeof Drawer>

export const SheetBehavior = Html.component({
  name: 'CreaseSheet',
  props: SheetBehaviorProps,
  model: Schema.Null,
  message: DrawerEvents,
  events: DrawerEvents,
}).make({
  init: () => null,
  update: {
    RequestedOpen: ($, event) => $.emit(event),
    RequestedClose: ($, event) => $.emit(event),
    Settled: ($, event) => $.emit(event),
    Snapped: ($, event) => $.emit(event),
  },
  parts: p => {
    const { purpose, ...props } = p.props
    return p.child(Drawer, {
      props: {
        ...props,
        disablePointerDismissal:
          props.disablePointerDismissal === true ||
          purpose === 'form' ||
          purpose === 'required',
      },
      onEmit: event => {
        if (event._tag !== 'RequestedClose') return event
        if (
          purpose === 'required' ||
          (purpose === 'form' && event.reason === 'swipe')
        )
          return undefined
        return event
      },
      parts: (drawer): DrawerParts =>
        purpose === 'required'
          ? {
              ...drawer,
              portal: element =>
                drawer.portal(element.attr('role', 'alertdialog')),
            }
          : drawer,
    })
  },
})

const paneId = Schema.NullOr(Schema.String)
const Pane = Schema.Struct({
  id: Schema.String,
  snapPoints: Schema.optional(Schema.Array(DrawerSnapPoint)),
  purpose: Schema.optional(SheetPurpose),
})
const {
  open: _open,
  swipeDirection: _swipeDirection,
  snapPoints: _snapPoints,
  snapPoint: _snapPoint,
  ...drawerFields
} = DrawerProps.fields
export const SheetSwitcherBehaviorProps = Schema.Struct({
  ...drawerFields,
  sheets: Schema.Array(Pane),
  activeId: Schema.optional(paneId),
  defaultActiveId: Schema.optional(paneId),
})
export type SheetSwitcherBehaviorProps = typeof SheetSwitcherBehaviorProps.Type

export const SheetSwitcherEvents = UiSchema.TaggedEnum({
  ActiveChanged: { id: paneId, reason: Schema.optional(DrawerDismissReason) },
})
export type SheetSwitcherEvents = typeof SheetSwitcherEvents.Type

const Message = UiSchema.TaggedEnum({
  RequestedSheet: {
    id: Schema.String,
    triggerId: Schema.optional(Schema.String),
  },
  RequestedDismiss: { reason: Schema.optional(DrawerDismissReason) },
  ObservedActive: { id: paneId },
  ClearedPrevious: { generation: Schema.Number },
  SettledClosed: {},
  Snapped: { id: Schema.String, point: DrawerSnapPoint },
})

const Model = Schema.Struct({
  localId: paneId,
  observedId: paneId,
  previousId: paneId,
  closingId: paneId,
  triggerId: paneId,
  generation: Schema.Number,
  snaps: Schema.Array(
    Schema.Struct({ id: Schema.String, point: DrawerSnapPoint }),
  ),
})
type Model = typeof Model.Type

const knownPane = (props: SheetSwitcherBehaviorProps, id: string | null) =>
  props.sheets.find(sheet => sheet.id === id)?.id ?? null
const activePane = (props: SheetSwitcherBehaviorProps, model: Model) =>
  knownPane(
    props,
    props.activeId === undefined ? model.localId : props.activeId,
  )

const ClearPrevious = Command.make(
  'ClearCreasePreviousSheet',
  { args: { generation: Schema.Number }, mode: 'switch' },
  ({ generation }) =>
    Effect.as(Effect.sleep(450), Message.ClearedPrevious({ generation })),
)

const WatchActive = Mount.makeStream(
  'WatchCreaseActiveSheet',
  { args: { id: paneId } },
  (_root: HTMLDivElement, _initial, changes) =>
    changes.pipe(Stream.map(({ id }) => Message.ObservedActive({ id }))),
)

const FocusPane = Mount.makeStream(
  'FocusCreaseSheetPane',
  { args: { entering: Schema.Boolean } },
  (pane: HTMLDivElement, initial, changes) =>
    Stream.concat(Stream.make(initial), changes).pipe(
      Stream.runForEach(({ entering }) =>
        Effect.sync(() => {
          if (!entering || pane.inert) return
          const focus =
            pane.querySelector<HTMLElement>('[autofocus]:not(:disabled)') ??
            pane.querySelector<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
            ) ??
            pane
          focus.focus({ preventScroll: true })
        }),
      ),
      Stream.fromEffect,
      Stream.drain,
    ),
)

export const SheetSwitcherBehavior = Html.component({
  name: 'CreaseSheetSwitcher',
  props: SheetSwitcherBehaviorProps,
  model: Model,
  message: Message,
  events: SheetSwitcherEvents,
}).make({
  init: ({ props }) => {
    const localId = knownPane(props, props.defaultActiveId ?? null)
    return {
      localId,
      observedId: knownPane(
        props,
        props.activeId === undefined ? localId : props.activeId,
      ),
      previousId: null,
      closingId: null,
      triggerId: null,
      generation: 0,
      snaps: [],
    }
  },
  update: {
    RequestedSheet: ($, { id, triggerId }) => {
      if (
        knownPane($.props, id) === null ||
        activePane($.props, $.model) === id
      )
        return $.model
      return $.evolve({
        localId: id,
        triggerId: triggerId ?? $.model.triggerId,
      }).emit(SheetSwitcherEvents.ActiveChanged({ id }))
    },
    RequestedDismiss: ($, { reason }) => {
      const id = activePane($.props, $.model)
      if (id === null) return $.model
      return $.evolve({ localId: null }).emit(
        SheetSwitcherEvents.ActiveChanged({
          id: null,
          ...(reason === undefined ? {} : { reason }),
        }),
      )
    },
    ObservedActive: ($, { id }) => {
      const { observedId } = $.model
      if (id === observedId) return $.model
      const generation = $.model.generation + 1
      const step = $.evolve({
        observedId: id,
        previousId: id === null ? null : observedId,
        closingId: id === null ? observedId : null,
        generation,
      }).run(Command.interrupt(ClearPrevious))
      return id === null || observedId === null
        ? step
        : step.run(ClearPrevious.make({ generation }))
    },
    ClearedPrevious: ($, { generation }) =>
      generation === $.model.generation
        ? $.evolve({ previousId: null })
        : $.model,
    SettledClosed: $ =>
      activePane($.props, $.model) === null
        ? $.evolve({ closingId: null, triggerId: null })
        : $.model,
    Snapped: ($, { id, point }) =>
      $.evolve({
        snaps: [...$.model.snaps.filter(snap => snap.id !== id), { id, point }],
      }),
  },
  parts: (p, model) => {
    const {
      sheets,
      activeId: _controlled,
      defaultActiveId: _default,
      ...options
    } = p.props
    const activeId = activePane(p.props, model)
    const renderedId = activeId ?? model.observedId ?? model.closingId
    const previousId =
      activeId === null
        ? null
        : activeId === model.observedId
          ? model.previousId
          : model.observedId
    const pane = sheets.find(sheet => sheet.id === renderedId)
    const triggerId = (id: string) => p.id('trigger', id)
    return p.child(SheetBehavior, {
      props: {
        ...options,
        open: activeId !== null,
        swipeDirection: 'down',
        purpose: pane?.purpose,
        triggerId: options.triggerId ?? model.triggerId,
        snapPoints: pane?.snapPoints,
        snapPoint: model.snaps.find(snap => snap.id === renderedId)?.point,
      },
      onEmit: {
        RequestedOpen: ({ triggerId: source }) => {
          const target = sheets.find(sheet => triggerId(sheet.id) === source)
          return target === undefined || source === null
            ? undefined
            : Message.RequestedSheet({ id: target.id, triggerId: source })
        },
        RequestedClose: ({ reason }) => Message.RequestedDismiss({ reason }),
        Settled: ({ open }) => (open ? undefined : Message.SettledClosed()),
        Snapped: ({ snapPoint: point }) =>
          activeId === null
            ? undefined
            : Message.Snapped({ id: activeId, point }),
      },
      parts: drawer => ({
        drawer,
        activeId,
        renderedId,
        previousId,
        triggerId,
        observe: p.part('div', element =>
          element.onMount(WatchActive({ id: activeId })),
        ),
        select: p.part('button', (element, id: string) =>
          element
            .attrs({ type: 'button', 'data-sheet-target': id })
            .on('click', Message.RequestedSheet({ id })),
        ),
        pane: p.part('div', (element, retained: boolean) =>
          element.onMount(
            FocusPane({ entering: !retained && previousId !== null }),
          ),
        ),
      }),
    })
  },
})

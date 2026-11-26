import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import {
  Popover,
  PopoverEvents,
  PopoverDismissReason,
  PopoverOpenReason,
  PopoverProps,
} from '@effect/ui-kit'
import { Effect, Queue, Schema, Stream } from 'effect'

const FocusEvent = UiSchema.TaggedEnum({
  FocusEntered: { triggerId: Schema.String },
  FocusLeft: {},
})
type FocusEvent = typeof FocusEvent.Type
const Events = UiSchema.TaggedEnum({
  RequestedOpen: {
    triggerId: Schema.NullOr(Schema.String),
    reason: Schema.Literals([...PopoverOpenReason.literals, 'trigger-focus']),
  },
  RequestedClose: { reason: PopoverDismissReason },
  Settled: { open: Schema.Boolean },
})
const Message = Schema.Union([PopoverEvents, FocusEvent])

const FocusScope = Mount.makeStream(
  'CreaseFocusPopoverScope',
  { args: {} },
  (root: HTMLSpanElement) =>
    Stream.callback<FocusEvent>(queue =>
      Effect.gen(function* () {
        const inside = (target: EventTarget | null) => {
          if (!(target instanceof Node)) return false
          if (root.contains(target)) return true
          const portalId = root
            .querySelector('[data-focus-popover-trigger][aria-expanded="true"]')
            ?.getAttribute('aria-controls')
          return (
            portalId != null &&
            root.ownerDocument.getElementById(portalId)?.contains(target)
          )
        }
        const onEnter = (event: globalThis.FocusEvent) => {
          const element = event.target
          if (
            !(element instanceof HTMLButtonElement) ||
            !element.hasAttribute('data-focus-popover-trigger') ||
            element.disabled ||
            !element.matches(':focus-visible') ||
            inside(event.relatedTarget) ||
            !element.id
          )
            return
          Queue.offerUnsafe(
            queue,
            FocusEvent.FocusEntered({ triggerId: element.id }),
          )
        }
        const onLeave = (event: globalThis.FocusEvent) => {
          if (inside(event.relatedTarget)) return
          if (event.relatedTarget !== null)
            Queue.offerUnsafe(queue, FocusEvent.FocusLeft())
          else
            queueMicrotask(() => {
              if (root.isConnected && !inside(root.ownerDocument.activeElement))
                Queue.offerUnsafe(queue, FocusEvent.FocusLeft())
            })
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            root.addEventListener('focusin', onEnter)
            root.addEventListener('focusout', onLeave)
          }),
          () =>
            Effect.sync(() => {
              root.removeEventListener('focusin', onEnter)
              root.removeEventListener('focusout', onLeave)
            }),
        )
        return yield* Effect.never
      }),
    ),
)

/** Adds focus-driven disclosure while the kit owns positioning, pointer dismissal, and the portal. */
export const FocusPopoverBehavior = Html.component({
  name: 'CreaseFocusPopover',
  props: Schema.Struct({
    ...PopoverProps.fields,
    open: Schema.optional(Schema.Boolean),
    defaultOpen: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({
    open: Schema.Boolean,
    byFocus: Schema.Boolean,
    triggerId: Schema.NullOr(Schema.String),
  }),
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => ({
    open: props.defaultOpen ?? false,
    byFocus: false,
    triggerId: null,
  }),
  update: {
    RequestedOpen: ($, event) =>
      $.evolve({ open: true, byFocus: false, triggerId: event.triggerId }).emit(
        event,
      ),
    RequestedClose: ($, event) =>
      $.evolve({ open: false, byFocus: false }).emit(event),
    Settled: ($, event) => $.emit(event),
    FocusEntered: ($, { triggerId }) =>
      ($.props.open ?? $.model.open)
        ? $.model
        : $.evolve({ open: true, byFocus: true, triggerId }).emit(
            Events.RequestedOpen({ triggerId, reason: 'trigger-focus' }),
          ),
    FocusLeft: $ =>
      $.model.byFocus && ($.props.open ?? $.model.open)
        ? $.evolve({ open: false, byFocus: false }).emit(
            Events.RequestedClose({ reason: 'focus-out' }),
          )
        : $.model,
  },
  parts: (p, model) => {
    const {
      defaultOpen: _defaultOpen,
      open = model.open,
      triggerId = model.triggerId,
      ...options
    } = p.props
    return p.child(Popover, {
      props: {
        sideOffset: 4,
        ...options,
        open,
        triggerId,
        ...(model.byFocus ? { initialFocus: false, finalFocus: false } : {}),
      },
      onEmit: {
        RequestedOpen: event => event,
        RequestedClose: event => event,
        Settled: event => event,
      },
      parts: popup => ({
        ...popup,
        focusScope: p.part('span', element => element.onMount(FocusScope())),
      }),
    })
  },
})

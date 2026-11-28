import { Command, Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Drawer } from '@effect/ui-kit'
import { Effect, Queue, Schema, Stream } from 'effect'

const Side = Schema.Literals(['left', 'right'])
const Props = Schema.Struct({
  id: Schema.String,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
  mobileOpen: Schema.optional(Schema.Boolean),
  responsive: Schema.optional(Schema.Boolean),
  side: Schema.optional(Side),
  storageKey: Schema.optional(Schema.String),
  shortcut: Schema.optional(Schema.Boolean),
})
const Message = UiSchema.TaggedEnum({
  Toggled: {},
  OpenMobile: {
    open: Schema.Boolean,
    triggerId: Schema.optional(Schema.NullOr(Schema.String)),
  },
  Resized: { mobile: Schema.Boolean },
  Restored: { open: Schema.Boolean },
  Saved: {},
})
type Message = typeof Message.Type
const Events = UiSchema.TaggedEnum({
  Changed: { open: Schema.Boolean },
  MobileChanged: { open: Schema.Boolean },
})
const Persist = Command.make(
  'CreaseSidebarPersist',
  { args: { key: Schema.String, open: Schema.Boolean }, mode: 'switch' },
  ({ key, open }) =>
    Effect.sync(() => {
      document.cookie = `${encodeURIComponent(key)}=${String(open)}; Path=/; Max-Age=604800; SameSite=Lax`
      return Message.Saved()
    }),
)
const Watch = Mount.makeStream(
  'ObserveCreaseSidebar',
  {
    args: {
      key: Schema.NullOr(Schema.String),
      responsive: Schema.Boolean,
      shortcut: Schema.Boolean,
    },
  },
  (root: HTMLDivElement, initial, changes) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        const doc = root.ownerDocument
        const browser = doc.defaultView
        if (browser === null) return yield* Effect.never
        let settings = initial
        const media = browser.matchMedia('(max-width: 767px)')
        const resize = () =>
          Queue.offerUnsafe(
            queue,
            Message.Resized({ mobile: settings.responsive && media.matches }),
          )
        const restore = () => {
          if (settings.key === null) return
          const prefix = `${encodeURIComponent(settings.key)}=`
          const found = doc.cookie
            .split(';')
            .map(pair => pair.trim())
            .find(pair => pair.startsWith(prefix))
            ?.slice(prefix.length)
          if (found === 'true' || found === 'false')
            Queue.offerUnsafe(
              queue,
              Message.Restored({ open: found === 'true' }),
            )
        }
        const key = (event: KeyboardEvent) => {
          if (
            !settings.shortcut ||
            event.defaultPrevented ||
            (!event.ctrlKey && !event.metaKey) ||
            event.altKey ||
            event.key.toLowerCase() !== 'b' ||
            (event.target instanceof HTMLElement &&
              (event.target.isContentEditable ||
                event.target.matches('input, textarea')))
          )
            return
          const scopes = doc.querySelectorAll('[data-slot="sidebar-wrapper"]')
          if (
            scopes.length > 1 &&
            (doc.activeElement?.closest('[data-slot="sidebar-wrapper"]') ??
              scopes.item(0)) !== root
          )
            return
          event.preventDefault()
          Queue.offerUnsafe(queue, Message.Toggled())
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            media.addEventListener('change', resize)
            doc.addEventListener('keydown', key)
            restore()
            resize()
          }),
          () =>
            Effect.sync(() => {
              media.removeEventListener('change', resize)
              doc.removeEventListener('keydown', key)
            }),
        )
        yield* Stream.runForEach(changes, args =>
          Effect.sync(() => {
            const previous = settings
            settings = args
            if (previous.key !== args.key) restore()
            if (previous.responsive !== args.responsive) resize()
          }),
        )
        return yield* Effect.never
      }),
    ),
)

export const SidebarBehavior = Html.component({
  name: 'CreaseSidebar',
  props: Props,
  model: Schema.Struct({
    open: Schema.Boolean,
    mobile: Schema.Boolean,
    mobileOpen: Schema.Boolean,
    triggerId: Schema.NullOr(Schema.String),
  }),
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => ({
    open: props.defaultOpen ?? true,
    mobile: false,
    mobileOpen: false,
    triggerId: null,
  }),
  update: {
    Toggled: $ => {
      if ($.model.mobile) {
        const open = !($.props.mobileOpen ?? $.model.mobileOpen)
        return $.evolve({ mobileOpen: open }).emit(
          Events.MobileChanged({ open }),
        )
      }
      const open = !($.props.open ?? $.model.open)
      const step = $.evolve({ open }).emit(Events.Changed({ open }))
      return $.props.storageKey === undefined
        ? step
        : step.run(Persist.make({ key: $.props.storageKey, open }))
    },
    OpenMobile: ($, { open, triggerId }) =>
      $.evolve({
        mobileOpen: open,
        triggerId: triggerId ?? $.model.triggerId,
      }).emit(Events.MobileChanged({ open })),
    Resized: ($, { mobile }) =>
      $.model.mobile === mobile
        ? $.model
        : $.evolve({ mobile, mobileOpen: false }),
    Restored: ($, { open }) =>
      $.props.open === undefined ? $.evolve({ open }) : $.model,
    Saved: $ => $.model,
  },
  parts: (p, model) => {
    const open = p.props.open ?? model.open
    const mobileOpen = p.props.mobileOpen ?? model.mobileOpen
    return p.child(Drawer, {
      props: {
        open: model.mobile && mobileOpen,
        triggerId: model.triggerId,
        swipeDirection: p.props.side ?? 'left',
      },
      onEmit: {
        RequestedOpen: ({ triggerId }) =>
          Message.OpenMobile({ open: true, triggerId }),
        RequestedClose: () => Message.OpenMobile({ open: false }),
        Settled: () => undefined,
        Snapped: () => undefined,
      },
      parts: drawer => ({
        drawer,
        open,
        mobile: model.mobile,
        mobileOpen,
        root: p.part('div', element =>
          element.onMount(
            Watch({
              key: p.props.storageKey ?? null,
              responsive: p.props.responsive !== false,
              shortcut: p.props.shortcut !== false,
            }),
          ),
        ),
        toggle: p.part('button', element =>
          element
            .attrs({
              type: 'button',
              'aria-controls': `${p.props.id}-panel`,
              'aria-expanded': String(model.mobile ? mobileOpen : open),
            })
            .on('click', Message.Toggled()),
        ),
      }),
    })
  },
})

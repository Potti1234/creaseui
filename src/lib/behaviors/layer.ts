import { Effect, Queue, Schema as S, Stream } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

/** The integrated submodel remains available for full popovers, including
 * focus restoration, scroll lock, positioning and enter/exit transitions. */
export { Popover } from '@foldkit/ui'

export const DismissReason = S.Literals([
  'escape-key',
  'outside-press',
  'window-blur',
])
export type DismissReason = typeof DismissReason.Type

export const isDismissal = S.is(DismissReason)

const Options = {
  topLayer: S.optionalKey(S.Boolean),
  modal: S.optionalKey(S.Boolean),
  closeOnBlur: S.optionalKey(S.Boolean),
  dismissOnOutsidePress: S.optionalKey(S.Boolean),
}
const Config = S.Struct({
  ...Options,
  insideIds: S.optionalKey(S.Array(S.String)),
})
type Config = typeof Config.Type

type BindOptions = Omit<Config, 'insideIds'> &
  Readonly<{
    contains?: (target: Node) => boolean
    onDismiss: (reason: DismissReason, event: Event) => void
  }>

const contains = (element: Element, target: Node): boolean => {
  const realm = element.ownerDocument.defaultView ?? globalThis
  for (let node: Node | null = target; node !== null;) {
    if (element === node) return true
    node =
      node instanceof realm.Element && node.assignedSlot !== null
        ? node.assignedSlot
        : node instanceof realm.ShadowRoot
          ? node.host
          : node.parentNode
  }
  return false
}

export const supportsTopLayer = (
  element = typeof document === 'undefined'
    ? undefined
    : document.documentElement,
): boolean =>
  typeof element?.showPopover === 'function' &&
  typeof element?.hidePopover === 'function'

type Entry = Readonly<{ element: HTMLElement; options: BindOptions }>
type Resources = Readonly<{
  stack: Array<Entry>
  persistent: Map<HTMLElement, number>
  retainRoots: (element: HTMLElement) => () => void
  release: () => void
}>
const documents = new WeakMap<Document, Resources>()

const begin = (doc: Document): Resources => {
  const stack: Array<Entry> = []
  const persistent = new Map<HTMLElement, number>()
  const win = doc.defaultView
  const realm = win ?? globalThis
  const active = () => stack.filter(({ element }) => element.isConnected)
  const isPersistent = (target: Node) =>
    Array.from(persistent.keys()).some(
      element => element.isConnected && contains(element, target),
    )
  const getTargets = (path: ReadonlyArray<EventTarget>) =>
    path.filter((target): target is Node => target instanceof realm.Node)

  const outside = (targets: ReadonlyArray<Node>) => {
    if (targets.some(isPersistent)) return []
    const dismiss = []
    for (const entry of active().reverse()) {
      if (
        targets.some(
          target =>
            contains(entry.element, target) || entry.options.contains?.(target),
        )
      )
        break
      if (entry.options.dismissOnOutsidePress !== false) dismiss.push(entry)
    }
    return dismiss
  }

  const consume = (event: Event) => {
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  // A modal can disappear on pointerdown; still consume that gesture's click.
  let stopBlockingClick: (() => void) | undefined
  const blockClick = () => {
    const finish = () => {
      doc.removeEventListener('pointerdown', finish, true)
      doc.removeEventListener('pointercancel', finish, true)
      doc.removeEventListener('click', click, true)
      win?.clearTimeout(timer)
      stopBlockingClick = undefined
    }
    const click = (event: MouseEvent) => {
      if (event.detail === 0) return
      consume(event)
      finish()
    }
    const timer = win?.setTimeout(finish, 3000)
    stopBlockingClick?.()
    stopBlockingClick = finish
    doc.addEventListener('pointerdown', finish, true)
    doc.addEventListener('pointercancel', finish, true)
    doc.addEventListener('click', click, true)
  }

  let touch:
    | Readonly<{
        targets: ReadonlyArray<Node>
        x: number
        y: number
      }>
    | undefined
  const onPointerDown = (
    event: PointerEvent,
    path: ReadonlyArray<EventTarget>,
  ) => {
    if (!event.isPrimary) return
    touch = undefined
    const targets = getTargets(path)
    const dismiss = outside(targets)
    const modal = dismiss.some(entry => entry.options.modal === true)
    if (event.pointerType === 'touch' && !modal) {
      touch = { targets, x: event.clientX, y: event.clientY }
      return
    }
    if (modal) {
      consume(event)
      blockClick()
    }
    for (const { options } of dismiss) options.onDismiss('outside-press', event)
  }

  const roots = new Map<EventTarget, { count: number; release: () => void }>()
  const pending = new WeakMap<PointerEvent, EventTarget>()
  const capturePress = (event: Event) => {
    if (!(event instanceof realm.PointerEvent)) return
    const path = event.composedPath()
    const boundary = event.currentTarget
    if (boundary === null) return
    // A closed root hides its descendants from outer listeners. Hand the
    // press to that root before deciding whether it was outside the layer.
    const host = path
      .slice(0, path.indexOf(boundary))
      .find(target => roots.has(target))
    if (host === undefined) {
      pending.delete(event)
      onPointerDown(event, path)
    } else {
      pending.set(event, host)
    }
  }
  const retainRoots = (element: HTMLElement) => {
    const releases: Array<() => void> = []
    let root = element.getRootNode()
    while (root instanceof realm.ShadowRoot) {
      const { host } = root
      if (root.mode === 'closed') {
        const shadow = root
        const fallback = (event: Event) => {
          // If the host itself was pressed, no root listener ran.
          if (
            !(event instanceof realm.PointerEvent) ||
            pending.get(event) !== host
          )
            return
          pending.delete(event)
          onPointerDown(event, event.composedPath())
        }
        let binding = roots.get(host)
        if (binding === undefined) {
          shadow.addEventListener('pointerdown', capturePress, true)
          host.addEventListener('pointerdown', fallback)
          binding = {
            count: 0,
            release: () => {
              shadow.removeEventListener('pointerdown', capturePress, true)
              host.removeEventListener('pointerdown', fallback)
              roots.delete(host)
            },
          }
          roots.set(host, binding)
        }
        const retained = binding
        retained.count++
        releases.push(() => {
          if (--retained.count === 0) retained.release()
        })
      }
      root = host.getRootNode()
    }
    return () => releases.forEach(release => release())
  }

  const onClick = (event: MouseEvent) => {
    const press = touch
    touch = undefined
    if (
      press === undefined ||
      event.detail === 0 ||
      Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10
    )
      return
    const dismiss = outside(press.targets)
    if (dismiss.some(entry => entry.options.modal === true)) consume(event)
    for (const { options } of dismiss) options.onDismiss('outside-press', event)
  }
  const onPointerCancel = () => {
    touch = undefined
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (
      event.key !== 'Escape' ||
      event.defaultPrevented ||
      event.isComposing ||
      event.keyCode === 229 ||
      event.repeat
    )
      return
    const entry = active().at(-1)
    if (entry === undefined) return
    // A native modal owns Escape while focus is in it, unless our layer is inside it.
    const nativeModal = getTargets(event.composedPath()).find(
      (target): target is Element =>
        target instanceof realm.Element && target.matches('dialog:modal'),
    )
    if (nativeModal !== undefined && !contains(nativeModal, entry.element))
      return
    event.preventDefault()
    entry.options.onDismiss('escape-key', event)
  }
  const onBlur = (event: Event) => {
    for (const { options } of active().reverse()) {
      if (options.closeOnBlur === true) options.onDismiss('window-blur', event)
    }
  }
  const onToggle = (event: Event) => {
    if (
      !('newState' in event) ||
      event.newState !== 'open' ||
      !(event.target instanceof realm.Element) ||
      isPersistent(event.target)
    )
      return
    const focused = doc.activeElement
    for (const element of persistent.keys()) {
      if (supportsTopLayer(element) && element.matches(':popover-open')) {
        element.hidePopover()
        element.showPopover()
      }
    }
    if (focused instanceof realm.HTMLElement && focused !== doc.activeElement) {
      focused.focus({ preventScroll: true })
    }
  }

  doc.addEventListener('pointerdown', capturePress, true)
  doc.addEventListener('pointercancel', onPointerCancel, true)
  doc.addEventListener('click', onClick, true)
  doc.addEventListener('keydown', onKeyDown)
  doc.addEventListener('toggle', onToggle, true)
  win?.addEventListener('blur', onBlur)
  return {
    stack,
    persistent,
    retainRoots,
    release: () => {
      doc.removeEventListener('pointerdown', capturePress, true)
      doc.removeEventListener('pointercancel', onPointerCancel, true)
      doc.removeEventListener('click', onClick, true)
      doc.removeEventListener('keydown', onKeyDown)
      doc.removeEventListener('toggle', onToggle, true)
      win?.removeEventListener('blur', onBlur)
    },
  }
}

const acquire = (doc: Document): Resources => {
  const resources = documents.get(doc) ?? begin(doc)
  documents.set(doc, resources)
  return resources
}

const releaseIfUnused = (doc: Document, resources: Resources) => {
  if (resources.stack.length > 0 || resources.persistent.size > 0) return
  resources.release()
  documents.delete(doc)
}

const showInTopLayer = (element: HTMLElement): (() => void) => {
  if (!supportsTopLayer(element) || element.matches(':popover-open'))
    return () => {}
  const previous = element.getAttribute('popover')
  element.setAttribute('popover', 'manual')
  try {
    element.showPopover()
  } catch {
    // Disconnected elements and inactive documents cannot enter the top layer.
  }
  return () => {
    if (element.matches(':popover-open')) element.hidePopover()
    if (previous === null) element.removeAttribute('popover')
    else element.setAttribute('popover', previous)
  }
}

/** Lifecycle binding only: the owner controls open state, focus and semantics. */
export const bindLayer = (
  element: HTMLElement,
  options: BindOptions,
): (() => void) => {
  const doc = element.ownerDocument
  const resources = acquire(doc)
  const entry = { element, options }
  const releaseRoots = resources.retainRoots(element)
  resources.stack.push(entry)
  const hide = options.topLayer === true ? showInTopLayer(element) : undefined
  return () => {
    const index = resources.stack.indexOf(entry)
    if (index === -1) return
    resources.stack.splice(index, 1)
    hide?.()
    releaseRoots()
    releaseIfUnused(doc, resources)
  }
}

/** Keep presses within a persistent region out of the dismissal stack.
 * If already open as a native popover, raise it above later popovers. */
export const bindPersistentLayer = (element: HTMLElement): (() => void) => {
  const doc = element.ownerDocument
  const resources = acquire(doc)
  const releaseRoots = resources.retainRoots(element)
  resources.persistent.set(
    element,
    (resources.persistent.get(element) ?? 0) + 1,
  )
  let bound = true
  return () => {
    if (!bound) return
    bound = false
    const count = resources.persistent.get(element) ?? 0
    if (count <= 1) resources.persistent.delete(element)
    else resources.persistent.set(element, count - 1)
    releaseRoots()
    releaseIfUnused(doc, resources)
  }
}

export const Message = defineMessageUnion({
  RequestedDismissal: { reason: DismissReason },
  CompletedLayerMount: {},
})
export type Message = typeof Message.Type

const KeepLayer = Mount.define('KeepPersistentLayer', {
  messages: [Message.CompletedLayerMount],
  execute: ({ element }) =>
    Effect.acquireRelease(
      Effect.sync(() =>
        element instanceof HTMLElement
          ? bindPersistentLayer(element)
          : () => {},
      ),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.CompletedLayerMount())),
})

export const persistentView = <Msg>(
  send: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
) => [h.OnMount(Mount.mapMessage(KeepLayer(), send))]

export const mount = Mount.defineStream('ObserveLayer', {
  args: Config.fields,
  messages: [Message.RequestedDismissal, Message.CompletedLayerMount],
  execute: ({ element, viewStateChanges, insideIds = [], ...options }) =>
    viewStateChanges.pipe(
      Stream.switchMap(state =>
        state === 'Paused'
          ? Stream.never
          : Stream.callback<Message>(queue =>
              Effect.gen(function* () {
                const realm = element.ownerDocument.defaultView ?? globalThis
                if (!(element instanceof realm.HTMLElement))
                  return yield* Effect.never
                const root = element.getRootNode()
                yield* Effect.acquireRelease(
                  Effect.sync(() =>
                    bindLayer(element, {
                      ...options,
                      contains: target =>
                        (root instanceof realm.Document ||
                          root instanceof realm.ShadowRoot) &&
                        insideIds.some(id => {
                          const inside = root.getElementById(id)
                          return inside !== null && contains(inside, target)
                        }),
                      onDismiss: reason => {
                        Queue.offerUnsafe(
                          queue,
                          Message.RequestedDismissal({ reason }),
                        )
                      },
                    }),
                  ),
                  cleanup => Effect.sync(cleanup),
                )
                Queue.offerUnsafe(queue, Message.CompletedLayerMount())
                return yield* Effect.never
              }),
            ),
      ),
    ),
})

export const view = <Msg>(
  config: Config,
  send: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
) => [h.OnMount(Mount.mapMessage(mount(config), send))]

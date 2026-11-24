import type { Attribute, HtmlBuilder } from 'foldkit/html'

/** Mark the surface so its owner can style it in either rendering mode. */
export const attributes = <Msg>(h: HtmlBuilder<Msg>): Attribute<Msg>[] => [
  h.DataAttribute('portal', 'top-layer'),
]

export const supportsTopLayer = (element: HTMLElement): boolean =>
  typeof element.showPopover === 'function' &&
  typeof element.hidePopover === 'function'

const inactive = () => {}

/** Acquire the native top layer for a mounted surface without changing its DOM parent. */
export const activate = (element: HTMLElement): (() => void) => {
  if (
    !element.isConnected ||
    !supportsTopLayer(element) ||
    element.matches(':popover-open')
  )
    return inactive

  const previous = element.getAttribute('popover')
  const restore = () => {
    if (element.getAttribute('popover') !== 'manual') return
    if (previous === null) element.removeAttribute('popover')
    else element.setAttribute('popover', previous)
  }

  element.setAttribute('popover', 'manual')
  try {
    element.showPopover()
  } catch {
    restore()
    return inactive
  }
  // A beforetoggle listener can cancel the request without throwing.
  if (!element.matches(':popover-open')) {
    restore()
    return inactive
  }

  let released = false
  return () => {
    if (released) return
    released = true
    try {
      if (element.matches(':popover-open')) element.hidePopover()
    } finally {
      restore()
    }
  }
}

const portalRootId = 'foldkit-portal-root'
const dialogPortalMarker = 'data-foldkit-portal-root'

/** Move the floating surface out of clipping ancestors while preserving its DOM scope. */
export const portalToContainingRoot = (element: Element): (() => void) => {
  const doc = element.ownerDocument
  const root = element.getRootNode()
  const realm = doc.defaultView
  const owner = realm && root instanceof realm.ShadowRoot ? root : doc
  const dialog = element.closest('dialog')
  let host = dialog
    ? dialog.querySelector(`:scope > [${dialogPortalMarker}]`)
    : owner.getElementById(portalRootId)
  if (!host) {
    host = doc.createElement('div')
    if (dialog) {
      host.setAttribute(dialogPortalMarker, '')
      dialog.append(host)
    } else {
      host.id = portalRootId
      const parent = owner === doc ? doc.body : owner
      parent.prepend(host)
    }
  }
  const container = host
  container.append(element)
  return () => {
    if (element.parentNode === container) element.remove()
    if (dialog && !container.hasChildNodes()) container.remove()
  }
}

/** Keep the trigger wrapper above its backdrop inside a modal dialog. */
export const portalBackdrop = (element: Element): (() => void) => {
  const dialog = element.closest('dialog')
  const wrapper = element.parentElement
  if (!dialog || !wrapper || dialog === wrapper)
    return portalToContainingRoot(element)
  wrapper.before(element)
  const parent = element.parentNode
  return () => {
    if (element.parentNode === parent) element.remove()
  }
}

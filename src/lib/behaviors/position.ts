import { Effect, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import * as Mount from 'foldkit/mount'

import { Message, position, type Align, type Side } from './position-native'
import { portalToContainingRoot } from './portal'

export * from './position-native'

const placements = S.Literals([
  'top',
  'right',
  'bottom',
  'left',
  'top-start',
  'top-end',
  'right-start',
  'right-end',
  'bottom-start',
  'bottom-end',
  'left-start',
  'left-end',
])
const padding = S.Union([
  S.Number,
  S.Struct({
    top: S.optionalKey(S.Number),
    right: S.optionalKey(S.Number),
    bottom: S.optionalKey(S.Number),
    left: S.optionalKey(S.Number),
  }),
])
export const AnchorConfig = S.Struct({
  placement: S.optional(placements),
  gap: S.optional(S.Number),
  offset: S.optional(S.Number),
  padding: S.optional(padding),
  portal: S.optional(S.Boolean),
  isPlacementLocked: S.optional(S.Boolean),
})
export type AnchorConfig = typeof AnchorConfig.Type
export type AnchorSetupConfig = Readonly<{
  buttonId: string
  anchor: AnchorConfig
  interceptTab?: boolean
  focusAfterPosition?: boolean
  focusSelector?: string
  arrowId?: string
  arrowPadding?: number
}>

export { portalBackdrop, portalToContainingRoot } from './portal'

const insideFixedContainer = (element: Element, realm: Window): boolean => {
  for (
    let ancestor: Element | null = element;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    if (realm.getComputedStyle(ancestor).position === 'fixed') return true
  }
  return false
}

/** Bind the established AnchorConfig contract to CreaseUI positioning. */
export const bindAnchor = (
  panel: Element,
  config: AnchorSetupConfig,
): (() => void) => {
  const realm = panel.ownerDocument.defaultView
  if (realm === null || !(panel instanceof realm.HTMLElement)) return () => {}
  const root = panel.getRootNode()
  const inShadow = root instanceof realm.ShadowRoot
  const owner = inShadow ? root : panel.ownerDocument
  const trigger = owner.getElementById(config.buttonId)
  if (!(trigger instanceof realm.HTMLElement)) return () => {}

  const { anchor } = config
  const portal = anchor.portal ?? true
  const releasePortal = portal ? portalToContainingRoot(panel) : undefined
  const fixed = inShadow || (portal && insideFixedContainer(trigger, realm))
  const [side, align = 'center'] = (anchor.placement ?? 'bottom-start').split(
    '-',
  ) as [Side, Align?]
  const candidate =
    config.arrowId === undefined ? null : owner.getElementById(config.arrowId)
  const arrow =
    candidate !== panel && panel.contains(candidate) ? candidate : null
  const styles = [
    '--button-width',
    'max-height',
    'overflow-y',
    'overscroll-behavior',
  ] as const
  const originalStyles = styles.map(name => ({
    name,
    value: panel.style.getPropertyValue(name),
    priority: panel.style.getPropertyPriority(name),
  }))
  const originalPlacement = panel.getAttribute('data-placement')
  let placed = false
  let focusFrame: number | undefined
  const stop = position(trigger, panel, {
    side,
    align,
    sideOffset: anchor.gap ?? 0,
    alignOffset: anchor.offset ?? 0,
    padding: anchor.padding ?? 0,
    lockPlacement: anchor.isPlacementLocked ?? false,
    strategy: fixed ? 'fixed' : 'absolute',
    arrow,
    arrowPadding: config.arrowPadding ?? 0,
    onSize: ({ referenceWidth, availableHeight }) => {
      panel.style.setProperty('--button-width', `${referenceWidth}px`)
      panel.style.maxHeight = `${availableHeight}px`
      if (arrow === null) {
        panel.style.overflowY = 'auto'
        panel.style.overscrollBehavior = 'none'
      }
    },
    onPlaced: placement => {
      panel.setAttribute('data-placement', placement.split('-')[0] ?? 'bottom')
      if (placed) return
      placed = true
      panel.style.removeProperty('visibility')
      if (config.focusAfterPosition) {
        focusFrame = realm.requestAnimationFrame(() => {
          const target = config.focusSelector
            ? owner.querySelector(config.focusSelector)
            : panel
          if (target instanceof realm.HTMLElement)
            target.focus({ preventScroll: true })
        })
      }
    },
  })
  const interceptTab = portal && config.interceptTab !== false
  const handleTab = (event: KeyboardEvent) => {
    if (event.key === 'Tab') trigger.focus()
  }
  if (interceptTab) panel.addEventListener('keydown', handleTab)
  return () => {
    stop()
    if (focusFrame !== undefined) realm.cancelAnimationFrame(focusFrame)
    if (interceptTab) panel.removeEventListener('keydown', handleTab)
    if (originalPlacement === null) panel.removeAttribute('data-placement')
    else panel.setAttribute('data-placement', originalPlacement)
    for (const { name, value, priority } of originalStyles) {
      panel.style.setProperty(name, value, priority)
    }
    releasePortal?.()
  }
}

export const mount = Mount.define('AttachPositionAnchor', {
  args: {
    buttonId: S.String,
    anchor: AnchorConfig,
    interceptTab: S.optionalKey(S.Boolean),
    focusAfterPosition: S.optionalKey(S.Boolean),
    focusSelector: S.optionalKey(S.String),
    arrowId: S.optionalKey(S.String),
    arrowPadding: S.optionalKey(S.Number),
  },
  messages: [Message.CompletedPosition],
  execute: ({ element, viewStateChanges: _viewStateChanges, ...config }) =>
    Effect.acquireRelease(
      Effect.sync(() => bindAnchor(element, config)),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.CompletedPosition())),
})

export const view = <Msg>(
  config: AnchorSetupConfig,
  send: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
) => [
  h.Style({ position: 'absolute', margin: '0', visibility: 'hidden' }),
  h.OnMount(Mount.mapMessage(mount(config), send)),
]

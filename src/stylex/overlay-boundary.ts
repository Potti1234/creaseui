import { Effect, Schema as S } from 'effect'
import * as Mount from 'foldkit/mount'
import { Anchor, Combobox } from '@foldkit/ui'

/**
 * StyleX themes in Crease may be scoped below the document root. Foldkit's
 * default portal moves anchored content to `document.body`, where inherited
 * theme variables are unavailable. Keep StyleX overlays in the themed subtree
 * so inheritance remains deterministic.
 *
 * Overlays that must escape clipping use the theme-copying Mount below.
 * Components must not opt into the body portal without this boundary.
 */
export const THEMED_OVERLAY_PORTAL = false as const

export const themedAnchor = <
  const Anchor extends Readonly<Record<string, unknown>>,
>(
  anchor: Anchor,
): Anchor & Readonly<{ portal: false }> => ({
  ...anchor,
  portal: THEMED_OVERLAY_PORTAL,
})

/** Snapshot inherited custom properties before portaling, and keep them in
 * sync with theme changes on the original ancestors. Preserve direction and
 * the theme's font as well. Restore inline styles and observers on unmount. */
const inheritPortalTheme = (element: HTMLElement): (() => void) => {
  const source = element.parentElement
  if (!source) return () => {}
  const saved = new Map<string, { value: string; priority: string }>()
  let inherited = new Set<string>()
  const restore = (name: string) => {
    const previous = saved.get(name)
    if (previous?.value)
      element.style.setProperty(name, previous.value, previous.priority)
    else element.style.removeProperty(name)
  }
  const refresh = () => {
    const computed = element.ownerDocument.defaultView?.getComputedStyle(source)
    if (!computed) return
    const next = new Set<string>(['direction', 'font-family', 'color-scheme'])
    for (let index = 0; index < computed.length; index++) {
      const name = computed.item(index)
      if (name.startsWith('--')) next.add(name)
    }
    for (const name of next) {
      if (!saved.has(name))
        saved.set(name, {
          value: element.style.getPropertyValue(name),
          priority: element.style.getPropertyPriority(name),
        })
      element.style.setProperty(name, computed.getPropertyValue(name))
    }
    for (const name of inherited) if (!next.has(name)) restore(name)
    inherited = next
  }
  refresh()
  const observer = new MutationObserver(refresh)
  for (
    let ancestor: Element | null = source;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    observer.observe(ancestor, {
      attributes: true,
      attributeFilter: ['class', 'style', 'dir'],
    })
  }
  return () => {
    observer.disconnect()
    for (const name of saved.keys()) restore(name)
  }
}

/** Combobox anchoring with an explicit theme-preserving portal. The input
 * keeps focus on option presses, matching Foldkit's AnchorCombobox Mount. */
export const AnchorThemedCombobox = Mount.define('AnchorThemedCombobox', {
  args: { buttonId: S.String, anchor: Anchor.AnchorConfig },
  messages: [Combobox.Message.CompletedAnchorCombobox],
  execute: ({ element, buttonId, anchor }) =>
    Effect.gen(function* () {
      yield* Effect.acquireRelease(
        Effect.sync(() => {
          if (!(element instanceof HTMLElement)) return () => {}
          const releaseTheme = inheritPortalTheme(element)
          const preventBlur = (event: PointerEvent) => event.preventDefault()
          element.addEventListener('pointerdown', preventBlur, {
            capture: true,
          })
          const releaseAnchor = Anchor.anchorSetup(element, {
            buttonId,
            anchor: { ...anchor, portal: true },
            interceptTab: false,
          })
          return () => {
            releaseAnchor()
            element.removeEventListener('pointerdown', preventBlur, {
              capture: true,
            })
            releaseTheme()
          }
        }),
        release => Effect.sync(release),
      )
      return Combobox.Message.CompletedAnchorCombobox()
    }),
})

export const themedComboboxPanel = <Msg>(
  buttonId: string,
  anchor: Anchor.AnchorConfig,
  send: (message: Combobox.Message) => Msg,
) => Mount.mapMessage(AnchorThemedCombobox({ buttonId, anchor }), send)

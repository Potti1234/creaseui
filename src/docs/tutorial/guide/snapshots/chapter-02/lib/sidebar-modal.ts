// @ts-nocheck: snapshot of creaseui-demo chapter-02:src/lib/sidebar-modal.ts
import { Effect, Stream } from 'effect'
import * as Dom from 'foldkit/dom'
import type { Attribute, HtmlBuilder } from 'foldkit/html'

/* Foldkit's DevTools host stays usable while the panel is modal. */
const DEVTOOLS_HOST_ID = 'foldkit-devtools'

export const MOBILE_MODAL_ID = 'sidebar-mobile-modal'

/* Every renderer hides the mobile panel from 768px (`md`). */
const MOBILE_QUERY = '(max-width: 767.98px)'

type Held = Readonly<{ origin: Element | null }>

/** Mount attribute on the open mobile Sidebar's `<dialog>`: the same modal
   handling Foldkit's Dialog acquires (focus trap, inert and hidden
   background, scroll lock, Escape as `cancel`). The modal is held only while
   the viewport is narrow enough to show the panel, so an open mobile state on
   a desktop viewport leaves the page usable. When the panel unmounts the
   resources are released and focus returns to the element that opened it. */
export const mobileModalMount = <Msg>(
  id: string,
  h: HtmlBuilder<Msg>,
): Attribute<Msg> =>
  h.OnMount({
    name: 'AcquireSidebarMobileModal',
    f: () =>
      Stream.callback<never>(() =>
        Effect.gen(function* () {
          let held: Held | undefined
          const acquire = Effect.gen(function* () {
            if (held !== undefined) return
            const origin = document.activeElement
            const isAcquired = yield* Dom.showDialog(`#${id}`, {
              isModal: true,
              allowedOutsideSelectors: [`#${DEVTOOLS_HOST_ID}`],
            }).pipe(Effect.catch(() => Effect.succeed(false)))
            if (!isAcquired) return
            yield* Dom.lockScroll
            held = { origin }
          })
          const release = (restoreFocus: boolean) =>
            Effect.gen(function* () {
              if (held === undefined) return
              const { origin } = held
              held = undefined
              yield* Dom.releaseDialogResources(id)
              const active = document.activeElement
              if (
                restoreFocus &&
                origin instanceof HTMLElement &&
                origin.isConnected &&
                (active === null || active === document.body)
              )
                origin.focus()
            })
          yield* Effect.acquireRelease(
            Effect.gen(function* () {
              const query = window.matchMedia(MOBILE_QUERY)
              const onChange = (event: MediaQueryListEvent) => {
                Effect.runFork(event.matches ? acquire : release(false))
              }
              if (query.matches) yield* acquire
              query.addEventListener('change', onChange)
              return { query, onChange }
            }),
            ({ query, onChange }) =>
              Effect.gen(function* () {
                query.removeEventListener('change', onChange)
                yield* release(true)
              }),
          )
          return yield* Effect.never
        }),
      ),
  })

import { Effect, Stream } from 'effect'
import * as Dom from 'foldkit/dom'
import type { Attribute, HtmlBuilder } from 'foldkit/html'

/* Foldkit's DevTools host stays usable while the panel is modal. */
const DEVTOOLS_HOST_ID = 'foldkit-devtools'

export const MOBILE_MODAL_ID = 'sidebar-mobile-modal'

/** Mount attribute on the open mobile Sidebar's `<dialog>`: the same modal
   handling Foldkit's Dialog acquires (focus trap, inert and hidden
   background, scroll lock, Escape as `cancel`). While mounted, focus stays
   inside the panel; when the panel unmounts the resources are released and
   focus returns to the element that opened it (the trigger). */
export const mobileModalMount = <Msg>(
  id: string,
  h: HtmlBuilder<Msg>,
): Attribute<Msg> =>
  h.OnMount({
    name: 'AcquireSidebarMobileModal',
    f: () =>
      Stream.callback<never>(() =>
        Effect.gen(function* () {
          yield* Effect.acquireRelease(
            Effect.gen(function* () {
              const origin = document.activeElement
              const isAcquired = yield* Dom.showDialog(`#${id}`, {
                isModal: true,
                allowedOutsideSelectors: [`#${DEVTOOLS_HOST_ID}`],
              }).pipe(Effect.catch(() => Effect.succeed(false)))
              if (isAcquired) yield* Dom.lockScroll
              return { isAcquired, origin }
            }),
            ({ isAcquired, origin }) =>
              Effect.gen(function* () {
                if (isAcquired) yield* Dom.releaseDialogResources(id)
                const active = document.activeElement
                if (
                  origin instanceof HTMLElement &&
                  origin.isConnected &&
                  (active === null || active === document.body)
                )
                  origin.focus()
              }),
          )
          return yield* Effect.never
        }),
      ),
  })

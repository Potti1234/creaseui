import { Effect, Stream } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'

/* A `<details>` keeps its `open` state in the DOM, outside the model — the
   Elm update loop cannot dismiss it. This mount adds the popover behaviors
   browsers leave out: link selection, outside pointer-down and Escape close
   the details. `name` distinguishes instances that can coexist on a page
   (site header vs. doc shell). */
export const autoCloseDetails = <Msg>(h: HtmlBuilder<Msg>, name: string) =>
  h.OnMount({
    name,
    f: element =>
      Stream.callback<Msg>(() =>
        Effect.gen(function* () {
          yield* Effect.acquireRelease(
            Effect.sync(() => {
              if (!(element instanceof HTMLDetailsElement)) return undefined
              const document_ = element.ownerDocument
              const onPointerDown = (event: PointerEvent) => {
                if (
                  event.target instanceof Node &&
                  !element.contains(event.target)
                )
                  element.open = false
              }
              const onClick = (event: MouseEvent) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest('a') !== null
                )
                  element.open = false
              }
              const onKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') element.open = false
              }
              document_.addEventListener('pointerdown', onPointerDown, {
                capture: true,
              })
              element.addEventListener('click', onClick)
              element.addEventListener('keydown', onKeyDown)
              return () => {
                document_.removeEventListener('pointerdown', onPointerDown, {
                  capture: true,
                })
                element.removeEventListener('click', onClick)
                element.removeEventListener('keydown', onKeyDown)
              }
            }),
            release => Effect.sync(() => release?.()),
          )
          return yield* Effect.never
        }),
      ),
  })

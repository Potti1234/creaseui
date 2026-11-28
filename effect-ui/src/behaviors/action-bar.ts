import { Mount } from '@effect/ui'
import { Effect, Queue, Stream } from 'effect'

export { ToolbarBehavior as ActionBarBehavior } from './toolbar'

export const ObserveActionBarEscape = Mount.makeStream(
  'ObserveActionBarEscape',
  { args: {} },
  (node: HTMLElement) =>
    Stream.callback<'Escape'>(queue =>
      Effect.gen(function* () {
        const document = node.ownerDocument
        const onKeyDown = (event: KeyboardEvent) => {
          if (
            event.key !== 'Escape' ||
            event.defaultPrevented ||
            document.querySelector(
              'dialog[open], [popover="manual"]:popover-open:not([data-slot="toast-viewport"])',
            ) !== null
          )
            return
          const last = Array.from(
            document.querySelectorAll('[data-slot="action-bar"]'),
          ).at(-1)
          if (!node.contains(last ?? null)) return
          event.preventDefault()
          Queue.offerUnsafe(queue, 'Escape')
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => document.addEventListener('keydown', onKeyDown)),
          () =>
            Effect.sync(() =>
              document.removeEventListener('keydown', onKeyDown),
            ),
        )
        return yield* Effect.never
      }),
    ),
)

import { Mount } from '@effect/ui'
import { Effect, Schema, Stream } from 'effect'

export {
  ToastProvider as ToastBehavior,
  ToastProviderEvents,
  ToastProviderProps,
  type ToastData,
  type ToastItem,
} from '@effect/ui-kit'

const SwipeDirection = Schema.Literals(['left', 'right', 'start', 'end'])
type Swipe = {
  readonly card: HTMLElement
  readonly id: number
  readonly x: number
  readonly y: number
  readonly sign: -1 | 1
  active: boolean
}

const watchSwipe = (
  provider: HTMLElement,
  {
    direction,
    threshold,
  }: {
    readonly direction: typeof SwipeDirection.Type
    readonly threshold: number
  },
) =>
  Stream.callback<never>(() =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const listener = new AbortController()
        const { signal } = listener
        const window = provider.ownerDocument.defaultView
        let swipe: Swipe | undefined
        const displacement = (event: PointerEvent, gesture: Swipe) =>
          Math.max(0, gesture.sign * (event.clientX - gesture.x))
        const reset = () => {
          swipe?.card.removeAttribute('data-swiping')
          swipe = undefined
          provider.style.removeProperty('--crease-toast-swipe-x')
        }

        provider.addEventListener(
          'pointerdown',
          event => {
            if (swipe !== undefined || event.button !== 0 || !event.isPrimary)
              return
            const target = event.target
            if (
              !(target instanceof Element) ||
              target.closest('a,button,input,select,textarea,[contenteditable]')
            )
              return
            const card = target.closest<HTMLElement>(
              '[data-slot="toast"]:not([data-ending-style], [data-limited])',
            )
            if (card?.closest('[data-slot="toast-provider"]') !== provider)
              return
            const rtl = window?.getComputedStyle(card).direction === 'rtl'
            const right =
              direction === 'right' ||
              (direction === 'start' && rtl) ||
              (direction === 'end' && !rtl)
            swipe = {
              card,
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              sign: right ? 1 : -1,
              active: false,
            }
          },
          { signal },
        )

        window?.addEventListener(
          'pointermove',
          event => {
            const gesture = swipe
            if (gesture?.id !== event.pointerId) return
            const offset = displacement(event, gesture)
            if (!gesture.active) {
              if (offset < 5 || offset <= Math.abs(event.clientY - gesture.y))
                return
              gesture.active = true
              gesture.card.setAttribute('data-swiping', '')
            }
            event.preventDefault()
            provider.style.setProperty(
              '--crease-toast-swipe-x',
              `${gesture.sign * offset}px`,
            )
          },
          { signal, passive: false },
        )

        window?.addEventListener(
          'pointerup',
          event => {
            const gesture = swipe
            if (gesture?.id !== event.pointerId) return
            if (gesture.active && displacement(event, gesture) >= threshold) {
              gesture.card.setAttribute(
                'data-swipe-dismissed',
                gesture.sign === 1 ? 'right' : 'left',
              )
              // Follow the kit's user-dismissal path, including its Dismissed event.
              gesture.card
                .querySelector<HTMLButtonElement>('[data-toast-close]')
                ?.click()
            }
            reset()
          },
          { signal },
        )

        window?.addEventListener(
          'pointercancel',
          event => {
            if (swipe?.id === event.pointerId) reset()
          },
          { signal },
        )
        window?.addEventListener('blur', reset, { signal })
        return () => {
          listener.abort()
          reset()
        }
      }),
      cleanup => Effect.sync(cleanup),
    ),
  )

export const TrackToastSwipe = Mount.makeStream(
  'TrackCreaseToastSwipe',
  { args: { direction: SwipeDirection, threshold: Schema.Number } },
  (provider: HTMLElement, initial, changes) =>
    Stream.concat(Stream.make(initial), changes).pipe(
      Stream.switchMap(args => watchSwipe(provider, args)),
    ),
)

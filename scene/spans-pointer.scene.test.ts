import { Effect, Fiber, Stream } from 'effect'
import { liveViewStateChanges } from 'foldkit/mount'
import { expect, it, vi } from 'vitest'

import { Pointer } from '@/lib/behaviors/spans-pointer'
import type { PointerMessage } from '@/lib/behaviors/spans'

const withTrack = async (
  autoScroll: boolean,
  run: (
    track: HTMLElement,
    messages: ReadonlyArray<PointerMessage>,
  ) => Promise<void>,
): Promise<void> => {
  const track = document.createElement('div')
  track.dataset.spanTrack = 'studio'
  document.body.append(track)
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(20, 40, 200, 50),
  )
  const listeners = vi.spyOn(track, 'addEventListener')
  const messages: PointerMessage[] = []
  const fiber = Effect.runFork(
    Pointer({ autoScroll, edge: 48, speed: 18 })
      .f(track, liveViewStateChanges)
      .pipe(
        Stream.runForEach(message =>
          Effect.sync(() => {
            messages.push(message)
          }),
        ),
      ),
  )
  try {
    await vi.waitFor(() =>
      expect(listeners).toHaveBeenCalledWith(
        'pointermove',
        expect.any(Function),
        expect.anything(),
      ),
    )
    await run(track, messages)
  } finally {
    await Effect.runPromise(Fiber.interrupt(fiber))
    track.remove()
  }
}

const pointer = (track: HTMLElement, type: string, x: number, y = 60): void => {
  track.dispatchEvent(
    new PointerEvent(type, {
      clientX: x,
      clientY: y,
      pointerId: 1,
      isPrimary: true,
      button: 0,
      bubbles: true,
    }),
  )
}

it('measures the mounted track itself when dragging', async () => {
  await withTrack(false, async (track, messages) => {
    pointer(track, 'pointerdown', 40)
    pointer(track, 'pointermove', 120)
    await vi.waitFor(() =>
      expect(messages).toEqual([
        expect.objectContaining({ _tag: 'PressedTrack' }),
        expect.objectContaining({
          _tag: 'MovedPointer',
          rects: [
            {
              track: 'studio',
              left: 20,
              top: 40,
              width: 200,
              height: 50,
              rtl: false,
            },
          ],
        }),
      ]),
    )
  })
})

import { Effect, Fiber, Schema } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import { makeElement } from 'foldkit/runtime'
import { expect, it, vi } from 'vitest'

const Model = Schema.Struct({ value: Schema.String })
const Message = defineMessageUnion({ UpdatedInput: { value: Schema.String } })

it('keeps newer input intact while the runtime catches up to deferred edits', async () => {
  const host = document.createElement('div')
  const container = host.appendChild(document.createElement('div'))
  container.id = 'deferred-input-app'
  document.body.append(host)
  let now = 0
  const clock = vi.spyOn(performance, 'now').mockImplementation(() => now)
  const app = makeElement({
    container,
    Model,
    init: () => ({ model: { value: '' } }),
    update: (_, message: typeof Message.Type) => {
      now += 6
      return { model: { value: message.value } }
    },
    view: (model, h) =>
      h.div(
        [],
        [
          h.input([
            h.Value(model.value),
            h.DataAttribute('rendered-value', model.value),
            h.OnInput(value => Message.UpdatedInput({ value })),
          ]),
        ],
      ),
  })
  const fiber = Effect.runFork(app.start())
  const frames: FrameRequestCallback[] = []
  const raf = vi.spyOn(globalThis, 'requestAnimationFrame')
  try {
    const input = await vi.waitFor(() => {
      const element = host.querySelector('input')
      if (element === null) throw new Error('Input not mounted')
      return element
    })
    raf.mockImplementation(callback => frames.push(callback))
    const runFrame = () => {
      const frame = frames.shift()
      if (frame === undefined) throw new Error('No render scheduled')
      frame(now)
    }
    const edit = (value: string) => {
      input.value = value
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }

    // The first edit exceeds the 5 ms drain budget; the second is queued.
    edit('A')
    edit('Al')
    // Run the frames in the same task so MessageChannel cannot drain the queue.
    for (let refused = 0; refused < 3; refused++) {
      runFrame()
      expect(input.value).toBe('Al')
      expect(input.dataset.renderedValue).toBe('')
    }
    runFrame()
    expect(input.value).toBe('Al')
    expect(input.dataset.renderedValue).toBe('Al')
  } finally {
    raf.mockRestore()
    clock.mockRestore()
    await Effect.runPromise(Fiber.interrupt(fiber))
    host.remove()
  }
})

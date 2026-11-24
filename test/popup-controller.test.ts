import assert from 'node:assert/strict'
import { it } from 'node:test'
import { Deferred, Effect, Fiber, Queue } from 'effect'

import * as Controller from '../src/lib/behaviors/popup-controller'

it('waits through opening and settles once with typed close details', async () => {
  await Effect.runPromise(
    Effect.gen(function* () {
      const queue = yield* Queue.unbounded<Controller.OpenRequest<number>>()
      const controller = Controller.make<number, 'saved', 'done', 'user'>(
        request => {
          Queue.offerUnsafe(queue, request)
        },
      )
      const waiting = yield* Effect.forkChild(controller.openUntilClose(42))
      const request = yield* Queue.take(queue)
      const id = request.correlationId
      assert.equal(request.settleOn, 'close')
      assert.equal(request.input, 42)
      assert.equal(controller.resolve(id, 'opened'), false)
      assert.equal(controller.isPending(id), true)
      const details = {
        reason: 'done',
        source: 'user',
        returnValue: 'saved',
      } as const
      assert.equal(controller.settleClose(id, details), true)
      assert.equal(controller.settleClose(id, details), false)
      assert.deepEqual(yield* Fiber.join(waiting), {
        status: 'closed',
        ...details,
      })

      const rejected = yield* Effect.forkChild(controller.openUntilClose(43))
      const second = yield* Queue.take(queue)
      assert.equal(
        controller.rejectOpen(second.correlationId, 'already-open'),
        true,
      )
      assert.deepEqual(yield* Fiber.join(rejected), {
        status: 'rejected',
        reason: 'already-open',
      })

      const cancelled = yield* Effect.forkChild(controller.openUntilClose(44))
      const third = yield* Queue.take(queue)
      assert.equal(controller.cancel(third.correlationId), true)
      assert.equal(controller.settleClose(third.correlationId, details), false)
      assert.deepEqual(yield* Fiber.join(cancelled), { status: 'cancelled' })

      const disposed = yield* Effect.forkChild(controller.openUntilClose(45))
      yield* Queue.take(queue)
      controller.dispose()
      assert.deepEqual(yield* Fiber.join(disposed), { status: 'disposed' })
    }).pipe(Effect.timeout('3 seconds')),
  )
})

it('dispatches lazily and pairs overlapping replies with their requests', async () => {
  await Effect.runPromise(
    Effect.gen(function* () {
      const dispatched =
        yield* Queue.unbounded<Controller.OpenRequest<string>>()
      const controller = Controller.make<string>(request => {
        Queue.offerUnsafe(dispatched, request)
      })
      const open = controller.requestOpen('programmatic')
      assert.equal(Queue.sizeUnsafe(dispatched), 0)
      const first = yield* Effect.forkChild(open)
      const a = yield* Queue.take(dispatched)
      const second = yield* Effect.forkChild(open)
      const b = yield* Queue.take(dispatched)
      assert.equal(a._tag, 'RequestedPopupOpen')
      assert.equal(a.input, 'programmatic')
      assert.notEqual(a.correlationId, b.correlationId)
      assert.equal(controller.resolve(b.correlationId, 'rejected'), true)
      assert.equal(controller.resolve(a.correlationId, 'opened'), true)
      assert.equal(controller.resolve(a.correlationId, 'already-open'), false)
      assert.equal(yield* Fiber.join(first), 'opened')
      assert.equal(yield* Fiber.join(second), 'rejected')
    }).pipe(Effect.timeout('3 seconds')),
  )
})

it('clears cancelled and interrupted requests and disposes queued requests', async () => {
  await Effect.runPromise(
    Effect.gen(function* () {
      const dispatched =
        yield* Queue.unbounded<Controller.OpenRequest<number>>()
      const controller = Controller.make<number>(request => {
        Queue.offerUnsafe(dispatched, request)
      })
      const cancelled = yield* Effect.forkChild(controller.requestOpen(1))
      const a = yield* Queue.take(dispatched)
      assert.equal(controller.cancel(a.correlationId), true)
      assert.equal(yield* Fiber.join(cancelled), 'cancelled')
      assert.equal(controller.isPending(a.correlationId), false)

      const interrupted = yield* Effect.forkChild(controller.requestOpen(2))
      const b = yield* Queue.take(dispatched)
      yield* Fiber.interrupt(interrupted)
      assert.equal(controller.isPending(b.correlationId), false)
      assert.equal(controller.resolve(b.correlationId, 'opened'), false)

      const pending = yield* Effect.forkChild(controller.requestOpen(3))
      const c = yield* Queue.take(dispatched)
      const alsoPending = yield* Effect.forkChild(controller.requestOpen(4))
      yield* Queue.take(dispatched)
      controller.dispose()
      controller.dispose()
      assert.equal(yield* Fiber.join(pending), 'disposed')
      assert.equal(yield* Fiber.join(alsoPending), 'disposed')
      assert.equal(controller.cancel(c.correlationId), false)
      assert.equal(yield* controller.requestOpen(5), 'disposed')
      assert.equal(Queue.sizeUnsafe(dispatched), 0)
    }).pipe(Effect.timeout('3 seconds')),
  )
})

it('cleans up when dispatch fails and accepts synchronous owner replies', async () => {
  const dispatched = Deferred.makeUnsafe<string>()
  const failed = Controller.make<null>(({ correlationId }) => {
    Deferred.doneUnsafe(dispatched, Effect.succeed(correlationId))
    throw new Error('dispatcher stopped')
  })
  await assert.rejects(Effect.runPromise(failed.requestOpen(null)), /stopped/)
  assert.equal(
    failed.isPending(await Effect.runPromise(Deferred.await(dispatched))),
    false,
  )

  const immediate = Controller.make<null>(({ correlationId }) => {
    assert.equal(immediate.isPending(correlationId), true)
    immediate.resolve(correlationId, 'already-open')
  })
  assert.equal(
    await Effect.runPromise(immediate.requestOpen(null)),
    'already-open',
  )
})

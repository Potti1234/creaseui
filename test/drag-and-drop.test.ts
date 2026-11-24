import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Option, Schema, Stream } from 'effect'
import { Window } from 'happy-dom'
import * as Dnd from '../src/lib/behaviors/drag-and-drop.ts'

const idle = Dnd.init({ id: 'board' })
const item = { itemId: 'item', containerId: 'source', index: 1 }
const press = Dnd.Message.PressedDraggable({ ...item, screenX: 0, screenY: 0 })
const destination = { containerId: 'destination', index: 2 }
const move = (screenX: number, target: Option.Option<typeof destination>) =>
  Dnd.Message.MovedPointer({
    screenX,
    screenY: 0,
    clientX: 20,
    clientY: 40,
    maybeDropTarget: target,
  })

describe('DragAndDrop', () => {
  it('activates at the threshold and emits a parent-owned drop intent', () => {
    const pending = Dnd.update(idle, press).model
    assert.equal(Dnd.isDragging(pending), false)
    assert.equal(Option.getOrThrow(Dnd.maybeDraggedItemId(pending)), 'item')
    assert.equal(
      Dnd.update(pending, move(4, Option.some(destination))).model,
      pending,
    )
    assert.deepEqual(Dnd.update(pending, Dnd.Message.ReleasedPointer()), {
      model: idle,
    })
    const dragging = Dnd.update(
      pending,
      move(5, Option.some(destination)),
    ).model
    assert.ok(Schema.is(Dnd.Model)(dragging))
    assert.equal(Dnd.isDragging(dragging), true)
    assert.deepEqual(
      Option.getOrThrow(Dnd.maybeDropTarget(dragging)),
      destination,
    )
    assert.equal(
      Option.getOrThrow(Dnd.ghostStyle(dragging)).transform,
      'translate3d(20px, 40px, 0)',
    )
    assert.deepEqual(Dnd.update(dragging, Dnd.Message.ReleasedPointer()), {
      model: idle,
      outMessage: Dnd.OutMessage.Reordered({
        itemId: 'item',
        fromContainerId: 'source',
        fromIndex: 1,
        toContainerId: 'destination',
        toIndex: 2,
      }),
    })
    const outside = Dnd.update(dragging, move(10, Option.none())).model
    assert.ok(Option.isNone(Dnd.maybeDropTarget(outside)))
    assert.deepEqual(Dnd.update(outside, Dnd.Message.ReleasedPointer()), {
      model: idle,
      outMessage: Dnd.OutMessage.Cancelled(),
    })
  })

  it('uses local pointer hit testing and restores existing document drag styles', async () => {
    const window = new Window()
    const { document } = window
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'document')
    Object.defineProperty(globalThis, 'document', {
      value: document,
      configurable: true,
    })
    try {
      const list = document.createElement('div')
      const row = document.createElement('div')
      const child = document.createElement('span')
      list.setAttribute('data-droppable-id', 'destination')
      row.setAttribute('data-sortable-id', 'another-item')
      row.append(child)
      list.append(row)
      document.body.append(list)
      document.documentElement.style.setProperty(
        'user-select',
        'text',
        'important',
      )
      Object.defineProperty(document, 'elementsFromPoint', {
        value: () => [child],
      })
      const subscription = Dnd.subscriptions.documentPointer
      const pending = Dnd.update(
        idle,
        Dnd.Message.PressedDraggable({
          ...item,
          screenX: 0,
          screenY: 0,
          pointerId: 7,
        }),
      ).model
      const events = subscription.dependenciesToStream(
        subscription.modelToDependencies(pending),
      )
      const result = Effect.runPromise(
        Stream.runCollect(Stream.take(events, 2)).pipe(
          Effect.timeout('2 seconds'),
        ),
      )
      // Wait for the subscription to acquire its document styles before moving.
      const pointer = setInterval(() => {
        if (document.head.querySelector('style') === null) return
        document.dispatchEvent(
          new window.PointerEvent('pointerup', { pointerId: 8 }),
        )
        document.dispatchEvent(
          new window.PointerEvent('pointermove', {
            pointerId: 7,
            screenX: 5,
            screenY: 0,
            clientX: 20,
            clientY: 40,
          }),
        )
        document.dispatchEvent(
          new window.PointerEvent('pointercancel', { pointerId: 7 }),
        )
      }, 10)
      const [moved, cancelled] = Array.from(
        await result.finally(() => clearInterval(pointer)),
      )
      assert.ok(moved)
      assert.equal(moved._tag, 'MovedPointer')
      assert.deepEqual(cancelled, Dnd.Message.CancelledDrag())
      const dragging = Dnd.update(pending, moved).model
      assert.deepEqual(Option.getOrThrow(Dnd.maybeDropTarget(dragging)), {
        containerId: 'destination',
        index: 1,
      })
      assert.equal(
        document.documentElement.style.getPropertyValue('user-select'),
        'text',
      )
      assert.equal(
        document.documentElement.style.getPropertyPriority('user-select'),
        'important',
      )
      assert.equal(document.head.querySelector('style'), null)
    } finally {
      if (previous) Object.defineProperty(globalThis, 'document', previous)
      else Reflect.deleteProperty(globalThis, 'document')
      await window.close()
    }
  })

  it('executes local keyboard navigation and restores focus on drop or cancel', async () => {
    const window = new Window()
    const { document } = window
    const globals = {
      document,
      HTMLElement: window.HTMLElement,
      requestAnimationFrame: window.requestAnimationFrame.bind(window),
    }
    const previous = Object.entries(globals).map(([key, value]) => {
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, key)
      Object.defineProperty(globalThis, key, { value, configurable: true })
      return { key, descriptor }
    })
    try {
      const source = document.createElement('div')
      const destination = document.createElement('div')
      const handle = document.createElement('button')
      source.setAttribute('data-droppable-id', item.containerId)
      destination.setAttribute('data-droppable-id', 'destination')
      handle.setAttribute('data-draggable-id', item.itemId)
      source.append(handle)
      document.body.append(source, destination)
      const activated = Dnd.update(
        idle,
        Dnd.Message.ActivatedKeyboardDrag(item),
      ).model
      const previousLane = Dnd.update(
        activated,
        Dnd.Message.PressedArrowKey({ direction: 'PreviousContainer' }),
      ).commands?.[0]
      assert.ok(previousLane)
      assert.deepEqual(
        await Effect.runPromise(previousLane.effect),
        Dnd.Message.CompletedResolveKeyboardMove({
          targetContainerId: item.containerId,
          targetIndex: item.index,
        }),
      )
      const movement = Dnd.update(
        activated,
        Dnd.Message.PressedArrowKey({ direction: 'NextContainer' }),
      )
      const command = movement.commands?.[0]
      assert.ok(command)
      const completion = await Effect.runPromise(command.effect)
      assert.deepEqual(
        completion,
        Dnd.Message.CompletedResolveKeyboardMove({
          targetContainerId: 'destination',
          targetIndex: 0,
        }),
      )
      const moved = Dnd.update(activated, completion).model
      assert.deepEqual(Option.getOrThrow(Dnd.maybeDropTarget(moved)), {
        containerId: 'destination',
        index: 0,
      })
      const dropped = Dnd.update(moved, Dnd.Message.ConfirmedKeyboardDrop())
      assert.deepEqual(
        dropped.outMessage,
        Dnd.OutMessage.Reordered({
          itemId: 'item',
          fromContainerId: 'source',
          fromIndex: 1,
          toContainerId: 'destination',
          toIndex: 0,
        }),
      )
      const cancelled = Dnd.update(moved, Dnd.Message.CancelledDrag())
      assert.deepEqual(cancelled.outMessage, Dnd.OutMessage.Cancelled())
      for (const result of [dropped, cancelled]) {
        assert.deepEqual(result.model, idle)
        assert.equal(Dnd.update(result.model, completion).model, result.model)
        const focus = result.commands?.[0]
        assert.ok(focus)
        handle.blur()
        assert.deepEqual(
          await Effect.runPromise(focus.effect),
          Dnd.Message.CompletedFocusItem(),
        )
        assert.equal(document.activeElement, handle)
      }
    } finally {
      for (const { key, descriptor } of previous) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else Reflect.deleteProperty(globalThis, key)
      }
      await window.close()
    }
  })
})

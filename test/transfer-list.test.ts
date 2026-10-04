import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Option } from 'effect'
import { DragAndDrop as Dnd } from '@foldkit/ui'

import * as TransferList from '../src/ui/transfer-list.ts'

const options: ReadonlyArray<TransferList.TransferListOption> = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
]

const CONTAINER_ID = 't-selected'

const dnd = (message: Dnd.Message) =>
  TransferList.Message.GotDndMessage({ message })

describe('TransferList', () => {
  it('moves an option into the value on add', () => {
    const model = TransferList.init({ id: 't', value: ['a'] })
    const next = TransferList.update(
      model,
      TransferList.Message.ClickedTransferListAdd({
        value: 'b',
        label: 'B',
        index: 1,
      }),
      options,
    )
    assert.deepEqual(next.model.value, ['a', 'b'])
    assert.equal(next.outMessage?._tag, 'ChangedTransferList')
  })

  it('moves an option out of the value on remove', () => {
    const model = TransferList.init({ id: 't', value: ['a', 'b'] })
    const next = TransferList.update(
      model,
      TransferList.Message.ClickedTransferListRemove({
        value: 'a',
        label: 'A',
        index: 0,
      }),
      options,
    )
    assert.deepEqual(next.model.value, ['b'])
  })

  it('clears the whole selection', () => {
    const model = TransferList.init({ id: 't', value: ['a', 'b', 'c'] })
    const next = TransferList.update(
      model,
      TransferList.Message.ClickedTransferListClear(),
      options,
    )
    assert.deepEqual(next.model.value, [])
  })

  it('reorders via a pointer drag through the DragAndDrop primitive', () => {
    let model = TransferList.init({ id: 't', value: ['a', 'b', 'c'] })
    let next = TransferList.update(
      model,
      dnd(
        Dnd.Message.PressedDraggable({
          itemId: 'a',
          containerId: CONTAINER_ID,
          index: 0,
          screenX: 0,
          screenY: 0,
        }),
      ),
      options,
    )
    model = next.model
    assert.equal(model.dnd.dragState._tag, 'Pending')
    assert.equal(model.suppressNextHandleClick, true)

    next = TransferList.update(
      model,
      dnd(
        Dnd.Message.MovedPointer({
          screenX: 0,
          screenY: 10,
          clientX: 0,
          clientY: 10,
          maybeDropTarget: Option.some({
            containerId: CONTAINER_ID,
            index: 2,
          }),
        }),
      ),
      options,
    )
    model = next.model
    assert.equal(model.dnd.dragState._tag, 'Dragging')
    assert.match(model.announcement, /moved to position 2 of 3/)

    next = TransferList.update(
      model,
      dnd(Dnd.Message.ReleasedPointer()),
      options,
    )
    model = next.model
    /* Insertion index 2 over the DOM list (dragged row still counted)
       converts to final index 1 — the row lands between b and c. */
    assert.deepEqual(model.value, ['b', 'a', 'c'])
    assert.equal(next.outMessage?._tag, 'ChangedTransferList')
    assert.match(model.announcement, /dropped\. Position 2 of 3/)
  })

  it('reorders via keyboard drag and announces the grab', () => {
    let model = TransferList.init({ id: 't', value: ['a', 'b', 'c'] })
    let next = TransferList.update(
      model,
      TransferList.Message.ClickedReorderHandle({ value: 'a', label: 'A' }),
      options,
    )
    model = next.model
    assert.equal(model.dnd.dragState._tag, 'KeyboardDragging')
    assert.match(model.announcement, /A grabbed\. Current position 1 of 3/)

    next = TransferList.update(
      model,
      dnd(
        Dnd.Message.CompletedResolveKeyboardMove({
          targetContainerId: CONTAINER_ID,
          targetIndex: 1,
        }),
      ),
      options,
    )
    model = next.model
    assert.match(model.announcement, /moved to position 2 of 3/)

    next = TransferList.update(
      model,
      dnd(Dnd.Message.ConfirmedKeyboardDrop()),
      options,
    )
    model = next.model
    assert.deepEqual(model.value, ['b', 'a', 'c'])
    assert.equal(next.outMessage?._tag, 'ChangedTransferList')
  })

  it('restores the value and announces on Escape cancel', () => {
    let model = TransferList.init({ id: 't', value: ['a', 'b', 'c'] })
    let next = TransferList.update(
      model,
      TransferList.Message.ClickedReorderHandle({ value: 'b', label: 'B' }),
      options,
    )
    model = next.model
    next = TransferList.update(model, dnd(Dnd.Message.CancelledDrag()), options)
    model = next.model
    assert.equal(model.dnd.dragState._tag, 'Idle')
    assert.deepEqual(model.value, ['a', 'b', 'c'])
    assert.equal(next.outMessage, undefined)
    assert.match(model.announcement, /B move cancelled/)
  })

  it('keeps a reorder-disabled row pinned against pointer drops', () => {
    const locked: ReadonlyArray<TransferList.TransferListOption> = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', isReorderDisabled: true },
      { value: 'c', label: 'C' },
    ]
    let model = TransferList.init({ id: 't', value: ['a', 'b', 'c'] })

    /* The locked row's own handle cannot start a drag. */
    let next = TransferList.update(
      model,
      dnd(
        Dnd.Message.PressedDraggable({
          itemId: 'b',
          containerId: CONTAINER_ID,
          index: 1,
          screenX: 0,
          screenY: 0,
        }),
      ),
      locked,
    )
    assert.equal(next.model.dnd.dragState._tag, 'Idle')

    /* Dropping 'a' past the locked 'b' clamps to the movable range — the
       drop lands back on its own slot and is announced as a return. */
    next = TransferList.update(
      model,
      dnd(
        Dnd.Message.PressedDraggable({
          itemId: 'a',
          containerId: CONTAINER_ID,
          index: 0,
          screenX: 0,
          screenY: 0,
        }),
      ),
      locked,
    )
    model = next.model
    next = TransferList.update(
      model,
      dnd(
        Dnd.Message.MovedPointer({
          screenX: 0,
          screenY: 10,
          clientX: 0,
          clientY: 10,
          maybeDropTarget: Option.some({
            containerId: CONTAINER_ID,
            index: 3,
          }),
        }),
      ),
      locked,
    )
    model = next.model
    next = TransferList.update(
      model,
      dnd(Dnd.Message.ReleasedPointer()),
      locked,
    )
    model = next.model
    assert.deepEqual(model.value, ['a', 'b', 'c'])
    assert.equal(next.outMessage, undefined)
    assert.match(model.announcement, /returned to position 1/)
  })

  it('swallows the click that trails a pointer drag', () => {
    let model = TransferList.init({ id: 't', value: ['a', 'b'] })
    let next = TransferList.update(
      model,
      dnd(
        Dnd.Message.PressedDraggable({
          itemId: 'a',
          containerId: CONTAINER_ID,
          index: 0,
          screenX: 0,
          screenY: 0,
        }),
      ),
      options,
    )
    model = next.model
    next = TransferList.update(
      model,
      TransferList.Message.ClickedReorderHandle({ value: 'a', label: 'A' }),
      options,
    )
    model = next.model
    assert.equal(model.suppressNextHandleClick, false)
    assert.equal(model.dnd.dragState._tag, 'Pending')
  })

  it('ignores drag messages while reordering is disabled', () => {
    const model = TransferList.init({ id: 't', value: ['a', 'b'] })
    const next = TransferList.update(
      model,
      dnd(
        Dnd.Message.PressedDraggable({
          itemId: 'a',
          containerId: CONTAINER_ID,
          index: 0,
          screenX: 0,
          screenY: 0,
        }),
      ),
      options,
      false,
    )
    assert.equal(next.model.dnd.dragState._tag, 'Idle')
  })
})

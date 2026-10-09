import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Toast from '../src/lib/toast.ts'

const finishAnimation = (model: Toast.Model, id: string) => {
  const generation = model.entries.find(entry => entry.id === id)!.animation
    .transitionGeneration
  const painted = Toast.update(
    model,
    Toast.Message.GotAnimationMessage({
      entryId: id,
      message: { _tag: 'CompletedWaitForPaint', generation },
    }),
  ).model
  return Toast.update(
    painted,
    Toast.Message.GotAnimationMessage({
      entryId: id,
      message: { _tag: 'EndedAnimation', generation },
    }),
  )
}

describe('Toast notification behavior', () => {
  it('drags with its pointer, snaps back below threshold, and dismisses past it', () => {
    let model = Toast.init({ id: 'swipe', swipeToDismiss: { threshold: 60 } })
    for (let index = 0; index < 4; index++)
      model = Toast.show(
        model,
        Toast.plain({ title: `Toast ${index}`, sticky: true }),
      ).model
    for (const entry of model.entries)
      model = finishAnimation(model, entry.id).model
    const press = (current: Toast.Model, entryId = 'swipe-entry-3') =>
      Toast.update(
        current,
        Toast.Message.PressedEntryPointer({
          entryId,
          pointerId: 7,
          clientX: 100,
        }),
      ).model
    assert.equal(
      press(model, 'swipe-entry-0').entries[0]?.swipeState._tag,
      'Idle',
    )
    const dragging = press(model)
    const wrongPointer = Toast.update(
      dragging,
      Toast.Message.MovedSwipePointer({ pointerId: 8, clientX: 200 }),
    ).model
    assert.equal(
      Toast.stackLayout(wrongPointer, 'bottom-right', true).entries[0]?.style[
        '--toast-swipe-movement-x'
      ],
      '0px',
    )
    const moved = Toast.update(
      dragging,
      Toast.Message.MovedSwipePointer({ pointerId: 7, clientX: 130 }),
    ).model
    assert.equal(
      Toast.stackLayout(moved, 'bottom-right', true).entries[0]?.style
        .transform,
      'translateX(30px) translateY(0px) scale(1)',
    )
    const short = Toast.update(
      moved,
      Toast.Message.ReleasedSwipePointer({ pointerId: 7, clientX: 130 }),
    )
    assert.equal(short.model.entries[3]?.swipeState._tag, 'Settling')
    assert.equal(short.model.entries[3]?.animation.transitionState, 'Idle')
    assert.ok(
      short.commands?.some(command => command.name === 'WaitForSwipeSettled'),
    )
    const cancelled = Toast.update(
      press(short.model),
      Toast.Message.CancelledSwipe({ pointerId: 7 }),
    ).model
    assert.equal(cancelled.entries[3]?.swipeState._tag, 'Settling')
    const released = Toast.update(
      press(cancelled),
      Toast.Message.ReleasedSwipePointer({ pointerId: 7, clientX: 180 }),
    ).model
    assert.equal(released.entries[3]?.swipeState._tag, 'Dismissing')
    assert.equal(released.entries[3]?.animation.transitionState, 'LeaveStart')
    const generation = released.entries[3]!.animation.transitionGeneration
    const painted = Toast.update(
      released,
      Toast.Message.GotAnimationMessage({
        entryId: 'swipe-entry-3',
        message: { _tag: 'CompletedWaitForPaint', generation },
      }),
    ).model
    const layout = Toast.stackLayout(painted, 'bottom-right', true)
    assert.equal(
      layout.entries[0]?.style.transform,
      'translateX(150%) translateY(0px) scale(1)',
    )
    assert.equal(layout.entries[0]?.style.opacity, '0')
    const removed = finishAnimation(released, 'swipe-entry-3')
    assert.equal(removed.outMessage?.entry.id, 'swipe-entry-3')
    assert.equal(Toast.visibleEntries(removed.model).length, 3)
    assert.equal(removed.model.limitedIds.length, 0)
  })

  it('mirrors left-position swipes, supports custom direction, and can disable gestures', () => {
    const left = Toast.init({ id: 'left', position: 'bottom-left' })
    assert.equal(Option.getOrThrow(left.maybeSwipeConfig).direction, 'Left')
    assert.equal(
      Option.getOrThrow(
        Toast.init({
          id: 'custom',
          swipeToDismiss: { direction: 'Left', threshold: 90 },
        }).maybeSwipeConfig,
      ).threshold,
      90,
    )
    const off = Toast.show(
      Toast.init({ id: 'off', swipeToDismiss: false }),
      Toast.plain({ title: 'No swipe', sticky: true }),
    ).model
    const pressed = Toast.update(
      off,
      Toast.Message.PressedEntryPointer({
        entryId: 'off-entry-0',
        pointerId: 1,
        clientX: 50,
      }),
    ).model
    assert.equal(pressed.entries[0]?.swipeState._tag, 'Idle')
    let model = Toast.show(
      left,
      Toast.plain({ title: 'Swipe left', sticky: true }),
    ).model
    model = finishAnimation(model, 'left-entry-0').model
    model = Toast.update(
      model,
      Toast.Message.PressedEntryPointer({
        entryId: 'left-entry-0',
        pointerId: 1,
        clientX: 100,
      }),
    ).model
    const wrongDirection = Toast.update(
      model,
      Toast.Message.MovedSwipePointer({ pointerId: 1, clientX: 180 }),
    ).model
    assert.equal(
      Toast.stackLayout(wrongDirection, 'bottom-left', true).entries[0]?.style[
        '--toast-swipe-movement-x'
      ],
      '0px',
    )
    const closed = Toast.update(
      model,
      Toast.Message.ReleasedSwipePointer({ pointerId: 1, clientX: 30 }),
    ).model
    const painted = Toast.update(
      closed,
      Toast.Message.GotAnimationMessage({
        entryId: 'left-entry-0',
        message: {
          _tag: 'CompletedWaitForPaint',
          generation: closed.entries[0]!.animation.transitionGeneration,
        },
      }),
    ).model
    assert.equal(
      Toast.stackLayout(painted, 'bottom-left', true).entries[0]?.style
        .transform,
      'translateX(-150%) translateY(0px) scale(1)',
    )
  })

  it('shows the newest three, queues older entries, and ignores their timers', () => {
    let model = Toast.init({ id: 'queue' })
    for (let index = 0; index < 8; index += 1)
      model = Toast.show(model, Toast.info({ title: `Toast ${index}` })).model
    assert.deepEqual(
      Toast.visibleEntries(model).map(entry => entry.payload.title),
      ['Toast 5', 'Toast 6', 'Toast 7'],
    )
    assert.equal(model.limitedIds.length, 5)
    const queued = model.entries[0]!
    assert.equal(queued.isHovered, true)
    const stale = Toast.update(
      model,
      Toast.Message.CompletedWaitBeforeDismissal({
        entryId: queued.id,
        version: queued.pendingDismissVersion,
      }),
    ).model
    assert.equal(stale, model)
    const closing = Toast.dismiss(model, 'queue-entry-7').model
    assert.equal(Toast.visibleEntries(closing).length, 3)
    const promoted = finishAnimation(closing, 'queue-entry-7')
    assert.deepEqual(
      Toast.visibleEntries(promoted.model).map(entry => entry.payload.title),
      ['Toast 4', 'Toast 5', 'Toast 6'],
    )
    assert.ok(
      promoted.commands?.some(
        command =>
          command.name === 'WaitBeforeDismissal' &&
          command.args?.['entryId'] === 'queue-entry-4',
      ),
    )
  })

  it('changes the visible limit without losing queued payloads or IDs', () => {
    let model = Toast.init({ id: 'queue', limit: 2 })
    for (let index = 0; index < 6; index += 1)
      model = Toast.show(
        model,
        Toast.plain({ title: `Toast ${index}`, sticky: true }),
      ).model
    const changed = Toast.update(
      model,
      Toast.Message.ChangedToastLimit({ limit: 5 }),
    ).model
    assert.equal(Toast.visibleEntries(changed).length, 5)
    assert.deepEqual(
      changed.entries.map(entry => entry.id),
      model.entries.map(entry => entry.id),
    )
    const updated = Toast.updateToast(changed, 'queue-entry-0', {
      title: 'Updated while queued',
      variant: 'Success',
    }).model
    assert.equal(updated.limitedIds.includes('queue-entry-0'), true)
    assert.equal(updated.entries[0]?.payload.title, 'Updated while queued')
  })

  it('keeps every timer paused until both viewport hover and focus leave', () => {
    let model = Toast.init({ id: 'queue' })
    for (let index = 0; index < 4; index += 1)
      model = Toast.show(model, Toast.info({ title: `Toast ${index}` })).model
    model = Toast.update(
      model,
      Toast.Message.ChangedToastViewportPointer({
        position: 'bottom-right',
        fallbackPosition: 'bottom-right',
        hovered: true,
        pause: true,
      }),
    ).model
    model = Toast.update(
      model,
      Toast.Message.ChangedToastViewportFocus({
        position: 'bottom-right',
        fallbackPosition: 'bottom-right',
        focused: true,
      }),
    ).model
    model = Toast.update(
      model,
      Toast.Message.ChangedToastViewportPointer({
        position: 'bottom-right',
        fallbackPosition: 'bottom-right',
        hovered: false,
        pause: true,
      }),
    ).model
    assert.ok(model.entries.every(entry => entry.isHovered))
    const resumed = Toast.update(
      model,
      Toast.Message.ChangedToastViewportFocus({
        position: 'bottom-right',
        fallbackPosition: 'bottom-right',
        focused: false,
      }),
    )
    assert.equal(resumed.model.entries[0]?.isHovered, true)
    assert.ok(
      Toast.visibleEntries(resumed.model).every(entry => !entry.isHovered),
    )
    assert.equal(resumed.commands?.length, 3)
  })

  it('uses measured mixed heights and mirrors offsets for top and bottom stacks', () => {
    let model = Toast.init({ id: 'queue' })
    for (let index = 0; index < 3; index += 1)
      model = Toast.show(
        model,
        Toast.plain({ title: `Toast ${index}`, sticky: true }),
      ).model
    for (const entry of model.entries)
      model = finishAnimation(model, entry.id).model
    model = {
      ...model,
      heights: {
        'queue-entry-0': 70,
        'queue-entry-1': 90,
        'queue-entry-2': 50,
      },
    }
    const expanded = Toast.stackLayout(model, 'bottom-right', true)
    assert.equal(expanded.height, 234)
    assert.deepEqual(
      expanded.entries.map(item => item.style.transform),
      [
        'translateY(0px) scale(1)',
        'translateY(-62px) scale(1)',
        'translateY(-164px) scale(1)',
      ],
    )
    assert.equal(
      Toast.stackLayout(model, 'top-right', true, 'top-right').entries[1]?.style
        .transform,
      'translateY(62px) scale(1)',
    )
    assert.equal(Toast.stackLayout(model, 'bottom-right', false).height, 74)
  })

  it('dismisses all queued and visible entries without promoting a closing queue', () => {
    let model = Toast.init({ id: 'queue' })
    for (let index = 0; index < 6; index += 1)
      model = Toast.show(
        model,
        Toast.plain({ title: 'Same payload', sticky: true }),
      ).model
    const closing = Toast.dismissAll(model).model
    const first = finishAnimation(closing, 'queue-entry-0')
    assert.equal(first.outMessage?.entry.id, 'queue-entry-0')
    let current = first.model
    for (const entry of current.entries)
      current = finishAnimation(current, entry.id).model
    assert.equal(current.entries.length, 0)
    assert.equal(current.limitedIds.length, 0)
  })
  it('uses deterministic IDs and schedules non-sticky entries', () => {
    const op1__ = Toast.show(
      Toast.init({ id: 'notice' }),
      Toast.success({ title: 'Saved', duration: '2 seconds' }),
    )
    const model = op1__.model
    const commands = op1__.commands ?? []
    assert.equal(model.entries[0]?.id, 'notice-entry-0')
    assert.equal(commands.length, 2)
  })

  it('ignores a stale timer after an entry update', () => {
    const op2__ = Toast.show(
      Toast.init({ id: 'notice' }),
      Toast.info({ title: 'Uploading' }),
    )
    const shown = op2__.model
    const id = shown.entries[0]!.id
    const { model: updated } = Toast.updateToast(shown, id, {
      title: 'Uploaded',
      variant: 'Success',
    })
    const op3__ = Toast.update(
      updated,
      Toast.Message.CompletedWaitBeforeDismissal({ entryId: id, version: 0 }),
    )
    const afterStale = op3__.model
    const _commands = op3__.commands ?? []
    const out = op3__.outMessage
    assert.equal(afterStale.entries.length, 1)
    assert.equal(out === undefined, true)
  })

  it('pauses expiry and schedules a new generation on resume', () => {
    const op4__ = Toast.show(
      Toast.init({ id: 'notice' }),
      Toast.warning({ title: 'Heads up' }),
    )
    const shown = op4__.model
    const id = shown.entries[0]!.id
    const op5__ = Toast.update(
      shown,
      Toast.Message.HoveredEntry({ entryId: id }),
    )
    const paused = op5__.model
    const op6__ = Toast.update(
      paused,
      Toast.Message.CompletedWaitBeforeDismissal({ entryId: id, version: 0 }),
    )
    const afterTimer = op6__.model
    assert.equal(afterTimer.entries.length, 1)
    const op7__ = Toast.update(
      afterTimer,
      Toast.Message.LeftEntry({ entryId: id }),
    )
    const resumed = op7__.model
    const commands = op7__.commands ?? []
    assert.equal(resumed.entries[0]?.pendingDismissVersion, 2)
    assert.equal(commands.length, 1)
  })

  it('emits a typed action fact and starts the acted-on entry leaving', () => {
    const op8__ = Toast.show(
      Toast.init({ id: 'notice' }),
      Toast.error({ title: 'Failed', actionLabel: 'Retry', sticky: true }),
    )
    const shown = op8__.model
    const id = shown.entries[0]!.id
    const op9__ = Toast.update(shown, Toast.ActivatedToastAction({ id }))
    const next = op9__.model
    const _commands = op9__.commands ?? []
    const out = op9__.outMessage
    assert.equal(next.entries[0]!.animation.transitionState, 'LeaveStart')
    assert.equal(out._tag, 'ActivatedToast')
  })
})

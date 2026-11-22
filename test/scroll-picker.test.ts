import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Picker from '../src/lib/behaviors/scroll-picker.ts'

const measured = (disabled: readonly number[] = []): Picker.Model =>
  Picker.update(
    Picker.init({ id: 'wheel' }),
    Picker.Message.Measured({
      centers: [90, 126, 162, 198, 234, 270, 306],
      viewport: 180,
      maxScroll: 216,
      offset: 0,
      orientation: 'vertical',
      disabled,
    }),
  ).model

describe('ScrollPicker geometry', () => {
  it('handles empty, single, variable sizes and extrapolation', () => {
    assert.equal(Picker.pickerPosition([], 50), 0)
    assert.equal(Picker.pickerPosition([20], -100), 0)
    const centers = [20, 40, 100]
    for (const [at, expected] of [
      [0, -1],
      [20, 0],
      [30, 0.5],
      [40, 1],
      [70, 1.5],
      [100, 2],
      [160, 3],
    ]) {
      assert.equal(Picker.pickerPosition(centers, at!), expected)
    }
    assert.equal(Picker.pickerPosition([10, 10], 20), 0)
  })

  it('finds enabled indices with fractional-direction tie breaking', () => {
    assert.equal(
      Picker.nearestEnabled(2.2, 5, index => index === 2),
      3,
    )
    assert.equal(
      Picker.nearestEnabled(1.8, 5, index => index === 2),
      1,
    )
    assert.equal(
      Picker.nearestEnabled(2, 5, index => index === 2),
      3,
    )
    assert.equal(
      Picker.nearestEnabled(1.5, 5, () => false),
      2,
    )
    assert.equal(
      Picker.nearestEnabled(-20, 5, () => false),
      0,
    )
    assert.equal(
      Picker.nearestEnabled(20, 5, () => false),
      4,
    )
    assert.equal(
      Picker.nearestEnabled(1, 0, () => false),
      -1,
    )
    assert.equal(
      Picker.nearestEnabled(1, 5, () => true),
      -1,
    )
  })

  it('pages by average center spacing and clamps without wrapping', () => {
    assert.equal(Picker.pageSize([90, 126, 162], 180), 4)
    assert.equal(Picker.pageSize([0, 20, 100], 200), 3)
    assert.equal(Picker.pageSize([], 180), 1)
    assert.equal(Picker.pageSize([10], 180), 1)
    assert.equal(Picker.pageSize([10, 10], 180), 1)
    assert.equal(Picker.pageSize([0, 100], 1), 1)
    assert.equal(Picker.pageTarget(2, 1, 7, 4), 6)
    assert.equal(Picker.pageTarget(2, -1, 7, 4), 0)
    assert.equal(Picker.pageTarget(6, 1, 7, 4), 6)
    assert.equal(Picker.pageTarget(0, -1, 7, 4), 0)
    assert.equal(Picker.pageTarget(0, 1, 0, 4), -1)
  })

  it('projects drag release at rate 0.998 and clamps both ends', () => {
    assert.ok(Math.abs(Picker.projectRelease(600, 1, 1000) - 101) < 1e-9)
    assert.equal(Picker.projectRelease(50, 1, 200), 0)
    assert.equal(Picker.projectRelease(50, -1, 200), 200)
    assert.equal(Picker.projectRelease(50, 0, 200), 50)
  })
})

describe('ScrollPicker update', () => {
  it('initializes as an idle native submodel', () => {
    const model = Picker.init({ id: 'hours', orientation: 'horizontal' })
    assert.equal(model.orientation, 'horizontal')
    assert.equal(model.phase, 'idle')
    assert.deepEqual(model.maybeSelectedIndex, Option.none())
    assert.equal(Picker.init({ id: 'minutes' }).orientation, 'vertical')
  })

  it('reports each newly centered enabled item once during scroll', () => {
    const next = Picker.update(
      measured(),
      Picker.Message.Scrolled({ position: 1.2, offset: 43.2 }),
    )
    assert.equal(next.model.phase, 'scrolling')
    assert.deepEqual(
      next.outMessage,
      Picker.OutMessage.Selected({ index: 1, reason: 'scroll' }),
    )
    assert.equal(
      Picker.update(
        next.model,
        Picker.Message.Scrolled({ position: 1.3, offset: 46.8 }),
      ).outMessage,
      undefined,
    )
    assert.deepEqual(
      Picker.update(
        next.model,
        Picker.Message.Scrolled({ position: 2, offset: 72 }),
      ).outMessage,
      Picker.OutMessage.Selected({ index: 2, reason: 'scroll' }),
    )
  })

  it('skips a disabled center until rest, then centers nearest enabled', () => {
    const next = Picker.update(
      measured([2]),
      Picker.Message.Scrolled({ position: 2.1, offset: 75.6 }),
    )
    assert.equal(next.outMessage, undefined)
    const rested = Picker.update(next.model, Picker.Message.Settled())
    assert.deepEqual(
      rested.outMessage,
      Picker.OutMessage.Selected({ index: 3, reason: 'settle' }),
    )
    assert.equal(rested.model.phase, 'following')
    assert.deepEqual(rested.model.maybeTarget, Option.some(108))
    assert.ok(rested.commands?.length)
  })

  it('follows external selection without intermediate reports and centers initially instantly', () => {
    const initial = Picker.update(
      measured(),
      Picker.Message.ChangedSelection({ index: 5 }),
    )
    assert.equal(initial.outMessage, undefined)
    assert.deepEqual(
      initial.commands?.map(({ name, args }) => ({ name, args })),
      [
        {
          name: 'ScrollPickerScrollTo',
          args: { id: 'wheel', offset: 180, animate: false },
        },
      ],
    )
    const passing = Picker.update(
      initial.model,
      Picker.Message.Scrolled({ position: 2, offset: 72 }),
    )
    assert.equal(passing.outMessage, undefined)
    assert.deepEqual(passing.model.maybeSelectedIndex, Option.some(5))
    const arrived = Picker.update(passing.model, Picker.Message.Settled())
    assert.equal(arrived.model.phase, 'idle')
    const external = Picker.update(
      arrived.model,
      Picker.Message.ChangedSelection({ index: 1 }),
    )
    assert.deepEqual(
      external.commands?.map(({ name, args }) => ({ name, args })),
      [
        {
          name: 'ScrollPickerScrollTo',
          args: { id: 'wheel', offset: 36, animate: true },
        },
      ],
    )
    assert.equal(external.outMessage, undefined)
  })

  it('ignores echoed selection during user interaction and invalid indices', () => {
    const scrolling = Picker.update(
      measured(),
      Picker.Message.Scrolled({ position: 1, offset: 36 }),
    ).model
    assert.deepEqual(
      Picker.update(scrolling, Picker.Message.ChangedSelection({ index: 6 })),
      { model: scrolling },
    )
    for (const index of [-1, 7])
      assert.deepEqual(
        Picker.update(measured(), Picker.Message.ChangedSelection({ index })),
        { model: measured() },
      )
  })

  it('pages from selection, skips disabled destinations, and clamps', () => {
    const next = Picker.update(
      measured([4]),
      Picker.Message.Paged({ delta: 1 }),
    )
    assert.deepEqual(
      next.outMessage,
      Picker.OutMessage.Selected({ index: 5, reason: 'page' }),
    )
    const end = Picker.update(next.model, Picker.Message.Paged({ delta: 1 }))
    assert.deepEqual(
      end.outMessage,
      Picker.OutMessage.Selected({ index: 6, reason: 'page' }),
    )
    assert.equal(
      Picker.update(end.model, Picker.Message.Paged({ delta: 1 })).outMessage,
      undefined,
    )
  })

  it('projects drag release, supports cancellation and suppresses rest during drag', () => {
    const dragging = Picker.update(
      measured(),
      Picker.Message.StartedDrag(),
    ).model
    assert.equal(dragging.phase, 'dragging')
    assert.deepEqual(Picker.update(dragging, Picker.Message.Settled()), {
      model: dragging,
    })
    const moved = Picker.update(
      dragging,
      Picker.Message.Dragged({ offset: 72 }),
    )
    assert.deepEqual(
      moved.commands?.map(({ name, args }) => ({ name, args })),
      [
        {
          name: 'ScrollPickerScrollTo',
          args: { id: 'wheel', offset: 72, animate: false },
        },
      ],
    )
    const next = Picker.update(
      dragging,
      Picker.Message.EndedDrag({ velocity: -1, offset: 72 }),
    )
    assert.deepEqual(
      next.outMessage,
      Picker.OutMessage.Selected({ index: 6, reason: 'drag' }),
    )
    const cancelled = Picker.update(
      dragging,
      Picker.Message.EndedDrag({ velocity: 0, offset: 72 }),
    )
    assert.deepEqual(
      cancelled.outMessage,
      Picker.OutMessage.Selected({ index: 2, reason: 'drag' }),
    )
  })

  it('interrupts following and handles empty/all-disabled lists without effects', () => {
    const following = Picker.update(
      measured(),
      Picker.Message.ChangedSelection({ index: 5 }),
    ).model
    const interrupted = Picker.update(
      following,
      Picker.Message.Interrupted(),
    ).model
    assert.equal(interrupted.phase, 'idle')
    assert.deepEqual(interrupted.maybeTarget, Option.none())
    const empty = Picker.init({ id: 'empty' })
    assert.deepEqual(Picker.update(empty, Picker.Message.Paged({ delta: 1 })), {
      model: empty,
    })
    for (const model of [empty, measured([0, 1, 2, 3, 4, 5, 6])]) {
      const next = Picker.update(model, Picker.Message.Settled())
      assert.equal(next.model.phase, 'idle')
      assert.equal(next.commands, undefined)
      assert.equal(next.outMessage, undefined)
    }
  })

  it('recenters on idle resize but does not interrupt active scrolling', () => {
    const selected = Picker.update(
      measured(),
      Picker.Message.ChangedSelection({ index: 3 }),
    ).model
    const idle = Picker.update(selected, Picker.Message.Settled()).model
    const message = Picker.Message.Measured({
      centers: [50, 100, 150, 200],
      disabled: [],
      viewport: 100,
      maxScroll: 150,
      offset: 0,
      orientation: 'horizontal',
    })
    const resized = Picker.update(idle, message)
    assert.equal(resized.model.orientation, 'horizontal')
    assert.deepEqual(resized.model.maybeTarget, Option.some(150))
    assert.ok(resized.commands?.length)
    assert.equal(
      Picker.update({ ...idle, phase: 'scrolling' }, message).commands,
      undefined,
    )
  })
})

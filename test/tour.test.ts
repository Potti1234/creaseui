import assert from 'node:assert/strict'
import test from 'node:test'

import { Option } from 'effect'

import * as Tour from '../src/lib/tour.ts'

test('activate starts the first step and clears the rect', () => {
  const model = Tour.activate(Tour.init()).model
  assert.equal(model.isActive, true)
  assert.equal(model.activeStepIndex, 0)
  assert.equal(Option.isNone(model.targetRect), true)
})

test('next advances until the last step, then completes', () => {
  const model = Tour.activate(Tour.init()).model
  const one = Tour.update(model, Tour.Message.RequestedNext({ stepCount: 3 }))
  assert.equal(one.model.activeStepIndex, 1)
  assert.equal(one.outMessage, undefined)

  const two = Tour.update(one.model, Tour.Message.RequestedNext({ stepCount: 3 }))
  assert.equal(two.model.activeStepIndex, 2)

  const done = Tour.update(two.model, Tour.Message.RequestedNext({ stepCount: 3 }))
  assert.equal(done.model.activeStepIndex, 2)
  if (done.outMessage?._tag === 'DismissedTour') {
    assert.equal(done.outMessage.source, 'complete')
  } else {
    assert.fail('expected DismissedTour out message')
  }
})

test('previous stays at zero and dismiss reports its source', () => {
  const model = Tour.activate(Tour.init()).model
  const stay = Tour.update(model, Tour.Message.RequestedPrevious())
  assert.equal(stay.model.activeStepIndex, 0)

  const dismissed = Tour.update(
    model,
    Tour.Message.RequestedDismiss({ source: 'backdrop' }),
  )
  if (dismissed.outMessage?._tag === 'DismissedTour') {
    assert.equal(dismissed.outMessage.source, 'backdrop')
  } else {
    assert.fail('expected DismissedTour out message')
  }
})

test('step changes clear the measured target rect', () => {
  const model = {
    ...Tour.activate(Tour.init()).model,
    targetRect: Option.some({ top: 1, left: 2, width: 3, height: 4, borderRadius: '4px' }),
  }
  const advanced = Tour.update(model, Tour.Message.RequestedNext({ stepCount: 3 })).model
  assert.equal(Option.isNone(advanced.targetRect), true)
})

test('an outside press without a backdrop reports a close', () => {
  const model = Tour.activate(Tour.init()).model
  const result = Tour.update(model, Tour.Message.PressedOutsideCallout())
  if (result.outMessage?._tag === 'DismissedTour') {
    assert.equal(result.outMessage.source, 'close')
  } else {
    assert.fail('expected DismissedTour out message')
  }
})

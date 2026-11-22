import assert from 'node:assert/strict'
import test from 'node:test'

import { Option } from 'effect'

import * as MessageScroller from '../src/lib/behaviors/stick-to-bottom.ts'

const observed = (
  reason: 'mount' | 'user' | 'content' | 'resize',
  scrollTop: number,
  scrollHeight = 1000,
  clientHeight = 200,
  anchorShift?: number,
  anchorTop?: number,
) =>
  MessageScroller.Message.ObservedMessageScrollerViewport({
    reason,
    scrollTop,
    scrollHeight,
    clientHeight,
    ...(anchorShift === undefined ? {} : { anchorShift }),
    ...(anchorTop === undefined ? {} : { anchorTop }),
  })

test('mount requests an immediate initial scroll and ignores stale completion', () => {
  const op1__ = MessageScroller.update(
    MessageScroller.init('conversation'),
    observed('mount', 0),
  )
  const mounted = op1__.model
  const commands = op1__.commands ?? []
  assert.equal(mounted.isReady, false)
  assert.equal(mounted.isFollowing, true)
  assert.equal(commands.length, 1)
  assert.equal(Option.isSome(mounted.pendingScrollVersion), true)
  const op2__ = MessageScroller.update(
    mounted,
    MessageScroller.Message.CompletedMessageScrollerScrollTo({ version: 0 }),
  )
  const stale = op2__.model
  assert.equal(Option.isSome(stale.pendingScrollVersion), true)
  const settled = MessageScroller.update(
    stale,
    MessageScroller.Message.CompletedMessageScrollerScrollTo({
      version: mounted.scrollVersion,
    }),
  ).model
  assert.equal(settled.isReady, true)
})

test('user interruption preserves position and records new content until follow resumes', () => {
  const initial = {
    ...MessageScroller.init('conversation'),
    isReady: true,
    scrollTop: 800,
    scrollHeight: 1000,
    clientHeight: 200,
  }
  const op3__ = MessageScroller.update(initial, observed('user', 500))
  const interrupted = op3__.model
  assert.equal(interrupted.isFollowing, false)
  const op4__ = MessageScroller.update(
    interrupted,
    observed('content', 500, 1200),
  )
  const appended = op4__.model
  const appendCommands = op4__.commands ?? []
  assert.equal(appended.scrollTop, 500)
  assert.equal(appended.hasNewMessages, true)
  assert.deepEqual(appendCommands, [])
  const op5__ = MessageScroller.update(
    appended,
    MessageScroller.Message.RequestedScroll({ direction: 'end' }),
  )
  const resumed = op5__.model
  const resumeCommands = op5__.commands ?? []
  assert.equal(resumed.isFollowing, true)
  assert.equal(resumed.hasNewMessages, false)
  assert.equal(resumeCommands.length, 1)
})

test('content and resize observations keep an active follower at the end', () => {
  const initial = {
    ...MessageScroller.init('conversation'),
    isReady: true,
    scrollTop: 800,
    scrollHeight: 1000,
    clientHeight: 200,
  }
  for (const reason of ['content', 'resize'] as const) {
    const op6__ = MessageScroller.update(initial, observed(reason, 800, 1200))
    const next = op6__.model
    const commands = op6__.commands ?? []
    assert.equal(next.isFollowing, true)
    assert.equal(commands.length, 1)
  }
})

test('downward scroll events during a jump keep following before reaching the tail', () => {
  const detached = MessageScroller.update(
    MessageScroller.init('conversation', { initial: false }),
    observed('user', 400),
  ).model
  const jumping = MessageScroller.update(
    detached,
    MessageScroller.Message.RequestedScroll({ direction: 'end' }),
  ).model
  assert.equal(
    MessageScroller.update(jumping, observed('user', 600)).model.isFollowing,
    true,
  )
})

test('an observer callback with no growth does not mark unseen messages', () => {
  const model = {
    ...MessageScroller.init('conversation'),
    isReady: true,
    isFollowing: false,
    scrollTop: 400,
    scrollHeight: 1000,
    clientHeight: 200,
  }
  assert.equal(
    MessageScroller.update(model, observed('content', 400)).model
      .hasNewMessages,
    false,
  )
})

test('releasing at the tail holds position until the reader scrolls back down', () => {
  const { model } = MessageScroller.update(
    MessageScroller.init('conversation'),
    observed('mount', 800),
  )
  const detached = MessageScroller.update(
    model,
    MessageScroller.Message.Released(),
  ).model
  const appended = MessageScroller.update(
    detached,
    observed('content', 800, 1100),
  )
  assert.equal(appended.model.isFollowing, false)
  assert.equal(appended.model.hasNewMessages, true)
  assert.equal(appended.commands?.length ?? 0, 0)
  const resumed = MessageScroller.update(
    appended.model,
    observed('user', 900, 1100),
  ).model
  assert.equal(resumed.isFollowing, true)
  assert.equal(resumed.hasNewMessages, false)
})

test('viewport resize and reader movement use the same configurable bottom threshold', () => {
  const { model } = MessageScroller.update(
    MessageScroller.init('conversation', { initial: false, threshold: 40 }),
    observed('mount', 0),
  )
  const detached = MessageScroller.update(model, observed('user', 759)).model
  assert.equal(MessageScroller.isAtBottom(detached), false)
  assert.equal(detached.isFollowing, false)
  const resumed = MessageScroller.update(detached, observed('user', 760)).model
  assert.equal(MessageScroller.isAtBottom(resumed), true)
  assert.equal(resumed.isFollowing, true)
})

test('growth above the reader preserves the visible row without flagging new content', () => {
  const { model } = MessageScroller.update(
    MessageScroller.init('conversation', { initial: false }),
    observed('mount', 400),
  )
  const result = MessageScroller.update(
    model,
    observed('content', 400, 1200, 200, 200),
  )
  assert.equal(result.model.hasNewMessages, false)
  assert.deepEqual(result.model.adjustedScrollTop, Option.some(600))
  assert.equal(result.commands?.length, 1)
})

test('explicit prepend preserves the reader distance without needing a surviving row', () => {
  const { model } = MessageScroller.update(
    MessageScroller.init('conversation', { initial: false }),
    observed('mount', 400),
  )
  const pending = MessageScroller.update(
    model,
    MessageScroller.Message.RequestedPrepend(),
  ).model
  const prepended = MessageScroller.update(
    pending,
    observed('content', 400, 1100),
  )
  assert.equal(prepended.model.hasNewMessages, false)
  assert.deepEqual(prepended.model.prependDistance, Option.none())
  assert.deepEqual(prepended.model.adjustedScrollTop, Option.some(500))
})

test('a size change can clamp a prepend correction before its scroll event', () => {
  const { model } = MessageScroller.update(
    MessageScroller.init('conversation', { initial: false }),
    observed('mount', 400),
  )
  const correcting = MessageScroller.update(
    model,
    observed('content', 400, 1800, 200, 800, 1200),
  ).model
  const resized = MessageScroller.update(
    correcting,
    observed('resize', 800, 1000, 200, -500, 700),
  ).model
  assert.deepEqual(resized.adjustedScrollTop, Option.some(700))
  assert.equal(resized.isFollowing, false)
})

test('duplicate completion cannot clear a newer request after an earlier scroll settled', () => {
  const scroller = MessageScroller.init('conversation')
  const request = MessageScroller.Message.RequestedScroll({ direction: 'end' })
  const first = MessageScroller.update(scroller, request).model
  const completed = MessageScroller.Message.CompletedMessageScrollerScrollTo({
    version: first.scrollVersion,
  })
  const settled = MessageScroller.update(first, completed).model
  const next = MessageScroller.update(settled, request).model
  assert.deepEqual(
    MessageScroller.update(next, completed).model.pendingScrollVersion,
    Option.some(next.scrollVersion),
  )
})

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { Option } from 'effect'

import * as MessageScroller from '../src/lib/message-scroller.ts'

const observed = (reason: 'mount' | 'user' | 'content' | 'resize', scrollTop: number, scrollHeight = 1000, clientHeight = 200) =>
  MessageScroller.Message.ObservedMessageScrollerViewport({ reason, scrollTop, scrollHeight, clientHeight })

test('mount requests an immediate initial scroll and ignores stale completion', () => {
  const op1__ = MessageScroller.update(MessageScroller.init('conversation'), observed('mount', 0)); const mounted = op1__.model; const commands = op1__.commands ?? [];
  assert.equal(mounted.isReady, true)
  assert.equal(mounted.isFollowing, true)
  assert.equal(commands.length, 1)
  assert.equal(Option.isSome(mounted.pendingScrollVersion), true)
  const op2__ = MessageScroller.update(mounted, MessageScroller.Message.CompletedMessageScrollerScrollTo({ version: 0 })); const stale = op2__.model;
  assert.equal(Option.isSome(stale.pendingScrollVersion), true)
})

test('user interruption preserves position and records new content until follow resumes', () => {
  const initial = { ...MessageScroller.init('conversation'), isReady: true, scrollTop: 800, scrollHeight: 1000, clientHeight: 200 }
  const op3__ = MessageScroller.update(initial, observed('user', 500)); const interrupted = op3__.model;
  assert.equal(interrupted.isFollowing, false)
  const op4__ = MessageScroller.update(interrupted, observed('content', 500, 1200)); const appended = op4__.model; const appendCommands = op4__.commands ?? [];
  assert.equal(appended.scrollTop, 500)
  assert.equal(appended.hasNewMessages, true)
  assert.deepEqual(appendCommands, [])
  const op5__ = MessageScroller.update(appended, MessageScroller.Message.RequestedScroll({ direction: 'end' })); const resumed = op5__.model; const resumeCommands = op5__.commands ?? [];
  assert.equal(resumed.isFollowing, true)
  assert.equal(resumed.hasNewMessages, false)
  assert.equal(resumeCommands.length, 1)
})

test('content and resize observations keep an active follower at the end', () => {
  const initial = { ...MessageScroller.init('conversation'), isReady: true, scrollTop: 800, scrollHeight: 1000, clientHeight: 200 }
  for (const reason of ['content', 'resize'] as const) {
    const op6__ = MessageScroller.update(initial, observed(reason, 800, 1200)); const next = op6__.model; const commands = op6__.commands ?? [];
    assert.equal(next.isFollowing, true)
    assert.equal(commands.length, 1)
  }
})

test('mounted observation owns mutation, resize, reduced-motion, and cleanup policy', () => {
  const source = readFileSync(new URL('../src/lib/message-scroller.ts', import.meta.url), 'utf8')
  assert.match(source, /new MutationObserver/)
  assert.match(source, /new ResizeObserver/)
  assert.match(source, /prefers-reduced-motion: reduce/)
  assert.match(source, /removeEventListener\('scroll'/)
  assert.match(source, /mutation\.disconnect\(\)/)
  assert.match(source, /resize\.disconnect\(\)/)
})

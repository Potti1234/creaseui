import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option, Schema } from 'effect'

import * as Connect from '../src/lib/behaviors/connect.ts'

const options: Connect.Options = {
  keys: ['a', 'b', 'c'],
  announcementId: 'live',
}
const start = (isKeyboard = true) =>
  Connect.Message.Started({ from: 'a', x: 10, y: 20, isKeyboard })
const started = (isKeyboard = true) =>
  Connect.update(Connect.init(), start(isKeyboard), options).model
const target = (to: string) =>
  Connect.Message.Targeted({ to: Option.some(to), x: 40, y: 50 })
const rect = (x: number, y: number): Connect.Rect => ({
  left: x - 5,
  right: x + 5,
  top: y - 5,
  bottom: y + 5,
})
const ports = [
  { key: 'a', rect: rect(0, 0) },
  { key: 'b', rect: rect(100, 0) },
  { key: 'c', rect: rect(100, 100) },
]

describe('Connect model', () => {
  it('has schema state and tagged messages', () => {
    assert.equal(Schema.is(Connect.Model)(Connect.init()), true)
    assert.equal(Schema.is(Connect.Model)(started()), true)
    assert.equal(Schema.is(Connect.Message)(start()), true)
    assert.equal(Schema.is(Connect.Model)({ draft: null }), false)
  })

  it('starts only with another acceptable, registered port', () => {
    for (const config of [
      { keys: [] },
      { keys: ['a'] },
      { ...options, canConnect: () => false },
    ]) {
      assert.deepEqual(Connect.update(Connect.init(), start(), config), {
        model: Connect.init(),
      })
    }
    assert.deepEqual(Option.getOrThrow(started().draft), {
      from: 'a',
      to: Option.none(),
      x: 10,
      y: 20,
      isKeyboard: true,
    })
    assert.equal(
      Connect.update(Connect.init(), start(), options).commands?.length,
      1,
    )
  })

  it('rejects self, unknown and policy-rejected targets without changing a draft', () => {
    const model = started()
    for (const to of ['a', 'missing'])
      assert.deepEqual(Connect.update(model, target(to), options), { model })
    assert.deepEqual(
      Connect.update(model, target('b'), {
        ...options,
        canConnect: () => false,
      }),
      { model },
    )
    assert.deepEqual(Connect.update(Connect.init(), target('b'), options), {
      model: Connect.init(),
    })
  })

  it('targets and clears targets, announcing only a changed target', () => {
    const next = Connect.update(started(), target('b'), options)
    assert.deepEqual(Option.getOrThrow(next.model.draft).to, Option.some('b'))
    assert.equal(next.commands?.length, 1)
    assert.equal(
      Connect.update(next.model, target('b'), options).commands?.length,
      0,
    )
    const cleared = Connect.update(
      next.model,
      Connect.Message.Targeted({ to: Option.none(), x: 1, y: 2 }),
      options,
    )
    assert.deepEqual(Option.getOrThrow(cleared.model.draft).to, Option.none())
  })

  it('moves the loose pointer end but ignores pointer moves in keyboard sessions', () => {
    const message = Connect.Message.MovedPointer({ x: 9, y: 8 })
    assert.deepEqual(Connect.update(started(), message, options), {
      model: started(),
    })
    const targeted = Connect.update(started(false), target('b'), options).model
    assert.deepEqual(
      Option.getOrThrow(Connect.update(targeted, message, options).model.draft),
      { from: 'a', to: Option.none(), x: 9, y: 8, isKeyboard: false },
    )
    assert.deepEqual(Connect.update(Connect.init(), message, options), {
      model: Connect.init(),
    })
  })

  it('requests, rather than saves, a valid edge for either reason', () => {
    for (const reason of ['Drag', 'ConnectKey'] as const) {
      const model = Connect.update(started(), target('b'), options).model
      const next = Connect.update(
        model,
        Connect.Message.RequestedCommit({ reason }),
        options,
      )
      assert.deepEqual(next.model, Connect.init())
      assert.deepEqual(
        next.outMessage,
        Connect.OutMessage.RequestedConnection({ from: 'a', to: 'b', reason }),
      )
      assert.equal(next.commands, undefined)
      assert.equal(
        Connect.update(model, Connect.Message.RequestedCommit({ reason }), {
          ...options,
          canConnect: () => false,
        }).outMessage,
        undefined,
      )
    }
    assert.equal(
      Connect.update(
        started(),
        Connect.Message.RequestedCommit({ reason: 'ConnectKey' }),
        options,
      ).outMessage,
      undefined,
    )
  })

  it('cancels only an existing draft and acknowledges accepted edges separately', () => {
    assert.deepEqual(
      Connect.update(
        Connect.init(),
        Connect.Message.RequestedCancel(),
        options,
      ),
      { model: Connect.init() },
    )
    const next = Connect.update(
      started(),
      Connect.Message.RequestedCancel(),
      options,
    )
    assert.deepEqual(next.model, Connect.init())
    assert.deepEqual(
      next.outMessage,
      Connect.OutMessage.Canceled({ from: 'a' }),
    )
    assert.equal(next.commands?.length, 1)
    assert.equal(
      Connect.update(
        Connect.init(),
        Connect.Message.Connected({ from: 'a', to: 'b' }),
        options,
      ).commands?.length,
      1,
    )
  })

  it('reports source, target and every allowed candidate', () => {
    assert.deepEqual(Connect.role(Connect.init(), 'a', options), Option.none())
    const model = Connect.update(started(), target('b'), options).model
    assert.deepEqual(Connect.role(model, 'a', options), Option.some('Source'))
    assert.deepEqual(Connect.role(model, 'b', options), Option.some('Target'))
    assert.deepEqual(
      Connect.role(model, 'c', options),
      Option.some('Candidate'),
    )
    assert.deepEqual(Connect.role(model, 'missing', options), Option.none())
    assert.deepEqual(
      Connect.role(model, 'c', { ...options, canConnect: () => false }),
      Option.none(),
    )
  })
})

describe('Connect spatial navigation', () => {
  it('prefers the directional cone, then weighted distance, with stable ties', () => {
    assert.deepEqual(
      Connect.nearestInDirection(rect(0, 0), [], [1, 0]),
      Option.none(),
    )
    assert.deepEqual(
      Connect.nearestInDirection(
        rect(0, 0),
        [{ key: 'behind', rect: rect(-1, 0) }],
        [1, 0],
      ),
      Option.none(),
    )
    assert.deepEqual(
      Connect.nearestInDirection(
        rect(0, 0),
        [
          { key: 'outside', rect: rect(1, 10) },
          { key: 'inside', rect: rect(100, 0) },
        ],
        [1, 0],
      ),
      Option.some('inside'),
    )
    assert.deepEqual(
      Connect.nearestInDirection(
        rect(0, 0),
        [
          { key: 'first', rect: rect(10, 0) },
          { key: 'tie', rect: rect(10, 0) },
        ],
        [1, 0],
      ),
      Option.some('first'),
    )
    assert.deepEqual(
      Connect.nearestInDirection(
        rect(0, 0),
        [
          { key: 'far', rect: rect(10, 5) },
          { key: 'near', rect: rect(12, 0) },
        ],
        [1, 0],
      ),
      Option.some('near'),
    )
    for (const [x, y] of [
      [0, -10],
      [0, 10],
      [-10, 0],
      [10, 0],
    ] as const)
      assert.deepEqual(
        Connect.nearestInDirection(
          rect(0, 0),
          [{ key: 'next', rect: rect(x, y) }],
          [Math.sign(x), Math.sign(y)],
        ),
        Option.some('next'),
      )
  })

  it('maps arrows from the current target and filters candidates', () => {
    const next = Connect.keyboardTarget(started(), 'ArrowRight', ports, options)
    assert.equal(next.preventDefault, true)
    assert.deepEqual(
      next.message,
      Option.some(
        Connect.Message.Targeted({ to: Option.some('b'), x: 100, y: 0 }),
      ),
    )
    const model = Connect.update(started(), target('b'), options).model
    assert.deepEqual(
      Connect.keyboardTarget(model, 'ArrowDown', ports, options).message,
      Option.some(
        Connect.Message.Targeted({ to: Option.some('c'), x: 100, y: 100 }),
      ),
    )
    assert.deepEqual(
      Connect.keyboardTarget(model, 'ArrowDown', ports, {
        ...options,
        canConnect: () => false,
      }).message,
      Option.none(),
    )
    assert.deepEqual(
      Connect.keyboardTarget(model, 'ArrowRight', [], options).message,
      Option.none(),
    )
  })

  it('maps commit/cancel keys without trapping Tab or handling unrelated keys', () => {
    const model = Connect.update(started(), target('b'), options).model
    for (const key of ['Enter', ' ']) {
      assert.deepEqual(
        Connect.keyboardTarget(model, key, ports, options).message,
        Option.some(Connect.Message.RequestedCommit({ reason: 'ConnectKey' })),
      )
      assert.deepEqual(
        Connect.keyboardTarget(started(), key, ports, options).message,
        Option.none(),
      )
    }
    for (const key of ['Escape', 'Tab']) {
      const next = Connect.keyboardTarget(model, key, ports, options)
      assert.deepEqual(
        next.message,
        Option.some(Connect.Message.RequestedCancel()),
      )
      assert.equal(next.preventDefault, key === 'Escape')
    }
    assert.equal(
      Connect.keyboardTarget(model, 'x', ports, options).handled,
      false,
    )
    assert.equal(
      Connect.keyboardTarget(Connect.init(), 'ArrowRight', ports, options)
        .handled,
      false,
    )
  })
})

describe('Connect announcements', () => {
  it('provides default English with caller labels', () => {
    const label = (key: string) => key.toUpperCase()
    assert.equal(
      Connect.connectMessage({ type: 'start', from: 'a' }, label),
      'Connecting from A. Arrows choose a port, Enter connects, Escape cancels.',
    )
    assert.equal(
      Connect.connectMessage({ type: 'target', from: 'a', to: 'b' }, label),
      'To B.',
    )
    assert.equal(
      Connect.connectMessage({ type: 'connect', from: 'a', to: 'b' }, label),
      'Connected A to B.',
    )
    assert.equal(
      Connect.connectMessage({ type: 'cancel', from: 'a' }, label),
      'Canceled.',
    )
  })

  it('supports custom messages and optional announcement commands', () => {
    let received = ''
    Connect.update(Connect.init(), start(), {
      ...options,
      label: key => `Port ${key}`,
      message: (message, label) => {
        received = label(message.from)
        return received
      },
    })
    assert.equal(received, 'Port a')
    assert.deepEqual(
      Connect.update(Connect.init(), start(), { keys: options.keys }).commands,
      [],
    )
  })
})

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Schema } from 'effect'
import { Window } from 'happy-dom'

import * as Demo from '@/docs/behavior-demo'
import * as Change from '@/lib/behaviors/change'
import * as History from '@/lib/behaviors/history'
import * as Observe from '@/lib/behaviors/observe'

const context = { reason: 'drag', source: 'mouse', attribution: 'actor-1' }
const options = {
  read: (model: { size: number }) => model.size,
  write: (model: { size: number }, size: number) => ({
    ...model,
    size: Math.min(size, 100),
  }),
}

test('a veto receives the current value and prevents the writer', () => {
  const model = { size: 30 }
  const result = Change.apply(
    model,
    { ...context, value: 50 },
    {
      ...options,
      beforeWrite: (proposal, current) => {
        assert.deepEqual(proposal, { ...context, previous: 30, value: 50 })
        assert.equal(current, model)
        return false
      },
      write: () => assert.fail('vetoed proposal wrote to model'),
    },
  )
  assert.deepEqual(result, { status: 'vetoed', model })
  assert.equal(result.model, model)
})

test('writes report the accepted value and suppress no-op proposals and writes', () => {
  const model = { size: 100 }
  assert.deepEqual(
    Change.apply(
      model,
      { ...context, value: 100 },
      {
        ...options,
        beforeWrite: () => assert.fail('unchanged proposal invoked policy'),
      },
    ),
    { status: 'unchanged', model },
  )
  assert.deepEqual(Change.apply(model, { ...context, value: 110 }, options), {
    status: 'unchanged',
    model,
  })
  assert.deepEqual(
    Change.apply({ size: 30 }, { ...context, value: 110 }, options),
    {
      status: 'committed',
      model,
      change: { ...context, previous: 30, value: 100, phase: 'Commit' },
    },
  )
})

test('live steps report incremental changes and final commit uses the interaction baseline', () => {
  const result = Change.apply(
    { size: 40 },
    { ...context, value: 50 },
    { ...options, phase: 'Live' },
  )
  assert.deepEqual(result, {
    status: 'live',
    model: { size: 50 },
    change: { ...context, previous: 40, value: 50, phase: 'Live' },
  })
  assert.deepEqual(Change.commit(30, result.model.size, context), {
    ...context,
    previous: 30,
    value: 50,
    phase: 'Commit',
  })
  assert.equal(Change.commit(30, 30, context), undefined)
})

test('command-safe attribution survives observation and separates history entries', async () => {
  const pending = JSON.parse(JSON.stringify(context))
  await Promise.resolve()
  const decoded = Schema.decodeUnknownSync(Change.Context)(pending)
  const record = (
    model: History.Model,
    previous: number,
    value: number,
    attribution: string,
  ) => {
    const committed = Change.commit(previous, value, {
      ...decoded,
      attribution,
    })
    assert.ok(committed)
    const change = Observe.change({
      ...committed,
      ref: 'size',
      component: 'slider',
      key: 'value',
    })
    return History.update(model, History.Message.Recorded({ change })).model
  }
  const initial = record(History.init(), 30, 40, decoded.attribution!)
  const next = record(initial, 40, 50, 'actor-2')
  assert.deepEqual(
    next.entries.map(entry => entry.attribution),
    ['actor-1', 'actor-2'],
  )
})

test('behavior demo records actual edits and skips repeated requests', () => {
  const edited = Demo.update(
    Demo.init(),
    Demo.Message.ChangedRegion({ value: 'Paris' }),
  ).model
  assert.equal(edited.region, 'Paris')
  assert.equal(edited.history.entries[0]?.reason, 'input')
  assert.equal(edited.history.entries[0]?.source, 'keyboard')
  const repeated = Demo.update(
    edited,
    Demo.Message.ChangedRegion({ value: 'Paris' }),
  ).model
  assert.equal(repeated, edited)
})

test('behavior demo vetoes malformed agent values and retains command attribution', () => {
  const running = Demo.update(Demo.init(), Demo.Message.StartedAgent()).model
  const action = {
    ref: 'region',
    component: 'input',
    action: 'setValue',
    args: [123],
  }
  const attempted = Demo.update(
    running,
    Demo.Message.AppliedAgentAction({ action }),
  ).model
  assert.equal(attempted.region, 'London')
  assert.equal(attempted.history.entries.length, 0)
  assert.equal(attempted.agent.running, false)

  const accepted = Demo.update(
    running,
    Demo.Message.AppliedAgentAction({
      action: { ...action, args: ['Frankfurt'] },
      context: {
        reason: 'imperative',
        source: 'agent',
        attribution: 'session-42',
      },
    }),
  ).model
  assert.equal(accepted.region, 'Frankfurt')
  assert.equal(accepted.history.entries[0]?.source, 'agent')
  assert.equal(accepted.history.entries[0]?.attribution, 'session-42')
  assert.equal(
    accepted.agent.results[0]?.changes?.[0]?.attribution,
    'session-42',
  )
})

test('classifies standalone events and tracks focus independently per scope', async () => {
  const window = new Window()
  try {
    const { document } = window
    const first = document.createElement('div')
    const second = document.createElement('div')
    const target = document.createElement('button')
    first.append(target)
    document.body.append(first, second)
    const scope = (element: unknown) => element as Element
    const binding = Change.bindInputSource(scope(first))
    const other = Change.bindInputSource(scope(second))
    const event = (value: unknown) => value as Event
    assert.equal(Change.sourceOf(), 'programmatic')
    assert.equal(
      Change.sourceOf(event(new window.MouseEvent('click'))),
      'virtual',
    )
    assert.equal(
      Change.sourceOf(event(new window.MouseEvent('click', { detail: 1 }))),
      'mouse',
    )
    assert.equal(
      Change.sourceOf(
        event(new window.PointerEvent('pointerdown', { pointerType: 'touch' })),
      ),
      'touch',
    )

    target.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
    )
    target.dispatchEvent(new window.FocusEvent('focusin', { bubbles: true }))
    assert.equal(binding.sourceOf(event(new window.Event('input'))), 'keyboard')
    assert.equal(binding.isFocusFromKeyboard(), true)
    assert.equal(other.sourceOf(), 'programmatic')
    assert.equal(other.isFocusFromKeyboard(), false)

    target.dispatchEvent(new window.FocusEvent('focusout', { bubbles: true }))
    target.dispatchEvent(
      new window.PointerEvent('pointerdown', {
        pointerType: 'pen',
        bubbles: true,
      }),
    )
    target.dispatchEvent(new window.FocusEvent('focusin', { bubbles: true }))
    assert.equal(binding.sourceOf(), 'pen')
    assert.equal(binding.isFocusFromKeyboard(), false)
    binding.dispose()
    target.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
    )
    assert.equal(binding.sourceOf(), 'programmatic')
    other.dispose()
  } finally {
    await window.happyDOM.close()
  }
})

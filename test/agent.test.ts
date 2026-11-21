import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Fiber, Option, Schema, Stream } from 'effect'
import * as Mount from 'foldkit/mount'

import * as Agent from '../src/lib/behaviors/agent.ts'

const component = (input: Partial<Agent.Component> = {}): Agent.Component => ({
  ref: 'region',
  component: 'select',
  label: 'Région',
  state: { value: 'London', open: false },
  actions: ['setValue', 'setOpen'],
  ...input,
})
const step = (input: Partial<Agent.Step> = {}): Agent.Step => ({
  ref: 'region',
  action: 'setValue',
  args: ['Frankfurt'],
  ...input,
})
const requested = (steps: readonly Agent.Step[] = [step()]) =>
  Agent.Message.RequestedAct({ steps })
const update = (
  model: Agent.Model,
  message: Agent.Message,
  components: readonly Agent.Component[] = [component()],
  options: Agent.Options = {},
) => Agent.update(model, message, components, options)
const completed = () => Agent.Message.CompletedStep({ changes: [] })

describe('Agent snapshot', () => {
  it('uses Schema data, drops hidden components and places off-page components last', () => {
    const visible = component()
    assert.equal(Schema.is(Agent.Component)(visible), true)
    assert.deepEqual(
      Agent.snapshot([
        component({ ref: 'old', offPage: true }),
        component({ ref: 'hidden', hidden: true }),
        visible,
      ]).map(row => row.ref),
      ['region', 'old'],
    )
    assert.deepEqual(Agent.snapshot([]), [])
    for (const state of [
      { disabled: true },
      { readOnly: true },
      { formDisabled: true },
    ]) {
      assert.deepEqual(Agent.snapshot([component({ state })])[0]?.actions, [])
    }
    assert.deepEqual(
      Agent.snapshot([component({ offPage: true })])[0]?.actions,
      [],
    )
  })

  it('redacts secret field state and errors without mutating input', () => {
    const secret = component({
      secret: true,
      state: {
        value: 'password',
        checked: true,
        query: 'private',
        errors: ['bad'],
        open: true,
      },
      error: 'private error',
    })
    const result = Agent.snapshot([secret])[0]
    assert.ok(result && 'state' in result)
    assert.deepEqual(result.state, {
      value: '[redacted]',
      checked: '[redacted]',
      query: '[redacted]',
      errors: '[redacted]',
      open: true,
    })
    assert.equal(result.error, '[redacted]')
    assert.equal(secret.state.value, 'password')
  })

  it('caps long pages and keeps open popups in source order before the more row', () => {
    const all = Array.from({ length: 105 }, (_, index) =>
      component({ ref: `c${index}`, state: { open: index >= 103 } }),
    )
    const result = Agent.snapshot(all)
    assert.equal(result.length, 101)
    assert.deepEqual(
      result.slice(-3).map(row => row.ref),
      ['c103', 'c104', 'more'],
    )
    assert.deepEqual(result.at(-1), {
      ref: 'more',
      component: 'more',
      more: 5,
      use: 'query',
      actions: [],
    })
    assert.equal(Agent.snapshot(all.slice(0, 100)).length, 100)
    const manyOpen = all.map(item => ({ ...item, state: { open: true } }))
    assert.equal(
      Agent.snapshot(manyOpen).filter(item => item.ref !== 'more').length,
      105,
    )
  })
})

describe('Agent query and step resolution', () => {
  const items = [
    { value: 'de', label: 'Düsseldorf' },
    { value: 'fr', label: 'Paris' },
  ]
  const components = [
    component({ items, row: 'Jane Doe' }),
    component({
      ref: 'city',
      label: 'City',
      component: 'alert-dialog',
      state: {},
      actions: ['press'],
    }),
  ]

  it('matches whole words in labels and rows, folds accents and sharp s, and filters kind', () => {
    const refs = (input: Agent.Query) => {
      const result = Agent.query(components, input)
      assert.ok(Array.isArray(result))
      return result.map(item => item.ref)
    }
    assert.deepEqual(refs({ text: 'REGION' }), ['region'])
    assert.deepEqual(refs({ text: 'Jane' }), ['region'])
    assert.deepEqual(refs({ text: 'Jan' }), [])
    assert.deepEqual(refs({ text: 'region', kind: 'dialog' }), [])
    assert.deepEqual(refs({ kind: 'dialog' }), ['city'])
    assert.deepEqual(refs({ text: 'dussel' }), ['region'])
    assert.deepEqual(
      Agent.query([component({ label: 'Straße' })], { text: 'STRASSE' }),
      Agent.query([component({ label: 'Straße' })], { text: 'Straße' }),
    )
    assert.deepEqual(Agent.query([], {}), {
      error: 'query takes text, within or kind. snapshot lists everything.',
    })
  })

  it('returns a list’s matching items, caps at 50 and explains closed dynamic lists', () => {
    const result = Agent.query(components, { within: 'region', text: 'DUSSEL' })
    assert.ok(Array.isArray(result))
    assert.deepEqual(result[0]?.items, [items[0]])
    const many = Array.from({ length: 52 }, (_, index) => ({
      value: String(index),
      label: `Item ${index}`,
    }))
    const capped = Agent.query([component({ items: many })], {
      within: 'Région',
    })
    assert.ok(Array.isArray(capped))
    assert.equal(capped[0]?.items?.length, 50)
    assert.equal(capped[0]?.more, 2)
    const closed = Agent.query([component()], { within: 'region' })
    assert.ok(Array.isArray(closed))
    assert.match(closed[0]?.note ?? '', /items show while it's open/)
    const missing = Agent.query(components, { within: 'missing' })
    assert.ok('error' in missing)
    assert.match(missing.error, /No component/)
    assert.deepEqual(
      Agent.query([component({ hidden: true })], { kind: 'select' }),
      [],
    )
  })

  it('resolves refs, labels, row words, item labels and kinds, and returns typed errors', () => {
    for (const ref of ['region', 'REGION', 'Jane', 'Düsseldorf', 'select']) {
      const action = Agent.resolveStep(components, step({ ref }))
      assert.ok(!('_tag' in action))
      assert.equal(action.ref, 'region')
      assert.deepEqual(action.args, ['Frankfurt'])
      assert.equal(Schema.is(Agent.Action)(action), true)
    }
    const unknown = Agent.resolveStep(components, step({ ref: 'missing' }))
    assert.ok('_tag' in unknown)
    assert.equal(unknown._tag, 'UnknownComponent')
    const disabled = Agent.resolveStep(
      [component({ state: { readOnly: true } })],
      step(),
    )
    assert.ok('_tag' in disabled)
    assert.equal(disabled._tag, 'ActionUnavailable')
    const duplicates = [component(), component({ ref: 'other' })]
    const ambiguous = Agent.resolveStep(
      duplicates,
      step({ ref: 'region label' }),
    )
    assert.ok('_tag' in ambiguous)
    const same = Agent.resolveStep(duplicates, step({ ref: 'Région' }))
    assert.ok('_tag' in same)
    assert.equal(same._tag, 'Ambiguous')
    assert.equal(
      (
        Agent.resolveStep(
          [component(), component({ ref: 'other', state: { open: true } })],
          step({ ref: 'Région' }),
        ) as Agent.Action
      ).ref,
      'other',
    )
    assert.equal(
      (
        Agent.resolveStep(
          [component({ actions: [] }), component({ ref: 'other' })],
          step({ ref: 'Région' }),
        ) as Agent.Action
      ).ref,
      'other',
    )
    assert.ok(
      '_tag' in Agent.resolveStep([component({ hidden: true })], step()),
    )
    assert.ok(
      '_tag' in Agent.resolveStep([component({ offPage: true })], step()),
    )
  })
})

describe('Agent act lifecycle', () => {
  it('keeps secret step results, changes and failures redacted after the control disappears', () => {
    const first = update(Agent.init(), requested(), [
      component({ secret: true }),
    ])
    const done = update(
      first.model,
      Agent.Message.CompletedStep({
        result: 'private result',
        changes: [
          Agent.agentChange({
            ref: 'region',
            component: 'select',
            key: 'value',
            value: 'private value',
            previous: 'private previous',
            reason: 'imperative',
            phase: 'Commit',
          }),
        ],
        gone: ['region'],
      }),
      [],
    )
    if (done.outMessage?._tag !== 'Finished') assert.fail('Expected Finished')
    assert.equal(done.outMessage.result.steps[0]?.result, '[redacted]')
    assert.equal(
      done.outMessage.result.steps[0]?.changes?.[0]?.value,
      '[redacted]',
    )
    assert.equal(
      done.outMessage.result.steps[0]?.changes?.[0]?.previous,
      '[redacted]',
    )
    const failed = update(
      first.model,
      Agent.Message.FailedStep({ message: 'private error' }),
      [],
    )
    if (failed.outMessage?._tag !== 'Finished') assert.fail('Expected Finished')
    assert.equal(failed.outMessage.result.error?.message, '[redacted]')
  })

  it('runs steps in order against fresh component data and finishes with changes and values', () => {
    const initial = Agent.init()
    assert.equal(Schema.is(Agent.Model)(initial), true)
    const first = update(
      initial,
      requested([step(), step({ ref: 'new', action: 'press', args: [] })]),
    )
    assert.equal(first.outMessage?._tag, 'RunStep')
    assert.equal(first.model.index, 0)
    const appeared = component({
      ref: 'new',
      component: 'button',
      actions: ['press'],
      state: {},
    })
    const components = [
      component({ state: { value: 'Frankfurt', open: false } }),
      appeared,
    ]
    const change = Agent.agentChange({
      ref: 'region',
      component: 'select',
      key: 'value',
      value: 'Frankfurt',
      previous: 'London',
      reason: 'imperative',
      phase: 'Commit',
    })
    assert.equal(change.source, 'agent')
    const second = update(
      first.model,
      Agent.Message.CompletedStep({
        changes: [change],
        appeared: [appeared],
        gone: ['old'],
      }),
      components,
    )
    assert.equal(second.model.index, 1)
    assert.equal(second.outMessage?._tag, 'RunStep')
    if (second.outMessage?._tag === 'RunStep')
      assert.equal(second.outMessage.action.ref, 'new')
    const done = update(
      second.model,
      Agent.Message.CompletedStep({ changes: [], result: 'Pressed Save' }),
      components,
    )
    assert.equal(done.model.running, false)
    assert.equal(done.outMessage?._tag, 'Finished')
    if (done.outMessage?._tag !== 'Finished') assert.fail('Expected Finished')
    assert.equal(done.outMessage.result.ok, true)
    assert.equal(done.outMessage.result.steps.length, 2)
    assert.equal(done.outMessage.result.steps[0]?.changes?.[0]?.source, 'agent')
    assert.deepEqual(done.outMessage.result.steps[0]?.gone, ['old'])
    assert.deepEqual(done.outMessage.result.appeared, [appeared])
    assert.deepEqual(done.outMessage.result.values, {
      'region Région': 'Frankfurt',
    })
    assert.equal(Schema.is(Agent.OutMessage)(done.outMessage), true)
    assert.deepEqual(update(done.model, completed()), { model: done.model })
    const empty = update(initial, requested([]))
    assert.equal(
      empty.outMessage?._tag === 'Finished' && empty.outMessage.result.ok,
      true,
    )
  })

  it('stops at the first failed or unresolvable step and ignores unexpected completions', () => {
    const first = update(Agent.init(), requested([step(), step()]))
    assert.deepEqual(update(first.model, requested()), { model: first.model })
    const failed = update(
      first.model,
      Agent.Message.FailedStep({ message: 'Save failed' }),
    )
    assert.equal(failed.outMessage?._tag, 'Finished')
    if (failed.outMessage?._tag !== 'Finished') assert.fail('Expected Finished')
    assert.equal(failed.outMessage.result.ok, false)
    assert.deepEqual(failed.outMessage.result.error, {
      step: 0,
      message: 'Save failed',
    })
    assert.deepEqual(failed.outMessage.result.steps, [])
    assert.deepEqual(update(Agent.init(), completed()), { model: Agent.init() })
    const missing = update(first.model, completed(), [])
    assert.equal(
      missing.outMessage?._tag === 'Finished' &&
        missing.outMessage.result.error?.step,
      1,
    )
    const secret = update(
      first.model,
      Agent.Message.FailedStep({ message: 'private error' }),
      [component({ secret: true })],
    )
    assert.equal(
      secret.outMessage?._tag === 'Finished' &&
        secret.outMessage.result.error?.message,
      '[redacted]',
    )
  })

  it('fails confirm without policy, asks for approval, allows or refuses and times out safely', () => {
    const components = [component({ confirm: 'Delete the region?' })]
    const noPolicy = update(Agent.init(), requested(), components)
    assert.equal(
      noPolicy.outMessage?._tag === 'Finished' &&
        noPolicy.outMessage.result.error?.message,
      'Needs a person: Delete the region?',
    )
    const options: Agent.Options = { allow: () => 'ask' }
    const asked = update(Agent.init(), requested(), components, options)
    assert.equal(asked.outMessage?._tag, 'RequestApproval')
    assert.equal(asked.commands?.[0]?.name, Agent.WaitForApproval.name)
    assert.deepEqual(asked.commands?.[0]?.args, {
      requestId: asked.model.version,
      timeoutMs: 300000,
    })
    assert.ok(Option.isSome(asked.model.maybeApproval))
    const requestId = asked.model.maybeApproval.value.requestId
    assert.deepEqual(update(asked.model, completed(), components, options), {
      model: asked.model,
    })
    assert.deepEqual(
      update(
        asked.model,
        Agent.Message.Allowed({ requestId: requestId - 1 }),
        components,
        options,
      ),
      { model: asked.model },
    )
    assert.deepEqual(
      update(
        asked.model,
        Agent.Message.TimedOutApproval({ requestId: requestId - 1 }),
        components,
        options,
      ),
      { model: asked.model },
    )
    const allowed = update(
      asked.model,
      Agent.Message.Allowed({ requestId }),
      components,
      options,
    )
    assert.equal(allowed.outMessage?._tag, 'RunStep')
    assert.deepEqual(
      update(
        allowed.model,
        Agent.Message.TimedOutApproval({ requestId }),
        components,
        options,
      ),
      { model: allowed.model },
    )
    const refused = update(
      asked.model,
      Agent.Message.Refused({ requestId }),
      components,
      options,
    )
    assert.equal(
      refused.outMessage?._tag === 'Finished' && refused.outMessage.result.ok,
      false,
    )
    const timedOut = update(
      asked.model,
      Agent.Message.TimedOutApproval({ requestId }),
      components,
      options,
    )
    assert.equal(
      timedOut.outMessage?._tag === 'Finished' &&
        timedOut.outMessage.result.error?.message,
      'No answer to setValue on region in 300 seconds.',
    )
    const next = update(refused.model, requested(), components, options)
    assert.ok(next.model.version > requestId)
    assert.deepEqual(
      update(
        next.model,
        Agent.Message.Refused({ requestId }),
        components,
        options,
      ),
      { model: next.model },
    )
    const changed = update(
      asked.model,
      Agent.Message.Allowed({ requestId }),
      [component({ actions: [] })],
      options,
    )
    assert.equal(
      changed.outMessage?._tag === 'Finished' && changed.outMessage.result.ok,
      false,
    )
    const policyRefused = update(Agent.init(), requested(), [component()], {
      allow: () => false,
    })
    assert.equal(
      policyRefused.outMessage?._tag === 'Finished' &&
        policyRefused.outMessage.result.ok,
      false,
    )
    assert.equal(
      update(Agent.init(), requested(), [component()], { allow: () => true })
        .outMessage?._tag,
      'RunStep',
    )
    const askWithoutConfirm = update(Agent.init(), requested(), [component()], {
      allow: () => 'ask',
      timeoutMs: 10,
    })
    assert.equal(askWithoutConfirm.outMessage?._tag, 'RequestApproval')
    assert.equal(askWithoutConfirm.commands?.[0]?.args.timeoutMs, 10)
  })

  it('redacts completion payloads and includes touched open components', () => {
    const components = [
      component({ secret: true, state: { value: 'private', open: true } }),
    ]
    const first = update(Agent.init(), requested(), components)
    const done = update(
      first.model,
      Agent.Message.CompletedStep({
        changes: [
          Agent.agentChange({
            ref: 'region',
            component: 'select',
            key: 'value',
            previous: 'private before',
            value: 'private after',
            reason: 'imperative',
            phase: 'Commit',
          }),
        ],
        result: 'private result',
      }),
      components,
    )
    if (done.outMessage?._tag !== 'Finished') assert.fail('Expected Finished')
    assert.equal(done.outMessage.result.steps[0]?.result, '[redacted]')
    assert.equal(
      done.outMessage.result.steps[0]?.changes?.[0]?.value,
      '[redacted]',
    )
    assert.equal(done.outMessage.result.open?.[0]?.state.value, '[redacted]')
    assert.deepEqual(done.outMessage.result.values, {})
  })
})

describe('Agent tools', () => {
  it('registers tools, dispatches inbound calls and replies through a Command, then aborts on cleanup', async () => {
    type Tool = { name: string; execute: (input: unknown) => Promise<unknown> }
    const registered: Tool[] = []
    const signals: AbortSignal[] = []
    const ready = Promise.withResolvers<void>()
    const element = { ownerDocument: {} } as Element
    Object.defineProperty(element.ownerDocument, 'modelContext', {
      value: {
        registerTool: (tool: Tool, options: { signal: AbortSignal }) => {
          registered.push(tool)
          signals.push(options.signal)
          if (registered.length === 3) ready.resolve()
        },
      },
    })
    const messages: (typeof Agent.Message.RequestedTool.Type)[] = []
    const mount = Agent.registerTools({})
    const fiber = Effect.runFork(
      Stream.runForEach(
        mount.f(element, Mount.liveViewStateChanges),
        message => {
          messages.push(message)
          return message.name === 'snapshot'
            ? Agent.replyToTool({
                reply: message.reply,
                result: [{ ref: 'test' }],
              }).effect
            : Effect.void
        },
      ),
    )
    try {
      await ready.promise
      assert.deepEqual(
        registered.map(tool => tool.name),
        ['snapshot', 'act', 'query'],
      )
      assert.deepEqual(await registered[0]!.execute({}), [{ ref: 'test' }])
      assert.equal(messages[0]?.name, 'snapshot')
      assert.deepEqual(messages[0]?.input, {})
      const pending = registered[1]!.execute({ steps: [] })
      await Effect.runPromise(Fiber.interrupt(fiber))
      assert.deepEqual(await pending, { error: 'Tool registration stopped.' })
      assert.ok(signals.every(signal => signal.aborted))
      assert.deepEqual(await registered[0]!.execute({}), {
        error: 'Tool registration stopped.',
      })
    } finally {
      await Effect.runPromise(Fiber.interrupt(fiber))
    }
  })

  it('is a no-op without WebMCP and tolerates registration rejection', async () => {
    const missing = { ownerDocument: {} } as Element
    const rejecting = { ownerDocument: {} } as Element
    Object.defineProperty(rejecting.ownerDocument, 'modelContext', {
      value: {
        registerTool: () => Promise.reject(new Error('Not allowed')),
      },
    })
    for (const element of [missing, rejecting]) {
      const fiber = Effect.runFork(
        Stream.runDrain(
          Agent.registerTools({}).f(element, Mount.liveViewStateChanges),
        ),
      )
      await Effect.runPromise(Effect.yieldNow)
      await Effect.runPromise(Fiber.interrupt(fiber))
    }
  })

  it('exports the three ui-sdk JSON Schema tools and a scoped registration Mount', () => {
    assert.deepEqual(
      Agent.agentTools.map(tool => tool.name),
      ['snapshot', 'act', 'query'],
    )
    for (const tool of Agent.agentTools) {
      assert.equal(tool.inputSchema.type, 'object')
      assert.ok(tool.description.length > 100)
    }
    assert.deepEqual(Agent.agentTools[1].inputSchema.required, ['steps'])
    assert.deepEqual(
      Agent.agentTools[1].inputSchema.properties.steps.items.required,
      ['ref', 'action'],
    )
    assert.equal(Agent.registerTools({}).name, 'RegisterAgentTools')
  })
})

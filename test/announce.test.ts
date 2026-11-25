import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { inertHtml } from 'foldkit/html'
import * as Announce from '../src/lib/behaviors/announce.ts'

describe('Announce', () => {
  it('keeps the two live regions mounted and routes text by priority', () => {
    const h = inertHtml
    const expected = (polite: string, assertive: string) => [
      h.div(Announce.liveRegionAttributes('polite', h), [polite]),
      h.div(Announce.liveRegionAttributes('assertive', h), [assertive]),
    ]
    assert.deepEqual(
      Announce.prepareAnnouncements(Announce.init(), h),
      expected('', ''),
    )
    assert.deepEqual(
      Announce.prepareAnnouncements({ text: 'Saved', priority: 'polite' }, h),
      expected('Saved', ''),
    )
    assert.deepEqual(
      Announce.prepareAnnouncements(
        { text: 'Failed', priority: 'assertive' },
        h,
      ),
      expected('', 'Failed'),
    )
  })
  it('describes list results, loading and removals', () => {
    assert.equal(
      Announce.describeList({ type: 'results', count: 0 }),
      'No results',
    )
    assert.equal(
      Announce.describeList({ type: 'results', count: 1 }),
      '1 result',
    )
    assert.equal(
      Announce.describeList({ type: 'results', count: 12 }),
      '12 results',
    )
    assert.equal(
      Announce.describeList({ type: 'results', count: 0, loading: true }),
      'Loading',
    )
    assert.equal(
      Announce.describeList({ type: 'removed', label: 'Task' }),
      'Task removed',
    )
  })

  it('publishes visually-hidden atomic regions at either priority', () => {
    for (const priority of ['polite', 'assertive'] as const) {
      const attrs = Announce.liveRegionAttributes(priority, inertHtml)
      assert.ok(
        attrs.some(
          attribute =>
            attribute._tag === 'Role' &&
            attribute.value === (priority === 'polite' ? 'status' : 'alert'),
        ),
      )
      assert.ok(
        attrs.some(
          attribute =>
            attribute._tag === 'AriaLive' && attribute.value === priority,
        ),
      )
      assert.ok(
        attrs.some(
          attribute =>
            attribute._tag === 'AriaAtomic' && attribute.value === true,
        ),
      )
      assert.ok(
        attrs.some(
          attribute =>
            attribute._tag === 'Style' &&
            attribute.value.clipPath === 'inset(50%)',
        ),
      )
    }
  })

  it('clears repeated text and rejects stale delay completions', () => {
    const initial = Announce.init()
    assert.deepEqual(
      Announce.update(
        initial,
        Announce.Message.RequestedAnnouncement({
          text: '',
          priority: 'polite',
        }),
      ),
      { model: initial },
    )
    const first = Announce.update(
      initial,
      Announce.Message.RequestedAnnouncement({
        text: 'Saved',
        priority: 'polite',
      }),
    )
    assert.equal(first.model.text, '')
    assert.equal(first.commands?.length, 1)
    const done = Announce.update(
      first.model,
      Announce.Message.CompletedDelay({ version: first.model.version }),
    ).model
    assert.equal(done.text, 'Saved')
    const repeated = Announce.update(
      done,
      Announce.Message.RequestedAnnouncement({
        text: 'Saved',
        priority: 'assertive',
      }),
    ).model
    assert.equal(repeated.text, '')
    assert.equal(repeated.priority, 'assertive')
    assert.deepEqual(
      Announce.update(
        repeated,
        Announce.Message.CompletedDelay({ version: done.version }),
      ),
      { model: repeated },
    )
    assert.equal(
      Announce.update(
        repeated,
        Announce.Message.CompletedDelay({ version: repeated.version }),
      ).model.text,
      'Saved',
    )
  })
})

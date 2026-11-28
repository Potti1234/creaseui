import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Html, HtmlServer } from '@effect/ui/html'
import { HtmlLocator, HtmlPlay } from '@effect/ui/html/testing'
import { TestHost } from '@effect/ui/testing'
import { Effect, Schema } from 'effect'

import { constrainLightboxPose } from '../src/behaviors/lightbox'
import { sanitizeMarkdownUrl } from '../src/behaviors/markdown'
import {
  collapsedIndices,
  computeOverflow,
} from '../src/behaviors/overflow-list'
import { CodeBlock } from '../src/ui/code-block'
import { Markdown } from '../src/ui/markdown'

const Fixture = Html.component({
  name: 'CreaseContentPortsFixture',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    h.div.children(
      CodeBlock(h, {
        id: 'example',
        props: { code: 'let x = 1\nlet y = 2' },
        language: 'typescript',
        lineNumbers: true,
        highlightLines: [2],
        collapsible: true,
        collapsibleThreshold: 2,
        tokenizer: () => [{ type: 'keyword', start: 0, end: 3 }],
      }),
      Markdown(h, {
        id: 'guide',
        source:
          '# Reference\n\nSee 【handbook】.\n\n~~~html\n<div>text</div>\n~~~',
        headingLevelStart: 3,
        citationStyle: 'number',
        sources: { handbook: { title: 'Handbook', url: '/handbook' } },
      }),
    ),
})

test('Code Block uses the supplied tokenizer and keeps the labeled region stable through collapse', () =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const { html } = yield* HtmlServer.renderToHtml(Fixture, {})
        assert.match(html, /data-type="keyword"[^>]*>let<\/span>/)
        assert.match(html, /data-highlighted(?:="")?[^>]*data-line="2"/)
        const play = yield* HtmlPlay.make(Fixture, {})
        const toggle = HtmlLocator.role('button', { name: 'typescript' })
        yield* play.expect(toggle).toHaveAttribute('aria-expanded', 'true')
        yield* play.expect(toggle).toHaveAttribute('aria-controls', 'example')
        yield* play.click(toggle)
        yield* play.expect(toggle).toHaveAttribute('aria-expanded', 'false')
        yield* play.click(toggle)
        yield* play.expect(toggle).toHaveAttribute('aria-expanded', 'true')
      }),
    ).pipe(Effect.provide(TestHost.layer())),
  ))

test('Markdown retains heading levels and citation numbering and escapes fenced content', () =>
  Effect.runPromise(
    Effect.gen(function* () {
      const { html } = yield* HtmlServer.renderToHtml(Fixture, {})
      assert.match(html, /<h3[^>]*>Reference<\/h3>/)
      assert.match(html, /aria-label="Citation 1: Handbook"/)
      assert.match(html, /rel="noopener noreferrer"/)
      assert.match(html, /&lt;/)
      assert.equal(sanitizeMarkdownUrl(' data:text/plain,caption '), null)
      assert.equal(
        sanitizeMarkdownUrl('/handbook#reference'),
        '/handbook#reference',
      )
    }),
  ))

test('Overflow List keeps the correct indices when the indicator occupies the leading edge', () => {
  const layout = computeOverflow({
    widths: [80, 90, 70],
    gap: 8,
    availableWidth: 200,
    indicatorWidth: 20,
    minVisibleItems: 0,
    collapseFrom: 'start',
  })
  assert.deepEqual(layout, { visibleCount: 2, rows: 1 })
  assert.deepEqual(collapsedIndices(3, layout.visibleCount, 'start'), [0])
  assert.deepEqual(collapsedIndices(3, layout.visibleCount, 'end'), [2])
})

test('Lightbox clamps pan and pinch to the zoomed image bounds', () => {
  const frame = { width: 100, height: 80 }
  const initial = { x: 0, y: 0, zoom: 1 }
  const zoomed = constrainLightboxPose(initial, frame, {
    zoom: 3,
    x: 200,
    y: -200,
  })
  assert.deepEqual(zoomed, { x: 50, y: -40, zoom: 2 })
  const pending = constrainLightboxPose(
    initial,
    { width: 0, height: 0 },
    {
      zoom: 2,
      x: -50,
      y: 0,
    },
  )
  assert.deepEqual(pending, { x: -50, y: 0, zoom: 2 })
  const relaxed = constrainLightboxPose(zoomed, frame, {
    zoom: 0.5,
    x: 15,
    y: 10,
  })
  assert.equal(relaxed.zoom, 1)
  assert.ok(Math.abs(relaxed.x) === 0 && Math.abs(relaxed.y) === 0)
})

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { chromium } from '@playwright/test'

import {
  assertUI,
  auditUI,
  createUIPolicy,
  expectUI,
  renderedRuleIds,
} from '../rendered.js'
import { AUDIT_RULES } from '../audit.js'

const fixture = name =>
  pathToFileURL(
    fileURLToPath(new URL(`./fixtures/audit/${name}`, import.meta.url)),
  ).href
const skip = existsSync(chromium.executablePath())
  ? false
  : 'Chromium is not installed (run `npx playwright install chromium`)'

const withPage = async (name, run) => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.goto(fixture(name))
    return await run(page)
  } finally {
    await browser.close()
  }
}

test('rendered SDK shares the CLI rule set and validates policy', () => {
  assert.deepEqual(renderedRuleIds, AUDIT_RULES)
  assert.throws(() => createUIPolicy([]), /must be an object/u)
  assert.throws(
    () =>
      createUIPolicy({
        exceptions: [
          { rule: 'text-contrast', selector: 'body', owner: 'a', reason: 'b' },
        ],
      }),
    /matches the whole page/u,
  )
  assert.throws(
    () =>
      createUIPolicy({
        exceptions: [{ rule: 'text-contrast', selector: '.x' }],
      }),
    /owner must be a nonempty string/u,
  )
})

test('clean page is complete and passes', { skip }, async () => {
  await withPage('clean.html', async page => {
    const report = await auditUI(page, { state: 'clean' })
    assert.equal(report.coverage.complete, true)
    assert.equal(report.outcome, 'passed')
    assertUI(report)
    const attached = []
    await expectUI(page, { attach: async name => attached.push(name) })
    assert.deepEqual(attached, [])
  })
})

test(
  'broken page fails with findings and attaches the report',
  { skip },
  async () => {
    await withPage('broken.html', async page => {
      const report = await auditUI(page, { state: 'broken' })
      assert.equal(report.outcome, 'failed')
      assert.ok(
        report.findings.some(finding => finding.rule === 'accessible-name'),
      )
      assert.throws(() => assertUI(report), /UI audit failed in broken/u)
      const attached = []
      await assert.rejects(
        expectUI(
          page,
          { attach: async name => attached.push(name) },
          { state: 'broken' },
        ),
      )
      assert.deepEqual(attached, ['crease-ui-broken'])
    })
  },
)

test(
  'unresolved or unsupported content is incomplete and never passes',
  { skip },
  async () => {
    await withPage('incomplete.html', async page => {
      const report = await auditUI(page, { state: 'gradient' })
      assert.equal(report.coverage.complete, false)
      assert.equal(report.outcome, 'incomplete')
      assert.throws(() => assertUI(report), /incomplete in gradient/u)
    })
  },
)

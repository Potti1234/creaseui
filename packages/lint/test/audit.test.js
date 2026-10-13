import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { chromium } from '@playwright/test'

const bin = fileURLToPath(new URL('../bin/creaseui-lint.js', import.meta.url))
const fixture = name =>
  pathToFileURL(
    fileURLToPath(new URL(`./fixtures/audit/${name}`, import.meta.url)),
  ).href
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))
const skip = existsSync(chromium.executablePath())
  ? false
  : 'Chromium is not installed (run `npx playwright install chromium`)'

const audit = (configSource, ...flags) => {
  const directory = mkdtempSync(path.join(tmpdir(), 'creaseui-audit-'))
  const config = path.join(directory, 'creaseui-lint.audit.mjs')
  const output = path.join(directory, 'report.json')
  writeFileSync(config, configSource)
  const result = spawnSync(
    process.execPath,
    [bin, 'audit', '--config', config, '--output', output, ...flags],
    { cwd: repoRoot, encoding: 'utf8' },
  )
  const report = existsSync(output)
    ? JSON.parse(readFileSync(output, 'utf8'))
    : undefined
  return { ...result, report }
}

const DIALOG_STATE = `{
  name: 'dialog-open',
  run: page => page.click('#open'),
  expect: async page => page.locator('[role="dialog"]').isVisible(),
}`

const cleanConfig = (extra = '') => `export default {
  renderer: 'pleat',
  viewports: [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
  ],
  themes: [{ name: 'light' }, { name: 'dark', apply: { kind: 'class', value: 'dark' } }],
  cases: [{
    id: 'settings',
    url: ${JSON.stringify(fixture('clean.html'))},
    ready: '#app',
    directions: ['ltr', 'rtl'],
    states: [{ name: 'resting' }, ${DIALOG_STATE}],
  }],
  ${extra}
}
`

const brokenConfig = (extra = '') => `export default {
  cases: [{ id: 'broken', url: ${JSON.stringify(fixture('broken.html'))} }],
  ${extra}
}
`

test(
  'clean fixture passes every combination with real interactions',
  { skip },
  () => {
    const { status, report, stderr } = audit(cleanConfig())
    assert.equal(status, 0, stderr)
    assert.equal(report.exitCode, 0)
    assert.equal(report.schemaVersion, 1)
    assert.equal(report.policy, 'crease-default-v1')
    assert.equal(report.renderer, 'pleat')
    assert.deepEqual(report.findings, [])
    assert.equal(report.coverage.checked, 16)
    assert.equal(report.coverage.unvisited, 0)
    assert.equal(report.interactions.length, 8)
    const dialog = report.results.find(result => result.state === 'dialog-open')
    assert.ok(dialog.checked['overlay-bounds'] >= 1)
    assert.ok(dialog.checked['text-contrast'] > 0)
  },
)

test(
  'broken fixture fails with rule ids, measurements and fixes',
  { skip },
  () => {
    const { status, report } = audit(brokenConfig())
    assert.equal(status, 1)
    const rules = new Set(report.findings.map(finding => finding.rule))
    for (const rule of [
      'accessible-name',
      'label-reference',
      'document-overflow',
      'overlay-bounds',
      'target-size',
      'text-contrast',
    ])
      assert.ok(rules.has(rule), `missing ${rule}`)
    const contrast = report.findings.find(
      finding => finding.rule === 'text-contrast',
    )
    assert.equal(contrast.selector, '#faint')
    assert.match(contrast.measured, /^\d+\.\d\d:1$/u)
    assert.equal(contrast.expected, '>= 4.5:1')
    assert.ok(contrast.fix.length > 0)
    assert.equal(
      report.findings.find(finding => finding.rule === 'target-size').severity,
      'warning',
    )
    // Gradient text cannot be resolved, so it is reported as unresolved, not guessed.
    assert.ok(report.coverage.unresolved >= 1)
    assert.ok(report.coverage.unsupported >= 1)
  },
)

test(
  'scoped exceptions exclude findings and unused exceptions are reported',
  { skip },
  () => {
    const { report } = audit(
      brokenConfig(`exceptions: [
      { rule: 'text-contrast', selector: '#faint', reason: 'legacy copy', owner: 'design' },
      { rule: 'target-size', selector: '#does-not-exist', reason: 'stale', owner: 'design' },
    ]`),
    )
    assert.equal(report.exitCode, 1)
    assert.ok(
      !report.findings.some(finding => finding.rule === 'text-contrast'),
    )
    assert.equal(report.coverage.excluded, 1)
    assert.equal(report.exceptions.used.length, 1)
    assert.equal(report.exceptions.unused.length, 1)
    assert.equal(report.exceptions.unused[0].selector, '#does-not-exist')
  },
)

test(
  'report-only relaxes findings but never incomplete execution',
  { skip },
  () => {
    assert.equal(audit(brokenConfig(), '--report-only').status, 0)
    const missing = audit(
      `export default { cases: [{ id: 'gone', url: ${JSON.stringify(fixture('missing.html'))} }] }`,
      '--report-only',
    )
    assert.equal(missing.status, 2)
    assert.equal(missing.report.coverage.unvisited, 1)
  },
)

test('failed state setup and unready pages exit 2', { skip }, () => {
  const failedState = audit(
    cleanConfig().replace(
      DIALOG_STATE,
      `{ name: 'never', run: () => {}, expect: () => false }`,
    ),
  )
  assert.equal(failedState.status, 2)
  assert.match(failedState.stderr, /state "never" setup failed/u)
  const unready = audit(
    cleanConfig().replace("ready: '#app'", "ready: '#nope'"),
  )
  assert.equal(unready.status, 2)
  assert.match(unready.stderr, /readiness selector/u)
})

test('invalid configuration exits 2 with a diagnostic', () => {
  const cases = [
    [
      brokenConfig(
        `exceptions: [{ rule: 'text-contrast', selector: '#faint', reason: 'x' }]`,
      ),
      /needs owner/u,
    ],
    [
      brokenConfig(
        `exceptions: [{ rule: 'text-contrast', selector: '*', reason: 'x', owner: 'y' }]`,
      ),
      /too broad/u,
    ],
    [
      brokenConfig(
        `exceptions: [{ rule: 'made-up', selector: '#x', reason: 'x', owner: 'y' }]`,
      ),
      /unknown rule/u,
    ],
    [
      `export default { cases: [{ id: 'a', url: 'x', states: [{ name: 's', run: () => {} }] }] }`,
      /needs expect/u,
    ],
    [
      `export default { policy: 'other', cases: [{ id: 'a', url: 'x' }] }`,
      /unknown policy/u,
    ],
    [`export default { cases: [] }`, /at least one case/u],
  ]
  for (const [source, message] of cases) {
    const result = audit(source)
    assert.equal(result.status, 2, source)
    assert.match(result.stderr, message)
  }
})

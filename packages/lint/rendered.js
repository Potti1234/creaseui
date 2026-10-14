import { AUDIT_ENGINE, AUDIT_RULES } from './lib/audit/index.js'
import { measurePage } from './lib/audit/measure.js'

// Host-page SDK: the caller owns navigation, themes and interactions; this
// measures the current document with the same engine as `creaseui-lint audit`.
// Playwright is never imported here; any page with `evaluate` and `url` works.
export const renderedRuleIds = AUDIT_RULES

const BROAD_SELECTORS = new Set(['*', 'html', 'body', ':root'])

export const createUIPolicy = (overrides = {}) => {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides))
    throw new TypeError('UI policy overrides must be an object.')
  const policy = {
    minimumTarget: 24,
    failOn: 'error',
    exceptions: [],
    ...overrides,
  }
  if (!Number.isFinite(policy.minimumTarget) || policy.minimumTarget <= 0)
    throw new TypeError('minimumTarget must be a positive number.')
  if (policy.failOn !== 'error' && policy.failOn !== 'warning')
    throw new TypeError('failOn must be "error" or "warning".')
  if (!Array.isArray(policy.exceptions))
    throw new TypeError('exceptions must be an array.')
  policy.exceptions.forEach((exception, index) => {
    const where = `exceptions[${index}]`
    if (!AUDIT_RULES.includes(exception?.rule))
      throw new TypeError(
        `${where}.rule must be one of ${AUDIT_RULES.join(', ')}.`,
      )
    for (const field of ['selector', 'owner', 'reason'])
      if (typeof exception[field] !== 'string' || !exception[field].trim())
        throw new TypeError(`${where}.${field} must be a nonempty string.`)
    if (BROAD_SELECTORS.has(exception.selector.trim()))
      throw new TypeError(
        `${where}.selector "${exception.selector}" matches the whole page.`,
      )
  })
  return Object.freeze(policy)
}

export async function auditUI(
  page,
  { policy = {}, state = 'current', timeout = 15000 } = {},
) {
  if (typeof state !== 'string' || !state.trim())
    throw new TypeError('A UI audit state must have a nonempty name.')
  if (!Number.isFinite(timeout) || timeout <= 0)
    throw new TypeError('UI audit timeout must be a positive number.')
  const configured = createUIPolicy(policy)
  let timer
  try {
    const measured = await Promise.race([
      page.evaluate(measurePage, {
        exceptions: configured.exceptions.map(({ rule, selector }, index) => ({
          rule,
          selector,
          index,
        })),
        minimumTarget: configured.minimumTarget,
      }),
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(`UI audit timed out in ${state} after ${timeout}ms.`),
            ),
          timeout,
        )
      }),
    ])
    const rank = { warning: 1, error: 2 }
    const blocking = measured.findings.filter(
      finding => rank[finding.severity] >= rank[configured.failOn],
    )
    const complete =
      measured.unresolved.length === 0 && measured.unsupported.length === 0
    return {
      engine: { ...AUDIT_ENGINE, host: 'page' },
      state,
      url: page.url(),
      failOn: configured.failOn,
      findings: measured.findings,
      coverage: {
        checked: measured.checked,
        unresolved: measured.unresolved,
        unsupported: measured.unsupported,
        excluded: measured.excluded,
        complete,
      },
      outcome: !complete
        ? 'incomplete'
        : blocking.length > 0
          ? 'failed'
          : 'passed',
      exceptions: {
        used: configured.exceptions.filter((_, index) =>
          measured.excluded.some(item => item.exception === index),
        ),
      },
    }
  } finally {
    clearTimeout(timer)
  }
}

const describe = items =>
  items
    .map(
      item =>
        `${item.rule}: ${item.selector}\n${item.reason ?? `${item.measured} (expected ${item.expected})\nFix: ${item.fix}`}`,
    )
    .join('\n\n')

export function assertUI(report) {
  if (!Array.isArray(report?.findings) || !report.coverage)
    throw new TypeError('Expected a report from auditUI().')
  if (report.outcome === 'incomplete')
    throw new Error(
      `UI audit incomplete in ${report.state}: measurements could not be completed, so it cannot pass.\n` +
        describe([
          ...report.coverage.unresolved,
          ...report.coverage.unsupported,
        ]),
    )
  if (report.outcome === 'failed')
    throw new Error(
      `UI audit failed in ${report.state}: ${report.findings.length} finding(s).\n` +
        describe(report.findings),
    )
}

export async function expectUI(page, testInfo, options = {}) {
  const report = await auditUI(page, options)
  if (report.outcome !== 'passed')
    await testInfo.attach(`crease-ui-${report.state}`, {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    })
  assertUI(report)
}

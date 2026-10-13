import { existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { POLICY_VERSION } from '../strict/contracts.js'
import { measurePage } from './measure.js'

export const AUDIT_SCHEMA_VERSION = 1
export const AUDIT_ENGINE = Object.freeze({
  name: 'creaseui-audit',
  version: '0.1.0',
})
export const AUDIT_RULES = Object.freeze([
  'accessible-name',
  'label-reference',
  'document-overflow',
  'overlay-bounds',
  'target-size',
  'text-contrast',
])
const SEVERITY_RANK = { warning: 1, error: 2 }
const BROAD_SELECTORS = new Set(['*', 'html', 'body', ':root'])

export class AuditSetupError extends Error {
  constructor(message) {
    super(`creaseui-lint audit: ${message}`)
    this.name = 'AuditSetupError'
  }
}

const fail = message => {
  throw new AuditSetupError(message)
}
const isRecord = value =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const nonEmpty = value => typeof value === 'string' && value.trim() !== ''

const normalizeTheme = (theme, index) => {
  if (!isRecord(theme) || !nonEmpty(theme.name))
    fail(`themes[${index}] needs a name`)
  const apply = theme.apply
  if (apply === undefined) return { name: theme.name }
  if (!isRecord(apply)) fail(`themes[${index}].apply must be an object`)
  if (apply.kind === 'class' && nonEmpty(apply.value))
    return { name: theme.name, apply: { target: 'html', ...apply } }
  if (apply.kind === 'attribute' && nonEmpty(apply.name))
    return {
      name: theme.name,
      apply: { target: 'html', value: '', ...apply },
    }
  if (apply.kind === 'storage' && nonEmpty(apply.key))
    return {
      name: theme.name,
      apply: { storage: 'local', value: '', ...apply },
    }
  return fail(
    `themes[${index}].apply must be {kind:'class',value}, {kind:'attribute',name,value} or {kind:'storage',key,value}`,
  )
}

export const normalizeAuditConfig = config => {
  if (!isRecord(config)) fail('config must export an object')
  const policy = config.policy ?? POLICY_VERSION
  if (policy !== POLICY_VERSION)
    fail(`unknown policy "${policy}"; supported: ${POLICY_VERSION}`)
  const failOn = config.failOn ?? 'error'
  if (!(failOn in SEVERITY_RANK)) fail('failOn must be "error" or "warning"')
  const viewports = config.viewports ?? [
    { name: 'desktop', width: 1440, height: 1000 },
  ]
  viewports.forEach((viewport, index) => {
    if (
      !isRecord(viewport) ||
      !nonEmpty(viewport.name) ||
      !Number.isInteger(viewport.width) ||
      !Number.isInteger(viewport.height)
    )
      fail(`viewports[${index}] needs name, width and height`)
  })
  const themes = (config.themes ?? [{ name: 'default' }]).map(normalizeTheme)
  if (!Array.isArray(config.cases) || config.cases.length === 0)
    fail('config needs at least one case')
  const ids = new Set()
  const cases = config.cases.map((entry, index) => {
    if (!isRecord(entry) || !nonEmpty(entry.id) || !nonEmpty(entry.url))
      fail(`cases[${index}] needs id and url`)
    if (ids.has(entry.id)) fail(`duplicate case id "${entry.id}"`)
    ids.add(entry.id)
    const directions = entry.directions ?? config.directions ?? ['ltr']
    if (!directions.every(direction => ['ltr', 'rtl'].includes(direction)))
      fail(`cases[${index}].directions must contain "ltr" or "rtl"`)
    const states = entry.states ?? [{ name: 'resting' }]
    states.forEach((state, stateIndex) => {
      if (!isRecord(state) || !nonEmpty(state.name))
        fail(`cases[${index}].states[${stateIndex}] needs a name`)
      if (state.run !== undefined && typeof state.run !== 'function')
        fail(`cases[${index}].states[${stateIndex}].run must be a function`)
      if (state.run !== undefined && typeof state.expect !== 'function')
        fail(
          `cases[${index}].states[${stateIndex}] needs expect(page): a state transition must assert its result`,
        )
    })
    return {
      id: entry.id,
      url: entry.url,
      ready: entry.ready ?? config.ready ?? 'body',
      directions,
      motion: entry.motion ?? config.motion ?? 'reduce',
      states,
    }
  })
  const exceptions = (config.exceptions ?? []).map((exception, index) => {
    if (!isRecord(exception)) fail(`exceptions[${index}] must be an object`)
    for (const field of ['rule', 'selector', 'reason', 'owner'])
      if (!nonEmpty(exception[field]))
        fail(`exceptions[${index}] needs ${field}`)
    if (!AUDIT_RULES.includes(exception.rule))
      fail(`exceptions[${index}] names unknown rule "${exception.rule}"`)
    if (BROAD_SELECTORS.has(exception.selector.trim()))
      fail(
        `exceptions[${index}] selector "${exception.selector}" is too broad; name a stable contract or region`,
      )
    const scope = exception.scope ?? '*'
    if (scope !== '*' && !ids.has(scope))
      fail(`exceptions[${index}] scope "${scope}" is not a case id`)
    return { ...exception, scope, index }
  })
  return {
    policy,
    renderer: config.renderer,
    failOn,
    minimumTarget: config.minimumTarget ?? 24,
    timeout: config.timeout ?? 15_000,
    artifactsDir: config.artifactsDir,
    viewports,
    themes,
    cases,
    exceptions,
  }
}

export const loadPlaywright = async searchFrom => {
  for (const directory of searchFrom)
    for (const name of ['playwright', '@playwright/test']) {
      try {
        const resolved = createRequire(
          path.join(directory, 'package.json'),
        ).resolve(name)
        const module = await import(pathToFileURL(resolved).href)
        const chromium = module.chromium ?? module.default?.chromium
        if (chromium) return { chromium, name }
      } catch {
        // try the next candidate
      }
    }
  return fail(
    'Playwright is not installed. Add "playwright" (or "@playwright/test") to the project and run `npx playwright install chromium`.',
  )
}

const applyThemeInPage = ({ apply, direction }) => {
  const target =
    apply?.target === 'body' ? document.body : document.documentElement
  if (apply?.kind === 'class') target.classList.add(apply.value)
  if (apply?.kind === 'attribute') target.setAttribute(apply.name, apply.value)
  document.documentElement.dir = direction
}

const settle = page =>
  page.evaluate(
    () =>
      new Promise(resolve => {
        const frames = () =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        if (document.fonts?.ready) document.fonts.ready.then(frames)
        else frames()
      }),
  )

const runCombination = async (browser, config, combination) => {
  const { entry, theme, viewport, direction, state } = combination
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: entry.motion,
  })
  const page = await context.newPage()
  page.setDefaultTimeout(config.timeout)
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  try {
    if (theme.apply?.kind === 'storage')
      await page.addInitScript(
        ({ key, value, storage }) =>
          (storage === 'session' ? sessionStorage : localStorage).setItem(
            key,
            value,
          ),
        theme.apply,
      )
    try {
      await page.goto(entry.url, { waitUntil: 'load' })
    } catch (error) {
      return {
        status: 'unvisited',
        reason: `page unavailable: ${error.message.split('\n')[0]}`,
      }
    }
    await page.evaluate(applyThemeInPage, { apply: theme.apply, direction })
    try {
      await page.locator(entry.ready).first().waitFor({ state: 'visible' })
    } catch {
      return {
        status: 'unvisited',
        reason: `readiness selector "${entry.ready}" never became visible`,
      }
    }
    let interaction
    if (state.run) {
      try {
        await state.run(page)
        const result = await state.expect(page)
        if (result === false) throw new Error('expect(page) returned false')
        interaction = { state: state.name, assertion: 'passed' }
      } catch (error) {
        return {
          status: 'unvisited',
          reason: `state "${state.name}" setup failed: ${String(error?.message ?? error).split('\n')[0]}`,
        }
      }
    }
    await settle(page)
    const measured = await page.evaluate(measurePage, {
      exceptions: config.exceptions
        .filter(
          exception => exception.scope === '*' || exception.scope === entry.id,
        )
        .map(({ rule, selector, index }) => ({ rule, selector, index })),
      minimumTarget: config.minimumTarget,
    })
    let screenshot
    if (config.artifactsDir) {
      mkdirSync(config.artifactsDir, { recursive: true })
      screenshot = path.join(
        config.artifactsDir,
        `${[entry.id, theme.name, viewport.name, direction, state.name].join('--').replace(/[^\w.-]+/gu, '_')}.png`,
      )
      await page.screenshot({ path: screenshot, fullPage: true })
    }
    return {
      status: 'measured',
      ...measured,
      pageErrors,
      interaction,
      screenshot,
    }
  } finally {
    await context.close()
  }
}

export const runAudit = async (rawConfig, options = {}) => {
  const config = normalizeAuditConfig(rawConfig)
  const { chromium, name } =
    options.playwright ??
    (await loadPlaywright(options.searchFrom ?? [process.cwd()]))
  let browser
  try {
    browser = await chromium.launch()
  } catch (error) {
    fail(
      `could not launch Chromium via ${name}: ${String(error.message).split('\n')[0]}. Run \`npx playwright install chromium\`.`,
    )
  }
  const failRank = SEVERITY_RANK[config.failOn]
  const results = []
  try {
    for (const entry of config.cases)
      for (const theme of config.themes)
        for (const viewport of config.viewports)
          for (const direction of entry.directions)
            for (const state of entry.states) {
              const combination = { entry, theme, viewport, direction, state }
              const outcome = await runCombination(browser, config, combination)
              const failing = (outcome.findings ?? []).filter(
                finding => SEVERITY_RANK[finding.severity] >= failRank,
              )
              results.push({
                case: entry.id,
                url: entry.url,
                theme: theme.name,
                viewport: viewport.name,
                direction,
                state: state.name,
                ...outcome,
                status:
                  outcome.status === 'unvisited'
                    ? 'unvisited'
                    : failing.length > 0
                      ? 'failed'
                      : 'checked',
              })
            }
  } finally {
    await browser.close()
  }

  const usedExceptions = new Set(
    results.flatMap(result =>
      (result.excluded ?? []).map(item => item.exception),
    ),
  )
  const findings = results.flatMap(result =>
    (result.findings ?? []).map(finding => ({
      case: result.case,
      url: result.url,
      renderer: config.renderer,
      theme: result.theme,
      viewport: result.viewport,
      direction: result.direction,
      state: result.state,
      ...finding,
    })),
  )
  const coverage = {
    checked: results.filter(result => result.status === 'checked').length,
    failed: results.filter(result => result.status === 'failed').length,
    unresolved: results.reduce(
      (total, result) => total + (result.unresolved?.length ?? 0),
      0,
    ),
    unsupported: results.reduce(
      (total, result) => total + (result.unsupported?.length ?? 0),
      0,
    ),
    unvisited: results.filter(result => result.status === 'unvisited').length,
    excluded: results.reduce(
      (total, result) => total + (result.excluded?.length ?? 0),
      0,
    ),
  }
  const blocking = findings.filter(
    finding => SEVERITY_RANK[finding.severity] >= failRank,
  )
  const exitCode =
    coverage.unvisited > 0
      ? 2
      : blocking.length > 0 && !options.reportOnly
        ? 1
        : 0
  return {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    engine: { ...AUDIT_ENGINE, host: name },
    policy: config.policy,
    renderer: config.renderer,
    failOn: config.failOn,
    reportOnly: Boolean(options.reportOnly),
    exitCode,
    coverage,
    findings,
    results,
    interactions: results
      .filter(result => result.interaction)
      .map(result => ({ case: result.case, ...result.interaction })),
    exceptions: {
      used: config.exceptions.filter(exception =>
        usedExceptions.has(exception.index),
      ),
      unused: config.exceptions.filter(
        exception => !usedExceptions.has(exception.index),
      ),
    },
  }
}

export const loadAuditConfig = async file => {
  if (!existsSync(file)) fail(`config file not found: ${file}`)
  const module = await import(pathToFileURL(path.resolve(file)).href)
  const value = module.default ?? module.config
  return typeof value === 'function' ? value() : value
}

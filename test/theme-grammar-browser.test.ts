import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { after, before, describe, it } from 'node:test'

import { chromium, type Browser } from '@playwright/test'

import { validateThemeDefinition } from '../src/lib/theme-roles'

const CASES: ReadonlyArray<
  readonly [role: 'primary' | 'radius', value: string, valid: boolean]
> = [
  ['primary', 'rgb(1 2 3)', true],
  ['primary', 'rgb(1, 2, 3)', true],
  ['primary', 'rgb(1%, 2%, 3%)', true],
  ['primary', 'rgb(1, 2%, 3)', false],
  ['primary', 'hsl(0, 50%, 50%)', true],
  ['primary', 'hsl(0 50 50)', true],
  ['primary', 'hsl(0, 50, 50)', false],
  ['primary', 'color-mix(in srgb, red 0%, blue)', true],
  ['primary', 'color-mix(in srgb, red 0%, blue 0%)', false],
  ['radius', 'calc(1rem + 2px)', true],
  ['radius', 'calc(1rem - 2px)', true],
  ['radius', 'calc(1rem+ 2px)', false],
  ['radius', 'calc(1rem +2px)', false],
  ['radius', 'calc(1rem*2)', true],
]

const PROPERTY = { primary: 'color', radius: 'border-radius' } as const

const accepted = (role: 'primary' | 'radius', value: string): boolean =>
  validateThemeDefinition(
    { schemaVersion: 1, values: { [role]: value } },
    { partial: true },
  ).length === 0

const skip = existsSync(chromium.executablePath())
  ? false
  : 'Chromium is not installed (run `npx playwright install chromium`)'

describe('theme grammar agrees with the browser', { skip }, () => {
  let browser: Browser
  before(async () => {
    if (skip === false) browser = await chromium.launch()
  })
  after(async () => {
    await browser?.close()
  })

  for (const [role, value, valid] of CASES)
    it(`${role}: ${value} is ${valid ? 'valid' : 'invalid'}`, async () => {
      const page = await browser.newPage()
      const supported = await page.evaluate(
        ([property, candidate]) => CSS.supports(property, candidate),
        [PROPERTY[role], value] as const,
      )
      await page.close()
      assert.equal(supported, valid, 'browser oracle')
      assert.equal(accepted(role, value), valid, 'theme validator')
    })
})

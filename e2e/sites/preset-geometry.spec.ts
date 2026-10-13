import { expect, test, type Page } from '@playwright/test'

/* R2 wave 1: Create styles apply to every control role, not only
   Button/Input, in every renderer. */
const CONTROLS = [
  'button',
  'input',
  'textarea',
  'select-trigger',
  'native-select',
  'input-group',
] as const
const SINGLE_LINE = CONTROLS.filter(slot => slot !== 'textarea')

type Measured = Readonly<{
  radius: number
  border: number
  shadow: string
  height: number
  fontSize: number
}>

const measure = (page: Page, slots: ReadonlyArray<string>) =>
  page.evaluate(slots => {
    const scope = document.querySelector(
      '[data-crease-board-theme], .create-board-theme',
    )!
    return Object.fromEntries(
      slots.map(slot => {
        const element = scope.querySelector(
          `[data-slot="${slot}"]:not([data-slot="input-group"] *)`,
        )!
        const style = getComputedStyle(element)
        return [
          slot,
          {
            radius: Number.parseFloat(style.borderTopLeftRadius),
            border: Number.parseFloat(style.borderTopWidth),
            shadow: style.boxShadow,
            height: element.getBoundingClientRect().height,
            fontSize: Number.parseFloat(style.fontSize),
          },
        ]
      }),
    )
  }, slots) as Promise<Record<string, Measured>>

const selectStyle = async (page: Page, style: string): Promise<void> => {
  await page.locator('#create-style-picker-button').click()
  await page
    .locator('#create-style-picker-panel button', {
      hasText: new RegExp(`^${style}$`, 'i'),
    })
    .first()
    .click()
}

const expectations: Readonly<
  Record<string, (measured: Record<string, Measured>) => void>
> = {
  lyra: m => {
    for (const slot of [...CONTROLS, 'card'])
      expect(m[slot]!.radius, slot).toBe(0)
  },
  maia: m => {
    for (const slot of SINGLE_LINE)
      expect(m[slot]!.radius, slot).toBeGreaterThan(100)
    expect(m.textarea!.radius).toBeGreaterThan(8)
    expect(m.card!.radius).toBeGreaterThan(14)
  },
  vega: m => {
    for (const slot of [...CONTROLS, 'card'])
      expect(m[slot]!.shadow, slot).toBe('none')
  },
  luma: m => {
    for (const slot of [...CONTROLS, 'card'])
      expect(m[slot]!.shadow, slot).not.toBe('none')
  },
  sera: m => {
    for (const slot of [...CONTROLS, 'card'])
      expect(m[slot]!.border, slot).toBe(2)
  },
  mira: m => {
    for (const slot of CONTROLS) expect(m[slot]!.fontSize, slot).toBe(13)
  },
  rhea: m => {
    for (const slot of SINGLE_LINE)
      expect(m[slot]!.height, slot).toBeGreaterThanOrEqual(40)
  },
}

for (const [style, check] of Object.entries(expectations)) {
  test(`${style} style reaches every control role`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/create')
    await selectStyle(page, style)
    await expect
      .poll(async () => {
        try {
          check(await measure(page, [...CONTROLS, 'card']))
          return true
        } catch {
          return false
        }
      })
      .toBe(true)
    check(await measure(page, [...CONTROLS, 'card']))
  })
}

import { expect, test, type Page } from '@playwright/test'

import { STYLES } from '../../src/demo/create-preset'
import { selectStyle } from './create-helpers'

/* R2 waves 1-5: Create styles apply to every control and selection role,
   not only Button/Input, in every renderer; list and menu rows follow
   shape and size, and tabs/disclosure triggers follow shape. Radio indicators and Switch
   tracks keep their circular/pill contract. */
const CONTROLS = [
  'button',
  'input',
  'textarea',
  'select-trigger',
  'native-select',
  'input-group',
] as const
const SINGLE_LINE = CONTROLS.filter(slot => slot !== 'textarea')
const SELECTION = ['checkbox', 'radio-group-item', 'switch'] as const
const ROWS = ['item', 'sidebar-menu-button'] as const
const TABS = ['tabs-list', 'tabs-trigger'] as const
const MEASURED = [
  ...CONTROLS,
  ...SELECTION,
  ...ROWS,
  ...TABS,
  'accordion-trigger',
  'calendar-day',
  'card',
  'table-cell',
  'badge',
]

type Measured = Readonly<{
  radius: number
  border: number
  shadow: string
  height: number
  fontSize: number
  paddingTop: number
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
            paddingTop: Number.parseFloat(style.paddingTop),
          },
        ]
      }),
    )
  }, slots) as Promise<Record<string, Measured>>

const expectations: Readonly<
  Record<string, (measured: Record<string, Measured>) => void>
> = {
  lyra: m => {
    for (const slot of [
      ...CONTROLS,
      'checkbox',
      ...ROWS,
      ...TABS,
      'accordion-trigger',
      'calendar-day',
      'card',
    ])
      expect(m[slot]!.radius, slot).toBe(0)
    expect(m['radio-group-item']!.radius).toBeGreaterThan(4)
    expect(m.switch!.radius).toBeGreaterThan(4)
    // Badges keep their pill purpose even in the square style.
    expect(m.badge!.radius).toBeGreaterThan(4)
  },
  maia: m => {
    for (const slot of SINGLE_LINE)
      expect(m[slot]!.radius, slot).toBeGreaterThan(100)
    expect(m.textarea!.radius).toBeGreaterThan(8)
    expect(m.card!.radius).toBeGreaterThan(14)
    for (const slot of ROWS) expect(m[slot]!.radius, slot).toBeGreaterThan(8)
    for (const slot of TABS) expect(m[slot]!.radius, slot).toBeGreaterThan(100)
    expect(m['accordion-trigger']!.radius).toBeGreaterThan(8)
    expect(m['calendar-day']!.radius).toBeGreaterThan(100)
  },
  vega: m => {
    for (const slot of [...CONTROLS, ...SELECTION, 'card'])
      expect(m[slot]!.shadow, slot).toBe('none')
  },
  luma: m => {
    for (const slot of [...CONTROLS, ...SELECTION, 'card'])
      expect(m[slot]!.shadow, slot).not.toBe('none')
  },
  sera: m => {
    for (const slot of [...CONTROLS, ...SELECTION, 'card'])
      expect(m[slot]!.border, slot).toBe(2)
  },
  mira: m => {
    for (const slot of CONTROLS) expect(m[slot]!.fontSize, slot).toBe(13)
    // Compact density changes geometry, not only type size.
    for (const slot of SINGLE_LINE)
      expect(m[slot]!.height, slot).toBeLessThanOrEqual(28)
    expect(m['table-cell']!.paddingTop).toBeLessThan(8)
  },
  rhea: m => {
    for (const slot of [...SINGLE_LINE, ...ROWS])
      expect(m[slot]!.height, slot).toBeGreaterThanOrEqual(40)
    // Region spacing grows instead of collapsing to a 4px panel inset.
    expect(m.card!.paddingTop).toBeGreaterThan(24)
    expect(m['table-cell']!.paddingTop).toBeGreaterThan(8)
  },
}

test('every non-baseline preset has geometry expectations', () => {
  expect(Object.keys(expectations).sort()).toEqual(
    STYLES.filter(style => style !== 'nova').sort(),
  )
})

for (const [style, check] of Object.entries(expectations)) {
  test(`${style} style reaches every control role`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/create')
    await selectStyle(page, style)
    await expect
      .poll(async () => {
        try {
          check(await measure(page, MEASURED))
          return true
        } catch {
          return false
        }
      })
      .toBe(true)
    check(await measure(page, MEASURED))
  })
}

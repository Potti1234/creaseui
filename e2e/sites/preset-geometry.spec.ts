import { expect, test, type Page } from '@playwright/test'

import { MIRA_SIZES, STYLES } from '../../src/demo/create-preset'
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
    // Named sizes (and square icons) are checked in the Mira size test below.
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

type Sized = Readonly<{
  slot: string
  size: string
  width: number
  height: number
}>

const measureSized = (page: Page) =>
  page.evaluate(() => {
    const scope = document.querySelector(
      '[data-crease-board-theme], .create-board-theme',
    )!
    return [
      ...scope.querySelectorAll(
        ':is([data-slot="button"],[data-slot="toggle"],[data-slot="select-trigger"],[data-slot="native-select"])[data-size]:not([data-slot="input-group"] *)',
      ),
    ]
      .filter(element => element.getClientRects().length > 0)
      .map(element => {
        const box = element.getBoundingClientRect()
        return {
          slot: element.getAttribute('data-slot')!,
          size: element.getAttribute('data-size')!,
          width: box.width,
          height: box.height,
        }
      })
  }) as Promise<ReadonlyArray<Sized>>

const rem = (value: string) => Number.parseFloat(value) * 16
const SCALE = Object.entries(MIRA_SIZES).map(([size, value]) => ({
  size,
  px: rem(value),
}))

test('Mira scale keeps named sizes ordered and icon controls square', () => {
  const heights = SCALE.map(({ px }) => px)
  expect(heights).toEqual([...heights].sort((a, b) => a - b))
  expect(new Set(heights).size).toBe(heights.length)
})

test('mira style follows the named size scale and keeps icon buttons square', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/create')
  const nova = await measureSized(page)
  await selectStyle(page, 'mira')
  const check = (sized: ReadonlyArray<Sized>) => {
    const seen = new Set<string>()
    for (const { slot, size, width, height } of sized) {
      const label = `${slot}[data-size=${size}] ${width}x${height}`
      const icon = /^icon(?:-(xs|sm|lg))?$/u.exec(size)
      const named = icon === null ? size : (icon[1] ?? 'default')
      const expected = SCALE.find(entry => entry.size === named)?.px
      if (expected === undefined) continue
      seen.add(`${slot}:${size}`)
      expect(height, label).toBeCloseTo(expected, 0)
      if (icon !== null) expect(width, label).toBeCloseTo(height, 0)
      if (slot === 'toggle')
        expect(width, label).toBeGreaterThanOrEqual(height - 0.5)
    }
    return seen
  }
  await expect
    .poll(async () => {
      try {
        check(await measureSized(page))
        return true
      } catch {
        return false
      }
    })
    .toBe(true)
  const mira = await measureSized(page)
  const seen = check(mira)
  // The board exercises several named sizes and at least one icon size.
  for (const required of [
    'button:default',
    'button:sm',
    'select-trigger:default',
  ])
    expect([...seen], required).toContain(required)
  expect([...seen].some(entry => /^button:icon/u.test(entry))).toBe(true)
  // Nova's icon buttons were square too; Mira must not trade that for height.
  for (const { slot, size, width, height } of nova)
    if (slot === 'button' && size.startsWith('icon'))
      expect(width, `nova ${size}`).toBeCloseTo(height, 0)
})

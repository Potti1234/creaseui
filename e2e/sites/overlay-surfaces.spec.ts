import { expect, test, type Page } from '@playwright/test'

/* R2 wave 4: every renderer's overlays compute the same Nova surface
   (radius, border, shadow) as the Tailwind/shadcn reference. */
type Surface = Readonly<{ radius: string; border: string; shadow: string }>

const SHADOW_MD =
  'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px'
const SHADOW_LG =
  'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px'

const cases: ReadonlyArray<
  Readonly<{
    component: string
    slot: string
    open: 'click' | 'hover'
    expected: Surface
  }>
> = [
  {
    component: 'dropdown-menu',
    slot: 'dropdown-menu-content',
    open: 'click',
    expected: { radius: '8px', border: '1px', shadow: SHADOW_MD },
  },
  {
    component: 'popover',
    slot: 'popover-content',
    open: 'click',
    expected: { radius: '8px', border: '1px', shadow: SHADOW_MD },
  },
  {
    component: 'hover-card',
    slot: 'hover-card-content',
    open: 'hover',
    expected: { radius: '8px', border: '1px', shadow: SHADOW_MD },
  },
  {
    component: 'select',
    slot: 'select-content',
    open: 'click',
    expected: { radius: '8px', border: '1px', shadow: SHADOW_MD },
  },
  {
    component: 'dialog',
    slot: 'dialog-content',
    open: 'click',
    expected: { radius: '10px', border: '1px', shadow: SHADOW_LG },
  },
  {
    component: 'alert-dialog',
    slot: 'alert-dialog-content',
    open: 'click',
    expected: { radius: '10px', border: '1px', shadow: SHADOW_LG },
  },
  {
    component: 'tooltip',
    slot: 'tooltip-content',
    open: 'hover',
    expected: { radius: '8px', border: '0px', shadow: 'none' },
  },
]

/* Tailwind composes ring/inset layers as transparent zero shadows; drop them
   so the comparison only sees painted layers. */
const surfaceOf = async (page: Page, slot: string): Promise<Surface | null> =>
  page.evaluate(slot => {
    const element = [
      ...document.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`),
    ].find(candidate => candidate.getBoundingClientRect().height > 0)
    if (element === undefined) return null
    const style = getComputedStyle(element)
    const layers =
      style.boxShadow === 'none'
        ? []
        : style.boxShadow
            .split(/,(?![^(]*\))/)
            .map(layer => layer.trim())
            .filter(layer => !layer.startsWith('rgba(0, 0, 0, 0) 0px 0px 0px'))
    return {
      radius: style.borderRadius,
      border: style.borderTopWidth,
      shadow: layers.length === 0 ? 'none' : layers.join(', '),
    }
  }, slot)

for (const { component, slot, open, expected } of cases) {
  test(`${component} overlay surface matches the shadcn reference`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/docs/components/${component}`)
    const trigger = page
      .locator('main [aria-label$="preview" i] button:visible')
      .first()
    await expect(trigger).toBeVisible()
    // Only re-trigger while the surface is still closed: clicking again on a
    // slow engine (WebKit) toggles an overlay that was about to render.
    await expect(async () => {
      if ((await surfaceOf(page, slot)) === null) {
        if (open === 'hover') await trigger.hover()
        else await trigger.click()
      }
      await expect
        .poll(() => surfaceOf(page, slot), { timeout: 2_000 })
        .not.toBeNull()
    }).toPass({ timeout: 15_000 })
    await expect.poll(() => surfaceOf(page, slot)).toEqual(expected)
  })
}

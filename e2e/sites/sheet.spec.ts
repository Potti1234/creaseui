import { expect, test, type Page } from '@playwright/test'

const activePanels = (page: Page) =>
  page.locator(
    '[data-slot="sheet-content"], [data-slot="sheet-panel"]:not([aria-hidden="true"])',
  )
const gotoSheets = async (page: Page) => {
  const path = test.info().project.metadata.sheetPath
  await page.goto(typeof path === 'string' ? path : '/docs/components/sheet')
}
const settled = async (page: Page) => {
  const panel = activePanels(page)
  await expect(panel).toHaveCount(1)
  await expect(panel).not.toHaveAttribute('data-transition')
  return panel
}
const close = async (page: Page) => {
  await page.keyboard.press('Escape')
  await expect(activePanels(page)).toHaveCount(0)
}

for (const width of [390, 1440]) {
  test(`sheet edge content fits and scrolls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await gotoSheets(page)
    await page
      .getByRole('button', { name: 'Open', exact: true })
      .first()
      .click()
    const basic = await settled(page)
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(
      'Pedro Duarte',
    )
    await expect(page.getByLabel('Username', { exact: true })).toHaveValue(
      '@peduarte',
    )
    const header = await basic
      .locator('[data-slot="sheet-header"]')
      .boundingBox()
    const label = await page.getByText('Name', { exact: true }).boundingBox()
    expect(Math.abs(label!.x - header!.x - 16)).toBeLessThan(1)
    await expect(basic.locator('[data-slot="sheet-footer"]')).toBeVisible()
    await basic
      .getByRole('button', { name: 'Save changes', exact: true })
      .click()
    await expect(activePanels(page)).toHaveCount(0)

    for (const name of ['Top', 'Right', 'Bottom', 'Left', 'فتح']) {
      await page.getByRole('button', { name, exact: true }).click()
      const panel = await settled(page)
      const box = (await panel.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(-1)
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1)
      if (name === 'Top' || name === 'Bottom') {
        expect(Math.abs(box.x)).toBeLessThan(1)
        expect(Math.abs(box.width - width)).toBeLessThan(1)
      }
      expect(await panel.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(
        true,
      )
      await expect(panel.locator('[data-slot="sheet-header"]')).toBeVisible()
      await expect(panel.locator('[data-slot="sheet-footer"]')).toBeVisible()
      if (name !== 'فتح') {
        expect(await panel.locator('p').count()).toBeGreaterThan(1)
      }
      const footer = (await panel
        .locator('[data-slot="sheet-footer"]')
        .boundingBox())!
      expect(footer.y).toBeGreaterThanOrEqual(0)
      expect(footer.y + footer.height).toBeLessThanOrEqual(1001)
      await close(page)
    }
    expect(errors).toEqual([])
  })

  test(`sheet flows retain full width, state and focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await gotoSheets(page)
    await page
      .getByRole('button', { name: 'Set up notifications', exact: true })
      .click()
    await settled(page)
    for (let round = 0; round < 2; round++) {
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
      await page
        .getByRole('heading', { name: 'How often?', exact: true })
        .waitFor()
      const frequency = activePanels(page)
      await expect
        .poll(async () => (await frequency.boundingBox())?.width)
        .toBe(width)
      await expect(frequency).toBeFocused()
      await page.getByRole('radio', { name: 'Daily', exact: true }).click()
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
      await page
        .getByRole('heading', {
          name: 'Where should we notify you?',
          exact: true,
        })
        .waitFor()
      await expect(activePanels(page)).toBeFocused()
      await page
        .getByRole('checkbox', { name: 'Text messages', exact: true })
        .click()
      await page.getByRole('button', { name: 'Back', exact: true }).click()
      await page
        .getByRole('heading', { name: 'How often?', exact: true })
        .waitFor()
      await expect(
        page.getByRole('radio', { name: 'Daily', exact: true }),
      ).toHaveAttribute('aria-checked', 'true')
      await page.getByRole('button', { name: 'Back', exact: true }).click()
      await page
        .getByRole('heading', { name: 'Set up notifications', exact: true })
        .last()
        .waitFor()
      await expect
        .poll(async () => (await activePanels(page).boundingBox())?.width)
        .toBe(width)
    }
    await expect(page.locator('[data-slot="sheet-panel"]')).toHaveCount(1)
    await close(page)
    await page
      .getByRole('button', { name: 'Set up notifications', exact: true })
      .click()
    await settled(page)
    await expect(page.locator('[data-slot="sheet-panel"]')).toHaveCount(1)
    await close(page)
    await page
      .getByRole('button', { name: 'Review settings', exact: true })
      .click()
    await settled(page)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(activePanels(page)).toBeFocused()
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expect(activePanels(page)).toBeFocused()
    await close(page)
    expect(errors).toEqual([])
  })

  test(`sheet drag settles and closes with Drawer easing at ${width}px`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await gotoSheets(page)
    await page
      .getByRole('button', { name: 'Show directions', exact: true })
      .click()
    const panel = await settled(page)
    await expect(panel).toHaveCSS(
      'transition-timing-function',
      'cubic-bezier(0.32, 0.72, 0, 1)',
    )
    await expect(panel).toHaveCSS('transition-duration', '0.45s')
    const handle = panel.locator('[data-slot="sheet-handle"]')
    const original = (await handle.boundingBox())!
    const x = original.x + original.width / 2
    const y = original.y + original.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x, y + 380, { steps: 20 })
    await expect(panel).toHaveCSS('transition-property', 'none')
    await page.waitForTimeout(350)
    await page.mouse.move(x, y + 381)
    await page.mouse.up()
    await expect
      .poll(async () => (await handle.boundingBox())!.y)
      .toBeGreaterThan(original.y + 200)
    await page.waitForTimeout(600)
    const rest = (await handle.boundingBox())!
    await page.waitForTimeout(150)
    expect(Math.abs((await handle.boundingBox())!.y - rest.y)).toBeLessThan(1)
    await expect(panel).toHaveCSS(
      'transition-timing-function',
      'cubic-bezier(0.32, 0.72, 0, 1)',
    )
    await page.mouse.move(x, rest.y + rest.height / 2)
    await page.mouse.down()
    await page.mouse.move(x, 999, { steps: 8 })
    await page.mouse.up()
    await expect(activePanels(page)).toHaveCount(0)
    await page.getByRole('button', { name: 'Open sheet', exact: true }).click()
    await settled(page)
    // Arm before Escape so a brief leave phase cannot finish before the check.
    const leaving = page.evaluate(
      () =>
        new Promise<string>(resolve => {
          const panel = document.querySelector<HTMLElement>(
            '[data-slot="sheet-panel"]',
          )!
          const observer = new MutationObserver(() => {
            if (panel.hasAttribute('data-leave')) {
              observer.disconnect()
              resolve(getComputedStyle(panel).transitionTimingFunction)
            }
          })
          observer.observe(panel, {
            attributes: true,
            attributeFilter: ['data-leave'],
          })
        }),
    )
    await page.keyboard.press('Escape')
    expect(await leaving).toBe('cubic-bezier(0.32, 0.72, 0, 1)')
    await expect(activePanels(page)).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test(`bottom sheets ease into view without dialog scrolling at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await gotoSheets(page)
    for (const name of [
      'Bottom',
      'Open sheet',
      'Open hug',
      'Open capped',
      'Open tall',
    ]) {
      const trigger = page.getByRole('button', { name, exact: true })
      await trigger.scrollIntoViewIfNeeded()
      // Observe the actual entrance, including its first focused frame.
      const frames = page.evaluate(
        () =>
          new Promise<
            Array<{
              top: number
              height: number
              scrollTop: number
              opacity: number
            }>
          >(resolve => {
            const samples: Array<{
              top: number
              height: number
              scrollTop: number
              opacity: number
            }> = []
            let started: number | undefined
            const tick = (now: number) => {
              const panel = document.querySelector<HTMLElement>(
                '[data-slot="sheet-panel"]',
              )
              const dialog = panel?.closest('dialog')
              if (panel && dialog?.open) {
                started ??= now
                const box = panel.getBoundingClientRect()
                samples.push({
                  top: box.top,
                  height: box.height,
                  scrollTop: dialog.scrollTop,
                  opacity: Number.parseFloat(
                    getComputedStyle(
                      dialog.querySelector('[data-slot="sheet-scrim"]')!,
                    ).opacity,
                  ),
                })
              }
              if (started !== undefined && now - started >= 800)
                resolve(samples)
              else requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }),
      )
      await trigger.click()
      const samples = await frames
      expect(samples.length).toBeGreaterThan(10)
      expect(samples.every(frame => frame.scrollTop === 0)).toBe(true)
      const first = samples[0]!
      const last = samples.at(-1)!
      expect(first.top).toBeGreaterThanOrEqual(999)
      expect(first.top - last.top).toBeGreaterThan(last.height * 0.8)
      const intermediate = samples.filter(
        frame => frame.top > last.top + 2 && frame.top < first.top - 2,
      )
      expect(
        new Set(intermediate.map(frame => Math.round(frame.top))).size,
      ).toBeGreaterThan(5)
      expect(
        samples.some(frame => frame.opacity > 0.05 && frame.opacity < 0.95),
      ).toBe(true)
      expect(first.opacity).toBe(0)
      expect(last.opacity).toBe(1)
      for (let index = 1; index < samples.length; index++) {
        expect(samples[index]!.top - samples[index - 1]!.top).toBeLessThan(1)
      }
      const panel = await settled(page)
      await expect(panel).toHaveCSS(
        'transition-timing-function',
        'cubic-bezier(0.32, 0.72, 0, 1)',
      )
      await close(page)
      await expect(trigger).toBeFocused()
    }
  })
}

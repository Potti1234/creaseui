import { expect, test, type Page } from '@playwright/test'

const expectSectionNearTop = async (page: Page, id: string): Promise<void> => {
  const section = page.locator(`#${id}`)
  await expect(section).toBeInViewport()
  await expect
    .poll(() =>
      section.evaluate(element => {
        const top = element.getBoundingClientRect().top
        const margin = Number.parseFloat(
          getComputedStyle(element).scrollMarginTop,
        )
        // Code highlighting can finish after the initial fragment scroll.
        return top >= margin - 1 && top <= margin + 48
      }),
    )
    .toBe(true)
}

for (const renderer of ['Tailwind', 'StyleX']) {
  test(`docs section links scroll and preserve ${renderer} example state`, async ({
    page,
  }) => {
    await page.goto('/docs/components/switch')
    const rendererButton = page.getByRole('button', {
      name: renderer,
      exact: true,
    })
    await rendererButton.click()
    const control = page.locator('#airplane-mode-control')
    await control.click()
    await expect(control).toHaveAttribute('aria-checked', 'true')

    const toc = page.getByRole('navigation', { name: 'On this page' })
    await toc.getByRole('link', { name: 'Installation', exact: true }).click()
    await expect(page).toHaveURL(/#installation$/u)
    await expectSectionNearTop(page, 'installation')
    await expect(rendererButton).toHaveAttribute('aria-pressed', 'true')
    await expect(control).toHaveAttribute('aria-checked', 'true')

    await toc.getByRole('link', { name: 'Description', exact: true }).click()
    await expectSectionNearTop(page, 'description')
    await page.goBack()
    await expectSectionNearTop(page, 'installation')
    await page.goForward()
    await expectSectionNearTop(page, 'description')

    // Clicking the current fragment must scroll again after manually moving away.
    await page.evaluate(() => window.scrollTo(0, 0))
    await toc.getByRole('link', { name: 'Description', exact: true }).click()
    await expectSectionNearTop(page, 'description')
    await expect(rendererButton).toHaveAttribute('aria-pressed', 'true')
    await expect(control).toHaveAttribute('aria-checked', 'true')
  })
}

test('encoded docs deep links scroll after initial render and reload', async ({
  page,
}) => {
  await page.goto('/docs/components/button#%75sage')
  await expectSectionNearTop(page, 'usage')
  await page.reload()
  await expectSectionNearTop(page, 'usage')
})

test('cross-page history restores the section and normal navigation starts at the top', async ({
  page,
}) => {
  await page.goto('/docs/components/switch#usage')
  await expectSectionNearTop(page, 'usage')
  await page.getByRole('link', { name: 'Button', exact: true }).click()
  await expect(page).toHaveURL('/docs/components/button')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  await page.goBack()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Switch')
  await expectSectionNearTop(page, 'usage')
  await page.goForward()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('missing and malformed fragments leave docs navigation usable', async ({
  page,
}) => {
  const errors: Error[] = []
  page.on('pageerror', error => errors.push(error))

  for (const hash of ['unknown-section', '%E0%A4%A']) {
    await page.goto(`/docs/components/button#${hash}`)
    await page
      .getByRole('navigation', { name: 'On this page' })
      .getByRole('link', { name: 'Installation', exact: true })
      .click()
    await expectSectionNearTop(page, 'installation')
  }

  expect(errors).toEqual([])
})

import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`shared routes and themes at ${viewport.width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(() =>
      localStorage.setItem('creaseui-theme', 'light'),
    )
    for (const route of [
      '/',
      '/docs/components/button',
      '/create',
      '/charts/area',
      '/blocks',
    ]) {
      await page.goto(route)
      await expect(page.locator('[data-site-header]')).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute(
        'data-renderer',
        info.project.name,
      )
      await expect(
        page.getByRole('group', { name: /^(Create|Charts|Blocks) renderer$/ }),
      ).toHaveCount(0)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      const other = info.project.name === 'stylex' ? 'Tailwind' : 'StyleX'
      await expect(
        page.getByRole('link', { name: `View this page in ${other}` }),
      ).toHaveAttribute(
        'href',
        `http://127.0.0.1:${other === 'StyleX' ? '4174' : '4173'}${route}`,
      )
      if (route === '/docs/components/button') {
        await page.getByRole('button', { name: 'Switch to dark mode' }).click()
        await expect(page.locator('html')).toHaveClass(/dark/)
        await page.getByRole('button', { name: 'Switch to light mode' }).click()
      }
    }
    expect(errors).toEqual([])
  })
}

test('client navigation and reload keep the selected site', async ({
  page,
}, info) => {
  await page.goto('/docs/components/button?test=1#installation')
  const other = info.project.name === 'stylex' ? 'Tailwind' : 'StyleX'
  await expect(
    page.getByRole('link', { name: `View this page in ${other}` }),
  ).toHaveAttribute(
    'href',
    new RegExp('/docs/components/button\\?test=1#installation$'),
  )
  await page
    .locator('aside')
    .getByRole('link', { name: 'Accordion', exact: true })
    .click()
  await expect(page).toHaveURL(/\/docs\/components\/accordion$/)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute(
    'data-renderer',
    info.project.name,
  )
  const trigger = page.locator('#basic [data-slot="accordion-trigger"]').first()
  await expect(trigger).toBeVisible()
  const expanded = await trigger.getAttribute('aria-expanded')
  await trigger.click()
  await expect(trigger).toHaveAttribute(
    'aria-expanded',
    expanded === 'true' ? 'false' : 'true',
  )
})

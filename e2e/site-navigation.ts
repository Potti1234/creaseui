import { expect, type Page } from '@playwright/test'

const RENDERER_PORTS = { StyleX: 4174, Tailwind: 4173 } as const

export const visitRenderer = async (
  page: Page,
  renderer: 'StyleX' | 'Tailwind',
) => {
  const value = renderer.toLowerCase()
  if ((await page.locator('html').getAttribute('data-renderer')) === value)
    return
  const current = new URL(page.url())
  await page.goto(
    `http://127.0.0.1:${String(RENDERER_PORTS[renderer])}${current.pathname}${current.search}${current.hash}`,
  )
  await expect(page.locator('html')).toHaveAttribute('data-renderer', value)
}

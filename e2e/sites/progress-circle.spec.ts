import { expect, test } from '@playwright/test'

test('circular progress retains its SVG track and fill and exposes its value', async ({
  page,
}) => {
  await page.goto('/docs/components/circular-progress')
  const ring = page
    .locator(
      '[data-slot="circular-progress"] svg[role="progressbar"][aria-valuenow]',
    )
    .first()
  await expect(ring).toBeVisible()
  await expect(
    ring.locator('circle[data-slot="circular-progress-track"]'),
  ).toHaveCount(1)
  await expect(
    ring.locator('circle[data-slot="circular-progress-fill"]'),
  ).toHaveAttribute('stroke-dasharray', /\d/u)
  await expect(ring).toHaveAttribute('aria-valuemin', '0')
  await expect(ring).toHaveAttribute('aria-valuemax', /\d/u)
})

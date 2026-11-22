import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.addInitScript(() => {
    localStorage.setItem(
      'foldkit-devtools',
      '{"isOpen":false,"isFlattened":false}',
    )
    localStorage.setItem('creaseui-theme', 'light')
  })
})

test('list-input keyboard draft announces, cancels, commits and restores focus', async ({
  page,
}) => {
  await page.goto('/docs/components/list-input')
  const preview = page
    .locator('[data-slot="list-input"]')
    .filter({ has: page.locator('#docs-list-input-2') })
  const handle = preview.getByRole('button', {
    name: 'Reorder guest 1',
    exact: true,
  })
  const announcement = preview.locator('[aria-live="assertive"]')
  await handle.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await expect(announcement).toContainText('guest 1 grabbed.')
  await page.keyboard.press('End')
  await expect(announcement).toHaveText('guest moved to position 3 of 3.')
  await page.keyboard.press('Escape')
  await expect(announcement).toHaveText('Reordering cancelled.')
  await expect(handle).toBeFocused()
  await handle.press('Enter')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowDown')
  await expect(announcement).toHaveText('guest moved to position 2 of 3.')
  await page.keyboard.press('Enter')
  await expect(announcement).toHaveText('guest dropped at position 2 of 3.')
  const movedHandle = preview.getByRole('button', {
    name: 'Reorder guest 2',
    exact: true,
  })
  await expect(movedHandle).toBeFocused()
  await expect(preview.locator('input').first()).toHaveValue('Grace Hopper')
  await page.keyboard.press('ArrowUp')
  await expect(announcement).toHaveText('guest moved to position 1 of 3.')
  await expect(handle).toBeFocused()
  await handle.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Tab')
  await expect(announcement).toHaveText('Reordering cancelled.')
  await expect(handle).not.toBeFocused()
})

test('kanban columns reorder horizontally, announce and preserve card order', async ({
  page,
}, testInfo) => {
  await page.goto(
    `/blocks/preview/${testInfo.project.name}--creaseui-kanban-board`,
  )
  const lanes = page.locator('[data-kanban-lane]')
  const handle = page.getByRole('button', {
    name: 'Reorder Backlog column',
    exact: true,
  })
  const announcement = page.locator('[aria-live="assertive"]').last()
  await expect(lanes).toHaveCount(4)
  const original = await lanes.evaluateAll(elements =>
    elements.map(element => element.getAttribute('data-kanban-lane')),
  )
  const cards = await lanes
    .first()
    .locator('[data-draggable-id]')
    .allTextContents()
  await expect(lanes.first()).toHaveAttribute('role', 'group')
  const cardList = lanes.first().getByRole('listbox', { name: 'Backlog cards' })
  await expect(cardList.getByRole('option')).toHaveCount(cards.length)
  await expect(cardList.getByRole('button')).toHaveCount(0)
  await handle.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await expect(announcement).toHaveText('Picked up Backlog, position 1 of 4.')
  await page.keyboard.press('ArrowRight')
  await expect(announcement).toHaveText('Backlog, position 2 of 4.')
  await expect(lanes.nth(1)).toHaveAttribute('data-kanban-lane', original[0]!)
  await expect(handle).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(announcement).toHaveText('Dropped Backlog at position 2 of 4.')
  await expect(handle).toHaveAttribute('aria-pressed', 'false')
  await expect(handle).toBeFocused()
  await expect(lanes.nth(1).locator('[data-draggable-id]')).toHaveText(cards)
  await handle.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Home')
  await expect(announcement).toHaveText('Backlog, position 1 of 4.')
  await page.keyboard.press('Escape')
  await expect(announcement).toHaveText(
    'Moved Backlog back to position 2 of 4.',
  )
  await expect(lanes.nth(1)).toHaveAttribute('data-kanban-lane', original[0]!)
  await expect(handle).toBeFocused()
})

test('kanban columns respect RTL and Tab cancels without trapping focus', async ({
  page,
}, testInfo) => {
  await page.goto(
    `/blocks/preview/${testInfo.project.name}--creaseui-kanban-board`,
  )
  await page
    .locator('html')
    .evaluate(element => element.setAttribute('dir', 'rtl'))
  const handle = page.getByRole('button', {
    name: 'Reorder Backlog column',
    exact: true,
  })
  const announcement = page.locator('[aria-live="assertive"]').last()
  await handle.press('Enter')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(announcement).toHaveText('Backlog, position 2 of 4.')
  await page.keyboard.press('Tab')
  await expect(handle).toHaveAttribute('aria-pressed', 'false')
  await expect(announcement).toHaveText(
    'Moved Backlog back to position 1 of 4.',
  )
  await expect(handle).not.toBeFocused()
})

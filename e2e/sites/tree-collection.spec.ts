import { expect, test } from '@playwright/test'

test('Tree List navigates only visible rows and returns to the right parent', async ({
  page,
}) => {
  await page.goto('/docs/components/tree-list')
  const tree = page
    .getByRole('tree', { name: 'Project files', exact: true })
    .first()
  const item = (name: string) =>
    tree.getByRole('treeitem', { name, exact: true })
  const branch = item('components')
  const child = item('Button.ts')

  await expect(branch).toHaveAttribute('aria-expanded', 'false')
  await expect(child).toHaveCount(0)
  await branch.focus()
  await page.keyboard.press('ArrowDown')
  await expect(item('App.ts')).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(branch).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await expect(branch).toHaveAttribute('aria-expanded', 'true')
  await expect(child).toHaveAttribute('aria-level', '3')
  await page.keyboard.press('ArrowRight')
  await expect(child).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(branch).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(branch).toHaveAttribute('aria-expanded', 'false')
  await expect(child).toHaveCount(0)
})

test('Sidebar disclosure hides and restores ordered navigation links', async ({
  page,
}) => {
  await page.goto('/docs/components/sidebar')
  const preview = page.locator(
    'section#nested-navigation [data-example-preview]',
  )
  const trigger = preview.getByRole('button', {
    name: 'Documentation',
    exact: true,
  })
  const submenu = preview.locator('[data-slot="sidebar-menu-sub"]')
  const links = submenu.getByRole('link')
  const labels = ['Introduction', 'Components', 'Changelog']
  const current = submenu.getByRole('link', { name: 'Components', exact: true })

  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(links).toHaveText(labels)
  await expect(current).toHaveAttribute('aria-current', 'page')

  await trigger.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(submenu).toHaveCount(0)
  await expect(trigger).toBeFocused()

  await trigger.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(links).toHaveText(labels)
  await expect(current).toHaveAttribute('aria-current', 'page')
  await expect(preview.getByRole('tree')).toHaveCount(0)
})

test('Tree List moves whole branches and cancels a nesting draft', async ({
  page,
}) => {
  await page.goto('/docs/components/tree-list')
  const tree = page
    .getByRole('tree', { name: 'Project files', exact: true })
    .first()
  const item = (name: string) =>
    tree.getByRole('treeitem', { name, exact: true })
  const app = item('App.ts')
  await app.focus()
  await expect(app).toBeFocused()
  await page.keyboard.press('Shift+Space')
  await page.keyboard.press('ArrowRight')
  await expect(app).toHaveAttribute('aria-level', '3')
  await expect(item('Button.ts')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(app).toHaveAttribute('aria-level', '2')
  await expect(app).toBeFocused()
  await page.keyboard.press('Shift+Space')
  await page.keyboard.press('ArrowRight')
  await expect(app).toHaveAttribute('aria-level', '3')
  await page.keyboard.press('Enter')
  await expect(app).toBeFocused()
  await expect(app).toHaveAttribute('aria-level', '3')
})

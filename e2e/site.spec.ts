import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page, type TestInfo } from '@playwright/test'

const assertAccessible = async (page: Page): Promise<void> => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(
    results.violations,
    results.violations
      .map(violation => `${violation.id}: ${violation.help}`)
      .join('\n'),
  ).toEqual([])
}

const attachPage = async (
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<void> => {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  })
}

test('landing content, theme, accessibility, and desktop visuals', async ({
  page,
}, testInfo) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Beautiful components for foldkit.' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Browse Components' })).toHaveAttribute(
    'href',
    '/docs/components/accordion',
  )
  await expect(page.getByText('registry available')).toBeVisible()
  await expect(page.getByText('65', { exact: true })).toBeVisible()
  await expect(page.getByText('70', { exact: true })).toBeVisible()
  await expect(page.getByText('16', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /Source revision/u })).toBeVisible()
  await assertAccessible(page)
  await attachPage(page, testInfo, 'landing-light-desktop')

  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/u)
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible()
  await attachPage(page, testInfo, 'landing-dark-desktop')
})

test('landing remains contained and navigable on mobile', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
  await expect(page.getByRole('link', { name: 'Browse Components' })).toBeVisible()
  await attachPage(page, testInfo, 'landing-light-mobile')
})

test('production component examples keep readable source and valid Unicode', async ({
  page,
}) => {
  for (const route of ['button', 'dialog', 'typography']) {
    await page.goto(`/docs/components/${route}`)
    const text = await page.locator('main').innerText()

    expect(text).not.toMatch(/(?:Ã.|Â.|â.|ð.|Ø.|Ù.|ï.)/u)
    expect(text).not.toMatch(/const preview = \([a-z],[a-z]\)=>/u)
    await expect(
      page.getByRole('heading', { level: 1, name: new RegExp(`^${route}$`, 'iu') }),
    ).toBeVisible()
  }
})

test('component APIs and machine-readable discovery stay available', async ({ page }) => {
  await page.goto('/docs/components/dialog')
  const api = page.locator('#api-reference')
  await expect(api.getByRole('table')).toBeVisible()
  await expect(api.getByRole('cell', { name: 'dialog', exact: true })).toBeVisible()
  await expect(api).toContainText('DialogProps')

  const index = await page.request.get('/docs-index.json')
  expect(index.ok()).toBe(true)
  const metadata = await index.json() as { componentCount: number }
  expect(metadata.componentCount).toBe(65)

  const llms = await page.request.get('/llms.txt')
  expect(await llms.text()).toContain('/docs/components/dialog')
})

test('create preset shuffle updates executable output', async ({ page }) => {
  await page.goto('/create')
  const token = page.getByText(/^--preset b/u)
  const before = await token.textContent()
  const board = page.locator('[data-slot="capture-target"]')
  const styleBefore = await board.getAttribute('data-crease-style')

  await page.getByRole('button', { name: 'Shuffle' }).click()
  await expect(token).not.toHaveText(before ?? '')
  await expect(board).not.toHaveAttribute('data-crease-style', styleBefore ?? '')
  await expect(page.getByRole('button', { name: 'Copy Registry JSON' })).toBeVisible()
})

test('component docs explain the Foldkit integration model', async ({ page }) => {
  await page.goto('/docs/components/button')
  await expect(page.getByText('Stateless helper', { exact: true })).toBeVisible()
  await expect(page.locator('#architecture')).toContainText('no child Model')
  await expect(page.locator('#keyboard-interaction')).toContainText('Enter')
  await page.locator('#basic label').click()
  await expect(page.locator('#basic code')).toContainText('// MODEL')
  await expect(page.locator('#basic code')).toContainText('Runtime.makeApplication')

  await page.goto('/docs/components/dialog')
  await expect(page.getByText('Stateful submodel', { exact: true })).toBeVisible()
  await expect(page.locator('#architecture')).toContainText('stateful Foldkit submodel')
  await expect(page.locator('#accessibility')).toContainText('restores focus')

  await page.goto('/docs/components/toast')
  await expect(page.getByText('Composed recipe', { exact: true })).toBeVisible()
  await expect(page.locator('#usage')).toContainText('Toast.show')
  await expect(page.locator('#render-the-viewport')).toContainText('Toast.toast')
  await expect(page.locator('#api-reference')).toContainText('DismissedToast')
  await expect(page.locator('#api-reference').getByRole('columnheader', { name: 'Purpose' })).toBeVisible()
})

test('Foldkit-native documentation remains contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/components/toast')

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
  await expect(page.getByText('Browse components')).toBeVisible()
  await expect(page.locator('#architecture')).toBeVisible()
})

test('authored helper pages publish complete application source', async ({ page }) => {
  test.setTimeout(90_000)

  for (const route of [
    'alert',
    'aspect-ratio',
    'badge',
    'breadcrumb',
    'bubble',
    'button',
    'button-group',
    'card',
    'checkbox',
    'collapsible',
    'direction',
    'empty',
    'field',
    'form',
    'item',
    'input',
    'input-group',
    'input-otp',
    'kbd',
    'label',
    'marker',
    'message',
    'native-select',
    'pagination',
    'progress',
    'radio-group',
    'scroll-area',
    'separator',
    'skeleton',
    'spinner',
    'switch',
    'table',
    'textarea',
    'toggle',
    'toggle-group',
    'typography',
  ]) {
    await page.goto(`/docs/components/${route}`)
    await expect(page.getByText(/^(Stateless helper|Composed recipe)$/u)).toBeVisible()
    await expect(page.locator('main code').filter({ hasText: 'Runtime.makeApplication' }).first()).toBeAttached()
  }
})

test('authored form connects controlled input help and validation', async ({ page }) => {
  await page.goto('/docs/components/form')

  const input = page.locator('#docs-form-error')
  await expect(input).toHaveAttribute(
    'aria-describedby',
    'docs-form-error-description docs-form-error-message',
  )
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#docs-form-error-message')).toHaveText(
    'Enter a valid email address.',
  )
})

test('create icon selection changes the live preview shapes', async ({ page }) => {
  await page.goto('/create')
  const board = page.locator('[data-slot="capture-target"]')
  const firstPreviewIcon = board.locator('.crease-preview-icon').first()

  await expect(board).toHaveAttribute('data-icon-library', 'lucide')
  await expect(firstPreviewIcon).toHaveCSS('width', '16px')
  await expect(firstPreviewIcon).toHaveCSS('height', '16px')
  await expect(firstPreviewIcon.locator('.crease-preview-icon-lucide')).toBeVisible()
  await expect(firstPreviewIcon.locator('.crease-preview-icon-tabler')).toBeHidden()

  await page.getByRole('button', { name: /Icons\s+Lucide/u }).click()
  await page.getByRole('button', { name: 'Tabler', exact: true }).click({ force: true })

  await expect(board).toHaveAttribute('data-icon-library', 'tabler')
  await expect(firstPreviewIcon.locator('.crease-preview-icon-lucide')).toBeHidden()
  await expect(firstPreviewIcon.locator('.crease-preview-icon-tabler')).toBeVisible()
})

test('dialog traps focus, closes with Escape, and restores its trigger', async ({ page }) => {
  await page.goto('/docs/components/dialog')
  const example = page.locator('#custom-close-button')
  const trigger = example.getByRole('button', { name: 'Open Dialog' })

  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await expect(dialog.locator('[data-slot="dialog-header"]')).toBeVisible()
  await expect(dialog.locator('[data-slot="dialog-title"]')).toHaveText('Edit profile')
  await expect(dialog.locator('[data-slot="dialog-footer"]')).toBeVisible()
  await expect(page.locator('#custom-close-button code')).toContainText('layout: parts')

  await page.keyboard.press('Tab')
  await expect(dialog).toContainText('Save changes')
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('sheet compound parts preserve focus and accessible structure', async ({ page }) => {
  await page.goto('/docs/components/sheet')
  const example = page.locator('#compound-layout')
  const trigger = example.getByRole('button', { name: 'Open right sheet' })

  await trigger.click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await expect(sheet.locator('[data-slot="sheet-header"]')).toBeVisible()
  await expect(sheet.locator('[data-slot="sheet-title"]')).toHaveText('Edit profile')
  await expect(sheet.locator('[data-slot="sheet-footer"]')).toBeVisible()
  await expect(example.locator('code')).toContainText('layout: parts')

  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('flagship documentation pages have no automated accessibility violations', async ({
  page,
}) => {
  for (const route of ['button', 'dialog', 'input', 'select']) {
    await page.goto(`/docs/components/${route}`)
    await assertAccessible(page)
  }
})

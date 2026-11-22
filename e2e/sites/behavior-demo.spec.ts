import { expect, test } from '@playwright/test'

test('agent approval, source undo and history seeking on the getting-started guide', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('creaseui-theme', 'light')
    localStorage.setItem(
      'foldkit-devtools',
      '{"isOpen":false,"isFlattened":false}',
    )
  })
  await page.goto('/docs/getting-started#agent-history')
  const demo = page.getByTestId('behavior-demo')
  await expect(demo).toBeVisible()
  await demo.getByRole('button', { name: 'Run agent', exact: true }).click()
  await expect(
    demo.getByRole('button', { name: 'Approve', exact: true }),
  ).toBeVisible()
  await expect(demo.getByRole('textbox', { name: 'Region' })).toHaveValue(
    'Frankfurt',
  )
  await expect(
    demo.getByRole('switch', { name: 'Public', exact: true }),
  ).not.toBeChecked()
  await demo.getByRole('button', { name: 'Approve', exact: true }).click()
  await expect(
    demo.getByRole('switch', { name: 'Public', exact: true }),
  ).toBeChecked()
  await expect(
    demo.getByText('1. Agent set Region to Frankfurt', { exact: true }),
  ).toBeVisible()
  await expect(
    demo.getByText('2. Agent set Public to true', { exact: true }),
  ).toBeVisible()
  await demo.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(
    demo.getByRole('switch', { name: 'Public', exact: true }),
  ).not.toBeChecked()
  await demo.getByRole('button', { name: 'Forward', exact: true }).click()
  await expect(
    demo.getByRole('switch', { name: 'Public', exact: true }),
  ).toBeChecked()
  await demo.getByRole('textbox', { name: 'Region' }).fill('Paris')
  await expect(
    demo.getByText('3. You set Region to Paris', { exact: true }),
  ).toBeVisible()
  await demo.getByRole('button', { name: 'Undo agent', exact: true }).click()
  await expect(
    demo.getByRole('switch', { name: 'Public', exact: true }),
  ).not.toBeChecked()
  await expect(demo.getByRole('textbox', { name: 'Region' })).toHaveValue(
    'Paris',
  )
  await expect(
    demo.getByText('1. Agent set Region to Frankfurt · undone', {
      exact: true,
    }),
  ).toBeVisible()
})

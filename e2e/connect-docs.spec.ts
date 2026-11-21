import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' })

for (const [renderer, port] of [
  ['tailwind', 4173],
  ['stylex', 4174],
  ['pleat', 4175],
] as const) {
  test(`${renderer} Connect docs describe the source behavior and preserve connection interactions`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'foldkit-devtools',
        '{"isOpen":false,"isFlattened":false}',
      )
      localStorage.setItem('creaseui-theme', 'light')
    })
    await page.goto(`http://127.0.0.1:${port}/docs/components/connect`)
    await expect(
      page.getByText('Stateful submodel', { exact: true }),
    ).toBeVisible()
    const installation = page.locator('#installation')
    await expect(installation).toContainText('src/lib/behaviors/connect.ts')
    await expect(installation).toContainText('No registry item is required.')
    await expect(installation).not.toContainText('shadcn')
    const usage = page.locator('#usage')
    for (const text of [
      'Connect.create<PortKey>()',
      'Connect.update(',
      'RequestedConnection',
      'Connect.Message.Connected(',
      'Command.mapMessages(',
    ])
      await expect(usage).toContainText(text)
    await expect(usage).not.toContainText('@/ui/connect')
    await expect(usage).not.toContainText('@/stylex/connect')
    await expect(usage).not.toContainText('@/pleat/connect')
    await expect(usage).not.toContainText('Connect.connect(')
    await expect(page.locator('#composition')).toContainText(
      'ObservePorts / MeasurePorts / Announce',
    )
    const api = page.locator('#api-reference')
    await expect(api.locator('tbody tr td:first-child')).toHaveText([
      'ConnectDraft',
      'Model',
      'Message',
      'OutMessage',
      'init',
      'update',
      'create',
      'view',
      'role',
      'keyboardTarget',
      'nearestInDirection',
      'connectMessage',
      'ObservePorts',
      'MeasurePorts',
      'Announce',
    ])
    await expect(
      page.getByRole('link', { name: 'Source', exact: true }),
    ).toHaveAttribute(
      'href',
      'https://github.com/Potti1234/creaseui/blob/main/src/lib/behaviors/connect.ts',
    )
    const source = page.getByRole('button', { name: 'prompt out', exact: true })
    for (const port of await page.locator('[data-connect-key]').all())
      await expect(port).toHaveCSS('touch-action', 'none')
    await source.focus()
    await page.keyboard.press('Enter')
    await expect(source).toHaveAttribute('data-connect', 'Source')
    await page.keyboard.press('ArrowRight')
    await expect(
      page.getByRole('button', { name: 'answer in', exact: true }),
    ).toHaveAttribute('data-connect', 'Target')
    await page.keyboard.press('Enter')
    await expect(
      page.getByText('Saved connections: 1', { exact: true }),
    ).toBeVisible()
  })
}

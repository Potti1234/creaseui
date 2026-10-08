import { expect, test } from '@playwright/test'

test('file input selects, validates, clears and drops files without crashing', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/docs/components/file-input')
  const fields = page.locator('[data-slot="file-input"]')
  await expect(fields).toHaveCount(3)
  const hero = fields.first()
  const basic = fields.last()
  const file = {
    name: 'resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('resume contents'),
  }

  const chooserReady = page.waitForEvent('filechooser')
  await hero.locator('[data-slot="file-input-dropzone"]').click()
  await (await chooserReady).setFiles(file)
  await expect(hero.getByText(file.name, { exact: true })).toHaveText(file.name)
  await expect(fields.nth(1).getByText(file.name, { exact: true })).toHaveCount(
    0,
  )
  await expect(basic.getByText(file.name, { exact: true })).toHaveCount(0)
  await hero
    .getByRole('button', { name: 'Clear Upload file', exact: true })
    .click()
  await expect(hero.getByText(file.name, { exact: true })).toHaveCount(0)

  const input = basic.locator('input[type="file"]')
  await input.setInputFiles(file)
  await expect(basic.getByText(file.name, { exact: true })).toHaveText(
    file.name,
  )
  await basic.getByRole('button', { name: 'Clear Resume', exact: true }).click()
  await expect(basic.getByText(file.name, { exact: true })).toHaveCount(0)
  await input.setInputFiles({
    name: 'bad.exe',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('invalid'),
  })
  await expect(
    basic.getByText('"bad.exe" is not an accepted file type', { exact: true }),
  ).toBeVisible()
  await expect(basic.getByText(file.name, { exact: true })).toHaveCount(0)
  await input.setInputFiles({
    ...file,
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  })
  await expect(basic.getByText(/exceeds the 5\.0 MB size limit/)).toBeVisible()

  const dataTransfer = await page.evaluateHandle(() => {
    const transfer = new DataTransfer()
    transfer.items.add(
      new File(['drop contents'], 'dropped.pdf', { type: 'application/pdf' }),
    )
    return transfer
  })
  await basic
    .locator('[data-slot="file-input-dropzone"]')
    .dispatchEvent('drop', { dataTransfer })
  await expect(basic.getByText('dropped.pdf', { exact: true })).toBeVisible()
  await expect(
    basic.getByText(/size limit|not an accepted file type/),
  ).toHaveCount(0)
  await dataTransfer.dispose()
  await expect(
    page.getByRole('heading', { name: 'Application Crash' }),
  ).toHaveCount(0)
  expect(errors).toEqual([])
})

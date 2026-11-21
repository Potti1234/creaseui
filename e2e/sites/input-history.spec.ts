import { expect, test, type Locator } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const expectValueAndCaret = async (field: Locator, value: string) => {
  await expect(field).toHaveValue(value)
  await expect
    .poll(() =>
      field.evaluate(element =>
        element instanceof HTMLTextAreaElement
          ? [element.selectionStart, element.selectionEnd]
          : [],
      ),
    )
    .toEqual([value.length, value.length])
}

test('chat history recalls sent messages and restores the draft', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem(
      'foldkit-devtools',
      '{"isOpen":false,"isFlattened":false}',
    )
    localStorage.setItem('creaseui-theme', 'light')
  })
  await page.goto('/docs/components/textarea')
  const field = page.getByRole('textbox', { name: 'Chat message', exact: true })
  await expect(field).toBeVisible()
  await field.scrollIntoViewIfNeeded()
  for (const value of ['First chat message', 'Second chat message']) {
    await field.fill(value)
    await expectValueAndCaret(field, value)
    await field.press('Enter')
    await expectValueAndCaret(field, '')
  }
  const draft = 'A draft to finish later'
  await field.fill(draft)
  await expectValueAndCaret(field, draft)
  await field.press('ArrowUp')
  await expectValueAndCaret(field, 'Second chat message')
  const screenshot =
    process.env.INPUT_HISTORY_EVIDENCE_DIR === undefined
      ? testInfo.outputPath(`input-history-${testInfo.project.name}.png`)
      : join(
          process.env.INPUT_HISTORY_EVIDENCE_DIR,
          `input-history-${testInfo.project.name}.png`,
        )
  await mkdir(dirname(screenshot), { recursive: true })
  await field
    .locator('xpath=ancestor::*[@data-example-preview][1]')
    .screenshot({ path: screenshot })
  await testInfo.attach('recalled-message', {
    path: screenshot,
    contentType: 'image/png',
  })
  await field.press('ArrowUp')
  await expectValueAndCaret(field, 'First chat message')
  await field.press('ArrowDown')
  await expectValueAndCaret(field, 'Second chat message')
  await field.press('ArrowDown')
  await expectValueAndCaret(field, draft)
  expect(errors).toEqual([])
})

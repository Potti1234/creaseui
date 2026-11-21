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

test('wrapped history entries keep native arrows until the first or last visual line', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'foldkit-devtools',
      '{"isOpen":false,"isFlattened":false}',
    )
    localStorage.setItem('creaseui-theme', 'light')
  })
  await page.goto('/docs/components/textarea')
  const field = page.getByRole('textbox', { name: 'Chat message', exact: true })
  const wrapped = 'A message that should wrap across several visual lines. '
    .repeat(5)
    .slice(0, 263)
  await field.evaluate(element => {
    element.addEventListener('keydown', event => {
      queueMicrotask(() => {
        element.dataset.historyPrevented = String(event.defaultPrevented)
      })
    })
  })
  for (const value of [wrapped, 'Short entry']) {
    await field.fill(value)
    await field.press('Enter')
    await expectValueAndCaret(field, '')
  }
  await field.press('ArrowUp')
  await expectValueAndCaret(field, 'Short entry')
  await field.press('ArrowUp')
  await expectValueAndCaret(field, wrapped)
  expect(
    await field.evaluate(element => {
      const style = getComputedStyle(element)
      return (
        (element.scrollHeight -
          parseFloat(style.paddingTop) -
          parseFloat(style.paddingBottom)) /
        parseFloat(style.lineHeight)
      )
    }),
  ).toBeGreaterThanOrEqual(3)

  await field.press('ArrowUp')
  await expect(field).toHaveValue(wrapped)
  await expect(field).toHaveAttribute('data-history-prevented', 'false')
  await expect
    .poll(() =>
      field.evaluate(element =>
        element instanceof HTMLTextAreaElement ? element.selectionStart : -1,
      ),
    )
    .toBeLessThan(wrapped.length)
  await field.press('Control+Home')
  await expect
    .poll(() =>
      field.evaluate(element =>
        element instanceof HTMLTextAreaElement ? element.selectionStart : -1,
      ),
    )
    .toBe(0)
  await field.press('ArrowDown')
  await expect(field).toHaveValue(wrapped)
  await expect(field).toHaveAttribute('data-history-prevented', 'false')
  await expect
    .poll(() =>
      field.evaluate(element =>
        element instanceof HTMLTextAreaElement ? element.selectionStart : -1,
      ),
    )
    .toBeGreaterThan(0)

  await field.press('Control+Home')
  await expect
    .poll(() =>
      field.evaluate(element =>
        element instanceof HTMLTextAreaElement ? element.selectionStart : -1,
      ),
    )
    .toBe(0)
  await field.press('ArrowUp')
  await expectValueAndCaret(field, 'Can you help me with my order?')
  await field.press('ArrowDown')
  await expectValueAndCaret(field, wrapped)
  await field.press('ArrowDown')
  await expectValueAndCaret(field, 'Short entry')
})

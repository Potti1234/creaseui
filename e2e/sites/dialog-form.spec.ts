import { expect, test } from '@playwright/test'

/* Review R11: the dialog-form recipe keeps native constraints, parent-owned
   validation, an externally associated footer submit, Cancel, Escape and
   focus return working on every renderer. */
test('Dialog invite form validates, submits from the footer and returns focus', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/docs/components/dialog')
  const trigger = page.getByRole('button', {
    name: 'Invite member',
    exact: true,
  })
  await trigger.scrollIntoViewIfNeeded()
  const summary = page.getByText(/^(No invites yet\.|Invited: .*)$/u)
  await expect(summary).toHaveText('No invites yet.')
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Invite a team member' })
  await expect(dialog).toBeVisible()
  const email = dialog.getByRole('textbox', { name: 'Email' })
  const send = dialog.getByRole('button', { name: 'Send invite' })
  expect(await send.getAttribute('type')).toBe('submit')
  expect(
    await send.evaluate(button => ({
      form: (button as HTMLButtonElement).form?.id,
      nested: button.closest('form') !== null,
    })),
  ).toEqual({ form: 'docs-invite-member-form', nested: false })
  expect(
    await dialog.getByRole('button', { name: 'Cancel' }).getAttribute('type'),
  ).toBe('button')

  // Empty: the browser blocks the footer submit and focuses the input.
  await send.click()
  await expect(dialog).toBeVisible()
  expect(
    await email.evaluate(
      input => (input as HTMLInputElement).validity.valueMissing,
    ),
  ).toBe(true)
  await expect(email).toBeFocused()

  // Malformed: type=email blocks it too; nothing is added.
  await email.fill('not-an-email')
  await send.click()
  await expect(dialog).toBeVisible()
  expect(
    await email.evaluate(
      input => (input as HTMLInputElement).validity.typeMismatch,
    ),
  ).toBe(true)
  await expect(summary).toHaveText('No invites yet.')

  // Valid with Enter: submits, closes and returns focus to the trigger.
  await email.fill('ada@example.com')
  await email.press('Enter')
  await expect(dialog).toBeHidden()
  await expect(summary).toHaveText('Invited: ada@example.com')
  await expect(trigger).toBeFocused()

  // Domain rule owned by the parent update: duplicates show a field error.
  await trigger.click()
  await expect(dialog).toBeVisible()
  await email.fill('ada@example.com')
  await send.click()
  await expect(
    dialog.getByText('ada@example.com is already invited.'),
  ).toBeVisible()
  await expect(email).toHaveAttribute('aria-invalid', 'true')

  // Cancel closes without inviting and returns focus.
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  // Escape closes without inviting and returns focus.
  await trigger.click()
  await expect(dialog).toBeVisible()
  await email.fill('grace@example.com')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(summary).toHaveText('Invited: ada@example.com')
  expect(errors).toEqual([])
})

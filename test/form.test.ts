import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formControlIds } from '../src/lib/form.ts'

describe('Form recipe behavior', () => {
  it('derives stable field support IDs from the control ID', () => {
    assert.deepEqual(formControlIds('account-email'), {
      descriptionId: 'account-email-description',
      messageId: 'account-email-message',
      describedBy: 'account-email-description account-email-message',
    })
  })
})

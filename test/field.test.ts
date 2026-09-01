import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { controlFieldParts, fieldErrorMessages } from '../src/lib/field.ts'

describe('Field composition behavior', () => {
  it('derives deterministic IDs only for rendered support parts', () => {
    const base = {
      id: 'account-email',
      label: 'Email',
      toControl: () => {
        throw new Error('not rendered')
      },
    }

    assert.deepEqual(controlFieldParts(base), {
      controlId: 'account-email',
      labelId: 'account-email-label',
      isInvalid: false,
      isDisabled: false,
    })
    assert.deepEqual(
      controlFieldParts({
        ...base,
        description: 'Account notifications.',
        errors: [{ message: 'Enter a valid email.' }],
      }),
      {
        controlId: 'account-email',
        labelId: 'account-email-label',
        descriptionId: 'account-email-description',
        errorId: 'account-email-error',
        describedBy: 'account-email-description account-email-error',
        isInvalid: true,
        isDisabled: false,
      },
    )
  })

  it('deduplicates defined validation messages in stable order', () => {
    assert.deepEqual(
      fieldErrorMessages([
        undefined,
        { message: 'Required.' },
        {},
        { message: 'Required.' },
        { message: 'Too short.' },
      ]),
      ['Required.', 'Too short.'],
    )
  })
})

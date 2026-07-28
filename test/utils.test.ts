import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { cn } from '../src/lib/utils.ts'

describe('cn', () => {
  it('joins conditional class values', () => {
    assert.equal(
      cn('button', { active: true, disabled: false }, ['rounded', undefined]),
      'button active rounded',
    )
  })

  it('resolves conflicting Tailwind utilities in favor of the last value', () => {
    assert.equal(cn('px-2 py-1', 'px-4'), 'py-1 px-4')
  })

  it('retains non-conflicting modifier variants', () => {
    assert.equal(
      cn('bg-background hover:bg-muted', 'dark:bg-card'),
      'bg-background hover:bg-muted dark:bg-card',
    )
  })

  it('allows consumers to override component defaults', () => {
    assert.equal(
      cn('rounded-md text-sm', 'rounded-full text-lg'),
      'rounded-full text-lg',
    )
  })
})

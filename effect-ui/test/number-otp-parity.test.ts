import assert from 'node:assert/strict'
import { test } from 'node:test'

import { normalizeInputOtp } from '../src/behaviors/input-otp'
import { isFractionalNumberInput } from '../src/behaviors/number-input'

test('OTP patterns filter before length truncation and work with stateful flags', () => {
  const hexadecimal = /[A-F0-9]/gi
  assert.equal(normalizeInputOtp('!aB2-G4K', 4, hexadecimal), 'aB24')
  assert.equal(normalizeInputOtp('F?:3', 4, hexadecimal), 'F3')
})

test('integer mode distinguishes grouped, fractional, and incomplete locale input', () => {
  assert.equal(isFractionalNumberInput('1,234', 'en-US'), false)
  assert.equal(isFractionalNumberInput('1,234.5', 'en-US'), true)
  assert.equal(isFractionalNumberInput('1.234,5', 'de-DE'), true)
  assert.equal(isFractionalNumberInput('-1.234,00', 'de-DE'), false)
  assert.equal(isFractionalNumberInput('١٢٫٥', 'ar-u-nu-arab'), true)
  assert.equal(isFractionalNumberInput('-', 'en-US'), false)
})

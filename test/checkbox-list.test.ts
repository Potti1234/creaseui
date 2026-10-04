import assert from 'node:assert/strict'
import test from 'node:test'

import {
  resolveItemChecked,
  resolveItemToggle,
  isCheckboxListDivider,
  checkboxListDivider,
  type CheckboxListItem,
} from '../src/lib/checkbox-list.ts'

type Msg = { readonly _tag: 'Toggled' }

const Toggled = (): Msg => ({ _tag: 'Toggled' })

test('collection membership drives the checked state', () => {
  const item: CheckboxListItem<Msg> = { label: 'Email', value: 'email' }
  assert.equal(resolveItemChecked({ value: ['email', 'push'] }, item), true)
  assert.equal(resolveItemChecked({ value: ['push'] }, item), false)
})

test('standalone items fall back to their own isChecked', () => {
  assert.equal(
    resolveItemChecked({}, { label: 'All', isChecked: 'indeterminate' }),
    'indeterminate',
  )
  assert.equal(resolveItemChecked({}, { label: 'Unset' }), false)
  /* A value-bearing item inside a controlled list ignores its own isChecked. */
  assert.equal(
    resolveItemChecked(
      { value: [] },
      { label: 'X', value: 'x', isChecked: true },
    ),
    false,
  )
})

test('collection toggle emits the updated value list', () => {
  const onChange = (values: ReadonlyArray<string>): Msg => {
    void values
    return Toggled()
  }
  const item: CheckboxListItem<Msg> = { label: 'Email', value: 'email' }
  const toggle = resolveItemToggle({ value: ['push'], onChange }, item, false)
  assert.ok(toggle !== undefined)
  assert.deepEqual(toggle(true), { _tag: 'Toggled' })
})

test('standalone toggle calls the item callback and indeterminate resolves to checked', () => {
  const onToggle = (_isChecked: boolean): Msg => Toggled()
  const item: CheckboxListItem<Msg> = { label: 'All', onToggle }
  const toggle = resolveItemToggle({}, item, 'indeterminate')
  assert.ok(toggle !== undefined)
  assert.deepEqual(toggle(true), { _tag: 'Toggled' })
  assert.equal(resolveItemToggle({}, { label: 'None' }, false), undefined)
})

test('divider sentinel is identified in the entry stream', () => {
  assert.equal(isCheckboxListDivider(checkboxListDivider), true)
  assert.equal(isCheckboxListDivider<Msg>({ label: 'Email' }), false)
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Option } from 'effect'

import * as Accordion from '../src/ui/accordion.ts'

describe('Accordion behavior', () => {
  it('normalizes stable open values for single and multiple modes', () => {
    assert.deepEqual(
      Accordion.init({
        id: 'single',
        type: 'single',
        value: ['shipping', 'returns', 'shipping'],
      }).value,
      ['shipping'],
    )

    assert.deepEqual(
      Accordion.init({
        id: 'multiple',
        type: 'multiple',
        value: ['shipping', 'returns', 'shipping'],
      }).value,
      ['shipping', 'returns'],
    )
  })

  it('keeps item identity stable without storing the view order', () => {
    const model = Accordion.init({
      id: 'faq',
      type: 'multiple',
      value: ['returns'],
    })

    assert.deepEqual(model, {
      id: 'faq',
      type: 'multiple',
      value: ['returns'],
    })
    assert.equal('itemIds' in model, false)
    assert.equal('openStates' in model, false)
  })

  it('enforces single-open semantics and emits the complete next value', () => {
    const initial = Accordion.init({
      id: 'faq',
      type: 'single',
      value: ['shipping'],
    })
    const [model, commands, maybeOutMessage] = Accordion.update(
      initial,
      Accordion.ToggledItem({ value: 'returns', isOpen: true }),
    )

    assert.deepEqual(model.value, ['returns'])
    assert.deepEqual(commands, [])
    assert.deepEqual(Option.getOrUndefined(maybeOutMessage), {
      _tag: 'ChangedValue',
      value: ['returns'],
      toggledValue: 'returns',
      isOpen: true,
    })
  })

  it('adds and removes values independently in multiple mode', () => {
    const initial = Accordion.init({
      id: 'faq',
      type: 'multiple',
      value: ['shipping'],
    })
    const [opened] = Accordion.update(
      initial,
      Accordion.ToggledItem({ value: 'returns', isOpen: true }),
    )
    const [closed] = Accordion.update(
      opened,
      Accordion.ToggledItem({ value: 'shipping', isOpen: false }),
    )

    assert.deepEqual(opened.value, ['shipping', 'returns'])
    assert.deepEqual(closed.value, ['returns'])
  })

  it('reflects externally-owned values without changing identity or mode', () => {
    const initial = Accordion.init({ id: 'faq', type: 'single' })
    const reflected = Accordion.reflect(initial, ['billing', 'security'])

    assert.deepEqual(reflected, {
      id: 'faq',
      type: 'single',
      value: ['billing'],
    })
  })

  it('keeps legacy item initialization as a migration path', () => {
    assert.deepEqual(
      Accordion.init({
        id: 'legacy',
        type: 'multiple',
        items: [
          { value: 'shipping', isOpen: true },
          { value: 'returns' },
        ],
      }).value,
      ['shipping'],
    )
  })
})

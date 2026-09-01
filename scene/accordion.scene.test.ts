import * as Scene from 'foldkit/scene'
import { describe, expect, it } from 'vitest'

import * as Accordion from '@/stylex/accordion'
import * as AccordionBehavior from '@/ui/accordion'

const items: ReadonlyArray<Accordion.AccordionItem> = [
  {
    value: 'returns',
    trigger: 'Returns',
    content: 'Return unopened items within 30 days.',
  },
  {
    value: 'shipping',
    trigger: 'Shipping',
    content: 'Orders ship in two business days.',
  },
]

const view = Scene.withViewInputs(Accordion.view, { items })()

describe('StyleX Accordion scene', () => {
  it('reuses the canonical Accordion behavior', () => {
    expect(Accordion.Model).toBe(AccordionBehavior.Model)
    expect(Accordion.Message).toBe(AccordionBehavior.Message)
    expect(Accordion.update).toBe(AccordionBehavior.update)
    expect(Accordion.reflect).toBe(AccordionBehavior.reflect)
  })

  it('renders stable values through reordered items and toggles accessibly', () => {
    Scene.scene(
      { update: Accordion.update, view },
      Scene.given(
        Accordion.init({
          id: 'policies',
          type: 'single',
          value: ['shipping'],
        }),
      ),
      Scene.expect(
        Scene.role('button', { name: 'Shipping', expanded: true }),
      ).toExist(),
      Scene.expect(
        Scene.role('button', { name: 'Returns', expanded: false }),
      ).toExist(),
      Scene.click(Scene.role('button', { name: 'Returns' })),
      Scene.expectHandled(),
      Scene.expect(
        Scene.role('button', { name: 'Returns', expanded: true }),
      ).toExist(),
      Scene.expect(
        Scene.role('button', { name: 'Shipping', expanded: false }),
      ).toExist(),
      Scene.expectOutMessage(
        Accordion.ChangedValue({
          value: ['returns'],
          toggledValue: 'returns',
          isOpen: true,
        }),
      ),
    )
  })
})

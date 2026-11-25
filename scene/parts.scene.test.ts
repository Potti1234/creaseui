import { expect, it } from 'vitest'

import { elements } from '@/lib/behaviors/parts'

it('enumerates current bound descendants in DOM order and can limit them to siblings', () => {
  const root = document.createElement('div')
  root.innerHTML = [
    '<div data-slot="row" data-key="b"><div data-slot="row" data-key="nested"></div></div>',
    '<div data-slot="row"></div>',
    '<div data-slot="row" data-key=""></div>',
    '<div data-slot="row" data-key="a"></div>',
    '<div data-key="decoration"></div>',
  ].join('')
  const parts = (direct = false) =>
    elements(root, '[data-slot="row"]', 'data-key', { direct })
  expect(parts().map(part => part.key)).toEqual(['b', 'nested', '', 'a'])
  const before = parts(true)
  expect(before.map(part => part.key)).toEqual(['b', '', 'a'])
  const moved = before.find(part => part.key === 'a')!.element
  root.prepend(moved)
  expect(parts(true).map(part => part.key)).toEqual(['a', 'b', ''])
  expect(parts()[0]?.element).toBe(moved)
  expect(before.map(part => part.key)).toEqual(['b', '', 'a'])
  moved.remove()
  expect(parts(true).map(part => part.key)).toEqual(['b', ''])
})

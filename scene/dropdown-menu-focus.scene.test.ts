import assert from 'node:assert/strict'
import { describe, it } from 'vitest'

import * as PleatMenu from '@/pleat/dropdown-menu'
import * as StyleXMenu from '@/stylex/dropdown-menu'
import * as TailwindMenu from '@/ui/dropdown-menu'

/**
 * A0.12: a pointer selection closes the menu without a `Closed` message, so
 * the old `message._tag === 'Closed'` guard dropped focus to the body. The
 * update must also emit `FocusDropdownMenuTrigger` when a selection closes
 * an open menu.
 */
for (const [renderer, MenuModule] of [
  ['tailwind', TailwindMenu],
  ['stylex', StyleXMenu],
  ['pleat', PleatMenu],
] as const) {
  describe(`${renderer} dropdown focus after selection`, () => {
    it('returns focus to the trigger when a selection closes the menu', () => {
      const Menu = MenuModule.create<'profile' | 'billing'>()
      const opened = Menu.open(MenuModule.init({ id: 'account' })).model
      const result = Menu.selectItem(opened, 'billing', 1)
      assert.equal(result.model.isOpen, false)
      assert.deepEqual(result.outMessage, {
        _tag: 'Selected',
        value: 'billing',
        index: 1,
      })
      assert.deepEqual(
        (result.commands ?? []).map(command => command.name),
        ['FocusDropdownMenuTrigger'],
      )
      assert.equal(result.commands?.[0]?.args.id, 'account')
    })

    it('does not focus the trigger when the selection stays open', () => {
      const Menu = MenuModule.create<'profile' | 'billing'>()
      const opened = Menu.open(MenuModule.init({ id: 'account' })).model
      const result = Menu.selectItem(opened, 'billing', 1, true)
      assert.equal(result.model.isOpen, true)
      assert.equal(result.commands, undefined)
    })
  })
}

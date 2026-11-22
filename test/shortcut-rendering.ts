import assert from 'node:assert/strict'
import { Combobox } from '@foldkit/ui'
import { Option } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import type * as TailwindCommand from '../src/ui/command'
import type * as TailwindMenu from '../src/ui/dropdown-menu'

export const verifyShortcutHints = (
  Command: Pick<typeof TailwindCommand, 'create' | 'init'>,
  Menu: Pick<typeof TailwindMenu, 'dropdownMenu' | 'init'>,
): void => {
  const command = Command.create<string>()
  const items = ['legacy', 'keys', 'both', 'none']
  const config = (item: string) => ({
    ...(item === 'legacy' || item === 'both' ? { shortcut: 'Explicit' } : {}),
    ...(item === 'keys' || item === 'both' ? { keys: 'mod+k' } : {}),
  })
  Scene.scene(
    {
      update: command.update,
      view: (
        model: TailwindCommand.Model,
        h: HtmlBuilder<TailwindCommand.Message>,
      ) =>
        h.main(
          [],
          [
            command.command(
              {
                model,
                items,
                maybeSelectedValue: Option.none(),
                restingInputValue: '',
                toParentMessage: message => message,
                itemToConfig: item => ({ content: item, ...config(item) }),
              },
              h,
            ),
            Menu.dropdownMenu(
              {
                model: { ...Menu.init({ id: 'shortcuts-menu' }), isOpen: true },
                items,
                trigger: 'Menu',
                toParentMessage: () =>
                  Combobox.Message.CompletedAttachComboboxPreventBlur(),
                itemToConfig: item => ({ label: item, ...config(item) }),
              },
              h,
            ),
          ],
        ),
    },
    Scene.given(Command.init({ id: 'shortcuts-command' })),
    Scene.Mount.resolve(
      Combobox.AttachComboboxPreventBlur,
      Combobox.Message.CompletedAttachComboboxPreventBlur(),
    ),
    simulation => {
      const visit = (node: typeof simulation.html): void => {
        const role = node.data?.attrs?.role
        if (role === 'option' || role === 'menuitem') {
          const label = items.find(item =>
            Scene.textContent(node).startsWith(item),
          )
          assert.ok(label)
          const findHint = (child: typeof node): typeof node | undefined => {
            if (
              Scene.textContent(child) === 'Explicit' ||
              child.data?.attrs?.['data-slot'] === 'command-shortcut' ||
              child.data?.attrs?.['aria-hidden'] === 'true'
            )
              return child
            return child.children
              ?.flatMap(next =>
                next && typeof next === 'object' ? [findHint(next)] : [],
              )
              .find(Boolean)
          }
          const hint = node.children
            ?.flatMap(child =>
              child && typeof child === 'object' ? [findHint(child)] : [],
            )
            .find(Boolean)
          if (label === 'none') assert.equal(hint, undefined)
          else {
            assert.ok(hint)
            assert.equal(
              hint.data?.attrs?.['aria-hidden'],
              label === 'legacy' ? undefined : 'true',
            )
            assert.equal(
              typeof node.data?.attrs?.['aria-keyshortcuts'],
              label === 'legacy' ? 'undefined' : 'string',
            )
            if (label !== 'keys')
              assert.equal(Scene.textContent(hint), 'Explicit')
          }
        }
        for (const child of node.children ?? [])
          if (child && typeof child === 'object') visit(child)
      }
      visit(simulation.html)
      return simulation
    },
  )
}

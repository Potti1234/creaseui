import assert from 'node:assert/strict'
import { Combobox } from '@foldkit/ui'
import { Option } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import type * as TailwindCommand from '../src/ui/command'

export const verifyCommandRoot = (
  Command: Pick<typeof TailwindCommand, 'create' | 'init'>,
  query: string,
  status: 'ready' | 'loading',
  announcement: string,
): void => {
  const command = Command.create<'Alpha'>()
  const hasStatus = status === 'loading' || query === 'missing'
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
                items: ['Alpha'],
                maybeSelectedValue: Option.none(),
                restingInputValue: '',
                toParentMessage: message => message,
                itemToConfig: () => ({ content: 'Alpha', keys: 'mod+k' }),
                status,
              },
              h,
            ),
          ],
        ),
    },
    Scene.given({
      ...Command.init({ id: 'command' }),
      inputValue: query,
    }),
    Scene.Mount.resolve(
      Combobox.AttachComboboxPreventBlur,
      Combobox.Message.CompletedAttachComboboxPreventBlur(),
    ),
    simulation => {
      const outer = simulation.html.children?.[0]
      if (!outer || typeof outer !== 'object')
        throw new Error('Missing command root')
      assert.equal(
        outer.data?.attrs?.['data-slot'],
        hasStatus ? 'command-state' : 'command',
      )
      const root = hasStatus ? outer.children?.[0] : outer
      if (!root || typeof root !== 'object')
        throw new Error('Missing command control')
      assert.equal(root.data?.attrs?.['data-slot'], 'command')
      assert.equal(root.children?.length, 3)
      const [region, inputWrapper, list] = root.children ?? []
      if (
        !region ||
        typeof region !== 'object' ||
        !inputWrapper ||
        typeof inputWrapper !== 'object' ||
        !list ||
        typeof list !== 'object'
      )
        throw new Error('Missing command children')
      assert.equal(
        inputWrapper.data?.attrs?.['data-slot'],
        'command-input-wrapper',
      )
      assert.equal(list.data?.attrs?.['data-slot'], 'command-list')
      assert.equal(region.data?.attrs?.['aria-live'], 'polite')
      assert.equal(region.data?.style?.position, 'fixed')
      assert.equal(region.data?.style?.width, '1px')
      assert.equal(region.data?.style?.height, '1px')
      assert.equal(Scene.textContent(region), announcement)
      return simulation
    },
  )
}

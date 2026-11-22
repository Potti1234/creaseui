import { Option } from 'effect'
import * as Scene from 'foldkit/scene'
import type { HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as Typeahead from '@/lib/behaviors/typeahead'
import * as TreeList from '@/lib/tree-list'
import * as Tailwind from '@/ui/tree-list'
import * as StyleX from '@/stylex/tree-list'

const items = [
  { id: 'lion', label: 'Lion' },
  { id: 'llama', label: 'Llama' },
  { id: 'lemon', label: 'Lemon', isDisabled: true },
  { id: 'ecole', label: 'École notes' },
]
const tree = Scene.selector('[data-slot="tree-list"]')

for (const [name, renderer] of [
  ['Tailwind', Tailwind],
  ['StyleX', StyleX],
] as const) {
  const view = (model: TreeList.Model, h: HtmlBuilder<TreeList.Message>) =>
    renderer.treeList(
      { model, toParentMessage: message => message, items, ariaLabel: 'Files' },
      h,
    )

  describe(`${name} tree-list typeahead`, () => {
    for (const scenario of [
      {
        title: 'starts after current',
        focusedId: 'lion',
        query: '',
        lastKey: '',
        isStepping: false,
        key: 'l',
        target: 'Llama',
      },
      {
        title: 'prefers the full repeated prefix',
        focusedId: 'llama',
        query: 'l',
        lastKey: 'l',
        isStepping: false,
        key: 'l',
        target: 'Llama',
      },
      {
        title: 'skips disabled items and wraps while stepping',
        focusedId: 'llama',
        query: 'll',
        lastKey: 'l',
        isStepping: true,
        key: 'l',
        target: 'Lion',
      },
      {
        title: 'folds accents',
        focusedId: 'lion',
        query: '',
        lastKey: '',
        isStepping: false,
        key: 'e',
        target: 'École notes',
      },
      {
        title: 'continues an active query with Space',
        focusedId: 'ecole',
        query: 'ecole',
        lastKey: 'e',
        isStepping: false,
        key: ' ',
        target: 'École notes',
      },
    ]) {
      it(scenario.title, () => {
        Scene.scene(
          { update: TreeList.update, view },
          Scene.given({
            ...TreeList.init({ id: 'files' }),
            focusedId: Option.some(scenario.focusedId),
            typeahead: {
              query: scenario.query,
              lastKey: scenario.lastKey,
              isStepping: scenario.isStepping,
              version: 0,
            },
          }),
          Scene.keydown(tree, scenario.key),
          Scene.expectHandled(),
          Scene.expect(
            Scene.role('treeitem', { name: scenario.target }),
          ).toHaveAttr('tabIndex', '0'),
          Scene.Command.resolve(
            TreeList.FocusTreeListItem,
            TreeList.Message.CompletedFocusTreeListItem(),
          ),
          Scene.Command.resolve(
            Typeahead.WaitBeforeResettingTypeahead,
            Typeahead.Message.ElapsedTimeout({ version: 1 }),
          ),
        )
      })
    }
  })
}

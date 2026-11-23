import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Option } from 'effect'

import * as Reorder from '@/lib/behaviors/tree-reorder'
import * as Tree from '@/lib/tree-list'

const items: ReadonlyArray<Tree.TreeListItemData> = [
  { id: 'folder', label: 'Folder' },
  {
    id: 'moving',
    label: 'Moving',
    children: [{ id: 'child', label: 'Child' }],
  },
  { id: 'last', label: 'Last' },
]

test('reparenting moves a subtree and refuses cycles', () => {
  const placement = Reorder.placementFor(items, 'moving', 'indent')!
  const nested = Reorder.place(items, placement)
  assert.deepEqual(
    nested.map(item => item.id),
    ['folder', 'last'],
  )
  assert.equal(nested[0]?.children?.[0]?.children?.[0]?.id, 'child')
  assert.equal(
    Reorder.place(nested, { id: 'folder', parent: 'child', before: null }),
    nested,
  )
  const restored = Reorder.place(
    nested,
    Reorder.placementFor(nested, 'moving', 'outdent')!,
  )
  assert.deepEqual(
    restored.map(item => item.id),
    items.map(item => item.id),
  )
  assert.equal(restored[0]?.children?.length, 0)
  assert.equal(restored[1], items[1])
})

test('tree list keeps or discards a keyboard draft', () => {
  const initial = Tree.update(
    Tree.init({ id: 'tree' }),
    Tree.Message.FocusedTreeListItem({ id: 'moving' }),
  ).model
  const key = (model: Tree.Model, key: string, shiftKey = false) =>
    Tree.update(
      model,
      Option.getOrThrow(
        Tree.reorderKey(
          Tree.reorderedItems(items, model),
          model,
          key,
          {
            shiftKey,
            ctrlKey: false,
            metaKey: false,
            altKey: false,
          },
          'ltr',
        ),
      ),
    ).model
  const moving = key(key(initial, ' ', true), 'ArrowUp')
  assert.equal(Tree.reorderedItems(items, moving)[0]?.id, 'moving')
  assert.equal(
    Tree.reorderedItems(items, key(moving, 'Escape'))[0]?.id,
    'folder',
  )
  assert.equal(
    Tree.reorderedItems(items, key(moving, 'Enter'))[0]?.id,
    'moving',
  )
})

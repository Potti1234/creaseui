import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as Tree from '../src/lib/behaviors/tree-collection.ts'

const items: ReadonlyArray<Tree.TreeItemData> = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'main', label: 'main.ts' },
      {
        value: 'lib',
        label: 'lib',
        children: [
          { value: 'helper', label: 'helper.ts' },
          { value: 'locked', label: 'locked.ts' },
        ],
      },
    ],
  },
  { value: 'docs', label: 'docs', children: [] },
  { value: 'readme', label: 'README.md' },
]

const tree = Tree.createTreeCollection(Tree.treeDataNodes(items))

describe('TreeCollection', () => {
  it('indexes sibling positions, parents, descendants and unloaded branches', () => {
    assert.equal(tree.size, 7)
    assert.deepEqual(tree.children(null), ['src', 'docs', 'readme'])
    assert.deepEqual(tree.children('src'), ['main', 'lib'])
    assert.equal(tree.parent('helper'), 'lib')
    assert.equal(tree.level('helper'), 3)
    assert.deepEqual(tree.ancestors('helper'), ['src', 'lib'])
    assert.deepEqual(tree.descendants('src'), [
      'main',
      'lib',
      'helper',
      'locked',
    ])
    assert.deepEqual(tree.position('lib'), { index: 2, size: 2 })
    assert.equal(tree.isBranch('docs'), true)
    assert.equal(tree.isBranch('readme'), false)
    assert.equal(tree.has('unknown'), false)
    assert.deepEqual(tree.position('unknown'), { index: 0, size: 0 })
  })

  it('handles children listed before parents, unknown parents and duplicate keys', () => {
    const flat = Tree.createTreeCollection<string>([
      { key: 'child', parent: 'parent' },
      { key: 'parent', parent: null },
      { key: 'orphan', parent: 'unknown' },
      { key: 'child', parent: null },
    ])
    assert.deepEqual(flat.keys(), ['parent', 'child', 'orphan'])
    assert.deepEqual(flat.children(null), ['parent', 'orphan'])
    assert.equal(flat.parent('child'), 'parent')
  })

  it('lists only reachable expanded rows with original data and flat indices', () => {
    assert.deepEqual(tree.visible(['lib']), ['src', 'docs', 'readme'])
    const expanded = ['src']
    assert.deepEqual(tree.visible(expanded), [
      'src',
      'main',
      'lib',
      'docs',
      'readme',
    ])
    expanded.push('lib')
    const rows = Tree.visibleTreeRows(items, expanded)
    assert.deepEqual(
      tree.visible(expanded),
      rows.map(({ item }) => item.value),
    )
    assert.deepEqual(
      rows.map(({ item, parent, level, index }) => [
        item.value,
        parent,
        level,
        index,
      ]),
      [
        ['src', null, 1, 0],
        ['main', 'src', 2, 1],
        ['lib', 'src', 2, 2],
        ['helper', 'lib', 3, 3],
        ['locked', 'lib', 3, 4],
        ['docs', null, 1, 5],
        ['readme', null, 1, 6],
      ],
    )
    assert.equal(rows[0]?.item, items[0])
  })

  it('converts file paths to folders-first trees with unique files and empty folders', () => {
    assert.deepEqual(
      Tree.treeFromPaths([
        'README.md',
        'src/main.ts',
        'src/lib/helper.ts',
        'docs/',
        'src/main.ts',
      ]),
      [
        {
          value: 'src',
          label: 'src',
          children: [
            {
              value: 'src/lib',
              label: 'lib',
              children: [{ value: 'src/lib/helper.ts', label: 'helper.ts' }],
            },
            { value: 'src/main.ts', label: 'main.ts' },
          ],
        },
        { value: 'docs', label: 'docs', children: [] },
        { value: 'README.md', label: 'README.md' },
      ],
    )
  })
})

describe('TreeCollection check state', () => {
  it('derives mixed and fully checked branches without changing the input', () => {
    const value = Object.freeze(['lib'])
    const state = Tree.treeCheckedStates(tree, value)
    assert.equal(state('src'), 'indeterminate')
    assert.equal(state('lib'), true)
    assert.equal(state('helper'), true)
    assert.equal(state('main'), false)
    assert.equal(state('unknown'), false)
    assert.deepEqual(Tree.toggleTreeChecked(tree, value, 'src'), [
      'main',
      'helper',
      'locked',
    ])
    assert.deepEqual(value, ['lib'])
  })

  it('reports checked values in tree order for each strategy', () => {
    assert.deepEqual(Tree.toggleTreeChecked(tree, ['readme'], 'lib'), [
      'helper',
      'locked',
      'readme',
    ])
    assert.deepEqual(
      Tree.toggleTreeChecked(tree, [], 'lib', { strategy: 'branch' }),
      ['lib', 'helper', 'locked'],
    )
    assert.deepEqual(
      Tree.toggleTreeChecked(tree, ['lib'], 'main', { strategy: 'trunk' }),
      ['src'],
    )
    assert.deepEqual(Tree.toggleTreeChecked(tree, ['src'], 'src'), [])
    const independent = { strategy: 'independent' } as const
    assert.equal(
      Tree.treeCheckedStates(tree, ['src'], independent.strategy)('main'),
      false,
    )
    assert.deepEqual(
      Tree.toggleTreeChecked(tree, ['readme', 'src'], 'lib', independent),
      ['readme', 'src', 'lib'],
    )
    assert.deepEqual(
      Tree.toggleTreeChecked(tree, ['src', 'lib'], 'src', independent),
      ['lib'],
    )
  })

  it('keeps refused branches and leaves unchanged when toggling ancestors', () => {
    const checkable = (key: string) => key !== 'lib'
    assert.deepEqual(
      Tree.toggleTreeChecked(tree, ['helper'], 'src', { checkable }),
      ['main', 'helper'],
    )
    assert.deepEqual(
      Tree.toggleTreeChecked(tree, ['helper'], 'lib', { checkable }),
      ['helper'],
    )
    const exceptLocked = { checkable: (key: string) => key !== 'locked' }
    const partial = Tree.toggleTreeChecked(tree, [], 'src', exceptLocked)
    assert.deepEqual(partial, ['main', 'helper'])
    assert.equal(Tree.treeCheckedStates(tree, partial)('src'), 'indeterminate')
    assert.deepEqual(
      Tree.toggleTreeChecked(tree, partial, 'src', exceptLocked),
      [],
    )
  })

  it('preserves a checked unloaded branch when children arrive', () => {
    const checked = Tree.toggleTreeChecked(tree, [], 'docs')
    assert.deepEqual(checked, ['docs'])
    const loaded = Tree.createTreeCollection<string>([
      ...Tree.treeDataNodes(items),
      { key: 'guide', parent: 'docs' },
    ])
    const state = Tree.treeCheckedStates(loaded, checked)
    assert.equal(state('docs'), true)
    assert.equal(state('guide'), true)
  })
})

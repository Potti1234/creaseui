import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Option } from 'effect'

import * as TreeList from '../src/ui/tree-list.ts'

const MOD = { ctrlKey: false, metaKey: false, altKey: false }

const items = [
  {
    id: 'src',
    label: 'src',
    isExpanded: true,
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx', onSelect: true },
          { id: 'card', label: 'Card.tsx', onSelect: true },
        ],
      },
      { id: 'app', label: 'App.tsx', onSelect: true },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'favicon', label: 'favicon.ico', onSelect: true },
      { id: 'index-html', label: 'index.html', onSelect: true },
    ],
  },
  { id: 'pkg', label: 'package.json', onSelect: true },
  { id: 'readme', label: 'README.md', isDisabled: true },
]

const model = (overrides?: Partial<TreeList.Model>): TreeList.Model => ({
  ...TreeList.init({ id: 'tree' }),
  ...overrides,
})

describe('TreeList visibility + expansion', () => {
  it('lists only items under expanded parents in DOM order', () => {
    const m = model()
    assert.deepEqual(
      TreeList.visibleItems(items, m).map(i => i.id),
      ['src', 'components', 'app', 'public', 'pkg', 'readme'],
    )
  })

  it('expands children after an override toggle', () => {
    const m = model({
      expandedOverrides: { public: true, src: false },
    })
    assert.deepEqual(
      TreeList.visibleItems(items, m).map(i => i.id),
      ['src', 'public', 'favicon', 'index-html', 'pkg', 'readme'],
    )
  })

  it('prefers overrides over the item isExpanded seed', () => {
    assert.equal(TreeList.isItemExpanded(items[0]!, model()), true)
    assert.equal(
      TreeList.isItemExpanded(
        items[0]!,
        model({
          expandedOverrides: { src: false },
        }),
      ),
      false,
    )
  })

  it('update writes the resolved override from the view', () => {
    const m = model()
    const op__ = TreeList.update(
      m,
      TreeList.Message.ToggledTreeListItem({ id: 'src', isExpanded: false }),
    )
    assert.equal(op__.model.expandedOverrides['src'], false)
    assert.equal(TreeList.isItemExpanded(items[0]!, op__.model), false)
  })
})

describe('TreeList tabbable seed', () => {
  it('seeds the first selected enabled item even inside a collapsed branch', () => {
    const nested = [
      {
        id: 'root',
        label: 'root',
        children: [{ id: 'deep', label: 'deep', isSelected: true }],
      },
    ]
    assert.equal(TreeList.findInitialTabbableId(nested), 'deep')
  })

  it('falls back to the first enabled item, else the first item', () => {
    assert.equal(TreeList.findInitialTabbableId(items), 'src')
    assert.equal(
      TreeList.findInitialTabbableId([
        { id: 'a', label: 'a', isDisabled: true },
        { id: 'b', label: 'b' },
      ]),
      'b',
    )
    assert.equal(
      TreeList.findInitialTabbableId([
        { id: 'a', label: 'a', isDisabled: true },
      ]),
      'a',
    )
  })

  it('re-seeds when the focused item leaves the visible set', () => {
    const m = model({ focusedId: Option.some('button') })
    // 'button' is inside collapsed 'components' -> not visible.
    assert.equal(TreeList.tabbableId(items, m), 'src')
  })
})

describe('TreeList.resolveKey', () => {
  it('ArrowDown moves to the next visible enabled item and clamps', () => {
    const m = model({ focusedId: Option.some('app') })
    assert.deepEqual(TreeList.resolveKey(items, m, 'ArrowDown', MOD, 'ltr'), {
      _tag: 'move',
      id: 'public',
    })
    // Skip disabled 'readme' at the end -> stay on 'pkg'.
    const atEnd = model({ focusedId: Option.some('pkg') })
    assert.deepEqual(
      TreeList.resolveKey(items, atEnd, 'ArrowDown', MOD, 'ltr'),
      { _tag: 'move', id: 'pkg' },
    )
  })

  it('ArrowUp mirrors ArrowDown', () => {
    const m = model({ focusedId: Option.some('public') })
    assert.deepEqual(TreeList.resolveKey(items, m, 'ArrowUp', MOD, 'ltr'), {
      _tag: 'move',
      id: 'app',
    })
    const atTop = model({ focusedId: Option.some('src') })
    assert.deepEqual(TreeList.resolveKey(items, atTop, 'ArrowUp', MOD, 'ltr'), {
      _tag: 'move',
      id: 'src',
    })
  })

  it('ArrowRight expands a collapsed branch, else moves to first child, else swallows', () => {
    const collapsed = model({ focusedId: Option.some('public') })
    assert.deepEqual(
      TreeList.resolveKey(items, collapsed, 'ArrowRight', MOD, 'ltr'),
      { _tag: 'toggle', id: 'public' },
    )
    const expanded = model({ focusedId: Option.some('src') })
    assert.deepEqual(
      TreeList.resolveKey(items, expanded, 'ArrowRight', MOD, 'ltr'),
      { _tag: 'move', id: 'components' },
    )
    const leaf = model({ focusedId: Option.some('app') })
    assert.deepEqual(
      TreeList.resolveKey(items, leaf, 'ArrowRight', MOD, 'ltr'),
      { _tag: 'move', id: 'app' },
    )
  })

  it('ArrowLeft collapses an expanded branch, else moves to the parent', () => {
    const expanded = model({ focusedId: Option.some('src') })
    assert.deepEqual(
      TreeList.resolveKey(items, expanded, 'ArrowLeft', MOD, 'ltr'),
      { _tag: 'toggle', id: 'src' },
    )
    const child = model({ focusedId: Option.some('app') })
    assert.deepEqual(
      TreeList.resolveKey(items, child, 'ArrowLeft', MOD, 'ltr'),
      { _tag: 'move', id: 'src' },
    )
  })

  it('swaps ArrowLeft/ArrowRight under rtl', () => {
    const expanded = model({ focusedId: Option.some('src') })
    assert.deepEqual(
      TreeList.resolveKey(items, expanded, 'ArrowLeft', MOD, 'rtl'),
      { _tag: 'move', id: 'components' },
    )
    assert.deepEqual(
      TreeList.resolveKey(items, expanded, 'ArrowRight', MOD, 'rtl'),
      { _tag: 'toggle', id: 'src' },
    )
  })

  it('Home/End move to the first/last visible enabled item', () => {
    const m = model({ focusedId: Option.some('app') })
    assert.deepEqual(TreeList.resolveKey(items, m, 'Home', MOD, 'ltr'), {
      _tag: 'move',
      id: 'src',
    })
    assert.deepEqual(TreeList.resolveKey(items, m, 'End', MOD, 'ltr'), {
      _tag: 'move',
      id: 'pkg',
    })
  })

  it('Enter activates inner-action rows, toggles parents, and ignores disabled rows', () => {
    const leaf = model({ focusedId: Option.some('app') })
    assert.deepEqual(TreeList.resolveKey(items, leaf, 'Enter', MOD, 'ltr'), {
      _tag: 'activate',
      id: 'app',
    })
    const parent = model({ focusedId: Option.some('src') })
    assert.deepEqual(TreeList.resolveKey(items, parent, ' ', MOD, 'ltr'), {
      _tag: 'toggle',
      id: 'src',
    })
    const disabled = model({ focusedId: Option.some('readme') })
    assert.deepEqual(
      TreeList.resolveKey(items, disabled, 'Enter', MOD, 'ltr'),
      { _tag: 'none' },
    )
  })

  it('typeahead wraps and skips disabled items', () => {
    const m = model({ focusedId: Option.some('app') })
    const intent = TreeList.resolveKey(items, m, 'p', MOD, 'ltr')
    // 'public' matches 'p' before 'package.json'.
    assert.deepEqual(intent, {
      _tag: 'typeahead',
      key: 'p',
      matchedId: Option.some('public'),
    })
  })

  it('a repeated character cycles to the next match', () => {
    const m = model({
      focusedId: Option.some('public'),
      typeahead: 'p',
    })
    const intent = TreeList.resolveKey(items, m, 'p', MOD, 'ltr')
    assert.deepEqual(intent, {
      _tag: 'typeahead',
      key: 'p',
      matchedId: Option.some('pkg'),
    })
  })

  it('modifier keys are not typeahead', () => {
    const m = model()
    assert.deepEqual(
      TreeList.resolveKey(items, m, 'p', { ...MOD, ctrlKey: true }, 'ltr'),
      { _tag: 'none' },
    )
  })
})

describe('TreeList.update', () => {
  it('PressedTreeListItemAction emits a SelectedTreeListItem out message', () => {
    const op__ = TreeList.update(
      model(),
      TreeList.Message.PressedTreeListItemAction({ id: 'app' }),
    )
    assert.deepEqual(op__.outMessage, {
      _tag: 'SelectedTreeListItem',
      id: 'app',
    })
  })

  it('AppliedTreeListTypeahead moves focus and bumps the reset version', () => {
    const m = model()
    const op__ = TreeList.update(
      m,
      TreeList.Message.AppliedTreeListTypeahead({
        key: 'p',
        matchedId: Option.some('public'),
      }),
    )
    assert.equal(op__.model.typeahead, 'p')
    assert.equal(op__.model.typeaheadVersion, 1)
    assert.deepEqual(op__.model.focusedId, Option.some('public'))
    assert.equal((op__.commands ?? []).length, 2)
  })

  it('stale typeahead resets are ignored', () => {
    const m = model({ typeahead: 'p', typeaheadVersion: 2 })
    const stale = TreeList.update(
      m,
      TreeList.Message.CompletedTreeListTypeaheadReset({ version: 1 }),
    )
    assert.equal(stale.model.typeahead, 'p')
    const current = TreeList.update(
      m,
      TreeList.Message.CompletedTreeListTypeaheadReset({ version: 2 }),
    )
    assert.equal(current.model.typeahead, '')
  })
})

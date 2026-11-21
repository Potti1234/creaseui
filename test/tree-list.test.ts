import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Option } from 'effect'

import * as Typeahead from '../src/lib/behaviors/typeahead.ts'

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

const typeaheadMessage = (
  key: string,
  snapshot: TreeList.Model = model(),
  candidates: ReadonlyArray<TreeList.TreeListItemData> = items,
) => {
  const intent = TreeList.resolveKey(candidates, snapshot, key, MOD, 'ltr')
  assert.ok(intent._tag === 'typeahead')
  return TreeList.Message.AppliedTreeListTypeahead({
    key: intent.key,
    candidates: intent.candidates,
  })
}

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
    assert.equal(
      TreeList.update(parent, typeaheadMessage(' ', parent)).model
        .expandedOverrides.src,
      false,
    )
    const disabled = model({ focusedId: Option.some('readme') })
    assert.deepEqual(
      TreeList.resolveKey(items, disabled, 'Enter', MOD, 'ltr'),
      { _tag: 'none' },
    )
  })

  it('typeahead carries the visible candidate facts without searching', () => {
    const m = model({ focusedId: Option.some('app') })
    const intent = TreeList.resolveKey(items, m, 'p', MOD, 'ltr')
    assert.ok(intent._tag === 'typeahead')
    assert.equal(intent.key, 'p')
    assert.deepEqual(
      intent.candidates.map(item => item.label),
      ['src', 'components', 'App.tsx', 'public', 'package.json', 'README.md'],
    )
    assert.equal(intent.candidates.at(-1)?.isDisabled, true)
  })

  it('does not compute typeahead state from the rendered query or focus', () => {
    const m = model({
      focusedId: Option.some('public'),
      typeahead: { query: 'p', lastKey: 'p', isStepping: false, version: 1 },
    })
    const intent = TreeList.resolveKey(items, m, 'p', MOD, 'ltr')
    assert.deepEqual(
      intent,
      TreeList.resolveKey(items, model(), 'p', MOD, 'ltr'),
    )
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
    const op__ = TreeList.update(m, typeaheadMessage('p'))
    assert.equal(op__.model.typeahead.query, 'p')
    assert.equal(op__.model.typeahead.version, 1)
    assert.deepEqual(op__.model.focusedId, Option.some('public'))
    assert.equal((op__.commands ?? []).length, 2)
  })

  it('cycles three messages from the same render against the latest model', () => {
    const message = typeaheadMessage('p', model(), [
      { id: 'public', label: 'public' },
      { id: 'pkg', label: 'package.json' },
      { id: 'patch', label: 'patch.txt' },
    ])
    const first = TreeList.update(model(), message)
    const second = TreeList.update(first.model, message)
    const third = TreeList.update(second.model, message)
    assert.deepEqual(first.model.focusedId, Option.some('public'))
    assert.deepEqual(second.model.focusedId, Option.some('pkg'))
    assert.deepEqual(third.model.focusedId, Option.some('patch'))
    assert.equal(third.model.typeahead.version, 3)
    assert.equal(third.commands?.length, 2)
  })

  it('decides whether Space continues a query using the latest model', () => {
    const snapshot = model({ focusedId: Option.some('public') })
    const space = typeaheadMessage(' ', snapshot)
    const typed = TreeList.update(snapshot, typeaheadMessage('p', snapshot))
    const continued = TreeList.update(typed.model, space)
    assert.equal(continued.model.typeahead.query, 'p ')
    assert.deepEqual(continued.model.expandedOverrides, {})
    const toggled = TreeList.update(snapshot, space)
    assert.equal(toggled.model.expandedOverrides.public, true)
    assert.equal(toggled.model.typeahead.query, '')
  })

  it('ignores inactive Space on disabled rows and preserves focus on failed searches', () => {
    const disabled = model({ focusedId: Option.some('readme') })
    const ignored = TreeList.update(disabled, typeaheadMessage(' ', disabled))
    assert.equal(ignored.model, disabled)
    assert.equal(ignored.commands, undefined)
    const missed = TreeList.update(disabled, typeaheadMessage('r', disabled))
    assert.deepEqual(missed.model.focusedId, disabled.focusedId)
    assert.equal(missed.commands?.length, 1)
    const empty = TreeList.update(
      disabled,
      TreeList.Message.AppliedTreeListTypeahead({ key: 'p', candidates: [] }),
    )
    assert.deepEqual(empty.model.focusedId, disabled.focusedId)
    assert.equal(empty.commands?.length, 1)
  })

  it('stale typeahead resets are ignored', () => {
    const m = model({
      typeahead: { query: 'p', lastKey: 'p', isStepping: false, version: 2 },
    })
    const stale = TreeList.update(
      m,
      TreeList.Message.GotTypeaheadMessage({
        message: Typeahead.Message.ElapsedTimeout({ version: 1 }),
      }),
    )
    assert.equal(stale.model.typeahead.query, 'p')
    const current = TreeList.update(
      m,
      TreeList.Message.GotTypeaheadMessage({
        message: Typeahead.Message.ElapsedTimeout({ version: 2 }),
      }),
    )
    assert.equal(current.model.typeahead.query, '')
  })
})

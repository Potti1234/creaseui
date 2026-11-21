// SPDX-License-Identifier: Apache-2.0
// Adapted for Crease UI from Vercel UI SDK's tree-collection and tree-checked
// helpers (https://github.com/vercel-labs/ui/tree/06a7633/packages/core/src/foundation/lists).

export type TreeCollectionNode<Key extends string = string> = Readonly<{
  key: Key
  parent: Key | null
  branch?: boolean
}>

type Entry<Key extends string> = {
  parent: Key | null
  children: Key[]
  branch: boolean
  index: number
}

export const createTreeCollection = <Key extends string>(
  nodes: Iterable<TreeCollectionNode<Key>>,
) => {
  const entries = new Map<Key, Entry<Key>>()
  const roots: Key[] = []
  for (const { key, parent, branch } of nodes) {
    if (!entries.has(key))
      entries.set(key, {
        parent,
        children: [],
        branch: branch === true,
        index: 0,
      })
  }
  for (const [key, entry] of entries) {
    const parent = entry.parent === null ? undefined : entries.get(entry.parent)
    if (parent === undefined) entry.parent = null
    entry.index = (parent?.children ?? roots).push(key)
  }

  const children = (key: Key | null): ReadonlyArray<Key> =>
    key === null ? roots : (entries.get(key)?.children ?? [])

  const parent = (key: Key): Key | null => entries.get(key)?.parent ?? null

  const ancestors = (key: Key): ReadonlyArray<Key> => {
    const found: Key[] = []
    const seen = new Set([key])
    for (let up = parent(key); up !== null && !seen.has(up); up = parent(up)) {
      seen.add(up)
      found.push(up)
    }
    return found.reverse()
  }

  const walk = (
    key: Key | null,
    enter: (key: Key) => boolean = () => true,
  ): ReadonlyArray<Key> => {
    const order: Key[] = []
    const seen = new Set(key === null ? [] : [key])
    const visit = (from: Key | null): void => {
      for (const child of children(from)) {
        if (seen.has(child)) continue
        seen.add(child)
        order.push(child)
        if (enter(child)) visit(child)
      }
    }
    visit(key)
    return order
  }

  return {
    size: entries.size,
    has: (key: Key) => entries.has(key),
    parent,
    children,
    isBranch: (key: Key) => {
      const entry = entries.get(key)
      return entry !== undefined && (entry.branch || entry.children.length > 0)
    },
    level: (key: Key) => ancestors(key).length + 1,
    position: (key: Key) => {
      const entry = entries.get(key)
      return entry === undefined
        ? { index: 0, size: 0 }
        : { index: entry.index, size: children(entry.parent).length }
    },
    ancestors,
    descendants: (key: Key) => walk(key),
    keys: () => walk(null),
    visible: (expanded: ReadonlyArray<Key>) => {
      const open = new Set(expanded)
      return walk(null, key => open.has(key))
    },
  }
}

export type TreeCollection<Key extends string = string> = ReturnType<
  typeof createTreeCollection<Key>
>

export type TreeItemData<Key extends string = string> = Readonly<{
  value: Key
  label: string
  children?: ReadonlyArray<TreeItemData<Key>>
  disabled?: boolean
  href?: string
}>

export type TreeRow<
  Key extends string = string,
  Item = TreeItemData<Key>,
> = Readonly<{
  item: Item
  parent: Key | null
  level: number
  index: number
}>

export const visibleTreeRowsBy = <
  Key extends string,
  Item extends { readonly children?: ReadonlyArray<Item> },
>(
  items: ReadonlyArray<Item>,
  keyOf: (item: Item) => Key,
  isExpanded: (item: Item) => boolean,
): ReadonlyArray<TreeRow<Key, Item>> => {
  const rows: Array<TreeRow<Key, Item>> = []
  const visit = (
    siblings: ReadonlyArray<Item>,
    parent: Key | null,
    level: number,
  ): void => {
    for (const item of siblings) {
      rows.push({ item, parent, level, index: rows.length })
      if (item.children !== undefined && isExpanded(item)) {
        visit(item.children, keyOf(item), level + 1)
      }
    }
  }
  visit(items, null, 1)
  return rows
}

export const visibleTreeRows = <Key extends string>(
  items: ReadonlyArray<TreeItemData<Key>>,
  expanded: ReadonlyArray<NoInfer<Key>>,
): ReadonlyArray<TreeRow<Key>> => {
  const open = new Set(expanded)
  return visibleTreeRowsBy(
    items,
    item => item.value,
    item => open.has(item.value),
  )
}

export const treeDataNodes = <Key extends string>(
  items: ReadonlyArray<TreeItemData<Key>>,
) =>
  visibleTreeRowsBy(
    items,
    item => item.value,
    () => true,
  ).map(({ item, parent }) => ({
    key: item.value,
    parent,
    branch: item.children !== undefined,
    item,
  }))

export const treeFromPaths = (
  paths: ReadonlyArray<string>,
): ReadonlyArray<TreeItemData> => {
  const roots: TreeItemData[] = []
  const directories = new Map<string, TreeItemData[]>()
  for (const path of paths) {
    const parts = path.split('/')
    const isDirectory = parts.at(-1) === ''
    if (isDirectory) parts.pop()
    let siblings = roots
    let value = ''
    for (const [index, label] of parts.entries()) {
      value = value ? `${value}/${label}` : label
      if (isDirectory || index < parts.length - 1) {
        let children = directories.get(value)
        if (children === undefined) {
          children = []
          directories.set(value, children)
          siblings.push({ value, label, children })
        }
        siblings = children
      } else if (!siblings.some(item => item.value === value)) {
        siblings.push({ value, label })
      }
    }
  }
  const foldersFirst = (
    items: ReadonlyArray<TreeItemData>,
  ): ReadonlyArray<TreeItemData> => {
    const folders: TreeItemData[] = []
    const files: TreeItemData[] = []
    for (const item of items) {
      if (item.children === undefined) files.push(item)
      else folders.push({ ...item, children: foldersFirst(item.children) })
    }
    return [...folders, ...files]
  }
  return foldersFirst(roots)
}

export type TreeCheckStrategy = 'leaf' | 'trunk' | 'branch' | 'independent'
export type TreeCheckedState = boolean | 'indeterminate'

const checkedLeaves = <Key extends string>(
  tree: TreeCollection<Key>,
  order: ReadonlyArray<Key>,
  value: ReadonlyArray<Key>,
): Set<Key> => {
  const checked = new Set(value)
  const leaves = new Set<Key>()
  for (const key of order) {
    const parent = tree.parent(key)
    if (parent !== null && checked.has(parent)) checked.add(key)
    if (checked.has(key) && tree.children(key).length === 0) leaves.add(key)
  }
  return leaves
}

const cascade = <Key extends string>(
  tree: TreeCollection<Key>,
  order: ReadonlyArray<Key>,
  leaves: ReadonlySet<Key>,
): ReadonlyMap<Key, TreeCheckedState> => {
  const states = new Map<Key, TreeCheckedState>()
  for (const key of order.toReversed()) {
    const children = tree.children(key)
    const state =
      children.length === 0
        ? leaves.has(key)
        : children.every(child => states.get(child) === true)
          ? true
          : children.some(child => states.get(child) !== false)
            ? 'indeterminate'
            : false
    states.set(key, state)
  }
  return states
}

export const treeCheckedStates = <Key extends string>(
  tree: TreeCollection<Key>,
  value: ReadonlyArray<NoInfer<Key>>,
  strategy: TreeCheckStrategy = 'leaf',
): ((key: Key) => TreeCheckedState) => {
  if (strategy === 'independent') {
    const checked = new Set(value)
    return key => checked.has(key)
  }
  const order = tree.keys()
  const states = cascade(tree, order, checkedLeaves(tree, order, value))
  return key => states.get(key) ?? false
}

export const toggleTreeChecked = <Key extends string>(
  tree: TreeCollection<Key>,
  value: ReadonlyArray<NoInfer<Key>>,
  key: NoInfer<Key>,
  {
    strategy = 'leaf',
    checkable = () => true,
  }: Readonly<{
    strategy?: TreeCheckStrategy
    checkable?: (key: NoInfer<Key>) => boolean
  }> = {},
): ReadonlyArray<Key> => {
  if (!checkable(key)) return [...value]
  if (strategy === 'independent') {
    return value.includes(key)
      ? value.filter(each => each !== key)
      : [...value, key]
  }
  const order = tree.keys()
  const leaves = checkedLeaves(tree, order, value)
  const affected: Key[] = []
  const visit = (node: Key): void => {
    const children = tree.children(node)
    if (children.length === 0) affected.push(node)
    for (const child of children) {
      if (checkable(child)) visit(child)
    }
  }
  if (order.includes(key)) visit(key)
  const isChecking = !affected.every(leaf => leaves.has(leaf))
  for (const leaf of affected) {
    if (isChecking) leaves.add(leaf)
    else leaves.delete(leaf)
  }

  if (strategy === 'leaf') return order.filter(leaf => leaves.has(leaf))
  const states = cascade(tree, order, leaves)
  return order.filter(node => {
    if (states.get(node) !== true) return false
    const parent = tree.parent(node)
    return (
      strategy === 'branch' || parent === null || states.get(parent) !== true
    )
  })
}

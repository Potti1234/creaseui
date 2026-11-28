import { Schema as S } from 'effect'

export const Placement = S.Struct({
  id: S.String,
  parent: S.NullOr(S.String),
  before: S.NullOr(S.String),
})
export type Placement = typeof Placement.Type

type Node = Readonly<{ id: string; isDisabled?: boolean | undefined }>
type TreeNode<Item extends Node> = Item &
  Readonly<{ children?: ReadonlyArray<TreeNode<Item>> | undefined }>
type Direction = 'up' | 'down' | 'indent' | 'outdent'

const locate = <Item extends Node>(
  items: ReadonlyArray<TreeNode<Item>>,
  id: string,
  parent: string | null = null,
  ancestors: ReadonlyArray<string> = [],
):
  | {
      items: ReadonlyArray<TreeNode<Item>>
      index: number
      parent: string | null
      ancestors: ReadonlyArray<string>
    }
  | undefined => {
  for (const [index, item] of items.entries()) {
    if (item.id === id) return { items, index, parent, ancestors }
    if (item.children !== undefined) {
      const found = locate(item.children, id, item.id, [...ancestors, item.id])
      if (found !== undefined) return found
    }
  }
}

export const placementFor = <Item extends Node>(
  items: ReadonlyArray<TreeNode<Item>>,
  id: string,
  direction: Direction,
): Placement | undefined => {
  const current = locate(items, id)
  if (current === undefined || current.items[current.index]?.isDisabled) return
  const { index, items: siblings, parent } = current
  const previous = siblings[index - 1]
  switch (direction) {
    case 'up':
      return previous === undefined
        ? undefined
        : { id, parent, before: previous.id }
    case 'down':
      return siblings[index + 1] === undefined
        ? undefined
        : { id, parent, before: siblings[index + 2]?.id ?? null }
    case 'indent':
      return previous === undefined || previous.isDisabled
        ? undefined
        : { id, parent: previous.id, before: null }
    case 'outdent': {
      const sourceParent = parent === null ? undefined : locate(items, parent)
      return sourceParent === undefined
        ? undefined
        : {
            id,
            parent: sourceParent.parent,
            before: sourceParent.items[sourceParent.index + 1]?.id ?? null,
          }
    }
  }
}

export const place = <Item extends Node>(
  items: ReadonlyArray<TreeNode<Item>>,
  placement: Placement,
): ReadonlyArray<TreeNode<Item>> => {
  const source = locate(items, placement.id)
  const target =
    placement.parent === null ? undefined : locate(items, placement.parent)
  const moved = source?.items[source.index]
  if (moved === undefined || moved.isDisabled) return items
  if (
    placement.parent !== null &&
    (target === undefined ||
      placement.parent === moved.id ||
      target.ancestors.includes(moved.id))
  )
    return items

  const visit = (
    siblings: ReadonlyArray<TreeNode<Item>>,
    parent: string | null,
  ): ReadonlyArray<TreeNode<Item>> => {
    const next = siblings.flatMap(item => {
      if (item.id === moved.id) return []
      if (item.children === undefined && item.id !== placement.parent)
        return [item]
      const children = visit(item.children ?? [], item.id)
      return [{ ...item, children }]
    })
    if (parent !== placement.parent) return next
    const before = next.findIndex(item => item.id === placement.before)
    next.splice(before < 0 ? next.length : before, 0, moved)
    return next
  }

  return visit(items, null)
}

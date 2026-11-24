/* Ported from Meta Astryx TreeList (packages/core/src/TreeList/ + hooks/useTreeFocus.ts) —
   expansion overrides, roving tabindex, and the APG tree keyboard model
   (arrows, Home/End, Enter/Space activation, 500ms typeahead buffer) adapted
   to foldkit's model/update/command structure. */

import { Effect, Option, Schema as S, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import * as Drag from '@/lib/behaviors/drag'

import * as Parts from '@/lib/behaviors/parts'
import * as TreeReorder from '@/lib/behaviors/tree-reorder'
import * as TreeCollection from '@/lib/behaviors/tree-collection'
import * as Typeahead from '@/lib/behaviors/typeahead'

export type TreeListDensity = 'compact' | 'balanced' | 'spacious'
export type TreeListVariant = 'lineGuides' | 'noGuides'

/** Recursive item configuration, mirroring astryx's `TreeListItemData`.
    `label` is `Html | string` at render time; typeahead matches on
    `typeaheadText` (default: `label` when it is a string).
    `onSelect: true` marks the row actionable (astryx `onClick`): activation
    reports `OutMessage.SelectedItem` for the parent to fold. */
export type TreeListItemData = Readonly<{
  id: string
  label: unknown
  typeaheadText?: string
  description?: string
  startContent?: unknown
  endContent?: unknown
  children?: ReadonlyArray<TreeListItemData>
  onSelect?: boolean
  href?: string
  target?: string
  isDisabled?: boolean
  isSelected?: boolean
  isExpanded?: boolean
}>

export const Model = S.Struct({
  id: S.String,
  /** Per-item expansion override, keyed by item id. Resolution:
      `expanded(item) = overrides[id] ?? item.isExpanded === true` — astryx's
      props-seed + override map. */
  expandedOverrides: S.Record(S.String, S.Boolean),
  /** The roving tab stop's item id. `none` falls back to the seeded tabbable
      item (first selected, else first enabled) — the same repair the DOM
      hook performs on mount. */
  focusedId: S.Option(S.String),
  typeahead: Typeahead.Model,
  treePlacements: S.optional(S.Array(TreeReorder.Placement)),
  treeDraft: S.optional(
    S.Struct({
      id: S.String,
      placements: S.Array(TreeReorder.Placement),
    }),
  ),
})
export type Model = typeof Model.Type

const TypeaheadCandidate = S.Struct({
  id: S.String,
  label: S.String,
  isDisabled: S.Boolean,
  hasChildren: S.Boolean,
  hasInnerAction: S.Boolean,
  isExpanded: S.Boolean,
})

export const Message = defineMessageUnion({
  DroppedTreePointer: { placement: TreeReorder.Placement },
  GrabbedTreeListItem: { id: S.String },
  RepositionedTreeListItem: { placement: TreeReorder.Placement },
  DroppedTreeListItem: {},
  CancelledTreeListReorder: {},
  ToggledTreeListItem: { id: S.String, isExpanded: S.Boolean },
  FocusedTreeListItem: { id: S.String },
  MovedTreeListFocus: { id: S.String },
  PressedTreeListItemAction: { id: S.String },
  RequestedTreeListItemActivation: { id: S.String },
  AppliedTreeListTypeahead: {
    key: S.String,
    candidates: S.Array(TypeaheadCandidate),
  },
  CompletedFocusTreeListItem: {},
  CompletedClickTreeListItemAction: {},
  GotTypeaheadMessage: { message: Typeahead.Message },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  SelectedTreeListItem: { id: S.String },
})
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Readonly<{
  id: string
  expandedIds?: ReadonlyArray<string>
}>

export const init = (config: InitConfig): Model => ({
  id: config.id,
  expandedOverrides: Object.fromEntries(
    (config.expandedIds ?? []).map(id => [id, true]),
  ),
  focusedId: Option.none(),
  typeahead: Typeahead.init(),
})

// ---------------------------------------------------------------------------
// Pure helpers shared by view (resolving keydown intents) and tests.
// ---------------------------------------------------------------------------

export const reorderedItems = (
  items: ReadonlyArray<TreeListItemData>,
  model: Model,
): ReadonlyArray<TreeListItemData> =>
  [
    ...(model.treePlacements ?? []),
    ...(model.treeDraft?.placements ?? []),
  ].reduce((current, placement) => TreeReorder.place(current, placement), items)

const reorderRowSelector = '[data-slot="tree-list-item"]'
const reorderItemSelector = '[role="treeitem"][data-tree-id]'
const treeSelector = '[data-slot="tree-list"]'

export const ObserveTreeReorder = Mount.defineStream('ObserveTreeReorder', {
  messages: [Message.DroppedTreePointer],
  execute: ({ element }) =>
    !(element instanceof HTMLElement)
      ? Stream.empty
      : Drag.observeDrag<typeof Message.DroppedTreePointer.Type>(
          element,
          (down, send) => {
            if (
              !(down.target instanceof Element) ||
              down.pointerType !== 'mouse'
            )
              return
            const row = down.target.closest<HTMLElement>(reorderRowSelector)
            const source = row?.closest<HTMLElement>(reorderItemSelector)
            const id = source?.dataset.treeId
            if (
              row === null ||
              row === undefined ||
              source === undefined ||
              source === null ||
              id === undefined ||
              source.hasAttribute('data-tree-disabled') ||
              row.closest(treeSelector) !== element
            )
              return
            let active = false
            return {
              captureElement: row,
              threshold: Drag.dragThreshold,
              cancelOnEscape: true,
              onStart: () => {
                active = true
              },
              onMove: () => {},
              onEnd: (event, cancelled) => {
                if (!active || cancelled) return
                const targetRow = element.ownerDocument
                  .elementFromPoint(event.clientX, event.clientY)
                  ?.closest<HTMLElement>(reorderRowSelector)
                const target =
                  targetRow?.closest<HTMLElement>(reorderItemSelector)
                const targetId = target?.dataset.treeId
                if (
                  targetRow == null ||
                  target == null ||
                  targetId === undefined ||
                  source.contains(target) ||
                  target.closest(treeSelector) !== element
                )
                  return

                const rect = targetRow.getBoundingClientRect()
                const isMiddle =
                  event.clientY > rect.top + rect.height / 3 &&
                  event.clientY < rect.bottom - rect.height / 3
                const nest =
                  isMiddle && !target.hasAttribute('data-tree-disabled')
                const parent =
                  target.parentElement?.closest<HTMLElement>(
                    reorderItemSelector,
                  )
                const siblings =
                  target.parentElement === null
                    ? []
                    : Parts.elements(
                        target.parentElement,
                        reorderItemSelector,
                        'data-tree-id',
                        { direct: true },
                      )
                const next =
                  siblings[
                    siblings.findIndex(part => part.element === target) + 1
                  ]
                if (
                  !nest &&
                  event.clientY >= rect.top + rect.height / 2 &&
                  next?.element === source
                )
                  return
                send(
                  Message.DroppedTreePointer({
                    placement: {
                      id,
                      parent: nest
                        ? targetId
                        : (parent?.dataset.treeId ?? null),
                      before: nest
                        ? null
                        : event.clientY < rect.top + rect.height / 2
                          ? targetId
                          : (next?.key ?? null),
                    },
                  }),
                )
              },
            }
          },
        ),
})

export const reorderKey = (
  items: ReadonlyArray<TreeListItemData>,
  model: Model,
  key: string,
  modifiers: Readonly<{
    shiftKey: boolean
    ctrlKey: boolean
    altKey: boolean
    metaKey: boolean
  }>,
  direction: 'ltr' | 'rtl',
): Option.Option<Message> => {
  if (modifiers.altKey || modifiers.ctrlKey || modifiers.metaKey)
    return Option.none()
  const draft = model.treeDraft
  if (draft === undefined) {
    const id = Option.getOrUndefined(model.focusedId)
    if (
      key !== ' ' ||
      !modifiers.shiftKey ||
      id === undefined ||
      !visibleItems(items, model).some(
        item => item.id === id && !item.isDisabled,
      )
    )
      return Option.none()
    return Option.some(Message.GrabbedTreeListItem({ id }))
  }
  if (key === 'Escape' || key === 'Tab')
    return key === 'Escape'
      ? Option.some(Message.CancelledTreeListReorder())
      : Option.none()
  if (key === ' ' || key === 'Enter')
    return Option.some(Message.DroppedTreeListItem())
  const movement =
    key === 'ArrowUp'
      ? 'up'
      : key === 'ArrowDown'
        ? 'down'
        : key === 'ArrowRight'
          ? direction === 'rtl'
            ? 'outdent'
            : 'indent'
          : key === 'ArrowLeft'
            ? direction === 'rtl'
              ? 'indent'
              : 'outdent'
            : undefined
  if (movement === undefined) return Option.none()
  const placement = TreeReorder.placementFor(items, draft.id, movement)
  return placement === undefined
    ? Option.some(Message.GrabbedTreeListItem({ id: draft.id }))
    : Option.some(Message.RepositionedTreeListItem({ placement }))
}

export const isItemExpanded = (item: TreeListItemData, model: Model): boolean =>
  model.treeDraft?.placements.some(
    placement => placement.parent === item.id,
  ) === true ||
  (model.expandedOverrides[item.id] ?? item.isExpanded === true)

export const hasChildren = (item: TreeListItemData): boolean =>
  item.children !== undefined && item.children.length > 0

export const isItemActionable = (item: TreeListItemData): boolean =>
  item.href !== undefined || item.onSelect === true

export type VisibleItem = Readonly<{
  id: string
  level: number
  isDisabled: boolean
  isExpanded: boolean
  hasChildren: boolean
  hasInnerAction: boolean
}>

const visibleRows = (items: ReadonlyArray<TreeListItemData>, model: Model) =>
  TreeCollection.visibleTreeRowsBy(
    items,
    item => item.id,
    item => isItemExpanded(item, model),
  )

const toVisibleItem = (
  { item, level }: TreeCollection.TreeRow<string, TreeListItemData>,
  model: Model,
): VisibleItem => ({
  id: item.id,
  level,
  isDisabled: item.isDisabled === true,
  isExpanded: hasChildren(item) && isItemExpanded(item, model),
  hasChildren: hasChildren(item),
  hasInnerAction: isItemActionable(item),
})

/** Items in rendered (visible) order: a parent's children appear only while
    it is expanded — the same list the DOM hook queries via
    `[role="treeitem"]`. */
export const visibleItems = (
  items: ReadonlyArray<TreeListItemData>,
  model: Model,
): ReadonlyArray<VisibleItem> =>
  visibleRows(items, model).map(row => toVisibleItem(row, model))

/** astryx's seed: first selected enabled item in document order, else first
    enabled, else first item. Children walk unconditionally — the seed is
    independent of expansion. */
export const findInitialTabbableId = (
  items: ReadonlyArray<TreeListItemData>,
): string | undefined => {
  let firstEnabled: string | undefined
  const walk = (list: ReadonlyArray<TreeListItemData>): string | undefined => {
    for (const item of list) {
      if (item.isSelected === true && item.isDisabled !== true) {
        return item.id
      }
      if (firstEnabled === undefined && item.isDisabled !== true) {
        firstEnabled = item.id
      }
      if (item.children !== undefined && item.children.length > 0) {
        const selected = walk(item.children)
        if (selected !== undefined) {
          return selected
        }
      }
    }
    return undefined
  }
  return walk(items) ?? firstEnabled ?? items[0]?.id
}

/** The id that carries tabindex=0 this render: the model's focus when it is
    still visible, else the seeded tabbable. */
export const tabbableId = (
  items: ReadonlyArray<TreeListItemData>,
  model: Model,
): string | undefined => {
  const visible = visibleItems(items, model)
  const focused = Option.getOrUndefined(model.focusedId)
  if (focused !== undefined && visible.some(item => item.id === focused)) {
    return focused
  }
  return (
    findInitialTabbableId(items) ?? visible.find(item => !item.isDisabled)?.id
  )
}

const NAVIGATION_KEYS: ReadonlySet<string> = new Set([
  'ArrowDown',
  'ArrowUp',
  'ArrowRight',
  'ArrowLeft',
  'Home',
  'End',
  'Enter',
  ' ',
])

const itemText = (item: TreeListItemData): string =>
  item.typeaheadText ?? (typeof item.label === 'string' ? item.label : '')

export const itemDomId = (treeId: string, itemId: string): string => {
  const separator = '-item-'
  const prefix = treeId + separator
  // Keep legacy IDs when the first separator identifies the tree boundary
  // and the result is outside the framed part namespace.
  if (
    !treeId.startsWith('part:') &&
    !/\s/.test(treeId) &&
    prefix.indexOf(separator) === treeId.length
  ) {
    return prefix + Parts.idPart(itemId)
  }
  return Parts.keyedPartId(treeId, 'item', itemId)
}

export const itemActionDomId = (treeId: string, itemId: string): string =>
  Parts.keyedPartId(treeId, 'action', itemId)

export const itemLabelDomId = (treeId: string, itemId: string): string =>
  Parts.keyedPartId(treeId, 'label', itemId)

export const itemDescriptionDomId = (treeId: string, itemId: string): string =>
  Parts.keyedPartId(treeId, 'description', itemId)

// ---------------------------------------------------------------------------
// Keyboard resolution — pure so the view only ships the resolved intent.
// ---------------------------------------------------------------------------

export type TreeKeyIntent =
  | Readonly<{ _tag: 'move'; id: string }>
  | Readonly<{ _tag: 'toggle'; id: string }>
  | Readonly<{ _tag: 'activate'; id: string }>
  | Readonly<{
      _tag: 'typeahead'
      key: string
      candidates: ReadonlyArray<typeof TypeaheadCandidate.Type>
    }>
  | Readonly<{ _tag: 'none' }>

/** Next enabled item in `dir` order from `start` (clamp, no wrap). */
const enabledFrom = (
  visible: ReadonlyArray<VisibleItem>,
  start: number,
  dir: 1 | -1,
): string | undefined => {
  for (let i = start; i >= 0 && i < visible.length; i += dir) {
    const candidate = visible[i]
    if (candidate !== undefined && !candidate.isDisabled) {
      return candidate.id
    }
  }
  return undefined
}

/** Translates a physical keypress into the resolved intent — the same
    branches as astryx's `useTreeFocus` (clamp at ends, tree semantics on
    ArrowLeft/Right, Enter/Space activation, printable-key typeahead). */
export const resolveKey = (
  items: ReadonlyArray<TreeListItemData>,
  model: Model,
  key: string,
  modifiers: Readonly<{ ctrlKey: boolean; metaKey: boolean; altKey: boolean }>,
  direction: 'ltr' | 'rtl',
): TreeKeyIntent => {
  const visible = visibleRows(items, model).map(row => ({
    ...toVisibleItem(row, model),
    parent: row.parent,
    item: row.item,
  }))
  if (visible.length === 0) {
    return { _tag: 'none' }
  }
  const focused = Option.getOrUndefined(model.focusedId)
  const currentIndex = visible.findIndex(item => item.id === focused)
  const current = currentIndex >= 0 ? visible[currentIndex] : undefined

  if (Typeahead.isTypeaheadKey(key, modifiers)) {
    return {
      _tag: 'typeahead',
      key,
      candidates: visible.map(item => ({
        id: item.id,
        label: itemText(item.item),
        isDisabled: item.isDisabled,
        hasChildren: item.hasChildren,
        hasInnerAction: item.hasInnerAction,
        isExpanded: item.isExpanded,
      })),
    }
  }
  if (!NAVIGATION_KEYS.has(key)) {
    return { _tag: 'none' }
  }

  const logicalKey =
    direction === 'rtl' && (key === 'ArrowLeft' || key === 'ArrowRight')
      ? key === 'ArrowLeft'
        ? 'ArrowRight'
        : 'ArrowLeft'
      : key

  switch (logicalKey) {
    case 'ArrowDown': {
      const target =
        enabledFrom(visible, currentIndex < 0 ? 0 : currentIndex + 1, 1) ??
        focused
      return target === undefined
        ? { _tag: 'none' }
        : { _tag: 'move', id: target }
    }
    case 'ArrowUp': {
      const target =
        enabledFrom(
          visible,
          currentIndex < 0 ? visible.length - 1 : currentIndex - 1,
          -1,
        ) ?? focused
      return target === undefined
        ? { _tag: 'none' }
        : { _tag: 'move', id: target }
    }
    case 'ArrowRight': {
      if (current === undefined) {
        return { _tag: 'none' }
      }
      if (current.hasChildren && !current.isExpanded) {
        return { _tag: 'toggle', id: current.id }
      }
      if (current.isExpanded) {
        const next = visible[currentIndex + 1]
        if (next !== undefined && next.parent === current.id) {
          return { _tag: 'move', id: next.id }
        }
      }
      // Leaf: swallow the key like astryx's preventDefault.
      return { _tag: 'move', id: current.id }
    }
    case 'ArrowLeft': {
      if (current === undefined) {
        return { _tag: 'none' }
      }
      if (current.isExpanded) {
        return { _tag: 'toggle', id: current.id }
      }
      return { _tag: 'move', id: current.parent ?? current.id }
    }
    case 'Home': {
      const target = enabledFrom(visible, 0, 1)
      return target === undefined
        ? { _tag: 'none' }
        : { _tag: 'move', id: target }
    }
    case 'End': {
      const target = enabledFrom(visible, visible.length - 1, -1)
      return target === undefined
        ? { _tag: 'none' }
        : { _tag: 'move', id: target }
    }
    case 'Enter':
    case ' ': {
      if (current === undefined || current.isDisabled) {
        // astryx does not preventDefault on a disabled row.
        return { _tag: 'none' }
      }
      if (current.hasInnerAction) {
        return { _tag: 'activate', id: current.id }
      }
      if (current.hasChildren) {
        return { _tag: 'toggle', id: current.id }
      }
      return { _tag: 'move', id: current.id }
    }
    default:
      return { _tag: 'none' }
  }
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

export const FocusTreeListItem = Command.define('FocusTreeListItem', {
  args: { domId: S.String },
  messages: [Message.CompletedFocusTreeListItem],
  execute: ({ domId }) =>
    Dom.focus(`#${CSS.escape(domId)}`).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedFocusTreeListItem()),
    ),
})

export const ClickTreeListItemAction = Command.define(
  'ClickTreeListItemAction',
  {
    args: { domId: S.String },
    messages: [Message.CompletedClickTreeListItemAction],
    execute: ({ domId }) =>
      Dom.clickElement(`#${CSS.escape(domId)}`).pipe(
        Effect.ignore,
        Effect.as(Message.CompletedClickTreeListItemAction()),
      ),
  },
)

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export type UpdateReturn = Update.ReturnWithOutMessage<
  Model,
  Message,
  OutMessage
>

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'DroppedTreePointer': {
      if (model.treeDraft !== undefined) return { model }
      const { placement } = message
      return {
        model: {
          ...model,
          focusedId: Option.some(placement.id),
          treePlacements: [...(model.treePlacements ?? []), placement],
          expandedOverrides:
            placement.parent === null
              ? model.expandedOverrides
              : { ...model.expandedOverrides, [placement.parent]: true },
        },
        commands: [
          FocusTreeListItem({ domId: itemDomId(model.id, placement.id) }),
        ],
      }
    }
    case 'GrabbedTreeListItem':
      return model.treeDraft === undefined
        ? { model: { ...model, treeDraft: { id: message.id, placements: [] } } }
        : { model }
    case 'RepositionedTreeListItem': {
      const draft = model.treeDraft
      const { placement } = message
      if (draft === undefined || draft.id !== placement.id) return { model }
      return {
        model: {
          ...model,
          treeDraft: { ...draft, placements: [...draft.placements, placement] },
        },
        commands: [FocusTreeListItem({ domId: itemDomId(model.id, draft.id) })],
      }
    }
    case 'DroppedTreeListItem': {
      if (model.treeDraft === undefined) return { model }
      const { treeDraft, ...rest } = model
      return {
        model: {
          ...rest,
          expandedOverrides: {
            ...rest.expandedOverrides,
            ...Object.fromEntries(
              treeDraft.placements.flatMap(placement =>
                placement.parent === null ? [] : [[placement.parent, true]],
              ),
            ),
          },
          treePlacements: [
            ...(model.treePlacements ?? []),
            ...treeDraft.placements,
          ],
        },
      }
    }
    case 'CancelledTreeListReorder': {
      if (model.treeDraft === undefined) return { model }
      const { treeDraft, ...rest } = model
      return {
        model: rest,
        commands: [
          FocusTreeListItem({ domId: itemDomId(model.id, treeDraft.id) }),
        ],
      }
    }
    case 'ToggledTreeListItem': {
      const next = { ...model.expandedOverrides }
      // `isExpanded` carries the resolved next value — the view computed it
      // against the item seed, so the model only records the override.
      next[message.id] = message.isExpanded
      return { model: { ...model, expandedOverrides: next } }
    }
    case 'FocusedTreeListItem':
      return {
        model: { ...model, focusedId: Option.some(message.id) },
      }
    case 'MovedTreeListFocus':
      return {
        model: { ...model, focusedId: Option.some(message.id) },
        commands: [
          FocusTreeListItem({ domId: itemDomId(model.id, message.id) }),
        ],
      }
    case 'PressedTreeListItemAction':
      return {
        model,
        outMessage: OutMessage.SelectedTreeListItem({ id: message.id }),
      }
    case 'RequestedTreeListItemActivation':
      // Forwards to the item's own inner action element — astryx's
      // `activateItem` clicks the row's `a[href]`/`button`; a selectable
      // row's inner button re-enters as PressedTreeListItemAction.
      return {
        model,
        commands: [
          ClickTreeListItemAction({
            domId: itemActionDomId(model.id, message.id),
          }),
        ],
      }
    case 'AppliedTreeListTypeahead': {
      const focusedId = Option.getOrUndefined(model.focusedId)
      const currentIndex = message.candidates.findIndex(
        item => item.id === focusedId,
      )
      if (message.key === ' ' && !Typeahead.isActive(model.typeahead)) {
        const current = message.candidates[currentIndex]
        if (current === undefined || current.isDisabled) return { model }
        if (current.hasInnerAction) {
          return update(
            model,
            Message.RequestedTreeListItemActivation({ id: current.id }),
          )
        }
        if (current.hasChildren) {
          return update(
            model,
            Message.ToggledTreeListItem({
              id: current.id,
              isExpanded: !(
                model.expandedOverrides[current.id] ?? current.isExpanded
              ),
            }),
          )
        }
        return update(model, Message.MovedTreeListFocus({ id: current.id }))
      }
      const next = Typeahead.search(model.typeahead, {
        key: message.key,
        labels: message.candidates.map(item => item.label),
        currentIndex,
        isDisabled: index => message.candidates[index]?.isDisabled === true,
      })
      const matchedId = Option.flatMap(next.maybeIndex, index =>
        Option.fromUndefinedOr(message.candidates[index]?.id),
      )
      return {
        model: {
          ...model,
          typeahead: next.model,
          focusedId: Option.match(matchedId, {
            onNone: () => model.focusedId,
            onSome: id => Option.some(id),
          }),
        },
        commands: [
          ...Command.mapMessages(next.commands, child =>
            Message.GotTypeaheadMessage({ message: child }),
          ),
          ...Option.match(matchedId, {
            onNone: (): Array<ReturnType<typeof FocusTreeListItem>> => [],
            onSome: id => [
              FocusTreeListItem({ domId: itemDomId(model.id, id) }),
            ],
          }),
        ],
      }
    }
    case 'GotTypeaheadMessage': {
      const next = Typeahead.update(model.typeahead, message.message)
      return {
        model: { ...model, typeahead: next.model },
        commands: Command.mapMessages(next.commands, child =>
          Message.GotTypeaheadMessage({ message: child }),
        ),
      }
    }
    case 'CompletedFocusTreeListItem':
    case 'CompletedClickTreeListItemAction':
      return { model }
  }
}

import { Option } from 'effect';

export type MenuModel = Readonly<{
  id: string;
  isOpen: boolean;
  isAnimated: boolean;
  isModal: boolean;
  /** Path of the highlighted item as index segments ([i] at root level,
   * [i, j] inside the open submenu at i). Empty while nothing is highlighted —
   * mouse opens start unhighlighted, keyboard opens highlight an item. */
  activePath: ReadonlyArray<number>;
  /** Path of the deepest open submenu trigger ([] at root level). Every
   * trigger whose own path is a prefix of this renders its panel, so
   * arbitrarily nested submenus stay expanded along the chain. */
  openSubmenuPath: ReadonlyArray<number>;
  /** Accumulated typeahead query of the current typing session (Base UI's
   * stringRef; sessions have no timer here — they last for the open state). */
  typeaheadQuery: string;
  /** Sibling index the current typeahead session searches from (Base UI's
   * prevIndexRef: the active item when the session began, or the last match
   * after a same-letter reset). Ignored while typeaheadQuery is empty. */
  typeaheadAnchorIndex: number;
  anchorX: Option.Option<number>;
  anchorY: Option.Option<number>;
}>;

export type MenuMessage =
  | Readonly<{ _tag: 'Opened' }>
  | Readonly<{ _tag: 'OpenedToItem'; index: number }>
  | Readonly<{ _tag: 'AnchoredAt'; x: number; y: number }>
  | Readonly<{ _tag: 'OpenedFromContext' }>
  | Readonly<{ _tag: 'OpenedAt'; x: number; y: number }>
  | Readonly<{ _tag: 'Closed' }>
  | Readonly<{ _tag: 'ActivatedItem'; path: ReadonlyArray<number> }>
  | Readonly<{ _tag: 'OpenedSubmenu'; path: ReadonlyArray<number> }>
  | Readonly<{ _tag: 'ClosedSubmenu' }>
  | Readonly<{
      _tag: 'SelectedItem';
      item: string;
      path: ReadonlyArray<number>;
      closeOnClick: boolean;
    }>
  | Readonly<{
      _tag: 'Typeahead';
      query: string;
      anchorIndex: number;
      matchedPath: ReadonlyArray<number>;
    }>;

export type Selection = Readonly<{ item: string; index: number }>;

export type UpdateResult = Readonly<{
  model: MenuModel;
  selection: Option.Option<Selection>;
}>;

const noSelection = (model: MenuModel): UpdateResult => ({
  model,
  selection: Option.none(),
});

const openModel = (model: MenuModel): MenuModel => ({
  ...model,
  isOpen: true,
  activePath: [],
  openSubmenuPath: [],
  typeaheadQuery: '',
  typeaheadAnchorIndex: -1,
  anchorX: Option.none(),
  anchorY: Option.none(),
});

const closeModel = (model: MenuModel): MenuModel => ({
  ...model,
  isOpen: false,
  openSubmenuPath: [],
  typeaheadQuery: '',
  typeaheadAnchorIndex: -1,
  anchorX: Option.none(),
  anchorY: Option.none(),
});

const resetTypeahead = (model: MenuModel): MenuModel => ({
  ...model,
  typeaheadQuery: '',
  typeaheadAnchorIndex: -1,
});

/** Longest common index-prefix: the submenu chain that stays open when the
 * highlight moves to `path` (siblings of an open trigger close it). */
const commonPrefix = (
  a: ReadonlyArray<number>,
  b: ReadonlyArray<number>,
): ReadonlyArray<number> => {
  const shared: Array<number> = [];
  for (let i = 0; i < a.length && i < b.length; i += 1) {
    if (a[i] !== b[i]) break;
    shared.push(a[i] as number);
  }
  return shared;
};

export const update = (
  model: MenuModel,
  message: MenuMessage,
): UpdateResult => {
  switch (message._tag) {
    case 'Opened':
      return noSelection(openModel(model));
    case 'OpenedToItem':
      return noSelection({
        ...openModel(model),
        activePath: [message.index],
      });
    case 'AnchoredAt':
      return noSelection({
        ...model,
        anchorX: Option.some(message.x),
        anchorY: Option.some(message.y),
      });
    case 'OpenedFromContext':
      // The contextmenu gesture arrives after pointerdown recorded the
      // anchor — opening must not clear it.
      return noSelection({
        ...openModel(model),
        anchorX: model.anchorX,
        anchorY: model.anchorY,
      });
    case 'OpenedAt':
      return noSelection({
        ...openModel(model),
        anchorX: Option.some(message.x),
        anchorY: Option.some(message.y),
      });
    case 'Closed':
      return noSelection(closeModel(model));
    case 'ActivatedItem':
      return message.path.length === 0
        ? noSelection(model)
        : noSelection({
            ...resetTypeahead(model),
            activePath: message.path,
            openSubmenuPath: commonPrefix(model.openSubmenuPath, message.path),
          });
    case 'OpenedSubmenu':
      return message.path.length === 0
        ? noSelection(model)
        : noSelection({
            ...resetTypeahead(model),
            openSubmenuPath: message.path,
            activePath: [...message.path, 0],
          });
    case 'ClosedSubmenu':
      return model.openSubmenuPath.length === 0
        ? noSelection(model)
        : noSelection({
            ...resetTypeahead(model),
            activePath: model.openSubmenuPath,
            openSubmenuPath: model.openSubmenuPath.slice(0, -1),
          });
    case 'SelectedItem':
      return {
        model: message.closeOnClick ? closeModel(model) : resetTypeahead(model),
        selection: Option.some({
          item: message.item,
          index: message.path.at(-1) ?? 0,
        }),
      };
    case 'Typeahead':
      return noSelection({
        ...model,
        typeaheadQuery: message.query,
        typeaheadAnchorIndex: message.anchorIndex,
        ...(message.matchedPath.length === 0
          ? {}
          : { activePath: message.matchedPath }),
      });
  }
};

export type MenuItemBehavior<Item extends string = string> = Readonly<{
  label: string;
  isDisabled: boolean;
  /** Whether activating this leaf closes the menu tree (Base UI's
   * closeOnClick: true for items, false for checkable items). */
  closeOnClick: boolean;
  submenu?: Readonly<{
    items: ReadonlyArray<Item>;
    itemToBehavior: (item: Item) => MenuItemBehavior<Item>;
  }>;
}>;

/** Follows `openSubmenuPath` into the nested behavior tree and returns the
 * item list + mapper of the deepest open level — the scope all navigation
 * and typeahead keys act on. */
const resolveScope = <Item extends string>(
  items: ReadonlyArray<Item>,
  itemToBehavior: (item: Item) => MenuItemBehavior<Item>,
  scopePath: ReadonlyArray<number>,
):
  | Readonly<{
      items: ReadonlyArray<Item>;
      itemToBehavior: (item: Item) => MenuItemBehavior<Item>;
    }>
  | undefined => {
  let scopeItems = items;
  let scopeToBehavior = itemToBehavior;
  for (const segment of scopePath) {
    const parent = scopeItems[segment];
    if (parent === undefined) return undefined;
    const submenu = scopeToBehavior(parent).submenu;
    if (submenu === undefined) return undefined;
    scopeItems = submenu.items;
    scopeToBehavior = submenu.itemToBehavior;
  }
  return { items: scopeItems, itemToBehavior: scopeToBehavior };
};

export const keyMessage = <Item extends string>(
  model: MenuModel,
  items: ReadonlyArray<Item>,
  itemToBehavior: (item: Item) => MenuItemBehavior<Item>,
  key: string,
  direction: 'ltr' | 'rtl' = 'ltr',
  modifiers?: Readonly<{ ctrlKey: boolean; altKey: boolean; metaKey: boolean }>,
): MenuMessage | undefined => {
  const forwardKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const backKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

  const scopePath = model.openSubmenuPath;
  const scope = resolveScope(items, itemToBehavior, scopePath);
  if (scope === undefined) return undefined;
  const count = scope.items.length;

  if (key === 'Escape')
    return scopePath.length === 0
      ? { _tag: 'Closed' }
      : { _tag: 'ClosedSubmenu' };
  if (key === backKey) return { _tag: 'ClosedSubmenu' };
  if (count === 0) return undefined;
  if (key === 'Home') return { _tag: 'ActivatedItem', path: [...scopePath, 0] };
  if (key === 'End')
    return { _tag: 'ActivatedItem', path: [...scopePath, count - 1] };
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    const delta = key === 'ArrowDown' ? 1 : -1;
    const lastSegment = model.activePath.at(-1);
    // The highlight only participates in this scope when it sits exactly one
    // level below it; anything else (no highlight, stale path) is "none".
    const activeIndex =
      model.activePath.length === scopePath.length + 1 &&
      lastSegment !== undefined
        ? lastSegment
        : -1;
    // Disabled items stay in the arrow-key rotation — Base UI navigates
    // focusableWhenDisabled (aria-disabled) items too.
    const next =
      activeIndex === -1
        ? delta > 0
          ? 0
          : count - 1
        : ((activeIndex >= count ? 0 : activeIndex) + delta + count) % count;
    return { _tag: 'ActivatedItem', path: [...scopePath, next] };
  }

  const lastSegment = model.activePath.at(-1);
  const activeIndex =
    model.activePath.length === scopePath.length + 1 &&
    lastSegment !== undefined &&
    lastSegment >= 0 &&
    lastSegment < count
      ? lastSegment
      : -1;
  const activeItem =
    activeIndex === -1 ? undefined : scope.items[activeIndex];
  const activeBehavior =
    activeItem === undefined ? undefined : scope.itemToBehavior(activeItem);

  if (key === forwardKey) {
    return activeBehavior !== undefined &&
      activeBehavior.submenu !== undefined &&
      !activeBehavior.isDisabled
      ? { _tag: 'OpenedSubmenu', path: model.activePath }
      : undefined;
  }

  // Enter always activates the highlighted item; Space does too, unless a
  // typeahead session is in flight where it keeps accumulating instead.
  if (key === 'Enter' || (key === ' ' && model.typeaheadQuery === '')) {
    if (activeItem === undefined || activeBehavior === undefined)
      return undefined;
    if (activeBehavior.isDisabled)
      // The key is consumed but activation of a disabled item is a no-op.
      return { _tag: 'ActivatedItem', path: model.activePath };
    if (activeBehavior.submenu !== undefined)
      return { _tag: 'OpenedSubmenu', path: model.activePath };
    return {
      _tag: 'SelectedItem',
      item: activeItem,
      path: model.activePath,
      closeOnClick: activeBehavior.closeOnClick,
    };
  }

  // Accumulating typeahead (Base UI's useTypeahead): single printable
  // characters only; every one is consumed while the menu is open.
  if (
    [...key].length !== 1 ||
    modifiers?.ctrlKey === true ||
    modifiers?.altKey === true ||
    modifiers?.metaKey === true
  )
    return undefined;

  const candidates = scope.items
    .map((item, index) => ({ index, behavior: scope.itemToBehavior(item) }))
    .filter((entry) => !entry.behavior.isDisabled);
  if (candidates.length === 0) return undefined;

  const isNewSession = model.typeaheadQuery === '';
  let query = model.typeaheadQuery;
  let anchor = isNewSession ? activeIndex : model.typeaheadAnchorIndex;

  // Base UI's rapid-succession cycle: when no label repeats its first letter
  // as its second, retyping the same first letter restarts the query from the
  // last match instead of accumulating it.
  const allowRapidSuccession = candidates.every(({ behavior }) => {
    const label = behavior.label;
    return (label[0]?.toLowerCase() ?? '') !== (label[1]?.toLowerCase() ?? '');
  });
  if (allowRapidSuccession && query === key) {
    query = '';
    anchor = activeIndex;
  }
  const nextQuery = query + key;

  const startIndex = anchor + 1;
  const lowerQuery = nextQuery.toLocaleLowerCase();
  const match = [
    ...candidates.filter((entry) => entry.index >= startIndex),
    ...candidates.filter((entry) => entry.index < startIndex),
  ].find((entry) =>
    entry.behavior.label.trim().toLocaleLowerCase().startsWith(lowerQuery),
  );

  if (match === undefined)
    // A non-space miss clears the accumulator; a space miss keeps growing it.
    return {
      _tag: 'Typeahead',
      query: key === ' ' ? nextQuery : '',
      anchorIndex: anchor,
      matchedPath: [],
    };
  return {
    _tag: 'Typeahead',
    query: nextQuery,
    anchorIndex: anchor,
    matchedPath: [...scopePath, match.index],
  };
};

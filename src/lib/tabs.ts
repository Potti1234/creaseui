import { Option } from 'effect'
import type {
  Attribute,
  ChildAttribute,
  HtmlBuilder,
  KeyboardModifiers,
} from 'foldkit/html'
import { Tabs as TabsPrimitive } from '@foldkit/ui'

export type Message = typeof TabsPrimitive.Message.Type
export type Model = typeof TabsPrimitive.Model.Type

const childAttributeTag = (attribute: ChildAttribute): string | undefined => {
  const value = attribute.attribute
  return typeof value === 'object' && value !== null && '_tag' in value &&
      typeof value._tag === 'string'
    ? value._tag
    : undefined
}

const wrapIndex = (index: number, length: number): number =>
  ((index % length) + length) % length

const firstEnabledIndex = (
  tabCount: number,
  isDisabledAt: (index: number) => boolean,
): number => {
  for (let index = 0; index < tabCount; index += 1) {
    if (!isDisabledAt(index)) return index
  }
  return 0
}

/** The index holding the roving tab stop, mirroring Base UI's composite
 *  highlight: explicit keyboard navigation wins and may rest on a
 *  disabled tab; a missing selection falls back to the first tab; a
 *  disabled selection leaves the stop on the first enabled tab so focus
 *  never strands on a tab that cannot activate. */
export const focusedTabIndex = (args: {
  readonly maybeFocusedIndex: Option.Option<number>
  readonly activeIndex: number
  readonly tabCount: number
  readonly selectedExists: boolean
  readonly isDisabledAt: (index: number) => boolean
}): number =>
  Option.getOrElse(
    Option.filter(
      args.maybeFocusedIndex,
      (index) => index >= 0 && index < args.tabCount,
    ),
    () =>
      args.selectedExists && args.isDisabledAt(args.activeIndex)
        ? firstEnabledIndex(args.tabCount, args.isDisabledAt)
        : args.activeIndex,
  )

/** Keydown to Message mapping mirroring Base UI's composite: a modifier
 *  key suppresses navigation entirely; arrows, Home, and End move the
 *  highlight onto disabled tabs without activating them; enabled tabs
 *  commit under Automatic activation and only highlight under Manual;
 *  Enter and Space commit an enabled highlighted tab that is not already
 *  selected. */
export const tabKeyDown = <Value extends string>(args: {
  readonly tabs: ReadonlyArray<Value>
  readonly focusedIndex: number
  readonly activeIndex: number
  readonly activationMode: TabsPrimitive.ActivationMode
  readonly orientation: TabsPrimitive.Orientation
  readonly isDisabledAt: (index: number) => boolean
}): ((
  key: string,
  modifiers: KeyboardModifiers,
) => Option.Option<Message>) => {
  const { nextKey, previousKey } =
    args.orientation === 'Vertical'
      ? { nextKey: 'ArrowDown', previousKey: 'ArrowUp' }
      : { nextKey: 'ArrowRight', previousKey: 'ArrowLeft' }
  const navigationKeys: ReadonlyArray<string> = [
    nextKey,
    previousKey,
    'Home',
    'End',
    'PageUp',
    'PageDown',
  ]
  const selectedAt = (index: number): Option.Option<Message> => {
    const value = args.tabs[index]
    return value === undefined
      ? Option.none()
      : Option.some(TabsPrimitive.Message.SelectedTab({ index, value }))
  }
  const resolveNavigationIndex = (key: string): number =>
    key === nextKey
      ? wrapIndex(args.focusedIndex + 1, args.tabs.length)
      : key === previousKey
        ? wrapIndex(args.focusedIndex - 1, args.tabs.length)
        : key === 'Home' || key === 'PageUp'
          ? 0
          : key === 'End' || key === 'PageDown'
            ? args.tabs.length - 1
            : args.focusedIndex

  return (key, modifiers) => {
    if (navigationKeys.includes(key)) {
      const hasModifier =
        modifiers.shiftKey ||
        modifiers.ctrlKey ||
        modifiers.altKey ||
        modifiers.metaKey
      if (args.tabs.length === 0 || hasModifier) return Option.none()
      const target = resolveNavigationIndex(key)
      if (target === args.focusedIndex) return Option.none()
      return args.isDisabledAt(target) || args.activationMode === 'Manual'
        ? Option.some(TabsPrimitive.Message.FocusedTab({ index: target }))
        : selectedAt(target)
    }
    if (key === 'Enter' || key === ' ') {
      return args.isDisabledAt(args.focusedIndex) ||
        args.focusedIndex === args.activeIndex
        ? Option.none()
        : selectedAt(args.focusedIndex)
    }
    return Option.none()
  }
}

const replacedTriggerTags = new Set(['Tabindex', 'OnKeyDownPreventDefault'])

/** The trigger attribute bundle with Base UI semantics layered over the
 *  primitive's: the roving tab stop and the keydown map come from
 *  {@link focusedTabIndex} and {@link tabKeyDown}; a disabled tab is
 *  focusable (`aria-disabled`, no `disabled`, no click handler) like
 *  Base UI's focusableWhenDisabled; clicking the already-active tab only
 *  refocuses it and never re-commits the selection. */
export const triggerAttributes = <Msg>(
  h: HtmlBuilder<Msg>,
  args: {
    readonly attributes: ReadonlyArray<ChildAttribute>
    readonly index: number
    readonly isFocusedStop: boolean
    readonly isDisabled: boolean
    readonly isActive: boolean
    readonly keyDown: (
      key: string,
      modifiers: KeyboardModifiers,
    ) => Option.Option<Message>
    readonly toParentMessage: (message: Message) => Msg
  },
): ReadonlyArray<Attribute<Msg> | ChildAttribute> => [
  ...args.attributes.filter((attribute) => {
    const tag = childAttributeTag(attribute) ?? ''
    return (
      !replacedTriggerTags.has(tag) &&
      !(tag === 'OnClick' && (args.isDisabled || args.isActive))
    )
  }),
  h.Tabindex(args.isFocusedStop ? 0 : -1),
  h.OnKeyDownPreventDefault((key, modifiers) =>
    Option.map(args.keyDown(key, modifiers), args.toParentMessage)),
  ...(args.isDisabled
    ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
    : args.isActive
      ? [
          h.OnClick(
            args.toParentMessage(
              TabsPrimitive.Message.FocusedTab({ index: args.index }),
            ),
          ),
        ]
      : []),
]

/** Base UI only emits `aria-orientation` on a vertical tablist —
 *  horizontal is the implicit default, so the attribute is dropped for
 *  horizontal tablists. */
export const tablistAttributes = (
  tablist: ReadonlyArray<ChildAttribute>,
  orientation: 'horizontal' | 'vertical',
): ReadonlyArray<ChildAttribute> =>
  orientation === 'vertical'
    ? tablist
    : tablist.filter(
        (attribute) => childAttributeTag(attribute) !== 'AriaOrientation',
      )

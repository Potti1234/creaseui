import { Option } from 'effect'
import { Command } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import { describe, it } from 'vitest'

import { Combobox as ComboboxPrimitive } from '@foldkit/ui'

import * as StyleXCombobox from '@/stylex/combobox'
import * as TailwindCombobox from '@/ui/combobox'

/**
 * Behavioral parity suite ported from Base UI's combobox tests
 * (base-ui/packages/react/src/combobox/{root,input,trigger,item}/*.test.tsx,
 * checked at base-ui HEAD).
 *
 * creaseui's combobox is a config-driven view over foldkit's Combobox
 * primitive: the input always lives outside the popup, the optional
 * `trigger` prop renders foldkit's toggle button, items are a plain array
 * projected through itemToValue/itemToLabel/itemToConfig, filtering is the
 * built-in case-insensitive "contains" match on label/searchText, and the
 * parent owns the selection via the Selected/ClearedSelection OutMessages.
 *
 * Base UI cases with no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - `render=` prop / custom element substitution, React StrictMode, React 17,
 *    contexts, store internals, collection parsers (React implementation
 *    details, no DOM concept in the DSL)
 *  - portals/positioner/arrow geometry and popup transitions (no layout or
 *    timers in the DSL — e2e covers motion)
 *  - onValueChange/onInputValueChange payloads, `reason` fields and
 *    `cancel()` — foldkit emits tagged OutMessages instead of event details
 *  - chips suite (Combobox.Chips/Chip/ChipRemove) and the Value, ItemIndicator,
 *    Empty, Status, Label, InputGroup, Icon, GroupLabel parts — none exist in
 *    the creaseui API
 *  - grid mode, virtualized items, the `limit` prop, `filteredItems`
 *    controlled filtering, `inline` mode, `keepMounted`
 *  - Field/Form validation integration, autofill, IME composition, drag
 *    selection, touch scroll-lock, Tab-out focus management
 *  - `itemToStringLabel`/`itemToStringValue` — covered by the
 *    itemToValue/itemToLabel + itemToConfig.searchText projection
 *  - number/non-string values — creaseui projects every item to a string
 *    value before handing it to the foldkit primitive
 */

type Fruit = Readonly<{
  value: string
  label: string
  group?: string
  disabled?: boolean
  searchText?: string
}>

const FRUITS: ReadonlyArray<Fruit> = [
  { value: 'apple', label: 'apple' },
  { value: 'banana', label: 'banana' },
  { value: 'cherry', label: 'cherry' },
]

const FRUITS_WITH_DISABLED: ReadonlyArray<Fruit> = [
  { value: 'apple', label: 'apple' },
  { value: 'banana', label: 'banana', disabled: true },
  { value: 'cherry', label: 'cherry' },
]

const SEARCHABLE: ReadonlyArray<Fruit> = [
  { value: 'apple', label: 'apple', searchText: 'red pomme' },
  { value: 'banana', label: 'banana', searchText: 'yellow tropical' },
  { value: 'cherry', label: 'cherry', searchText: 'red stone fruit' },
]

const PRODUCE: ReadonlyArray<Fruit> = [
  { value: 'apple', label: 'apple', group: 'fruit' },
  { value: 'banana', label: 'banana', group: 'fruit' },
  { value: 'carrot', label: 'carrot', group: 'vegetable' },
  { value: 'celery', label: 'celery', group: 'vegetable' },
]

type Model = Readonly<{
  combobox: TailwindCombobox.Model
  multi: TailwindCombobox.MultiModel
  maybeValue: Option.Option<string>
  selectedValues: ReadonlyArray<string>
  autoHighlight: boolean
}>

type Message = Readonly<
  | { _tag: 'GotComboboxMessage'; message: TailwindCombobox.Message }
  | { _tag: 'GotMultiMessage'; message: TailwindCombobox.Message }
>

const toComboboxMessage = (message: TailwindCombobox.Message): Message => ({
  _tag: 'GotComboboxMessage',
  message,
})

const toMultiMessage = (message: TailwindCombobox.Message): Message => ({
  _tag: 'GotMultiMessage',
  message,
})

const initModel = (
  overrides?: Partial<
    Pick<
      Model,
      'combobox' | 'multi' | 'maybeValue' | 'selectedValues' | 'autoHighlight'
    >
  >,
): Model => ({
  combobox: overrides?.combobox ?? TailwindCombobox.init({ id: 'fruit' }),
  multi: overrides?.multi ?? TailwindCombobox.multiInit({ id: 'fruit-multi' }),
  maybeValue: overrides?.maybeValue ?? Option.none(),
  selectedValues: overrides?.selectedValues ?? [],
  autoHighlight: overrides?.autoHighlight ?? false,
})

const itemToValue = (item: Fruit) => item.value
const itemToLabel = (item: Fruit) => item.label
const itemToConfig = (item: Fruit): TailwindCombobox.ComboboxItemConfig => ({
  ...(item.searchText === undefined ? {} : { searchText: item.searchText }),
  ...(item.disabled === undefined ? {} : { isDisabled: item.disabled }),
})

const restingLabel = (
  items: ReadonlyArray<Fruit>,
  maybeValue: Option.Option<string>,
): string =>
  Option.match(maybeValue, {
    onNone: () => '',
    onSome: value => items.find(item => item.value === value)?.label ?? value,
  })

type ComboboxModule = Readonly<{
  create: typeof TailwindCombobox.create
  createMulti: typeof TailwindCombobox.createMulti
}>

const input = Scene.role('combobox')
const listbox = Scene.role('listbox')
const option = (name: string) => Scene.role('option', { name })
const allOptions = Scene.all.role('option')
const toggle = Scene.selector('#fruit-button')
const backdrop = Scene.selector('#fruit-backdrop')
const root = Scene.selector('[data-slot="command"]')
const hiddenInput = Scene.selector('input[type="hidden"]')
const allHiddenInputs = Scene.all.selector('input[type="hidden"]')
const allGroups = Scene.all.role('group')

// The items panel mounts two resources when it appears (floating anchor +
// portaled backdrop) and unmounts them when it disappears. The toggle button
// mounts a blur-prevent listener with the initial render.
const resolveOpenedMounts = [
  Scene.Mount.resolve(
    ComboboxPrimitive.AnchorCombobox,
    ComboboxPrimitive.Message.CompletedAnchorCombobox(),
  ),
  Scene.Mount.resolve(
    ComboboxPrimitive.PortalComboboxBackdrop,
    ComboboxPrimitive.Message.CompletedPortalComboboxBackdrop(),
  ),
]
const resolveToggleMount = Scene.Mount.resolve(
  ComboboxPrimitive.AttachComboboxPreventBlur,
  ComboboxPrimitive.Message.CompletedAttachComboboxPreventBlur(),
)
// NOTE: expectEnded consumes its matcher list per call, so this is a
// factory — every scene needs a fresh step.
const expectPanelUnmounted = () =>
  Scene.Mount.expectEnded(
    ComboboxPrimitive.AnchorCombobox,
    ComboboxPrimitive.PortalComboboxBackdrop,
  )
const resolveFocusInput = Scene.Command.resolve(
  ComboboxPrimitive.FocusInput,
  ComboboxPrimitive.Message.CompletedFocusInput(),
)
const resolveScrollIntoView = Scene.Command.resolve(
  ComboboxPrimitive.ScrollIntoView,
  ComboboxPrimitive.Message.CompletedScrollIntoView(),
)
const resolveClickItem = Scene.Command.resolve(
  ComboboxPrimitive.ClickItem,
  ComboboxPrimitive.Message.CompletedClickItem(),
)

const verifyRenderer = (name: string, Combobox: ComboboxModule) => {
  const Single = Combobox.create<string>()
  const SingleAutoHighlight = Combobox.create<string>({ autoHighlight: true })
  const Multi = Combobox.createMulti<string>()

  const update = (model: Model, message: Message) => {
    switch (message._tag) {
      case 'GotComboboxMessage': {
        const bundle = model.autoHighlight ? SingleAutoHighlight : Single
        const next = bundle.update(model.combobox, message.message)
        const maybeValue = Option.match(Option.fromNullishOr(next.outMessage), {
          onNone: () => model.maybeValue,
          onSome: out =>
            out._tag === 'Selected'
              ? Option.some(out.value)
              : Option.none<string>(),
        })
        return {
          model: { ...model, combobox: next.model, maybeValue },
          commands: Command.mapMessages(next.commands ?? [], toComboboxMessage),
          outMessage: next.outMessage,
        }
      }
      case 'GotMultiMessage': {
        const next = Multi.update(model.multi, message.message)
        const selectedValues = Option.match(
          Option.fromNullishOr(next.outMessage),
          {
            onNone: () => model.selectedValues,
            onSome: out =>
              out._tag === 'Selected'
                ? model.selectedValues.includes(out.value)
                  ? model.selectedValues.filter(value => value !== out.value)
                  : [...model.selectedValues, out.value]
                : model.selectedValues,
          },
        )
        return {
          model: { ...model, multi: next.model, selectedValues },
          commands: Command.mapMessages(next.commands ?? [], toMultiMessage),
          outMessage: next.outMessage,
        }
      }
    }
  }

  const singleView =
    (
      bundle: typeof Single,
      items: ReadonlyArray<Fruit>,
      extra?: Partial<TailwindCombobox.ComboboxProps<Fruit, string, Message>>,
    ) =>
    (model: Model, h: HtmlBuilder<Message>) =>
      bundle.combobox(
        {
          model: model.combobox,
          maybeSelectedValue: model.maybeValue,
          restingInputValue: restingLabel(items, model.maybeValue),
          toParentMessage: toComboboxMessage,
          items,
          itemToValue,
          itemToLabel,
          itemToConfig,
          ...extra,
        },
        h,
      )

  const multiView =
    (
      items: ReadonlyArray<Fruit>,
      extra?: Partial<
        TailwindCombobox.ComboboxMultiProps<Fruit, string, Message>
      >,
    ) =>
    (model: Model, h: HtmlBuilder<Message>) =>
      Multi.comboboxMulti(
        {
          model: model.multi,
          selectedValues: model.selectedValues,
          toParentMessage: toMultiMessage,
          items,
          itemToValue,
          itemToLabel,
          itemToConfig,
          ...extra,
        },
        h,
      )

  describe(`${name} Combobox (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('wires the input and listbox together while closed', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.expect(input).toHaveAttr('role', 'combobox'),
          Scene.expect(input).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(input).toHaveAttr('aria-haspopup', 'listbox'),
          Scene.expect(input).toHaveAttr('aria-autocomplete', 'list'),
          Scene.expect(input).toHaveAttr('autocomplete', 'off'),
          Scene.expect(input).not.toHaveAttr('aria-controls'),
          Scene.expect(input).not.toHaveAttr('aria-activedescendant'),
          Scene.expect(listbox).toBeAbsent(),
        )
      })

      it('links the open popup with aria-expanded, aria-controls and aria-labelledby', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(input).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(input).toHaveAttr('aria-controls', 'fruit-items'),
          Scene.expect(listbox).toHaveAttr('aria-labelledby', 'fruit-input'),
          Scene.expect(listbox).toHaveAttr('tabIndex', '-1'),
        )
      })

      it('exposes the input label through the ariaLabel prop', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, { ariaLabel: 'Pick a fruit' }),
          },
          Scene.given(initModel()),
          Scene.expect(input).toHaveAccessibleName('Pick a fruit'),
          Scene.expect(input).toHaveAttr('aria-label', 'Pick a fruit'),
        )
      })

      it('exposes the input label through the ariaLabelledBy prop', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div(
                [],
                [
                  h.span([h.Id('fruit-label')], ['Pick a fruit']),
                  singleView(Single, FRUITS, {
                    ariaLabelledBy: 'fruit-label',
                  })(model, h),
                ],
              ),
          },
          Scene.given(initModel()),
          Scene.expect(input).toHaveAccessibleName('Pick a fruit'),
          Scene.expect(input).toHaveAttr('aria-labelledby', 'fruit-label'),
        )
      })

      it('marks the input aria-invalid and data-invalid when invalid', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, { isInvalid: true }),
          },
          Scene.given(initModel()),
          Scene.expect(input).toHaveAttr('aria-invalid', 'true'),
          Scene.expect(input).toHaveAttr('data-invalid', ''),
          Scene.expect(root).toHaveAttr('data-invalid', ''),
        )
      })

      it('shows placeholder text on the empty input', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, {
              placeholder: 'Pick a fruit…',
            }),
          },
          Scene.given(initModel()),
          Scene.expect(input).toHaveAttr('placeholder', 'Pick a fruit…'),
        )
      })
    })

    describe('opening and closing the popup', () => {
      it('opens the popup when the input is focused', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          // foldkit opens on focus (`openOnFocus: true`); the scene DSL has no
          // input click to drive `openOnInputClick`.
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(listbox).toExist(),
          Scene.expect(input).toHaveAttr('data-open', ''),
          Scene.expect(root).toHaveAttr('data-open', ''),
          Scene.expect(input).not.toHaveAttr('aria-activedescendant'),
        )
      })

      // DIVERGENCE: Base UI does not open on focus alone — a Tab-focus leaves
      // the popup closed until a click or keystroke; creaseui hardcodes
      // openOnFocus: true, so focusing the input opens it.
      it.fails('does not open the popup on focus alone', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          Scene.expect(listbox).toBeAbsent(),
        )
      })

      it('opens the popup and highlights the first option on ArrowDown', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.keydown(input, 'ArrowDown'),
          ...resolveOpenedMounts,
          Scene.expect(listbox).toExist(),
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-0',
          ),
          Scene.expect(option('apple')).toHaveAttr('data-active', ''),
        )
      })

      it('opens the popup and highlights the last option on ArrowUp', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.keydown(input, 'ArrowUp'),
          ...resolveOpenedMounts,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-2',
          ),
          Scene.expect(option('cherry')).toHaveAttr('data-active', ''),
        )
      })

      it('opens the popup while typing', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.type(input, 'app'),
          ...resolveOpenedMounts,
          Scene.expect(listbox).toExist(),
          Scene.expect(input).toHaveValue('app'),
        )
      })

      it('closes the popup on Escape and requests input focus', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.keydown(input, 'Escape'),
          // Focus restoration is a Command in foldkit — assert and resolve it.
          Scene.Command.expectHas(ComboboxPrimitive.FocusInput),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.expect(listbox).toBeAbsent(),
          Scene.expect(input).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(input).not.toHaveAttr('data-open'),
        )
      })

      it('closes the popup when the backdrop is clicked', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(backdrop).toExist(),
          Scene.click(backdrop),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.expect(listbox).toBeAbsent(),
        )
      })

      it('closes the popup when the input loses focus', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.blur(input),
          // A blur-driven close does not refocus the input.
          Scene.Command.expectNone(),
          expectPanelUnmounted(),
          Scene.expect(listbox).toBeAbsent(),
        )
      })

      it('ignores Enter while closed', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.keydown(input, 'Enter'),
          Scene.expectIgnored(),
          Scene.expect(listbox).toBeAbsent(),
        )
      })

      it('ignores printable keys while closed', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.keydown(input, 'a'),
          Scene.expectIgnored(),
          Scene.expect(listbox).toBeAbsent(),
        )
      })

      it('ignores Escape while closed', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.keydown(input, 'Escape'),
          Scene.expectIgnored(),
        )
      })

      it('does not navigate an empty item list', () => {
        Scene.scene(
          { update, view: singleView(Single, []) },
          Scene.given(initModel()),
          Scene.keydown(input, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(listbox).toBeAbsent(),
          Scene.expect(input).toHaveAttr('aria-expanded', 'false'),
        )
      })

      it('renders the popup open on init when the model is open', () => {
        // Base UI's defaultOpen: the foldkit `open` helper yields an open model.
        const { model: openComboboxModel } =
          ComboboxPrimitive.create<string>().open(
            TailwindCombobox.init({ id: 'fruit' }),
          )
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel({ combobox: openComboboxModel })),
          ...resolveOpenedMounts,
          Scene.expect(listbox).toExist(),
          Scene.expect(input).toHaveAttr('aria-expanded', 'true'),
        )
      })

      it('locks scroll and inerts siblings while a modal popup is open', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(
            initModel({
              combobox: TailwindCombobox.init({ id: 'fruit', isModal: true }),
            }),
          ),
          Scene.focus(input),
          Scene.Command.expectHas(ComboboxPrimitive.LockScroll),
          Scene.Command.expectHas(ComboboxPrimitive.InertOthers),
          Scene.Command.resolve(
            ComboboxPrimitive.LockScroll,
            ComboboxPrimitive.Message.CompletedLockScroll(),
          ),
          Scene.Command.resolve(
            ComboboxPrimitive.InertOthers,
            ComboboxPrimitive.Message.CompletedInertOthers(),
          ),
          ...resolveOpenedMounts,
          Scene.keydown(input, 'Escape'),
          Scene.Command.expectHas(ComboboxPrimitive.UnlockScroll),
          Scene.Command.expectHas(ComboboxPrimitive.RestoreInert),
          Scene.Command.resolve(
            ComboboxPrimitive.FocusInput,
            ComboboxPrimitive.Message.CompletedFocusInput(),
          ),
          Scene.Command.resolve(
            ComboboxPrimitive.UnlockScroll,
            ComboboxPrimitive.Message.CompletedUnlockScroll(),
          ),
          Scene.Command.resolve(
            ComboboxPrimitive.RestoreInert,
            ComboboxPrimitive.Message.CompletedRestoreInert(),
          ),
          expectPanelUnmounted(),
          Scene.expect(listbox).toBeAbsent(),
        )
      })
    })

    describe('prop: trigger (foldkit toggle button)', () => {
      it('toggles the popup open and closed', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, {
              trigger: { content: 'Open' },
            }),
          },
          Scene.given(initModel()),
          resolveToggleMount,
          Scene.expect(toggle).toHaveAttr('aria-expanded', 'false'),
          Scene.click(toggle),
          resolveFocusInput,
          ...resolveOpenedMounts,
          Scene.expect(listbox).toExist(),
          Scene.expect(toggle).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(toggle).toHaveAttr('aria-controls', 'fruit-items'),
          Scene.click(toggle),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.expect(listbox).toBeAbsent(),
          Scene.expect(toggle).toHaveAttr('aria-expanded', 'false'),
        )
      })

      it('exposes aria-haspopup=listbox and a type=button trigger', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, {
              trigger: { content: 'Open' },
            }),
          },
          Scene.given(initModel()),
          resolveToggleMount,
          Scene.expect(toggle).toHaveAttr('type', 'button'),
          Scene.expect(toggle).toHaveAttr('aria-haspopup', 'listbox'),
        )
      })

      it('exposes the trigger aria-label', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, {
              trigger: { content: '⌄', ariaLabel: 'Toggle popup' },
            }),
          },
          Scene.given(initModel()),
          resolveToggleMount,
          Scene.expect(toggle).toHaveAccessibleName('Toggle popup'),
        )
      })

      // DIVERGENCE: Base UI's Combobox.Trigger is an ordinary focusable
      // button; foldkit's toggle is a pointer-only control (`tabIndex: -1`),
      // so keyboard users reach the popup through the input instead.
      it.fails('keeps the trigger in the keyboard tab order', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, {
              trigger: { content: 'Open' },
            }),
          },
          Scene.given(initModel()),
          resolveToggleMount,
          Scene.expect(toggle).not.toHaveAttr('tabIndex', '-1'),
        )
      })
    })

    describe('highlighting', () => {
      it('tracks the active option with aria-activedescendant', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.keydown(input, 'ArrowDown'),
          resolveScrollIntoView,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-0',
          ),
          Scene.keydown(input, 'ArrowDown'),
          resolveScrollIntoView,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-1',
          ),
          Scene.expect(option('banana')).toHaveAttr('data-active', ''),
          Scene.expect(option('apple')).not.toHaveAttr('data-active'),
        )
      })

      // DIVERGENCE (intentional): foldkit's Command-style hook for the
      // highlighted option is `data-active`; Base UI uses `data-highlighted`.
      it('marks the highlighted option with data-active', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.keydown(input, 'ArrowDown'),
          ...resolveOpenedMounts,
          Scene.expect(option('apple')).toHaveAttr('data-active', ''),
          Scene.expect(option('apple')).not.toHaveAttr('data-highlighted'),
        )
      })

      // DIVERGENCE: Base UI's loopFocus returns the highlight to the input
      // (clears aria-activedescendant) when arrowing past the last option, and
      // the next ArrowDown re-highlights the first item. foldkit wraps the
      // highlight straight to the first option.
      it.fails('returns the highlight to the input past the last option', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.keydown(input, 'ArrowUp'),
          ...resolveOpenedMounts,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-2',
          ),
          Scene.keydown(input, 'ArrowDown'),
          resolveScrollIntoView,
          Scene.expect(input).not.toHaveAttr('aria-activedescendant'),
        )
      })

      // DIVERGENCE: Base UI moves the input text caret on Home/End without
      // changing the highlighted option; foldkit navigates the highlight to
      // the first/last enabled option instead.
      it.fails('moves the text caret on Home and End', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.keydown(input, 'End'),
          resolveScrollIntoView,
          Scene.expect(input).not.toHaveAttr('aria-activedescendant'),
        )
      })

      it('moves the highlight to the first and last options on Home/End', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.keydown(input, 'ArrowDown'),
          ...resolveOpenedMounts,
          Scene.keydown(input, 'End'),
          resolveScrollIntoView,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-2',
          ),
          Scene.keydown(input, 'Home'),
          resolveScrollIntoView,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-0',
          ),
        )
      })

      it('skips disabled options during keyboard navigation', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS_WITH_DISABLED) },
          Scene.given(initModel()),
          Scene.keydown(input, 'ArrowDown'),
          ...resolveOpenedMounts,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-0',
          ),
          // banana is disabled — ArrowDown jumps straight to cherry.
          Scene.keydown(input, 'ArrowDown'),
          resolveScrollIntoView,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-2',
          ),
          Scene.expect(option('banana')).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(option('banana')).toHaveAttr('data-disabled', ''),
          Scene.expect(option('banana')).not.toHaveHandler('click'),
        )
      })

      it('requests a ScrollIntoView command on keyboard navigation', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.keydown(input, 'ArrowDown'),
          Scene.Command.expectHas(ComboboxPrimitive.ScrollIntoView),
          resolveScrollIntoView,
        )
      })

      // DIVERGENCE: Base UI maps PageDown/PageUp to the last/first option;
      // foldkit's input keymap handles only Arrow/Home/End and ignores
      // PageDown/PageUp entirely.
      it.fails('moves the highlight to the last option on PageDown', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.keydown(input, 'PageDown'),
          Scene.expectIgnored(),
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-2',
          ),
        )
      })

      it('arms hover handlers on enabled options only', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS_WITH_DISABLED) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(option('apple')).toHaveHandler('pointermove'),
          Scene.expect(option('banana')).not.toHaveHandler('pointermove'),
        )
      })

      it.todo(
        'highlights the option under the pointer (the scene DSL cannot emit ' +
          'pointermove — foldkit dedupes by last pointer position)',
      )
    })

    describe('selecting an option', () => {
      it('selects on click: closes, shows the label, emits Selected', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.click(option('banana')),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.Selected({ value: 'banana' }),
          ),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.expect(listbox).toBeAbsent(),
          Scene.expect(input).toHaveValue('banana'),
        )
      })

      it('selects the highlighted option on Enter', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.keydown(input, 'ArrowDown'),
          resolveScrollIntoView,
          // Enter issues a ClickItem command that clicks the active option.
          Scene.keydown(input, 'Enter'),
          resolveClickItem,
          Scene.click(option('apple')),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.Selected({ value: 'apple' }),
          ),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.expect(input).toHaveValue('apple'),
        )
      })

      it('suppresses Enter when no option is highlighted', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.keydown(input, 'Enter'),
          Scene.expectIgnored(),
          Scene.expect(listbox).toExist(),
          Scene.expectNoOutMessage(),
        )
      })

      it('keeps the selection when clicking the selected option again', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.click(option('apple')),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.Selected({ value: 'apple' }),
          ),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.click(option('apple')),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.Selected({ value: 'apple' }),
          ),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.expect(input).toHaveValue('apple'),
        )
      })

      it('marks the selected option aria-selected and data-selected', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.click(option('banana')),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(option('banana')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(option('banana')).toHaveAttr('data-selected', ''),
          Scene.expect(option('apple')).toHaveAttr('aria-selected', 'false'),
        )
      })

      it('shows every option again when reopening after a selection', () => {
        // The resting selected label is not treated as a filter query.
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.click(option('apple')),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expectAll(allOptions).toHaveCount(3),
        )
      })

      it('restores the resting label when closing without selecting', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel({ maybeValue: Option.some('banana') })),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.type(input, 'zzz'),
          expectPanelUnmounted(),
          Scene.keydown(input, 'Escape'),
          resolveFocusInput,
          Scene.expect(input).toHaveValue('banana'),
          Scene.expectNoOutMessage(),
        )
      })

      it('emits ClearedSelection on close when a nullable input is emptied', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(
            initModel({
              combobox: TailwindCombobox.init({ id: 'fruit', nullable: true }),
              maybeValue: Option.some('banana'),
            }),
          ),
          Scene.focus(input),
          ...resolveOpenedMounts,
          // An emptied query matches everything, so the panel stays mounted.
          Scene.type(input, ''),
          Scene.keydown(input, 'Escape'),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.ClearedSelection(),
          ),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.expect(input).toHaveValue(''),
        )
      })

      it('keeps the selection when a non-nullable input is emptied', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel({ maybeValue: Option.some('banana') })),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.type(input, ''),
          Scene.keydown(input, 'Escape'),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.expect(input).toHaveValue('banana'),
          Scene.expectNoOutMessage(),
        )
      })

      // DIVERGENCE: Base UI deselects immediately when the input text is
      // cleared — the option's aria-selected flips while the popup is still
      // open. creaseui only clears on close (and only when `nullable`), so a
      // cleared input leaves the previous option marked selected.
      it.fails('clears the selection as soon as the input is emptied', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel({ maybeValue: Option.some('banana') })),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.type(input, ''),
          Scene.expect(option('banana')).toHaveAttr('aria-selected', 'false'),
        )
      })
    })

    describe('filtering', () => {
      it('narrows options by case-insensitive substring on the label', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.type(input, 'AN'),
          ...resolveOpenedMounts,
          Scene.expectAll(allOptions).toHaveCount(1),
          Scene.expect(option('banana')).toExist(),
          Scene.expect(option('apple')).toBeAbsent(),
        )
      })

      it('matches on the itemToConfig searchText', () => {
        Scene.scene(
          { update, view: singleView(Single, SEARCHABLE) },
          Scene.given(initModel()),
          Scene.type(input, 'yellow'),
          ...resolveOpenedMounts,
          Scene.expectAll(allOptions).toHaveCount(1),
          Scene.expect(option('banana')).toExist(),
          Scene.type(input, 'stone fruit'),
          Scene.expect(option('cherry')).toExist(),
          Scene.expectAll(allOptions).toHaveCount(1),
        )
      })

      it('restores every option when the query is cleared', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.type(input, 'an'),
          ...resolveOpenedMounts,
          Scene.expectAll(allOptions).toHaveCount(1),
          Scene.type(input, ''),
          Scene.expectAll(allOptions).toHaveCount(3),
        )
      })

      // DIVERGENCE: Base UI keeps the popup open and renders Combobox.Empty
      // when nothing matches; creaseui has no Empty part and the foldkit
      // panel unmounts entirely while the model stays open (data-open
      // remains, aria-expanded flips false). Reopening re-filters matches.
      it('hides the whole panel when no option matches, remounting on the next match', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.type(input, 'an'),
          ...resolveOpenedMounts,
          Scene.expect(listbox).toExist(),
          Scene.type(input, 'zzz'),
          expectPanelUnmounted(),
          Scene.expect(listbox).toBeAbsent(),
          Scene.expect(input).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(input).toHaveAttr('data-open', ''),
          Scene.type(input, 'cherry'),
          ...resolveOpenedMounts,
          Scene.expectAll(allOptions).toHaveCount(1),
          Scene.expect(option('cherry')).toExist(),
        )
      })

      it.fails('keeps the popup open when no options match', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.type(input, 'zzz'),
          Scene.expect(listbox).toExist(),
        )
      })

      it.todo(
        'renders Combobox.Empty inside the popup when no options match ' +
          '(creaseui has no Empty part)',
      )
    })

    describe('prop: disabled', () => {
      // DIVERGENCE (intentional): foldkit controls use aria-disabled +
      // data-disabled instead of the native `disabled` attribute, so the
      // input stays focusable while every interaction handler is removed.
      it('marks the control aria-disabled and removes all interaction handlers', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, {
              isDisabled: true,
              trigger: { content: 'Open' },
            }),
          },
          Scene.given(initModel()),
          resolveToggleMount,
          Scene.expect(input).toBeDisabled(),
          Scene.expect(input).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(input).toHaveAttr('data-disabled', ''),
          Scene.expect(input).not.toHaveAttr('disabled'),
          Scene.expect(input).not.toHaveHandler('input'),
          Scene.expect(input).not.toHaveHandler('keydown'),
          Scene.expect(input).not.toHaveHandler('focus'),
          Scene.expect(input).not.toHaveHandler('blur'),
          Scene.expect(toggle).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(toggle).toHaveAttr('data-disabled', ''),
          Scene.expect(toggle).not.toHaveHandler('click'),
          Scene.expect(root).toHaveAttr('data-disabled', ''),
          Scene.expect(listbox).toBeAbsent(),
        )
      })

      // DIVERGENCE: Base UI mirrors `disabled` onto the hidden input so it is
      // skipped at form submission; foldkit never emits disabled/readonly/
      // required on the hidden mirror inputs.
      it.fails('marks the hidden input disabled so it does not submit', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, {
              isDisabled: true,
              formName: 'fruit',
            }),
          },
          Scene.given(initModel({ maybeValue: Option.some('apple') })),
          Scene.expect(hiddenInput).toHaveAttr('disabled', ''),
        )
      })
    })

    describe('prop: readOnly', () => {
      it('exposes readonly semantics and freezes the input', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, { isReadOnly: true }),
          },
          Scene.given(initModel()),
          // `readonly` is set as a DOM property, not an attribute — the
          // aria/data markers are the observable surface here.
          Scene.expect(input).toHaveAttr('aria-readonly', 'true'),
          Scene.expect(input).toHaveAttr('data-readonly', ''),
          Scene.expect(root).toHaveAttr('data-readonly', ''),
          Scene.expect(input).not.toHaveHandler('input'),
        )
      })

      it('opens for browsing but suppresses commits', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, { isReadOnly: true }),
          },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(listbox).toExist(),
          Scene.expect(listbox).toHaveAttr('aria-readonly', 'true'),
          Scene.expect(listbox).toHaveAttr('data-readonly', ''),
          Scene.expect(option('apple')).toHaveAttr('data-readonly', ''),
          Scene.expect(option('apple')).not.toHaveHandler('click'),
          // Arrow keys still move the highlight for browsing.
          Scene.keydown(input, 'ArrowDown'),
          resolveScrollIntoView,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-0',
          ),
          // Enter on a highlighted option is suppressed, not committed.
          Scene.keydown(input, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(listbox).toExist(),
          Scene.expectNoOutMessage(),
        )
      })

      it('keeps the trigger clickable while readOnly', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, {
              isReadOnly: true,
              trigger: { content: 'Open' },
            }),
          },
          Scene.given(initModel()),
          resolveToggleMount,
          Scene.expect(toggle).toHaveAttr('data-readonly', ''),
          Scene.click(toggle),
          resolveFocusInput,
          ...resolveOpenedMounts,
          Scene.expect(listbox).toExist(),
        )
      })

      // DIVERGENCE: Base UI flips the input to aria-autocomplete="none" while
      // readOnly since typing is frozen; foldkit always emits "list".
      it.fails('sets aria-autocomplete="none" while readOnly', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, { isReadOnly: true }),
          },
          Scene.given(initModel()),
          Scene.expect(input).toHaveAttr('aria-autocomplete', 'none'),
        )
      })
    })

    describe('grouping', () => {
      const groupedView = singleView(Single, PRODUCE, {
        itemGroupKey: item => item.group ?? '',
        groupToHeading: key => `group-${key}`,
      })

      it('wraps items in role=group labelled by its heading', () => {
        Scene.scene(
          { update, view: groupedView },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expectAll(allGroups).toHaveCount(2),
          // Groups render role=group + aria-labelledby pointing at the
          // heading's id; the `fruit-group-<key>` key is a vnode key, not
          // a DOM id.
          Scene.expect(
            Scene.selector(
              '[role="group"][aria-labelledby="fruit-heading-fruit"]',
            ),
          ).toExist(),
          Scene.expect(Scene.selector('#fruit-heading-fruit')).toHaveText(
            'group-fruit',
          ),
          Scene.expect(
            Scene.selector(
              '[role="group"][aria-labelledby="fruit-heading-vegetable"]',
            ),
          ).toExist(),
        )
      })

      it('renders a separator between groups', () => {
        Scene.scene(
          { update, view: groupedView },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expectAll(Scene.all.role('separator')).toHaveCount(1),
        )
      })

      it('removes a group when all its options are filtered out', () => {
        Scene.scene(
          { update, view: groupedView },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.type(input, 'carr'),
          Scene.expectAll(allGroups).toHaveCount(1),
          Scene.expect(
            Scene.selector(
              '[role="group"][aria-labelledby="fruit-heading-vegetable"]',
            ),
          ).toExist(),
          Scene.expect(Scene.selector('#fruit-group-fruit')).toBeAbsent(),
        )
      })
    })

    describe('form integration', () => {
      it('renders a name-only hidden input before any selection', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, { formName: 'fruit' }),
          },
          Scene.given(initModel()),
          Scene.expectAll(allHiddenInputs).toHaveCount(1),
          Scene.expect(hiddenInput).toHaveAttr('name', 'fruit'),
          // With no selection the hidden input carries name only — no
          // value attribute at all.
          Scene.expect(hiddenInput).not.toHaveAttr('value'),
        )
      })

      it('mirrors the selected value into the hidden input', () => {
        Scene.scene(
          {
            update,
            view: singleView(Single, FRUITS, { formName: 'fruit' }),
          },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.click(option('apple')),
          resolveFocusInput,
          expectPanelUnmounted(),
          Scene.expect(hiddenInput).toHaveAttr('name', 'fruit'),
          Scene.expect(hiddenInput).toHaveValue('apple'),
        )
      })

      it('omits the hidden input when no formName is provided', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.expect(hiddenInput).toBeAbsent(),
        )
      })

      it.todo('marks the hidden input required (creaseui has no required prop)')
    })

    describe('prop: multiple', () => {
      it('keeps the popup open after each selection', () => {
        Scene.scene(
          { update, view: multiView(FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.click(option('apple')),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.Selected({ value: 'apple' }),
          ),
          Scene.expect(listbox).toExist(),
          Scene.expect(input).toHaveAttr('aria-expanded', 'true'),
        )
      })

      it('selects several options and marks each aria-selected', () => {
        Scene.scene(
          { update, view: multiView(FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.click(option('apple')),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.Selected({ value: 'apple' }),
          ),
          Scene.click(option('banana')),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.Selected({ value: 'banana' }),
          ),
          Scene.expect(option('apple')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(option('banana')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(option('cherry')).toHaveAttr('aria-selected', 'false'),
        )
      })

      it('unselects a previously selected option', () => {
        Scene.scene(
          { update, view: multiView(FRUITS) },
          Scene.given(initModel({ selectedValues: ['apple'] })),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(option('apple')).toHaveAttr('aria-selected', 'true'),
          Scene.click(option('apple')),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.Selected({ value: 'apple' }),
          ),
          // The parent toggles membership off; the option is deselected.
          Scene.expect(option('apple')).toHaveAttr('aria-selected', 'false'),
        )
      })

      it('exposes aria-multiselectable on the listbox', () => {
        Scene.scene(
          { update, view: multiView(FRUITS) },
          Scene.given(initModel()),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(listbox).toHaveAttr('aria-multiselectable', 'true'),
        )
      })

      it('keeps the typed query after selecting (input outside popup)', () => {
        Scene.scene(
          { update, view: multiView(FRUITS) },
          Scene.given(initModel()),
          Scene.type(input, 'ap'),
          ...resolveOpenedMounts,
          Scene.click(option('apple')),
          Scene.expectOutMessage(
            TailwindCombobox.OutMessage.Selected({ value: 'apple' }),
          ),
          Scene.expect(input).toHaveValue('ap'),
          Scene.expect(listbox).toExist(),
        )
      })

      it('clears the typed query on close without a selection', () => {
        Scene.scene(
          { update, view: multiView(FRUITS) },
          Scene.given(initModel()),
          Scene.type(input, 'zz'),
          // 'zz' matches nothing, so the panel never mounts — nothing to
          // acknowledge.
          Scene.expect(listbox).toBeAbsent(),
          Scene.keydown(input, 'Escape'),
          resolveFocusInput,
          Scene.expect(input).toHaveValue(''),
        )
      })

      it('renders one hidden input per selected value', () => {
        Scene.scene(
          { update, view: multiView(FRUITS, { formName: 'fruit' }) },
          Scene.given(initModel({ selectedValues: ['apple', 'cherry'] })),
          Scene.expectAll(allHiddenInputs).toHaveCount(2),
          Scene.expect(
            Scene.selector('input[type="hidden"][value="apple"]'),
          ).toExist(),
          Scene.expect(
            Scene.selector('input[type="hidden"][value="cherry"]'),
          ).toExist(),
        )
      })
    })

    describe('prop: autoHighlight', () => {
      it('highlights the first matching item after typing', () => {
        Scene.scene(
          { update, view: singleView(SingleAutoHighlight, FRUITS) },
          Scene.given(initModel({ autoHighlight: true })),
          Scene.type(input, 'ch'),
          ...resolveOpenedMounts,
          Scene.expect(input).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-0',
          ),
          Scene.expect(option('cherry')).toHaveAttr('data-active', ''),
        )
      })

      it('marks the selected option on initial open without highlighting', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel({ maybeValue: Option.some('banana') })),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(option('banana')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(input).not.toHaveAttr('aria-activedescendant'),
        )
      })

      // DIVERGENCE: Base UI's autoHighlight only kicks in once filtering
      // starts — opening never highlights. creaseui's autoHighlight
      // pre-activates index 0 on every open.
      it.fails('does not highlight any option on open', () => {
        Scene.scene(
          { update, view: singleView(SingleAutoHighlight, FRUITS) },
          Scene.given(initModel({ autoHighlight: true })),
          Scene.focus(input),
          ...resolveOpenedMounts,
          Scene.expect(input).not.toHaveAttr('aria-activedescendant'),
        )
      })

      // DIVERGENCE: foldkit activates the first filtered option on every
      // input change, so typing highlights a match even with autoHighlight
      // off — Base UI only highlights while typing when autoHighlight is on.
      it.fails('does not highlight a match on typing when autoHighlight is off', () => {
        Scene.scene(
          { update, view: singleView(Single, FRUITS) },
          Scene.given(initModel()),
          Scene.type(input, 'ch'),
          ...resolveOpenedMounts,
          Scene.expect(input).not.toHaveAttr('aria-activedescendant'),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindCombobox)
verifyRenderer('StyleX', StyleXCombobox)

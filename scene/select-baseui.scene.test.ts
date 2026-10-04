import { Option } from 'effect'
import { Command } from 'foldkit'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Listbox as ListboxPrimitive } from '@foldkit/ui'
import { describe, it } from 'vitest'

import * as StyleXSelect from '@/stylex/select'
import * as TailwindSelect from '@/ui/select'

/**
 * Behavioral parity suite ported from Base UI's select tests
 * (base-ui/packages/react/src/select/**, checked at base-ui HEAD).
 * creaseui's Select is a foldkit single-select Listbox submodel with a
 * button trigger, so the cases exercise the trigger, the listbox popup,
 * and the hidden form input.
 *
 * foldkit Listbox internals surfaced in these tests: opening the popup
 * emits a `FocusItems` Command and renders `AnchorListbox` +
 * `PortalListboxBackdrop` Mounts; closing emits `FocusButton`; keyboard
 * navigation emits `ScrollIntoView`; every typeahead keystroke emits a
 * `DelayClearSearch` debounce Command; Enter/Space commits by emitting a
 * `ClickItem` Command that clicks the option in the real DOM. Scenes
 * resolve each of those with the raw Listbox result Message.
 *
 * Cases that have no creaseui analogue are recorded as comments at the
 * bottom of this file instead of being dropped silently:
 *  - React internals: refs, portals, contexts, StrictMode, React 17,
 *    describeConformance blocks, SSR hydration ordering
 *  - `render=` prop / element-substitution cases (foldkit fixes the element)
 *  - Event-object payloads, `eventDetails.cancel()`, modifier reporting
 *    (foldkit dispatches plain messages, not DOM event objects)
 *  - `onOpenChange`/`onValueChange` callback signatures (the foldkit model
 *    owns open state internally; selection surfaces as an OutMessage only)
 *  - `multiple` mode and `isItemEqualToValue` (creaseui Select is
 *    single-select; values are projected to strings via itemToValue)
 *  - `required`/`aria-labelledby` props, Field.Root integration, data-touched
 *    /data-dirty/data-filled/data-focused hooks, validate callbacks, native
 *    form validation on submit
 *  - Browser autofill of the hidden input and `autoComplete`
 *  - Focus movement assertions (toHaveFocus, focus restoration, finalFocus)
 *    — the scene DSL does not model real DOM focus
 *  - Scroll arrows, positioner/sideOffset/alignOffset math, RTL measured
 *    layouts, popup height/resize/overscroll, viewport pinning — no layout
 *  - Drag-to-select, quick-selection timeouts, touch scroll lock, pointer
 *    capture and hover timing — no pointer movement step or timers
 *  - Popover integration cases (select inside popover)
 *  - ScrollIntoView/FocusItems real DOM effects (asserted as Commands only)
 */

type Model = Readonly<{
  select: TailwindSelect.Model
  maybeSelected: Option.Option<string>
}>

type Message = Readonly<
  | { _tag: 'GotSelect'; message: TailwindSelect.Message }
  | { _tag: 'SetSelected'; value: string }
>

type SelectModule = Readonly<{
  init: typeof TailwindSelect.init
  update: typeof TailwindSelect.update
  select: <Item, Msg>(
    props: Readonly<{
      model: TailwindSelect.Model
      maybeSelectedValue: Option.Option<string>
      toParentMessage: (message: TailwindSelect.Message) => Msg
      items: ReadonlyArray<Item>
      itemToValue: (item: Item) => string
      itemToLabel: (item: Item) => string
      itemToConfig?: (
        item: Item,
      ) => Readonly<{ content?: Html | string; isDisabled?: boolean }>
      placeholder?: string
      ariaLabel?: string
      isDisabled?: boolean
      isReadOnly?: boolean
      isInvalid?: boolean
      name?: string
      form?: string
      direction?: 'ltr' | 'rtl'
      position?: 'popper' | 'item-aligned'
      itemGroupKey?: (item: Item, index: number) => string
      groupToHeading?: (groupKey: string) => string | undefined
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const makeUpdate = (Select: SelectModule) => {
  const update = (model: Model, message: Message) => {
    switch (message._tag) {
      case 'GotSelect': {
        const next = Select.update(model.select, message.message)
        return {
          model: {
            select: next.model,
            maybeSelected: Option.match(Option.fromNullishOr(next.outMessage), {
              onNone: () => model.maybeSelected,
              onSome: selected => Option.some(selected.value),
            }),
          },
          commands: Command.mapMessages(next.commands ?? [], message => ({
            _tag: 'GotSelect' as const,
            message,
          })),
          outMessage: next.outMessage,
        }
      }
      case 'SetSelected':
        return {
          model: { ...model, maybeSelected: Option.some(message.value) },
        }
    }
  }
  return update
}

const initModel = (Select: SelectModule, id: string): Model => ({
  select: Select.init({ id }),
  maybeSelected: Option.none(),
})

const selectedModel = (
  Select: SelectModule,
  id: string,
  value: string,
): Model => ({
  select: Select.init({ id }),
  maybeSelected: Option.some(value),
})

// Programmatic open, the foldkit analogue of Base UI's `defaultOpen`/`open` props.
const openModel = (
  Select: SelectModule,
  id: string,
  maybeSelected: Option.Option<string> = Option.none(),
  maybeActiveItemIndex: Option.Option<number> = Option.none(),
): Model => ({
  select: Select.update(
    Select.init({ id }),
    ListboxPrimitive.Message.Opened({ maybeActiveItemIndex }),
  ).model,
  maybeSelected,
})

const trigger = Scene.selector('[data-slot="select-trigger"]')
const listbox = Scene.role('listbox')
const backdrop = Scene.selector('[data-slot="select-backdrop"]')
const hiddenInput = Scene.selector('input[type="hidden"]')
const option = (name: string) => Scene.role('option', { name })
const selectValue = Scene.selector('[data-slot="select-value"]')
const itemIndicator = Scene.all.selector('[data-slot="select-item-indicator"]')

// An opened popup renders two pending mounts; a model injected already-open
// via Scene.given has no FocusItems command to settle, only these mounts.
const resolveOpenMounts = () => [
  Scene.Mount.resolve(
    ListboxPrimitive.AnchorListbox,
    ListboxPrimitive.Message.CompletedAnchorListbox(),
  ),
  Scene.Mount.resolve(
    ListboxPrimitive.PortalListboxBackdrop,
    ListboxPrimitive.Message.CompletedPortalListboxBackdrop(),
  ),
]

// An in-scene open additionally leaves a FocusItems command behind;
// every test that opens the popup settles it before the next interaction.
const resolveOpenedPopup = () => [
  Scene.Command.resolve(
    ListboxPrimitive.FocusItems,
    ListboxPrimitive.Message.CompletedFocusItems(),
  ),
  ...resolveOpenMounts(),
]

// Closing emits a FocusButton command and ends the two popup mounts.
const acknowledgeClosedPopup = () => [
  Scene.Command.resolve(
    ListboxPrimitive.FocusButton,
    ListboxPrimitive.Message.CompletedFocusButton(),
  ),
  Scene.Mount.expectEnded(
    { name: 'AnchorListbox' },
    { name: 'PortalListboxBackdrop' },
  ),
]

const resolveScrollIntoView = () =>
  Scene.Command.resolve(
    ListboxPrimitive.ScrollIntoView,
    ListboxPrimitive.Message.CompletedScrollIntoView(),
  )

// Resolving with a stale version leaves the search query in place, which is
// how a second keystroke accumulates before the debounce clears it.
const dropSearchDebounce = () =>
  Scene.Command.resolve(
    ListboxPrimitive.DelayClearSearch,
    ListboxPrimitive.Message.CompletedDelayClearSearch({ version: 0 }),
  )

type ViewOverrides = Readonly<
  Partial<{
    items: ReadonlyArray<string>
    itemToConfig: (
      item: string,
    ) => Readonly<{ content?: Html | string; isDisabled?: boolean }>
    placeholder: string
    ariaLabel: string
    isDisabled: boolean
    isReadOnly: boolean
    isInvalid: boolean
    name: string
    form: string
    direction: 'ltr' | 'rtl'
    position: 'popper' | 'item-aligned'
    itemGroupKey: (item: string, index: number) => string
    groupToHeading: (groupKey: string) => string | undefined
  }>
>

const verifyRenderer = (name: string, Select: SelectModule) => {
  describe(`${name} Select (Base UI port)`, () => {
    const update = makeUpdate(Select)

    const view =
      (overrides: ViewOverrides = {}) =>
      (model: Model, h: HtmlBuilder<Message>): Html =>
        Select.select(
          {
            model: model.select,
            maybeSelectedValue: model.maybeSelected,
            toParentMessage: message => ({
              _tag: 'GotSelect' as const,
              message,
            }),
            items: ['one', 'two', 'three'],
            itemToValue: item => item,
            itemToLabel: item => item,
            ...overrides,
          },
          h,
        )

    describe('ARIA attributes', () => {
      // DIVERGENCE: Base UI renders the trigger with role="combobox"; foldkit's
      // Listbox trigger is a plain button (implicit role=button) carrying
      // aria-haspopup="listbox".
      it.fails('sets role="combobox" on the trigger', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(Scene.role('combobox')).toExist(),
        )
      })

      it('marks the trigger aria-haspopup/aria-expanded and wires aria-controls', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(trigger).toHaveAttr('type', 'button'),
          Scene.expect(trigger).toHaveAttr('aria-haspopup', 'listbox'),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger).not.toHaveAttr('aria-controls'),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'fruit-items'),
          Scene.expect(listbox).toHaveAttr('aria-labelledby', 'fruit-button'),
          Scene.expect(listbox).toHaveAttr('tabIndex', '0'),
        )
      })

      // DIVERGENCE: Base UI omits aria-orientation for the default vertical
      // orientation; foldkit always renders it ("vertical" or "horizontal").
      it.fails('omits aria-orientation on the vertical listbox', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.expect(listbox).not.toHaveAttr('aria-orientation'),
        )
      })

      it('points aria-activedescendant at the active option', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'ArrowDown'),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(listbox).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-0',
          ),
          Scene.expect(option('one')).toHaveAttr('data-active', ''),
        )
      })

      it('exposes aria-selected only on the selected option', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(openModel(Select, 'fruit', Option.some('two'))),
          ...resolveOpenMounts(),
          Scene.expect(option('two')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(option('two')).toHaveAttr('data-selected', ''),
          Scene.expect(option('one')).toHaveAttr('aria-selected', 'false'),
          Scene.expect(option('one')).not.toHaveAttr('data-selected'),
        )
      })

      it('applies aria-label to the trigger', () => {
        Scene.scene(
          { update, view: view({ ariaLabel: 'Pick a fruit' }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(
            Scene.role('button', { name: 'Pick a fruit' }),
          ).toExist(),
          Scene.expect(trigger).toHaveAttr('aria-label', 'Pick a fruit'),
        )
      })

      it('associates the trigger with a label element', () => {
        Scene.scene(
          {
            update,
            view: (model: Model, h: HtmlBuilder<Message>): Html =>
              h.div(
                [],
                [
                  h.label([h.For('fruit-button')], ['Fruit']),
                  Select.select(
                    {
                      model: model.select,
                      maybeSelectedValue: model.maybeSelected,
                      toParentMessage: message => ({
                        _tag: 'GotSelect' as const,
                        message,
                      }),
                      items: ['one', 'two', 'three'],
                      itemToValue: item => item,
                      itemToLabel: item => item,
                    },
                    h,
                  ),
                ],
              ),
          },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(Scene.role('button', { name: 'Fruit' })).toExist(),
          Scene.expect(Scene.label('Fruit')).toHaveId('fruit-button'),
        )
      })

      it.todo(
        'applies aria-required to the trigger when required (creaseui Select has no required prop)',
      )
      it.todo(
        'applies aria-labelledby to the trigger (creaseui Select exposes ariaLabel only)',
      )
    })

    describe('prop: defaultValue', () => {
      it('should select the item by default', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(selectedModel(Select, 'fruit', 'two')),
          Scene.expect(trigger).toContainText('two'),
          Scene.expect(trigger).not.toHaveAttr('data-placeholder'),
        )
      })
    })

    describe('prop: value', () => {
      it('should update the selected item when the value prop changes', () => {
        Scene.scene(
          {
            update,
            view: (model: Model, h: HtmlBuilder<Message>): Html =>
              h.div(
                [],
                [
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick({ _tag: 'SetSelected', value: 'three' }),
                    ],
                    ['Set three'],
                  ),
                  Select.select(
                    {
                      model: model.select,
                      maybeSelectedValue: model.maybeSelected,
                      toParentMessage: message => ({
                        _tag: 'GotSelect' as const,
                        message,
                      }),
                      items: ['one', 'two', 'three'],
                      itemToValue: item => item,
                      itemToLabel: item => item,
                    },
                    h,
                  ),
                ],
              ),
          },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(trigger).toContainText(''),
          Scene.click(Scene.text('Set three')),
          Scene.expectHandled(),
          Scene.expect(trigger).toContainText('three'),
        )
      })

      it('falls back to the raw value when it matches no item', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(selectedModel(Select, 'fruit', 'four')),
          Scene.expect(trigger).toContainText('four'),
        )
      })
    })

    describe('prop: onValueChange', () => {
      it('should call onValueChange when an item is selected', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.click(option('two')),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            TailwindSelect.OutMessage.Selected({ value: 'two' }),
          ),
          Scene.expect(trigger).toContainText('two'),
          Scene.expect(listbox).toBeAbsent(),
          ...acknowledgeClosedPopup(),
        )
      })
    })

    describe('prop: defaultOpen', () => {
      it('should open the select by default', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(listbox).toExist(),
        )
      })

      it('should select an item and close when clicked while opened by default', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.click(option('three')),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            TailwindSelect.OutMessage.Selected({ value: 'three' }),
          ),
          Scene.expect(listbox).toBeAbsent(),
          ...acknowledgeClosedPopup(),
        )
      })
    })

    describe('interactions', () => {
      it('opens the popup on click and marks the trigger data-open', () => {
        // DIVERGENCE (documented): Base UI marks the open trigger
        // `data-popup-open`/`data-pressed`; foldkit emits `data-open` on the
        // trigger and the wrapper instead.
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(trigger).not.toHaveAttr('data-open'),
          Scene.expect(Scene.selector('[data-slot="select"]')).not.toHaveAttr(
            'data-open',
          ),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(trigger).toHaveAttr('data-open', ''),
          Scene.expect(Scene.selector('[data-slot="select"]')).toHaveAttr(
            'data-open',
            '',
          ),
          Scene.expect(listbox).toExist(),
        )
      })

      it('opens the popup on pointer down and ignores the follow-up click', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.pointerDown(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(listbox).toExist(),
          // A mouse down/up pair ending in a click does not toggle a second
          // time — the click that follows the opening pointerdown is consumed.
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(listbox).toExist(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
        )
      })

      it('closes the popup when the trigger is clicked while open', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'Enter'),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(listbox).toBeAbsent(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          ...acknowledgeClosedPopup(),
        )
      })

      it('closes the popup on Escape', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.keydown(listbox, 'Escape'),
          Scene.expectHandled(),
          Scene.expect(listbox).toBeAbsent(),
          ...acknowledgeClosedPopup(),
        )
      })

      it('closes the popup when the backdrop is clicked', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expect(listbox).toBeAbsent(),
          ...acknowledgeClosedPopup(),
        )
      })

      // Base UI dismisses on an outside press; foldkit also treats focus
      // leaving the (non-modal) listbox as a dismissal that does not return
      // focus to the trigger.
      it('closes the popup when the listbox loses focus', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.blur(listbox),
          Scene.expectHandled(),
          Scene.expect(listbox).toBeAbsent(),
          Scene.Command.expectNone(),
          Scene.Mount.expectEnded(
            { name: 'AnchorListbox' },
            { name: 'PortalListboxBackdrop' },
          ),
        )
      })

      it('closes on a second pointer down while the trailing click is ignored', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.pointerDown(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.pointerDown(trigger),
          Scene.expectHandled(),
          Scene.expect(listbox).toBeAbsent(),
          ...acknowledgeClosedPopup(),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(listbox).toBeAbsent(),
        )
      })

      it('should select the item and close popup when clicked', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(option('two')).not.toHaveAttr('data-selected'),
          Scene.click(option('two')),
          Scene.expectHandled(),
          Scene.expect(option('two')).toBeAbsent(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger).toContainText('two'),
          ...acknowledgeClosedPopup(),
          // Reopening keeps the selection marked on the option.
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(option('two')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(option('two')).toHaveAttr('data-selected', ''),
        )
      })

      // DIVERGENCE: Base UI highlights the selected option when the popup is
      // reopened by pointer; foldkit only seeds the active item from the
      // selection on keyboard opens — pointer opens leave nothing active.
      it.fails('should focus the selected item upon opening the popup', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.click(option('three')),
          Scene.expectHandled(),
          ...acknowledgeClosedPopup(),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(option('three')).toHaveAttr('data-active', ''),
        )
      })

      it('activates the selected item when reopened with the keyboard', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(selectedModel(Select, 'fruit', 'three')),
          Scene.keydown(trigger, 'ArrowDown'),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(option('three')).toHaveAttr('data-active', ''),
          Scene.expect(listbox).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-2',
          ),
        )
      })

      it('opens with ArrowUp onto the last item when nothing is selected', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'ArrowUp'),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(option('three')).toHaveAttr('data-active', ''),
        )
      })

      it('navigating with keyboard should move the active item', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'ArrowDown'),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(option('one')).toHaveAttr('data-active', ''),
          Scene.keydown(listbox, 'ArrowDown'),
          Scene.expectHandled(),
          resolveScrollIntoView(),
          Scene.expect(option('two')).toHaveAttr('data-active', ''),
          Scene.expect(option('one')).not.toHaveAttr('data-active'),
          Scene.expect(listbox).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-1',
          ),
          Scene.keydown(listbox, 'ArrowDown'),
          Scene.expectHandled(),
          resolveScrollIntoView(),
          Scene.expect(option('three')).toHaveAttr('data-active', ''),
        )
      })

      it('navigates to the first and last items with Home and End', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.keydown(listbox, 'End'),
          Scene.expectHandled(),
          resolveScrollIntoView(),
          Scene.expect(option('three')).toHaveAttr('data-active', ''),
          Scene.keydown(listbox, 'Home'),
          Scene.expectHandled(),
          resolveScrollIntoView(),
          Scene.expect(option('one')).toHaveAttr('data-active', ''),
        )
      })

      // DIVERGENCE: Base UI does not loop focus — ArrowDown on the last item
      // stays put; foldkit wraps keyboard navigation to the first item.
      it.fails('does not wrap focus at the list edges', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.keydown(listbox, 'End'),
          Scene.expectHandled(),
          resolveScrollIntoView(),
          Scene.keydown(listbox, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(option('three')).toHaveAttr('data-active', ''),
        )
      })

      it('skips disabled items while navigating', () => {
        Scene.scene(
          {
            update,
            view: view({
              itemToConfig: item => ({ isDisabled: item === 'two' }),
            }),
          },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'ArrowDown'),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(option('one')).toHaveAttr('data-active', ''),
          Scene.keydown(listbox, 'ArrowDown'),
          Scene.expectHandled(),
          resolveScrollIntoView(),
          Scene.expect(option('three')).toHaveAttr('data-active', ''),
          Scene.expect(option('two')).not.toHaveAttr('data-active'),
        )
      })

      it('should select item when Enter key is pressed', () => {
        // foldkit commits a keyboard-activated item by emitting a ClickItem
        // Command — in the real runtime it clicks the option element, which
        // closes the popup and selects through the same path as a mouse click.
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'ArrowDown'),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.keydown(listbox, 'ArrowDown'),
          Scene.expectHandled(),
          resolveScrollIntoView(),
          Scene.keydown(listbox, 'Enter'),
          Scene.expectHandled(),
          Scene.Command.expectHas({
            name: 'ClickItem',
            args: { id: 'fruit', index: 1 },
          }),
          Scene.Command.resolve(
            ListboxPrimitive.ClickItem,
            ListboxPrimitive.Message.CompletedClickItem(),
          ),
          Scene.expect(listbox).toExist(),
          // The DOM click has not happened yet, so the popup is still open;
          // close it the way a dismissed commit-less session would.
          Scene.keydown(listbox, 'Escape'),
          Scene.expectHandled(),
          ...acknowledgeClosedPopup(),
        )
      })

      it('does not trigger selection when Space is pressed during text navigation', () => {
        Scene.scene(
          {
            update,
            view: view({ items: ['Item One', 'Item Two'] }),
          },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.keydown(listbox, 'i'),
          Scene.expectHandled(),
          dropSearchDebounce(),
          Scene.keydown(listbox, ' '),
          Scene.expectHandled(),
          // Space extends the search query ("i ") instead of committing.
          Scene.Command.resolve(
            ListboxPrimitive.DelayClearSearch,
            ListboxPrimitive.Message.CompletedDelayClearSearch({ version: 2 }),
          ),
          Scene.expect(listbox).toExist(),
          Scene.expectNoOutMessage(),
          Scene.expect(trigger).not.toContainText('Item'),
        )
      })

      it('should not select a disabled item', () => {
        Scene.scene(
          {
            update,
            view: view({
              itemToConfig: item => ({ isDisabled: item === 'two' }),
            }),
          },
          Scene.given(initModel(Select, 'fruit')),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(option('two')).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(option('two')).toHaveAttr('data-disabled', ''),
          // No click handler exists, so the option can never commit.
          Scene.expect(option('two')).not.toHaveHandler('click'),
          Scene.expect(trigger).not.toContainText('two'),
        )
      })

      // DIVERGENCE: Base UI ignores a click on an option that was never
      // highlighted; foldkit commits on any option click (the scene DSL has
      // no pointermove step, so every scene click is "unhighlighted").
      it.fails('should ignore an unhighlighted item with a generic virtual click', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.expect(option('two')).not.toHaveAttr('data-active'),
          Scene.click(option('two')),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
        )
      })

      it.todo(
        'should highlight a hovered item and commit it with a mouse click ' +
          '(the scene DSL has no pointermove step for OnPointerMove)',
      )
      it.todo(
        'should select an item via drag-to-select (no pointer capture, ' +
          'screenX/screenY deltas, or timing in the scene DSL)',
      )
    })

    describe('typeahead', () => {
      const searchView = () => view({ items: ['apple', 'apricot', 'banana'] })

      it('moves the highlight with typeahead while the popup is open', () => {
        Scene.scene(
          { update, view: searchView() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.keydown(listbox, 'b'),
          Scene.expectHandled(),
          Scene.Command.resolve(
            ListboxPrimitive.DelayClearSearch,
            ListboxPrimitive.Message.CompletedDelayClearSearch({ version: 1 }),
          ),
          Scene.expect(option('banana')).toHaveAttr('data-active', ''),
          Scene.expect(listbox).toHaveAttr(
            'aria-activedescendant',
            'fruit-item-2',
          ),
          Scene.expectNoOutMessage(),
        )
      })

      it('skips disabled items while moving the highlight with typeahead', () => {
        Scene.scene(
          {
            update,
            view: view({
              items: ['apple', 'apricot', 'banana'],
              itemToConfig: item => ({ isDisabled: item === 'apple' }),
            }),
          },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.keydown(listbox, 'a'),
          Scene.expectHandled(),
          Scene.Command.resolve(
            ListboxPrimitive.DelayClearSearch,
            ListboxPrimitive.Message.CompletedDelayClearSearch({ version: 1 }),
          ),
          Scene.expect(option('apricot')).toHaveAttr('data-active', ''),
          Scene.expect(option('apple')).not.toHaveAttr('data-active'),
        )
      })

      it('accumulates keystrokes into one search before the debounce clears', () => {
        Scene.scene(
          { update, view: view({ items: ['Item One', 'Item Two', 'Other'] }) },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.keydown(listbox, 'i'),
          Scene.expectHandled(),
          // Stale completions — each keystroke's debounce fires against a
          // superseded version, so the query keeps accumulating.
          dropSearchDebounce(),
          Scene.keydown(listbox, 't'),
          Scene.expectHandled(),
          dropSearchDebounce(),
          Scene.keydown(listbox, 'e'),
          Scene.expectHandled(),
          dropSearchDebounce(),
          Scene.keydown(listbox, 'm'),
          Scene.expectHandled(),
          dropSearchDebounce(),
          Scene.keydown(listbox, ' '),
          Scene.expectHandled(),
          dropSearchDebounce(),
          Scene.keydown(listbox, 't'),
          Scene.expectHandled(),
          Scene.Command.resolve(
            ListboxPrimitive.DelayClearSearch,
            ListboxPrimitive.Message.CompletedDelayClearSearch({ version: 6 }),
          ),
          // "item t" skips "Item One" and lands on "Item Two".
          Scene.expect(option('Item Two')).toHaveAttr('data-active', ''),
        )
      })

      // DIVERGENCE: Base UI commits the matching item when a printable key is
      // pressed on a focused, closed trigger. foldkit's trigger keydown only
      // handles open/navigation keys — printable keys are ignored.
      it.fails('commits typeahead on a closed trigger when items are provided', () => {
        Scene.scene(
          { update, view: view({ items: ['apple', 'banana'], name: 'fruit' }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'b'),
          Scene.expect(hiddenInput).toHaveValue('banana'),
        )
      })

      it.fails('skips disabled items and commits the next match via typeahead on a closed trigger', () => {
        Scene.scene(
          {
            update,
            view: view({
              items: ['apple', 'orange', 'one'],
              itemToConfig: item => ({ isDisabled: item === 'one' }),
              name: 'fruit',
            }),
          },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'o'),
          Scene.expect(hiddenInput).toHaveValue('orange'),
        )
      })

      it('commits nothing when the only typeahead match is disabled (closed trigger)', () => {
        // Outcome parity: foldkit ignores closed-trigger typeahead entirely,
        // so nothing can commit regardless of item state.
        Scene.scene(
          {
            update,
            view: view({
              items: ['apple', 'one'],
              itemToConfig: item => ({ isDisabled: item === 'one' }),
              name: 'fruit',
            }),
          },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'o'),
          Scene.expectIgnored(),
          Scene.expectNoOutMessage(),
          Scene.expect(hiddenInput).not.toHaveAttr('value'),
          Scene.expect(trigger).toContainText(''),
        )
      })
    })

    describe('prop: disabled', () => {
      it('uses aria-disabled instead of the HTML disabled attribute', () => {
        // DIVERGENCE (documented): Base UI sets the native `disabled`
        // attribute on the trigger. foldkit renders aria-disabled +
        // data-disabled and simply omits all interaction handlers, so the
        // control can never open.
        Scene.scene(
          { update, view: view({ isDisabled: true }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(trigger).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(trigger).toHaveAttr('data-disabled', ''),
          Scene.expect(trigger).toBeDisabled(),
          Scene.expect(trigger).not.toHaveHandler('click'),
          Scene.expect(trigger).not.toHaveHandler('pointerdown'),
          Scene.expect(trigger).not.toHaveHandler('keydown'),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
        )
      })

      it.fails('sets the disabled attribute on the trigger', () => {
        Scene.scene(
          { update, view: view({ isDisabled: true }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(trigger).toHaveAttr('disabled', ''),
        )
      })

      // DIVERGENCE: Base UI propagates `disabled` from the root onto items
      // (data-disabled + unclickable). foldkit's root isDisabled only neuters
      // the trigger; options rendered by a programmatically-opened disabled
      // select are unaffected.
      it.fails('inherits the disabled state from the root on items', () => {
        Scene.scene(
          { update, view: view({ isDisabled: true }) },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.expect(option('one')).toHaveAttr('aria-disabled', 'true'),
        )
      })
    })

    describe('prop: readOnly', () => {
      it.each([
        { name: 'ArrowDown', key: 'ArrowDown' },
        { name: 'Enter', key: 'Enter' },
        { name: 'Space', key: ' ' },
      ])('opens the popup with $name', ({ key }) => {
        Scene.scene(
          { update, view: view({ isReadOnly: true }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, key),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(listbox).toExist(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
        )
      })

      it('opens the popup when clicked', () => {
        Scene.scene(
          { update, view: view({ isReadOnly: true }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(listbox).toExist(),
          Scene.expect(listbox).toHaveAttr('aria-readonly', 'true'),
          Scene.expect(listbox).toHaveAttr('data-readonly', ''),
          Scene.expect(trigger).toHaveAttr('data-readonly', ''),
          Scene.expect(option('one')).toHaveAttr('data-readonly', ''),
        )
      })

      it('does not commit a value when an item is clicked in a popup the user opened', () => {
        Scene.scene(
          { update, view: view({ isReadOnly: true }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          // readOnly options carry no click handler, so no commit is possible.
          Scene.expect(option('two')).not.toHaveHandler('click'),
          Scene.expect(option('two')).not.toHaveAttr('data-selected'),
          Scene.expect(trigger).not.toContainText('two'),
        )
      })

      it('does not commit a value with Enter on a highlighted item', () => {
        Scene.scene(
          { update, view: view({ isReadOnly: true }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'ArrowDown'),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.keydown(listbox, 'Enter'),
          // SuppressedItemCommit: handled, popup stays open, nothing emitted.
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.Command.expectNone(),
          Scene.expect(listbox).toExist(),
          Scene.expect(trigger).not.toContainText('one'),
        )
      })

      it('does not commit a value with typeahead on a closed trigger', () => {
        Scene.scene(
          { update, view: view({ isReadOnly: true }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.keydown(trigger, 'b'),
          Scene.expectIgnored(),
          Scene.expectNoOutMessage(),
          Scene.expect(trigger).toContainText(''),
        )
      })

      // DIVERGENCE: Base UI mirrors readOnly onto the trigger as
      // aria-readonly="true"; foldkit marks the trigger data-readonly only
      // (aria-readonly lands on the listbox).
      it.fails('marks the trigger aria-readonly', () => {
        Scene.scene(
          { update, view: view({ isReadOnly: true }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(trigger).toHaveAttr('aria-readonly', 'true'),
        )
      })
    })

    describe('prop: id', () => {
      it('sets the id on the trigger', () => {
        // DIVERGENCE (intentional): Base UI lands `id` verbatim on the trigger;
        // foldkit namespaces the sub-elements off the model id, so the trigger
        // is `<id>-button`, the listbox `<id>-items`, and items `<id>-item-N`.
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'test-id')),
          Scene.expect(trigger).toHaveId('test-id-button'),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.expect(listbox).toHaveId('test-id-items'),
          Scene.expect(option('one')).toHaveId('test-id-item-0'),
        )
      })

      // DIVERGENCE: Base UI gives the hidden input `<id>-hidden-input`; the
      // foldkit hidden input carries no id.
      it.fails('sets a hidden input id when name is not provided', () => {
        Scene.scene(
          { update, view: view({ name: 'fruit' }) },
          Scene.given(initModel(Select, 'test-id')),
          Scene.expect(hiddenInput).toHaveAttr('id', 'test-id-hidden-input'),
        )
      })
    })

    describe('form metadata', () => {
      it('mirrors the selected value into a named hidden input', () => {
        Scene.scene(
          { update, view: view({ name: 'fruit' }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(hiddenInput).toHaveAttr('name', 'fruit'),
          Scene.expect(hiddenInput).not.toHaveAttr('value'),
          Scene.expect(hiddenInput).toHaveAttr('type', 'hidden'),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.click(option('two')),
          Scene.expectHandled(),
          Scene.expect(hiddenInput).toHaveValue('two'),
          ...acknowledgeClosedPopup(),
        )
      })

      it('marks the hidden input with the form attribute', () => {
        Scene.scene(
          { update, view: view({ name: 'fruit', form: 'order-form' }) },
          Scene.given(selectedModel(Select, 'fruit', 'one')),
          Scene.expect(hiddenInput).toHaveAttr('form', 'order-form'),
          Scene.expect(hiddenInput).toHaveValue('one'),
        )
      })

      it('omits the hidden input entirely when no name is provided', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(hiddenInput).toBeAbsent(),
        )
      })

      it.todo(
        'marks the hidden input required when no selection exists ' +
          '(creaseui Select has no required prop)',
      )
    })

    describe('groups', () => {
      const groupedView = () =>
        view({
          items: ['apple', 'banana', 'carrot'],
          itemGroupKey: item => (item === 'carrot' ? 'vegetables' : 'fruits'),
          groupToHeading: group => group,
        })

      it('should render group with label', () => {
        Scene.scene(
          { update, view: groupedView() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.expect(Scene.role('group', { name: 'fruits' })).toExist(),
          Scene.expect(Scene.role('group', { name: 'vegetables' })).toExist(),
          // Base UI's GroupLabel is aria-hidden by default; foldkit renders
          // the heading as role=presentation.
          Scene.expect(Scene.selector('#fruit-heading-fruits')).toHaveAttr(
            'role',
            'presentation',
          ),
          Scene.expect(Scene.selector('#fruit-heading-fruits')).toContainText(
            'fruits',
          ),
        )
      })

      it('should associate label with group', () => {
        Scene.scene(
          { update, view: groupedView() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          // The group element has no DOM id — the keyed vnode's id only
          // becomes an aria-labelledby target on the heading.
          Scene.expect(Scene.role('group', { name: 'fruits' })).toHaveAttr(
            'aria-labelledby',
            'fruit-heading-fruits',
          ),
          Scene.expect(Scene.role('group', { name: 'vegetables' })).toHaveAttr(
            'aria-labelledby',
            'fruit-heading-vegetables',
          ),
        )
      })

      it('renders a separator between groups', () => {
        Scene.scene(
          { update, view: groupedView() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.expectAll(Scene.all.role('separator')).toHaveCount(1),
          Scene.expect(
            Scene.selector('[data-slot="select-separator"]'),
          ).toExist(),
        )
      })
    })

    describe('item indicator', () => {
      // DIVERGENCE (documented): Base UI mounts Select.ItemIndicator only
      // while the item is selected (unless keepMounted). creaseui always
      // renders the indicator span and reveals it via selection-driven
      // styling — there is no keepMounted equivalent.
      it('keeps the indicator mounted regardless of selection', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          Scene.expectAll(itemIndicator).toHaveCount(3),
          Scene.expect(
            Scene.selector('[data-slot="select-item-indicator"]'),
          ).toExist(),
        )
      })
    })

    describe('value projection', () => {
      const objectView = (model: Model, h: HtmlBuilder<Message>): Html =>
        Select.select(
          {
            model: model.select,
            maybeSelectedValue: model.maybeSelected,
            toParentMessage: message => ({
              _tag: 'GotSelect' as const,
              message,
            }),
            items: [
              { value: 'v1', label: 'Label One' },
              { value: 'v2', label: 'Label Two' },
            ],
            itemToValue: item => item.value,
            itemToLabel: item => item.label,
            name: 'fruit',
          },
          h,
        )

      it('uses itemToLabel for trigger text when items are objects', () => {
        Scene.scene(
          { update, view: objectView },
          Scene.given(selectedModel(Select, 'fruit', 'v2')),
          Scene.expect(trigger).toContainText('Label Two'),
          Scene.expect(hiddenInput).toHaveValue('v2'),
        )
      })

      it('uses itemToConfig.searchText for typeahead when provided', () => {
        Scene.scene(
          {
            update,
            view: (model: Model, h: HtmlBuilder<Message>): Html =>
              Select.select(
                {
                  model: model.select,
                  maybeSelectedValue: model.maybeSelected,
                  toParentMessage: message => ({
                    _tag: 'GotSelect' as const,
                    message,
                  }),
                  items: [
                    { value: 'v1', label: 'Apple' },
                    { value: 'v2', label: 'Banana' },
                  ],
                  itemToValue: item => item.value,
                  itemToLabel: item => item.label,
                  itemToConfig: item => ({ content: `pick ${item.label}` }),
                },
                h,
              ),
          },
          Scene.given(openModel(Select, 'fruit')),
          ...resolveOpenMounts(),
          // The visible option text differs from the searchable label:
          // "pick Banana" renders, but 'b' still targets it via itemToLabel.
          Scene.expect(option('pick Banana')).toExist(),
          Scene.keydown(listbox, 'b'),
          Scene.expectHandled(),
          Scene.Command.resolve(
            ListboxPrimitive.DelayClearSearch,
            ListboxPrimitive.Message.CompletedDelayClearSearch({ version: 1 }),
          ),
          Scene.expect(option('pick Banana')).toHaveAttr('data-active', ''),
        )
      })
    })

    describe('style hooks', () => {
      it('marks the trigger data-placeholder while empty and clears it once filled', () => {
        Scene.scene(
          { update, view: view({ placeholder: 'Select a fruit' }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(trigger).toHaveAttr('data-placeholder', ''),
          Scene.expect(selectValue).toHaveText('Select a fruit'),
          Scene.click(trigger),
          Scene.expectHandled(),
          ...resolveOpenedPopup(),
          Scene.click(option('two')),
          Scene.expectHandled(),
          Scene.expect(trigger).not.toHaveAttr('data-placeholder'),
          Scene.expect(selectValue).toHaveText('two'),
          ...acknowledgeClosedPopup(),
        )
      })

      // DIVERGENCE: Base UI also marks the Select.Value element with
      // data-placeholder while empty; creaseui only marks the trigger.
      it.fails('marks the value element data-placeholder while empty', () => {
        Scene.scene(
          { update, view: view({ placeholder: 'Select a fruit' }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(selectValue).toHaveAttr('data-placeholder', ''),
        )
      })

      it('marks data-invalid on the wrapper and trigger', () => {
        Scene.scene(
          { update, view: view({ isInvalid: true }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(trigger).toHaveAttr('data-invalid', ''),
          Scene.expect(Scene.selector('[data-slot="select"]')).toHaveAttr(
            'data-invalid',
            '',
          ),
        )
      })

      it('marks the wrapper dir for RTL', () => {
        Scene.scene(
          { update, view: view({ direction: 'rtl' }) },
          Scene.given(initModel(Select, 'fruit')),
          Scene.expect(Scene.selector('[data-slot="select"]')).toHaveAttr(
            'dir',
            'rtl',
          ),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindSelect)
verifyRenderer('StyleX', StyleXSelect)

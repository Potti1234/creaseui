import { Command } from 'foldkit'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Tabs as TabsPrimitive } from '@foldkit/ui'
import { describe, it } from 'vitest'

import {
  init as initGroup,
  update as updateGroup,
  type Message as GroupMessage,
  type Model as GroupModel,
} from '@/lib/toggle-group'
import * as StyleXToggleGroup from '@/stylex/toggle-group'
import * as TailwindToggleGroup from '@/ui/toggle-group'

/**
 * Behavioral parity suite ported from Base UI's toggle-group tests
 * (base-ui/packages/react/src/toggle-group/ToggleGroup.test.tsx, checked at
 * base-ui HEAD).
 *
 * creaseui's toggle-group is built on the foldkit Tabs primitive in Manual
 * activation mode: arrow keys move a roving tabindex, Enter/Space/click commit
 * a selection, and the parent owns the pressed values. "Uncontrolled" Base UI
 * cases map to whatever initial selection the parent seeds — there is no
 * separate defaultValue prop.
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - describeConformance / React internals (ref, render-prop, StrictMode)
 *  - 'should warn if Toggle value is not set and ToggleGroup value is
 *    defined' — a React dev console warning; creaseui's item type requires
 *    `value`, so the situation cannot be expressed
 *  - 'does not change the value when the event is canceled' — Base UI's
 *    eventDetails.cancel() has no foldkit analogue (plain messages, no DOM
 *    event objects)
 *  - the Toolbar-nested variant of 'multiple transitions' — creaseui has no
 *    Toolbar component
 *  - real focus movement (`toHaveFocus`) — the scene DSL has no DOM focus;
 *    roving `tabIndex` plus the resolved FocusTab command stand in for it
 *  - the legacy `onToggle` overload of `toggleGroup` (no model) — the ported
 *    suite exercises the model + OutMessage API only
 *  - toggle/Toggle.test.tsx standalone suite — covers the standalone toggle
 *    component (`src/ui/toggle.ts`), not the group
 */

type Model = Readonly<{
  group: GroupModel
  multiple: boolean
  values: ReadonlyArray<string>
}>

type Message = Readonly<
  | { _tag: 'GotGroup'; message: GroupMessage }
  | { _tag: 'SetValues'; values: ReadonlyArray<string> }
  | { _tag: 'SetMultiple'; multiple: boolean }
>

type OutMessage = Readonly<{
  _tag: 'ValueChanged'
  values: ReadonlyArray<string>
}>

const update = (
  model: Model,
  message: Message,
): {
  model: Model
  commands?: ReadonlyArray<Command.Command<Message>>
  outMessage?: OutMessage
} => {
  switch (message._tag) {
    case 'GotGroup': {
      const next = updateGroup(model.group, message.message)
      const commands = Command.mapMessages(next.commands, (child): Message => ({
        _tag: 'GotGroup',
        message: child,
      }))
      if (next.outMessage === undefined) {
        return { model: { ...model, group: next.model }, commands }
      }
      const selected = next.outMessage.value
      // Base UI toggle semantics: single-mode re-click deselects; multiple
      // adds/removes the value in the pressed set.
      const values = model.multiple
        ? model.values.includes(selected)
          ? model.values.filter(value => value !== selected)
          : [...model.values, selected]
        : model.values.includes(selected)
          ? []
          : [selected]
      return {
        model: { ...model, group: next.model, values },
        commands,
        outMessage: { _tag: 'ValueChanged', values },
      }
    }
    case 'SetValues':
      return { model: { ...model, values: message.values } }
    case 'SetMultiple':
      return { model: { ...model, multiple: message.multiple } }
  }
}

type ToggleGroupItemSpec = Readonly<{
  value: string
  children: ReadonlyArray<Html | string>
  ariaLabel?: string
  isDisabled?: boolean
}>

type SelectionProps =
  | Readonly<{ value: string; values?: never }>
  | Readonly<{ value?: never; values: ReadonlyArray<string> }>

type ToggleGroupModule = Readonly<{
  toggleGroup: <Msg>(
    props: Readonly<{
      model: GroupModel
      toParentMessage: (message: GroupMessage) => Msg
      ariaLabel: string
      items: ReadonlyArray<ToggleGroupItemSpec>
      direction?: 'ltr' | 'rtl'
      orientation?: 'vertical'
    }> &
      SelectionProps,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const items = (
  overrides?: Readonly<Record<string, Partial<ToggleGroupItemSpec>>>,
): ReadonlyArray<ToggleGroupItemSpec> =>
  (['one', 'two', 'three'] as const).map(value => ({
    value,
    children: [value[0]!.toUpperCase() + value.slice(1)],
    ...overrides?.[value],
  }))

type ViewOptions = Readonly<{
  items?: ReadonlyArray<ToggleGroupItemSpec>
  direction?: 'ltr' | 'rtl'
  vertical?: boolean
  controls?: (model: Model, h: HtmlBuilder<Message>) => ReadonlyArray<Html>
}>

const selectionProps = (model: Model): SelectionProps =>
  model.multiple ? { values: model.values } : { value: model.values[0] ?? '' }

const groupView =
  (ToggleGroup: ToggleGroupModule, options?: ViewOptions) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    h.div(
      [],
      [
        ToggleGroup.toggleGroup(
          {
            model: model.group,
            toParentMessage: (message): Message => ({
              _tag: 'GotGroup',
              message,
            }),
            ariaLabel: 'My Toggle Group',
            items: options?.items ?? items(),
            ...(options?.direction === undefined
              ? {}
              : { direction: options.direction }),
            ...(options?.vertical === true
              ? { orientation: 'vertical' as const }
              : {}),
            ...selectionProps(model),
          },
          h,
        ),
        ...(options?.controls === undefined ? [] : options.controls(model, h)),
      ],
    )

const fresh = (overrides?: {
  multiple?: boolean
  values?: ReadonlyArray<string>
}): Model => ({
  group: initGroup({ id: 'tg' }),
  multiple: overrides?.multiple ?? false,
  values: overrides?.values ?? [],
})

const resolveFocus = Scene.Command.resolve(
  TabsPrimitive.FocusTab,
  TabsPrimitive.Message.CompletedFocusTab(),
)

const group = Scene.role('group', { name: 'My Toggle Group' })
const one = Scene.role('button', { name: 'One' })
const two = Scene.role('button', { name: 'Two' })
const three = Scene.role('button', { name: 'Three' })

const verifyRenderer = (name: string, ToggleGroup: ToggleGroupModule) => {
  const view = (options?: ViewOptions) => groupView(ToggleGroup, options)

  describe(`${name} ToggleGroup (Base UI port)`, () => {
    it('renders a `group`', () => {
      Scene.scene(
        { update, view: view() },
        Scene.given(fresh()),
        Scene.expect(group).toExist(),
        Scene.expect(group).toHaveAccessibleName('My Toggle Group'),
      )
    })

    describe('uncontrolled', () => {
      it('pressed state', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh()),
          Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'false'),
          Scene.click(one),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'false'),
          Scene.click(two),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(two).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
        )
      })

      // Base UI's defaultValue is an uncontrolled initial value; creaseui
      // always takes the pressed set from the parent, so the initial model
      // plays the same role.
      it('prop: defaultValue', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh({ values: ['two'] })),
          Scene.expect(two).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
          Scene.click(one),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'false'),
        )
      })

      it.todo(
        'when Toggles omit value — creaseui items require a `value`; ' +
          'value-less Toggles cannot be expressed',
      )
    })

    describe('controlled', () => {
      it('pressed state', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh({ values: ['two'] })),
          Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'true'),
          Scene.click(one),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'false'),
        )
      })

      it('prop: value', () => {
        Scene.scene(
          {
            update,
            view: view({
              controls: (_model, h) => [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetValues', values: ['one'] }),
                  ],
                  ['Select one'],
                ),
              ],
            }),
          },
          Scene.given(fresh({ values: ['two'] })),
          Scene.expect(two).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
          Scene.click(Scene.role('button', { name: 'Select one' })),
          Scene.expectHandled(),
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'false'),
        )
      })
    })

    describe('prop: disabled', () => {
      // creaseui has no group-level `disabled` prop; setting isDisabled on
      // every item produces the same observable end state Base UI asserts.
      it('can disable the whole group', () => {
        Scene.scene(
          {
            update,
            view: view({
              items: items({
                one: { isDisabled: true },
                two: { isDisabled: true },
                three: { isDisabled: true },
              }),
            }),
          },
          Scene.given(fresh()),
          Scene.expect(one).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(one).toHaveAttr('data-disabled', ''),
          Scene.expect(one).toBeDisabled(),
          Scene.expect(one).not.toHaveHandler('click'),
          Scene.expect(two).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(two).toHaveAttr('data-disabled', ''),
          Scene.expect(two).toBeDisabled(),
          Scene.expect(two).not.toHaveHandler('click'),
          Scene.expect(three).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(three).toHaveAttr('data-disabled', ''),
          Scene.expect(three).toBeDisabled(),
          Scene.expect(three).not.toHaveHandler('click'),
        )
      })

      it('can disable individual items', () => {
        Scene.scene(
          {
            update,
            view: view({ items: items({ two: { isDisabled: true } }) }),
          },
          Scene.given(fresh()),
          Scene.expect(one).not.toHaveAttr('data-disabled'),
          Scene.expect(one).toBeEnabled(),
          Scene.expect(one).toHaveHandler('click'),
          Scene.expect(two).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(two).toHaveAttr('data-disabled', ''),
          Scene.expect(two).toBeDisabled(),
          Scene.expect(two).not.toHaveHandler('click'),
          Scene.expect(three).not.toHaveAttr('data-disabled'),
          Scene.expect(three).toBeEnabled(),
          Scene.expect(three).toHaveHandler('click'),
        )
      })

      // DIVERGENCE (low): Base UI emits aria-disabled="false" on enabled
      // toggles; creaseui omits the attribute entirely on enabled items.
      it.fails('emits aria-disabled="false" on enabled items', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh()),
          Scene.expect(one).toHaveAttr('aria-disabled', 'false'),
        )
      })
    })

    describe('prop: orientation', () => {
      it('vertical', () => {
        Scene.scene(
          { update, view: view({ vertical: true }) },
          Scene.given(fresh()),
          Scene.expect(group).toHaveAttr('data-orientation', 'vertical'),
        )
      })

      it('does not render aria-orientation on role="group"', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh()),
          Scene.expect(group).not.toHaveAttr('aria-orientation'),
        )
      })
    })

    describe('prop: multiple', () => {
      // DIVERGENCE (low): Base UI marks a multiple group with the
      // data-multiple styling hook; creaseui encodes multiplicity only in
      // which selection prop is used and emits no marker.
      it.fails('sets data-multiple only when true', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh({ multiple: true })),
          Scene.expect(group).toHaveAttr('data-multiple', ''),
        )
      })

      it('multiple items can be pressed when true', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh({ multiple: true, values: ['one'] })),
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'false'),
          Scene.click(two),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'true'),
        )
      })

      it('only one item can be pressed when false', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh({ values: ['one'] })),
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'false'),
          Scene.click(two),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'true'),
        )
      })

      it.todo(
        'when Toggles omit value — creaseui items require a `value`; ' +
          'value-less Toggles cannot be expressed',
      )

      // Port of 'multiple transitions' (standalone variant): switching the
      // parent between single and multiple mode keeps the pressed set and
      // the roving focus.
      it('preserves selection and roving focus across single/multiple switches', () => {
        Scene.scene(
          {
            update,
            view: view({
              controls: (model, h) => [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({
                      _tag: 'SetMultiple',
                      multiple: !model.multiple,
                    }),
                  ],
                  ['Switch mode'],
                ),
              ],
            }),
          },
          Scene.given(fresh({ values: ['one'] })),
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.click(two),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'true'),
          Scene.click(Scene.role('button', { name: 'Switch mode' })),
          Scene.expectHandled(),
          Scene.click(one),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'true'),
          Scene.click(two),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'false'),
          Scene.click(Scene.role('button', { name: 'Switch mode' })),
          Scene.expectHandled(),
          Scene.click(two),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
          Scene.expect(two).toHaveAttr('aria-pressed', 'true'),
          Scene.keydown(two, 'ArrowLeft'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('tabIndex', '0'),
          Scene.expect(two).toHaveAttr('tabIndex', '-1'),
        )
      })
    })

    describe('keyboard interactions', () => {
      // Scene has no DOM focus: tabIndex="0" marks the roving-focus item and
      // FocusTab command resolution stands in for the DOM focus itself.
      // creaseui reverses DOM order for direction="rtl" while keeping the
      // arrow mapping bound to DOM order, so for rtl/horizontal ArrowLeft
      // walks one→two→three exactly like Base UI's rtl nextKey.
      const matrix = [
        ['ltr', false, 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'],
        ['ltr', true, 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'],
        ['rtl', false, 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'],
      ] as const

      matrix.forEach(
        ([
          direction,
          vertical,
          nextKey,
          prevKey,
          ignoredNextKey,
          ignoredPrevKey,
        ]) => {
          it(`${direction} / orientation: ${vertical ? 'vertical' : 'horizontal'}`, () => {
            Scene.scene(
              {
                update,
                view: view({
                  direction,
                  ...(vertical ? { vertical } : {}),
                }),
              },
              Scene.given(fresh({ values: ['one'] })),
              Scene.expect(one).toHaveAttr('tabIndex', '0'),
              Scene.expect(two).toHaveAttr('tabIndex', '-1'),
              Scene.expect(three).toHaveAttr('tabIndex', '-1'),
              Scene.keydown(one, nextKey),
              Scene.expectHandled(),
              resolveFocus,
              Scene.expect(two).toHaveAttr('tabIndex', '0'),
              Scene.expect(one).toHaveAttr('tabIndex', '-1'),
              Scene.keydown(two, nextKey),
              Scene.expectHandled(),
              resolveFocus,
              Scene.expect(three).toHaveAttr('tabIndex', '0'),
              // loop to the beginning
              Scene.keydown(three, nextKey),
              Scene.expectHandled(),
              resolveFocus,
              Scene.expect(one).toHaveAttr('tabIndex', '0'),
              Scene.keydown(one, prevKey),
              Scene.expectHandled(),
              resolveFocus,
              Scene.expect(three).toHaveAttr('tabIndex', '0'),
              Scene.keydown(three, prevKey),
              Scene.expectHandled(),
              resolveFocus,
              Scene.expect(two).toHaveAttr('tabIndex', '0'),
              // keys from the other axis should not move focus
              Scene.keydown(two, ignoredNextKey),
              Scene.expectIgnored(),
              Scene.expect(two).toHaveAttr('tabIndex', '0'),
              Scene.keydown(two, ignoredPrevKey),
              Scene.expectIgnored(),
              Scene.expect(two).toHaveAttr('tabIndex', '0'),
            )
          })
        },
      )

      // DIVERGENCE (med): Base UI keeps DOM order in a vertical RTL group and
      // ArrowDown moves one→two→three. creaseui reverses item order for
      // direction="rtl" regardless of orientation, so ArrowDown walks the
      // reversed order one→three→two.
      it.fails('rtl / orientation: vertical', () => {
        Scene.scene(
          { update, view: view({ direction: 'rtl', vertical: true }) },
          Scene.given(fresh({ values: ['one'] })),
          Scene.expect(one).toHaveAttr('tabIndex', '0'),
          Scene.keydown(one, 'ArrowDown'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(two).toHaveAttr('tabIndex', '0'),
        )
      })

      it('Home key moves focus to the first item', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh()),
          Scene.expect(one).toHaveAttr('tabIndex', '0'),
          Scene.keydown(one, 'ArrowRight'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.keydown(two, 'ArrowRight'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(three).toHaveAttr('tabIndex', '0'),
          Scene.keydown(three, 'Home'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('tabIndex', '0'),
          Scene.keydown(one, 'ArrowRight'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(two).toHaveAttr('tabIndex', '0'),
          Scene.keydown(two, 'Home'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('tabIndex', '0'),
        )
      })

      it('End key moves focus to the last item', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh()),
          Scene.expect(one).toHaveAttr('tabIndex', '0'),
          Scene.keydown(one, 'End'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(three).toHaveAttr('tabIndex', '0'),
          Scene.keydown(three, 'ArrowLeft'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(two).toHaveAttr('tabIndex', '0'),
          Scene.keydown(two, 'End'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(three).toHaveAttr('tabIndex', '0'),
        )
      })

      // foldkit activates on keydown (OnKeyDownPreventDefault matches
      // 'Enter'/' ' against the roving-focus index), so unlike plain buttons
      // both keys are exercisable here.
      ;(['Enter', ' '] as const).forEach(key => {
        it(`key: ${key === ' ' ? 'Space' : key} toggles the pressed state`, () => {
          Scene.scene(
            { update, view: view() },
            Scene.given(fresh()),
            Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
            Scene.keydown(one, key),
            Scene.expectHandled(),
            resolveFocus,
            Scene.expect(one).toHaveAttr('aria-pressed', 'true'),
            Scene.keydown(one, key),
            Scene.expectHandled(),
            resolveFocus,
            Scene.expect(one).toHaveAttr('aria-pressed', 'false'),
          )
        })
      })
    })

    describe('prop: onValueChange', () => {
      it('fires when an Item is clicked', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh()),
          Scene.click(one),
          Scene.expectHandled(),
          Scene.expectOutMessage({ _tag: 'ValueChanged', values: ['one'] }),
          resolveFocus,
          Scene.click(two),
          Scene.expectHandled(),
          Scene.expectOutMessage({ _tag: 'ValueChanged', values: ['two'] }),
          resolveFocus,
        )
      })

      ;(['Enter', ' '] as const).forEach(key => {
        it(`fires when the ${key === ' ' ? 'Space' : key} is pressed`, () => {
          Scene.scene(
            { update, view: view() },
            Scene.given(fresh()),
            Scene.keydown(one, key),
            Scene.expectHandled(),
            Scene.expectOutMessage({ _tag: 'ValueChanged', values: ['one'] }),
            resolveFocus,
            Scene.keydown(one, 'ArrowRight'),
            Scene.expectHandled(),
            resolveFocus,
            Scene.keydown(two, key),
            Scene.expectHandled(),
            Scene.expectOutMessage({ _tag: 'ValueChanged', values: ['two'] }),
            resolveFocus,
          )
        })
      })
    })

    describe('style hooks', () => {
      // DIVERGENCE (med): Base UI marks pressed items with data-pressed.
      // creaseui reflects pressed state only via aria-pressed; the sole
      // data-* marker is the tabs primitive's data-selected on the
      // roving-focus item, which tracks focus rather than the pressed set.
      it.fails('marks the pressed item with data-pressed', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(fresh()),
          Scene.click(one),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(one).toHaveAttr('data-pressed', ''),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindToggleGroup)
verifyRenderer('StyleX', StyleXToggleGroup)

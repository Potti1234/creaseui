import { Command } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import { describe, it } from 'vitest'

import { Tabs as TabsPrimitive } from '@foldkit/ui'

import * as StyleXTabs from '@/stylex/tabs'
import * as TailwindTabs from '@/ui/tabs'

/**
 * Behavioral parity suite ported from Base UI's tabs tests
 * (base-ui/packages/react/src/tabs/{root,list,tab,panel,indicator}/*.test.tsx,
 * checked at base-ui HEAD).
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - React-implementation internals: describeConformance, refs, contexts,
 *    StrictMode panel registration, React 17, suspense, error boundaries.
 *  - `render=`/`nativeButton` element substitution and render-prop state
 *    (react-router Link, anchor tabs, activation-direction render state).
 *  - `onValueChange` eventDetails payloads (cancel(), reason, event,
 *    activationDirection) — foldkit emits a plain `Selected` OutMessage.
 *  - Implicit/uncontrolled selection: auto-select first enabled tab on
 *    mount, `reason: 'initial' | 'disabled' | 'missing'` fallbacks, null
 *    selection. creaseui's `selectedValue` is always parent-owned, so the
 *    only fallback is the presentational `activeIndex = 0`.
 *  - `Tabs.Indicator` — creaseui has no indicator part (the whole
 *    TabsIndicator.test.tsx suite: CSS var positioning, transforms,
 *    prehydration script, CSP nonce — all layout/hydration internals).
 *  - `data-activation-direction` tracking (Base UI-only feature).
 *  - Real DOM focus movement (tab.focus(), Tab key, toHaveFocus),
 *    portals/popups, secondary-button press choreography, non-main
 *    button discrimination, and pointerdown-vs-click timing — foldkit
 *    commits selection on click and the scene DSL cannot click disabled
 *    or assert pointerdown payloads.
 *  - `hidden` tabs, `keepMounted` panels, panels sharing a value,
 *    non-string tab values (creaseui `Value extends string`).
 *  - Panel mount/unmount animations, `data-ending-style`, resize
 *    observation — no layout engine in the vnode DSL.
 */

type Model = Readonly<{
  tabs: TabsPrimitive.Model
  selected: string
  values: ReadonlyArray<string>
  disabled: ReadonlyArray<string>
}>

type Message = Readonly<
  | { _tag: 'GotTabs'; message: TabsPrimitive.Message }
  | { _tag: 'SetSelected'; value: string }
  | { _tag: 'RemoveValue'; value: string }
  | { _tag: 'SetDisabled'; value: string; isDisabled: boolean }
>

type TabsModule = Readonly<{
  init: typeof TailwindTabs.init
  update: typeof TailwindTabs.update
  tabs: <Msg>(
    props: Readonly<{
      model: TailwindTabs.Model
      selectedValue: string
      toParentMessage: (message: TabsPrimitive.Message) => Msg
      tabs: ReadonlyArray<{
        value: string
        label: Html | string
        content: Html | string
        isDisabled?: boolean
      }>
      ariaLabel?: string
      orientation?: 'horizontal' | 'vertical'
      direction?: 'ltr' | 'rtl'
      variant?: 'default' | 'line' | null
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const tabConfigs = (model: Model) =>
  model.values.map((value) => ({
    value,
    label: `Tab ${value}`,
    content: `Panel ${value}`,
    isDisabled: model.disabled.includes(value),
  }))

const givenModel = (
  overrides?: Partial<Model>,
): Model => ({
  tabs: TabsPrimitive.init({ id: 'demo-tabs' }),
  selected: 'one',
  values: ['one', 'two', 'three'],
  disabled: [],
  ...overrides,
})

const givenManualModel = (overrides?: Partial<Model>): Model => ({
  ...givenModel(overrides),
  tabs: TabsPrimitive.init({ id: 'demo-tabs', activationMode: 'Manual' }),
})

const tab = (name: string) => Scene.role('tab', { name })
const tablist = Scene.role('tablist')
const panel = Scene.role('tabpanel')
const allTabs = Scene.all.role('tab')

const resolveFocus = Scene.Command.resolve(
  TabsPrimitive.FocusTab,
  TabsPrimitive.Message.CompletedFocusTab(),
)

const verifyRenderer = (name: string, Tabs: TabsModule) => {
  const update = (model: Model, message: Message) => {
    switch (message._tag) {
      case 'GotTabs': {
        const next = Tabs.update(model.tabs, message.message)
        const selection = next.outMessage
        return {
          model: {
            ...model,
            tabs: next.model,
            selected:
              selection === undefined ? model.selected : selection.value,
          },
          commands: Command.mapMessages(next.commands, (child) => ({
            _tag: 'GotTabs' as const,
            message: child,
          })),
          outMessage: next.outMessage,
        }
      }
      case 'SetSelected':
        return { model: { ...model, selected: message.value } }
      case 'RemoveValue':
        return {
          model: {
            ...model,
            values: model.values.filter((value) => value !== message.value),
          },
        }
      case 'SetDisabled':
        return {
          model: {
            ...model,
            disabled: message.isDisabled
              ? [...model.disabled, message.value]
              : model.disabled.filter((value) => value !== message.value),
          },
        }
    }
  }

  const defaultView =
    (overrides?: {
      ariaLabel?: string
      orientation?: 'horizontal' | 'vertical'
      direction?: 'ltr' | 'rtl'
    }) =>
    (model: Model, h: HtmlBuilder<Message>) =>
      Tabs.tabs(
        {
          model: model.tabs,
          selectedValue: model.selected,
          toParentMessage: (message) => ({ _tag: 'GotTabs', message }),
          tabs: tabConfigs(model),
          ...overrides,
        },
        h,
      )

  describe(`${name} Tabs (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('sets role=tablist with an accessible name and role=tab triggers', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel()),
          Scene.expect(tablist).toHaveAccessibleName('Tabs'),
          Scene.expect(tab('Tab one')).toExist(),
          Scene.expect(tab('Tab two')).toExist(),
          Scene.expect(tab('Tab three')).toExist(),
          Scene.expect(panel).toExist(),
        )
      })

      it('can be named via `aria-label`', () => {
        Scene.scene(
          { update, view: defaultView({ ariaLabel: 'string label' }) },
          Scene.given(givenModel()),
          Scene.expect(tablist).toHaveAccessibleName('string label'),
        )
      })

      it.todo(
        'can be named via `aria-labelledby` — creaseui exposes ariaLabel only',
      )

      // DIVERGENCE: Base UI omits aria-orientation on a horizontal tablist
      // (horizontal is the implicit default) and only emits it when
      // orientation="vertical". foldkit always emits it.
      it.fails(
        'does not add aria-orientation by default',
        () => {
          Scene.scene(
            { update, view: defaultView() },
            Scene.given(givenModel()),
            Scene.expect(tablist).not.toHaveAttr('aria-orientation'),
          )
        },
      )

      it('adds the proper aria-orientation when vertical', () => {
        Scene.scene(
          { update, view: defaultView({ orientation: 'vertical' }) },
          Scene.given(givenModel()),
          Scene.expect(tablist).toHaveAttr('aria-orientation', 'vertical'),
        )
      })

      it('sets the aria-selected attribute on the active tab', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel()),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'false'),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'false'),
          Scene.click(tab('Tab two')),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'false'),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'false'),
          resolveFocus,
          Scene.click(tab('Tab three')),
          Scene.expectHandled(),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
          Scene.click(tab('Tab one')),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
        )
      })
    })

    describe('tab and panel wiring', () => {
      it('sets the aria-labelledby attribute on the tab panel to the corresponding tab id', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel()),
          Scene.expect(tab('Tab one')).toHaveAttr('id', 'demo-tabs-tab-0'),
          Scene.expect(panel).toHaveAttr(
            'aria-labelledby',
            'demo-tabs-tab-0',
          ),
          Scene.expect(panel).toHaveText('Panel one'),
        )
      })

      it('sets aria-controls only on the active tab and syncs it to the mounted panel', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel()),
          // Panels mount active-only, so only the selected tab points at a
          // panel — matching Base UI when keepMounted is false.
          Scene.expect(tab('Tab one')).toHaveAttr(
            'aria-controls',
            'demo-tabs-panel-0',
          ),
          Scene.expect(tab('Tab two')).not.toHaveAttr('aria-controls'),
          Scene.expect(tab('Tab three')).not.toHaveAttr('aria-controls'),
          Scene.click(tab('Tab two')),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).not.toHaveAttr('aria-controls'),
          Scene.expect(tab('Tab two')).toHaveAttr(
            'aria-controls',
            'demo-tabs-panel-1',
          ),
          Scene.expect(panel).toHaveAttr('id', 'demo-tabs-panel-1'),
          resolveFocus,
        )
      })

      it('puts the selected child in tab order', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetSelected', value: 'three' }),
                  ],
                  ['Select three'],
                ),
                Tabs.tabs(
                  {
                    model: model.tabs,
                    selectedValue: model.selected,
                    toParentMessage: (message) => ({
                      _tag: 'GotTabs',
                      message,
                    }),
                    tabs: tabConfigs(model),
                  },
                  h,
                ),
              ]),
          },
          Scene.given(givenModel()),
          Scene.expect(tab('Tab one')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab two')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '-1'),
          // Controlled change from outside moves the tab stop to the new
          // selected tab.
          Scene.click(Scene.text('Select three')),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(tab('Tab two')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '0'),
        )
      })

      it('marks the active tab and panel with data-selected', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel()),
          Scene.expect(tab('Tab one')).toHaveAttr('data-selected', ''),
          Scene.expect(panel).toHaveAttr('data-selected', ''),
          Scene.expect(tab('Tab two')).not.toHaveAttr('data-selected'),
        )
      })

      // DIVERGENCE: Base UI emits data-index on every panel; foldkit's
      // panel attributes carry only id/role/aria-labelledby/tabIndex/
      // data-selected — there is no data-index hook.
      it.fails('sets the panel index data attribute', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel()),
          Scene.expect(panel).toHaveAttr('data-index', '0'),
        )
      })
    })

    describe('pointer navigation', () => {
      it('selects the clicked tab and swaps the rendered panel', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel({ selected: 'one' })),
          Scene.expect(panel).toHaveText('Panel one'),
          Scene.click(tab('Tab two')),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            TabsPrimitive.OutMessage.Selected({ value: 'two', index: 1 }),
          ),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(panel).toHaveText('Panel two'),
          Scene.expect(Scene.text('Panel one')).toBeAbsent(),
          resolveFocus,
        )
      })

      it('does not select the clicked disabled tab', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel({ disabled: ['two'] })),
          // The disabled tab emits no click handler, so a click can never
          // select it (Scene.click would throw on the disabled target).
          Scene.expect(tab('Tab two')).not.toHaveHandler('click'),
          Scene.expect(tab('Tab two')).toBeDisabled(),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(tab('Tab two')).toHaveAttr('data-disabled', ''),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'false'),
        )
      })

      // DIVERGENCE: Base UI does not call onValueChange when the active tab
      // is clicked again. foldkit dispatches SelectedTab unconditionally,
      // so the OutMessage re-commits.
      it.fails(
        'should not call onValueChange when already active',
        () => {
          Scene.scene(
            { update, view: defaultView() },
            Scene.given(givenModel()),
            Scene.click(tab('Tab one')),
            Scene.expectHandled(),
            Scene.expectNoOutMessage(),
          )
        },
      )

      // DIVERGENCE (documented): Base UI's activateOnFocus commits selection
      // on pointerdown; foldkit wires no pointerdown handler and commits on
      // click instead.
      it('commits selection on click, not pointerdown', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel()),
          Scene.expect(tab('Tab two')).toHaveHandler('click'),
          Scene.expect(tab('Tab two')).not.toHaveHandler('pointerdown'),
        )
      })
    })

    describe('keyboard navigation (horizontal, automatic activation)', () => {
      it('moves to and activates the next tab on ArrowRight', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel()),
          Scene.keydown(tab('Tab one'), 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            TabsPrimitive.OutMessage.Selected({ value: 'two', index: 1 }),
          ),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab two')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab one')).toHaveAttr('tabIndex', '-1'),
          resolveFocus,
        )
      })

      it('moves to and activates the previous tab on ArrowLeft', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel({ selected: 'two' })),
          Scene.keydown(tab('Tab two'), 'ArrowLeft'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
        )
      })

      it('moves to and activates the last tab if focus is on the first tab', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel()),
          Scene.keydown(tab('Tab one'), 'ArrowLeft'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '0'),
          resolveFocus,
        )
      })

      it('moves to and activates the first tab if focus is on the last tab', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel({ selected: 'three' })),
          Scene.keydown(tab('Tab three'), 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab one')).toHaveAttr('tabIndex', '0'),
          resolveFocus,
        )
      })

      it('moves to and activates the first tab on Home and the last on End', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel({ selected: 'three' })),
          Scene.keydown(tab('Tab three'), 'Home'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
          Scene.keydown(tab('Tab one'), 'End'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
        )
      })

      it('skips a disabled tab in a single keypress', () => {
        // Matches Base UI's native-`disabled` case: disabled tabs are
        // skipped by roving keyboard navigation.
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel({ disabled: ['two'] })),
          Scene.keydown(tab('Tab one'), 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
          Scene.keydown(tab('Tab three'), 'ArrowLeft'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
        )
      })

      // DIVERGENCE: Base UI moves focus *to* a disabled tab (it stays
      // focusable) without activating it. foldkit gives the disabled tab the
      // native `disabled` attribute and skips it in roving navigation — the
      // arrow lands on the next enabled tab and, in automatic mode,
      // activates it.
      it.fails(
        'moves focus to a disabled tab without activating it',
        () => {
          Scene.scene(
            { update, view: defaultView() },
            Scene.given(givenModel({ disabled: ['two'] })),
            Scene.keydown(tab('Tab one'), 'ArrowRight'),
            Scene.expectHandled(),
            Scene.expect(tab('Tab two')).toHaveAttr('tabIndex', '0'),
            Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'false'),
          )
        },
      )

      it.fails(
        'moves focus to a disabled first tab on Home without activating it',
        () => {
          Scene.scene(
            { update, view: defaultView() },
            Scene.given(
              givenModel({ selected: 'three', disabled: ['one'] }),
            ),
            Scene.keydown(tab('Tab three'), 'Home'),
            Scene.expectHandled(),
            Scene.expect(tab('Tab one')).toHaveAttr('tabIndex', '0'),
            Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'false'),
          )
        },
      )

      it.fails(
        'moves focus to a disabled last tab on End without activating it',
        () => {
          Scene.scene(
            { update, view: defaultView() },
            Scene.given(givenModel({ disabled: ['three'] })),
            Scene.keydown(tab('Tab one'), 'End'),
            Scene.expectHandled(),
            Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '0'),
            Scene.expect(tab('Tab three')).toHaveAttr(
              'aria-selected',
              'false',
            ),
          )
        },
      )

      // DIVERGENCE: Base UI ignores arrow keys while a modifier is held.
      // foldkit's keydown handler only inspects the key, so modifier+arrow
      // still navigates.
      ;(['shiftKey', 'ctrlKey', 'altKey', 'metaKey'] as const).forEach(
        (modifier) => {
          it.fails(
            `does not move focus when modifier key: ${modifier} is pressed`,
            () => {
              Scene.scene(
                { update, view: defaultView() },
                Scene.given(givenModel()),
                Scene.keydown(tab('Tab one'), 'ArrowRight', {
                  [modifier]: true,
                }),
                Scene.expectHandled(),
                Scene.expect(tab('Tab one')).toHaveAttr(
                  'aria-selected',
                  'true',
                ),
              )
            },
          )
        },
      )
    })

    describe('keyboard navigation (manual activation)', () => {
      it('moves the roving tabindex on ArrowRight without activating', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenManualModel()),
          Scene.keydown(tab('Tab one'), 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(tab('Tab two')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'false'),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
        )
      })

      it('wraps the roving tabindex to the last tab on ArrowLeft from the first tab without activating', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenManualModel()),
          Scene.keydown(tab('Tab one'), 'ArrowLeft'),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'false'),
          resolveFocus,
        )
      })

      it('moves focus to the first tab on Home and the last on End without activating', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenManualModel({ selected: 'two' })),
          Scene.keydown(tab('Tab two'), 'End'),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
          Scene.keydown(tab('Tab three'), 'Home'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('tabIndex', '0'),
          resolveFocus,
        )
      })

      ;(['Enter', ' '] as const).forEach((key) => {
        it(`activates the focused tab with ${
          key === ' ' ? 'Space' : 'Enter'
        }`, () => {
          Scene.scene(
            { update, view: defaultView() },
            Scene.given(givenManualModel()),
            Scene.keydown(tab('Tab one'), 'ArrowRight'),
            Scene.expectHandled(),
            Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'false'),
            resolveFocus,
            Scene.keydown(tab('Tab two'), key),
            Scene.expectHandled(),
            Scene.expectOutMessage(
              TabsPrimitive.OutMessage.Selected({ value: 'two', index: 1 }),
            ),
            Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'true'),
            Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'false'),
            resolveFocus,
          )
        })
      })

      it('keeps the roving tabindex on the focused tab when the value changes externally, then arrows continue from it', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetSelected', value: 'three' }),
                  ],
                  ['Select three'],
                ),
                Tabs.tabs(
                  {
                    model: model.tabs,
                    selectedValue: model.selected,
                    toParentMessage: (message) => ({
                      _tag: 'GotTabs',
                      message,
                    }),
                    tabs: tabConfigs(model),
                  },
                  h,
                ),
              ]),
          },
          Scene.given(givenManualModel()),
          Scene.keydown(tab('Tab one'), 'ArrowRight'),
          Scene.expectHandled(),
          resolveFocus,
          // External controlled change: selection moves, highlight stays.
          Scene.click(Scene.text('Select three')),
          Scene.expectHandled(),
          Scene.expect(tab('Tab two')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'false'),
          // Arrow navigation resumes from the highlighted (focused) tab.
          Scene.keydown(tab('Tab two'), 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
        )
      })

      it.todo(
        'does not wrap focus past the first/last tab when `loopFocus` is ' +
          'false — creaseui has no loopFocus prop, foldkit always wraps',
      )
    })

    describe('orientation: vertical', () => {
      it('moves to and activates the next tab on ArrowDown and previous on ArrowUp', () => {
        Scene.scene(
          { update, view: defaultView({ orientation: 'vertical' }) },
          Scene.given(givenModel()),
          Scene.keydown(tab('Tab one'), 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
          Scene.keydown(tab('Tab two'), 'ArrowUp'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
        )
      })

      it('wraps to the last tab on ArrowUp from the first tab', () => {
        Scene.scene(
          { update, view: defaultView({ orientation: 'vertical' }) },
          Scene.given(givenModel()),
          Scene.keydown(tab('Tab one'), 'ArrowUp'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
        )
      })

      it('ignores horizontal arrow keys in a vertical tablist', () => {
        Scene.scene(
          { update, view: defaultView({ orientation: 'vertical' }) },
          Scene.given(givenModel()),
          Scene.keydown(tab('Tab one'), 'ArrowRight'),
          Scene.expectIgnored(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          Scene.keydown(tab('Tab one'), 'ArrowLeft'),
          Scene.expectIgnored(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
        )
      })
    })

    describe('direction: rtl', () => {
      it('mirrors tab order and arrow direction in a horizontal rtl tablist', () => {
        Scene.scene(
          { update, view: defaultView({ direction: 'rtl' }) },
          Scene.given(givenModel()),
          // Rendered order is reversed inside a dir=ltr list on a dir=rtl
          // root, so ArrowLeft advances to the next logical tab and
          // ArrowRight wraps to the last — matching Base UI's rtl matrix.
          Scene.expect(Scene.selector('[data-slot="tabs"]')).toHaveAttr(
            'dir',
            'rtl',
          ),
          Scene.expect(Scene.nth(allTabs, 0)).toHaveText('Tab three'),
          Scene.expect(Scene.nth(allTabs, 2)).toHaveText('Tab one'),
          Scene.expect(tablist).toHaveAttr('dir', 'ltr'),
          Scene.expect(tab('Tab one')).toHaveAttr('id', 'demo-tabs-tab-2'),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          Scene.keydown(tab('Tab one'), 'ArrowLeft'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
          Scene.keydown(tab('Tab two'), 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
          // ArrowRight (logical-previous) from the first logical tab wraps
          // to the last logical tab.
          Scene.keydown(tab('Tab one'), 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'true'),
          resolveFocus,
        )
      })
    })

    describe('disabled tabs', () => {
      it('honors an explicit value pointing at a disabled tab', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel({ disabled: ['one'] })),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'false'),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'false'),
        )
      })

      it('keeps a controlled selection when the selected tab becomes disabled', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({
                      _tag: 'SetDisabled',
                      value: 'one',
                      isDisabled: true,
                    }),
                  ],
                  ['Disable one'],
                ),
                Tabs.tabs(
                  {
                    model: model.tabs,
                    selectedValue: model.selected,
                    toParentMessage: (message) => ({
                      _tag: 'GotTabs',
                      message,
                    }),
                    tabs: tabConfigs(model),
                  },
                  h,
                ),
              ]),
          },
          Scene.given(givenModel()),
          Scene.click(Scene.text('Disable one')),
          Scene.expectHandled(),
          // Controlled root: selection stays on the now-disabled tab and no
          // change event fires — same outcome as Base UI's controlled case.
          Scene.expectNoOutMessage(),
          Scene.expect(tab('Tab one')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab one')).toBeDisabled(),
        )
      })

      // DIVERGENCE: Base UI keeps tabindex="-1" on a disabled tab that is
      // programmatically selected and leaves the tab stop on the previously
      // highlighted tab. foldkit's roving cursor follows the selected tab
      // whenever no manual focus exists, so the disabled selected tab gets
      // tabindex="0".
      it.fails(
        'does not set tabIndex=0 on disabled tabs when they are programmatically selected',
        () => {
          Scene.scene(
            { update, view: defaultView() },
            Scene.given(
              givenModel({ selected: 'one', disabled: ['one'] }),
            ),
            Scene.expect(tab('Tab one')).toHaveAttr('tabIndex', '-1'),
          )
        },
      )

      it.todo(
        'does not select any tab when all tabs are disabled — ' +
          'creaseui has no implicit selection; selectedValue is always set',
      )

      it.todo(
        'auto-selects the first enabled tab on mount and reports ' +
          "reason 'initial' — creaseui requires an explicit selectedValue",
      )
    })

    describe('tab removal', () => {
      // DIVERGENCE (documented): Base UI commits an automatic fallback
      // (onValueChange with reason 'missing') when the selected tab leaves
      // the list. foldkit emits no OutMessage — the parent keeps the stale
      // value and the view falls back to activeIndex 0, which coincidentally
      // shows the first remaining tab selected.
      it('moves the visible selection and tab stop to a remaining tab when the selected tab is removed', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'RemoveValue', value: 'one' }),
                  ],
                  ['Remove one'],
                ),
                Tabs.tabs(
                  {
                    model: model.tabs,
                    selectedValue: model.selected,
                    toParentMessage: (message) => ({
                      _tag: 'GotTabs',
                      message,
                    }),
                    tabs: tabConfigs(model),
                  },
                  h,
                ),
              ]),
          },
          Scene.given(givenModel()),
          Scene.click(Scene.text('Remove one')),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(tab('Tab one')).not.toExist(),
          Scene.expect(tab('Tab two')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab two')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '-1'),
        )
      })

      it('can fall back to a tab that is disabled when the selected tab is removed', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'RemoveValue', value: 'three' }),
                  ],
                  ['Remove three'],
                ),
                Tabs.tabs(
                  {
                    model: model.tabs,
                    selectedValue: model.selected,
                    toParentMessage: (message) => ({
                      _tag: 'GotTabs',
                      message,
                    }),
                    tabs: tabConfigs(model),
                  },
                  h,
                ),
              ]),
          },
          Scene.given(
            givenModel({ selected: 'three', disabled: ['one'] }),
          ),
          Scene.click(Scene.text('Remove three')),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          // Base UI moves the tab stop onto the remaining disabled tab
          // (it stays focusable). foldkit's presentational fallback also
          // lands on index 0 — tabindex=0 on the disabled tab.
          Scene.expect(tab('Tab one')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab two')).toHaveAttr('tabIndex', '-1'),
        )
      })

      it('keeps the tab stop on the selected tab when an unselected tab is removed', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'RemoveValue', value: 'one' }),
                  ],
                  ['Remove one'],
                ),
                Tabs.tabs(
                  {
                    model: model.tabs,
                    selectedValue: model.selected,
                    toParentMessage: (message) => ({
                      _tag: 'GotTabs',
                      message,
                    }),
                    tabs: tabConfigs(model),
                  },
                  h,
                ),
              ]),
          },
          Scene.given(givenModel({ selected: 'three' })),
          Scene.click(Scene.text('Remove one')),
          Scene.expectHandled(),
          Scene.expect(tab('Tab three')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Tab three')).toHaveAttr('tabIndex', '0'),
          Scene.expect(tab('Tab two')).toHaveAttr('tabIndex', '-1'),
        )
      })
    })

    describe('nested tabs', () => {
      type NestedModel = Readonly<{
        outer: TabsPrimitive.Model
        inner: TabsPrimitive.Model
        outerSelected: string
        innerSelected: string
      }>

      type NestedMessage = Readonly<
        | { _tag: 'GotOuterTabs'; message: TabsPrimitive.Message }
        | { _tag: 'GotInnerTabs'; message: TabsPrimitive.Message }
      >

      const nestedUpdate = (
        model: NestedModel,
        message: NestedMessage,
      ) => {
        switch (message._tag) {
          case 'GotOuterTabs': {
            const next = Tabs.update(model.outer, message.message)
            const selection = next.outMessage
            return {
              model: {
                ...model,
                outer: next.model,
                outerSelected:
                  selection === undefined
                    ? model.outerSelected
                    : selection.value,
              },
              commands: Command.mapMessages(next.commands, (child) => ({
                _tag: 'GotOuterTabs' as const,
                message: child,
              })),
              outMessage: next.outMessage,
            }
          }
          case 'GotInnerTabs': {
            const next = Tabs.update(model.inner, message.message)
            const selection = next.outMessage
            return {
              model: {
                ...model,
                inner: next.model,
                innerSelected:
                  selection === undefined
                    ? model.innerSelected
                    : selection.value,
              },
              commands: Command.mapMessages(next.commands, (child) => ({
                _tag: 'GotInnerTabs' as const,
                message: child,
              })),
              outMessage: next.outMessage,
            }
          }
        }
      }

      const nestedView = (model: NestedModel, h: HtmlBuilder<NestedMessage>) =>
        Tabs.tabs(
          {
            model: model.outer,
            selectedValue: model.outerSelected,
            toParentMessage: (message) => ({
              _tag: 'GotOuterTabs',
              message,
            }),
            ariaLabel: 'Outer tabs',
            tabs: [
              {
                value: 'outer-1',
                label: 'Outer 1',
                content: Tabs.tabs(
                  {
                    model: model.inner,
                    selectedValue: model.innerSelected,
                    toParentMessage: (message) => ({
                      _tag: 'GotInnerTabs',
                      message,
                    }),
                    ariaLabel: 'Inner tabs',
                    tabs: [
                      {
                        value: 'inner-1',
                        label: 'Inner 1',
                        content: 'Inner panel 1',
                      },
                      {
                        value: 'inner-2',
                        label: 'Inner 2',
                        content: 'Inner panel 2',
                      },
                    ],
                  },
                  h,
                ),
              },
              { value: 'outer-2', label: 'Outer 2', content: 'Outer panel 2' },
            ],
          },
          h,
        )

      it('keeps a nested root independent from the one hosting its panel', () => {
        Scene.scene(
          { update: nestedUpdate, view: nestedView },
          Scene.given({
            outer: TabsPrimitive.init({ id: 'outer-tabs' }),
            inner: TabsPrimitive.init({ id: 'inner-tabs' }),
            outerSelected: 'outer-1',
            innerSelected: 'inner-1',
          }),
          // Each root wires its own tabs and panels together via model ids.
          Scene.expect(tab('Inner 1')).toHaveAttr(
            'aria-controls',
            'inner-tabs-panel-0',
          ),
          Scene.expect(
            Scene.role('tabpanel', { name: 'Inner 1' }),
          ).toHaveAttr('id', 'inner-tabs-panel-0'),
          // Arrow keys within the nested list stay within the nested list.
          Scene.keydown(tab('Inner 1'), 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(tab('Inner 2')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Outer 1')).toHaveAttr('aria-selected', 'true'),
          Scene.expect(tab('Outer 2')).toHaveAttr('aria-selected', 'false'),
          Scene.expect(Scene.text('Inner panel 2')).toExist(),
          resolveFocus,
          // Selecting an outer tab unmounts the nested root with its panel.
          Scene.click(tab('Outer 2')),
          Scene.expectHandled(),
          Scene.expect(tab('Inner 1')).not.toExist(),
          Scene.expect(Scene.text('Outer panel 2')).toExist(),
          resolveFocus,
        )
      })
    })

    describe('empty children', () => {
      it('renders the root and an empty tablist with no tabs', () => {
        Scene.scene(
          { update, view: defaultView() },
          Scene.given(givenModel({ values: [] })),
          Scene.expect(Scene.selector('[data-slot="tabs"]')).toExist(),
          Scene.expect(tablist).toExist(),
          Scene.expect(tab('Tab one')).not.toExist(),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindTabs)
verifyRenderer('StyleX', StyleXTabs)

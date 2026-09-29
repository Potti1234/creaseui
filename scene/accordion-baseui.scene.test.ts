import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import type * as AccordionBehavior from '@/lib/accordion-state'
import * as StyleXAccordion from '@/stylex/accordion'
import * as TailwindAccordion from '@/ui/accordion'

/**
 * Behavioral parity suite ported from Base UI's accordion tests
 * (base-ui/packages/react/src/accordion/{root,header,item,panel,trigger}/*.test.tsx,
 * checked at base-ui HEAD).
 *
 * Where creaseui's closed panel differs from Base UI's unmounted panel, the
 * port asserts the mounted-but-inert equivalent (`aria-hidden` wrapper, no
 * `data-open`) rather than the DOM absence Base UI checks.
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - describeConformance blocks for all five parts (React ref/render-prop
 *    conformance; creaseui parts are attributes on fixed elements)
 *  - "throws when rendered outside Accordion.Item/Root" (React context
 *    errors; creaseui items are data, not context-bound components)
 *  - "does not report hidden=true after the item has started opening"
 *    (Base UI render-prop state callback; creaseui has no render prop)
 *  - "preserves generated part associations during hydration" and the
 *    server-side-rendering keyframe suppression test (SSR)
 *  - "keeps the closing panel visible until its exit transition completes"
 *    and the React.Activity animation replay test (real DOM timing)
 *  - non-native trigger cases (`nativeButton={false}` / `render={<span/>}`:
 *    element substitution) — creaseui triggers are always native buttons,
 *    so the disabled trigger leaves the tab order like Base UI's native one
 *  - "allows onMouseUp to call preventBaseUIHandler" and the whole
 *    BaseUIChangeEventDetails group (eventDetails.cancel() veto; foldkit
 *    components dispatch plain messages — no cancellable event payload)
 */

type Model = AccordionBehavior.Model
type Message = AccordionBehavior.Message

/** Message that stands in for an externally owned `value` prop update. */
type ExternalMessage = Readonly<{
  _tag: 'SetValue'
  value: ReadonlyArray<string>
}>

type AccordionModule = Readonly<{
  init: (config: AccordionBehavior.InitConfig) => Model
  update: (model: Model, message: Message) => AccordionBehavior.UpdateReturn
  reflect: (model: Model, value: ReadonlyArray<string>) => Model
  OutMessage: {
    ChangedValue: (fields: {
      value: ReadonlyArray<string>
      toggledValue: string
      isOpen: boolean
    }) => AccordionBehavior.OutMessage
  }
  view: (
    model: Model,
    viewInputs: { items: ReadonlyArray<AccordionBehavior.AccordionItem> },
    h: HtmlBuilder<Message>,
  ) => Html
}>

const items: ReadonlyArray<AccordionBehavior.AccordionItem> = [
  { value: 'first', trigger: 'Trigger 1', content: 'Panel contents 1' },
  { value: 'second', trigger: 'Trigger 2', content: 'Panel contents 2' },
]

const initConfig = (
  value: ReadonlyArray<string> = [],
  type: 'single' | 'multiple' = 'single',
): AccordionBehavior.InitConfig => ({ id: 'policies', type, value })

const trigger1 = Scene.role('button', { name: 'Trigger 1' })
const trigger2 = Scene.role('button', { name: 'Trigger 2' })
const panel1 = Scene.selector('#policies-item-first-panel')
const panel2 = Scene.selector('#policies-item-second-panel')
const item1 = Scene.nth(Scene.all.selector('[data-slot="accordion-item"]'), 0)
const item2 = Scene.nth(Scene.all.selector('[data-slot="accordion-item"]'), 1)
// The chevron svg is also aria-hidden, so scope the lookup to divs.
const inertWrapper1 = Scene.within(
  item1,
  Scene.selector('div[aria-hidden="true"]'),
)
const inertWrapper2 = Scene.within(
  item2,
  Scene.selector('div[aria-hidden="true"]'),
)

const verifyRenderer = (name: string, Accordion: AccordionModule) => {
  const view = Scene.withViewInputs(Accordion.view, { items })

  const disabledItems: ReadonlyArray<AccordionBehavior.AccordionItem> = [
    { ...items[0], isDisabled: true },
    items[1],
  ]
  const disabledView = Scene.withViewInputs(Accordion.view, {
    items: disabledItems,
  })

  describe(`${name} Accordion (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('links the trigger and open panel through generated ids', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig(['first']))),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger1).toHaveAttr(
            'aria-controls',
            'policies-item-first-panel',
          ),
          Scene.expect(trigger1).toHaveId('policies-item-first-button'),
          Scene.expect(panel1).toHaveId('policies-item-first-panel'),
        )
      })

      it('gives the panel role="region" labelled by the trigger', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig(['first']))),
          Scene.expect(panel1).toHaveAttr('role', 'region'),
          Scene.expect(panel1).toHaveAttr(
            'aria-labelledby',
            'policies-item-first-button',
          ),
        )
      })

      // creaseui keeps the panel mounted while closed (inert + aria-hidden so
      // the height animation has something to transition), so the panel id
      // always exists — matching Base UI's keepMounted shape. Base UI still
      // drops aria-controls whenever the item is closed
      // (`open ? panelId : undefined`), and creaseui emits it the same way.
      it('drops aria-controls on the trigger while the mounted panel is closed', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig())),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel1).toExist(),
          Scene.expect(trigger1).not.toHaveAttr('aria-controls'),
        )
      })

      it.todo(
        'references a manual panel id in trigger aria-controls — creaseui ' +
          'derives part ids from the accordion id + item value; no id props',
      )
      it.todo(
        'references a manual trigger id in panel aria-labelledby — no id ' +
          'props, and the panel has no aria-labelledby at all',
      )

      it('nests each trigger inside a level-3 heading', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig())),
          Scene.expect(
            Scene.role('heading', { level: 3, name: 'Trigger 1' }),
          ).toExist(),
          Scene.expect(
            Scene.role('heading', { level: 3, name: 'Trigger 2' }),
          ).toExist(),
        )
      })
    })

    describe('uncontrolled', () => {
      it('opens and closes the panel when its trigger is clicked', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig())),
          // The closed panel stays mounted but inert — hidden from AT.
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger1).not.toHaveAttr('aria-controls'),
          Scene.expect(trigger1).not.toHaveAttr('data-panel-open'),
          Scene.expect(panel1).not.toHaveAttr('data-open'),
          Scene.expect(inertWrapper1).toExist(),
          Scene.expect(Scene.within(inertWrapper1, panel1)).toExist(),
          Scene.click(trigger1),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            Accordion.OutMessage.ChangedValue({
              value: ['first'],
              toggledValue: 'first',
              isOpen: true,
            }),
          ),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger1).toHaveAttr(
            'aria-controls',
            'policies-item-first-panel',
          ),
          Scene.expect(trigger1).toHaveAttr('data-panel-open', ''),
          Scene.expect(panel1).toHaveAttr('data-open', ''),
          Scene.expect(inertWrapper1).toBeAbsent(),
          Scene.click(trigger1),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            Accordion.OutMessage.ChangedValue({
              value: [],
              toggledValue: 'first',
              isOpen: false,
            }),
          ),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel1).not.toHaveAttr('data-open'),
          Scene.expect(inertWrapper1).toExist(),
        )
      })

      describe('prop: defaultValue', () => {
        it('custom item value', () => {
          Scene.scene(
            { update: Accordion.update, view: view() },
            Scene.given(Accordion.init(initConfig(['first']))),
            Scene.expect(panel1).toHaveAttr('data-open', ''),
            Scene.expect(trigger1).toHaveAttr('aria-expanded', 'true'),
            Scene.expect(panel2).not.toHaveAttr('data-open'),
            Scene.expect(trigger2).toHaveAttr('aria-expanded', 'false'),
            Scene.expect(inertWrapper2).toExist(),
          )
        })
      })
    })

    describe('controlled', () => {
      const update = (
        model: Model,
        message: Message | ExternalMessage,
      ): AccordionBehavior.UpdateReturn =>
        message._tag === 'SetValue'
          ? { model: Accordion.reflect(model, message.value) }
          : Accordion.update(model, message)

      it('reflects externally owned value changes', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(Accordion.init(initConfig())),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel1).not.toHaveAttr('data-open'),
          Scene.Subscription.emit<Message | ExternalMessage>({
            _tag: 'SetValue',
            value: ['first'],
          }),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger1).toHaveAttr('data-panel-open', ''),
          Scene.expect(panel1).toHaveAttr('data-open', ''),
          Scene.Subscription.emit<Message | ExternalMessage>({
            _tag: 'SetValue',
            value: [],
          }),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel1).not.toHaveAttr('data-open'),
        )
      })

      describe('prop: value', () => {
        it('custom item value', () => {
          Scene.scene(
            { update, view: view() },
            Scene.given(Accordion.init(initConfig(['first']))),
            Scene.expect(panel1).toHaveAttr('data-open', ''),
            Scene.expect(trigger1).toHaveAttr('aria-expanded', 'true'),
            Scene.expect(panel2).not.toHaveAttr('data-open'),
            Scene.expect(trigger2).toHaveAttr('aria-expanded', 'false'),
          )
        })
      })
    })

    describe('prop: disabled', () => {
      it('drops interaction handlers and marks the trigger on a disabled item', () => {
        Scene.scene(
          { update: Accordion.update, view: disabledView() },
          Scene.given(Accordion.init(initConfig())),
          // The native disabled attribute drops the trigger from the tab
          // order and makes it unclickable — assert handler absence instead
          // of attempting clicks.
          Scene.expect(trigger1).toHaveAttr('disabled', ''),
          Scene.expect(trigger1).not.toHaveAttr('aria-disabled'),
          Scene.expect(trigger1).toBeDisabled(),
          Scene.expect(trigger1).toHaveAttr('data-disabled', ''),
          // Handlers live under their DOM event key in the vnode.
          Scene.expect(trigger1).not.toHaveHandler('click'),
          Scene.expect(trigger1).not.toHaveHandler('keydown'),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel1).not.toHaveAttr('data-open'),
          Scene.expect(trigger2).toBeEnabled(),
          Scene.expect(trigger2).toHaveHandler('click'),
          Scene.expect(trigger2).toHaveHandler('keydown'),
        )
      })

      it('marks every part of a disabled item data-disabled', () => {
        Scene.scene(
          { update: Accordion.update, view: disabledView() },
          Scene.given(Accordion.init(initConfig(['first']))),
          Scene.expect(item1).toHaveAttr('data-disabled', ''),
          Scene.expect(
            Scene.within(item1, Scene.role('heading', { level: 3 })),
          ).toHaveAttr('data-disabled', ''),
          Scene.expect(trigger1).toHaveAttr('data-disabled', ''),
          Scene.expect(panel1).toHaveAttr('data-disabled', ''),
          Scene.expect(item2).not.toHaveAttr('data-disabled'),
        )
      })

      it('renders the native disabled attribute and leaves the tab order', () => {
        Scene.scene(
          { update: Accordion.update, view: disabledView() },
          Scene.given(Accordion.init(initConfig())),
          Scene.expect(trigger1).toHaveAttr('disabled', ''),
          Scene.expect(trigger1).not.toHaveAttr('aria-disabled'),
          Scene.expect(trigger1).not.toHaveAttr('tabIndex', '0'),
        )
      })

      it.todo(
        'can disable the whole accordion from the root — creaseui exposes ' +
          'isDisabled per item only; there is no root disabled prop',
      )
    })

    describe('keyboard interactions', () => {
      it('key: Enter toggles the Accordion open state', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig())),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
          Scene.keydown(trigger1, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger1).toHaveAttr('data-panel-open', ''),
          Scene.expect(panel1).toHaveAttr('data-open', ''),
          Scene.keydown(trigger1, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel1).not.toHaveAttr('data-open'),
        )
      })

      // Base UI activates Space on keyup: the keydown is consumed (the
      // default is suppressed so the native keyup→click cannot also fire)
      // but must not toggle on its own. The toggle lands on keyup — see the
      // it.todo below; the scene DSL emits keydown only.
      it('waits for Space keyup before toggling', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig())),
          Scene.keydown(trigger1, ' '),
          Scene.expectHandled(),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
        )
      })

      it.todo(
        'opens and closes on Space keyup — the scene DSL has no keyup ' +
          'step; verify in e2e',
      )

      it('ignores unrelated keys', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig())),
          Scene.keydown(trigger1, 'ArrowDown'),
          Scene.expectIgnored(),
          Scene.expect(trigger1).toHaveAttr('aria-expanded', 'false'),
        )
      })
    })

    describe('prop: multiple', () => {
      it('multiple items can be open when `multiple = true`', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig([], 'multiple'))),
          Scene.expect(trigger1).not.toHaveAttr('data-panel-open'),
          Scene.expect(trigger2).not.toHaveAttr('data-panel-open'),
          Scene.expect(panel1).not.toHaveAttr('data-open'),
          Scene.expect(panel2).not.toHaveAttr('data-open'),
          Scene.click(trigger1),
          Scene.expectHandled(),
          Scene.click(trigger2),
          Scene.expectHandled(),
          Scene.expect(panel1).toHaveAttr('data-open', ''),
          Scene.expect(panel2).toHaveAttr('data-open', ''),
          Scene.expect(trigger1).toHaveAttr('data-panel-open', ''),
          Scene.expect(trigger2).toHaveAttr('data-panel-open', ''),
          Scene.click(trigger1),
          Scene.expectHandled(),
          Scene.expect(panel1).not.toHaveAttr('data-open'),
          Scene.expect(panel2).toHaveAttr('data-open', ''),
          Scene.expect(trigger1).not.toHaveAttr('data-panel-open'),
          Scene.expect(trigger2).toHaveAttr('data-panel-open', ''),
        )
      })

      it('when false only one item can be open', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig([], 'single'))),
          Scene.click(trigger1),
          Scene.expectHandled(),
          Scene.expect(panel1).toHaveAttr('data-open', ''),
          Scene.expect(trigger1).toHaveAttr('data-panel-open', ''),
          Scene.click(trigger2),
          Scene.expectHandled(),
          Scene.expect(panel2).toHaveAttr('data-open', ''),
          Scene.expect(trigger2).toHaveAttr('data-panel-open', ''),
          Scene.expect(panel1).not.toHaveAttr('data-open'),
          Scene.expect(trigger1).not.toHaveAttr('data-panel-open'),
        )
      })
    })

    describe('prop: onValueChange', () => {
      it('accumulates open values in toggle order while multiple', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig([], 'multiple'))),
          Scene.click(trigger2),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            Accordion.OutMessage.ChangedValue({
              value: ['second'],
              toggledValue: 'second',
              isOpen: true,
            }),
          ),
          Scene.click(trigger1),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            Accordion.OutMessage.ChangedValue({
              value: ['second', 'first'],
              toggledValue: 'first',
              isOpen: true,
            }),
          ),
        )
      })

      it('replaces the open value when `multiple` is false', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig())),
          Scene.click(trigger1),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            Accordion.OutMessage.ChangedValue({
              value: ['first'],
              toggledValue: 'first',
              isOpen: true,
            }),
          ),
          Scene.click(trigger2),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            Accordion.OutMessage.ChangedValue({
              value: ['second'],
              toggledValue: 'second',
              isOpen: true,
            }),
          ),
        )
      })
    })

    describe('style hooks', () => {
      it('does not render the item value as data-value on triggers', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig(['first', 'second'], 'multiple'))),
          Scene.expect(trigger1).not.toHaveAttr('data-value'),
          Scene.expect(trigger2).not.toHaveAttr('data-value'),
        )
      })

      it('marks the open trigger data-panel-open instead of data-open', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig(['first']))),
          Scene.expect(trigger1).toHaveAttr('data-panel-open'),
          Scene.expect(trigger1).not.toHaveAttr('data-open'),
        )
      })

      it('renders data-index on every trigger including the first', () => {
        Scene.scene(
          { update: Accordion.update, view: view() },
          Scene.given(Accordion.init(initConfig())),
          Scene.expect(trigger1).toHaveAttr('data-index', '0'),
          Scene.expect(trigger2).toHaveAttr('data-index', '1'),
        )
      })
    })

    describe('prop: keepMounted / hiddenUntilFound', () => {
      it.todo(
        'unmounts the closed panel unless keepMounted — creaseui panels are ' +
          'always mounted and inert while closed so the grid-rows animation ' +
          'works; there is no keepMounted prop',
      )
      it.todo(
        'honours hiddenUntilFound on closed panels — creaseui has no ' +
          'hiddenUntilFound prop (and no warn for keepMounted={false})',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindAccordion)
verifyRenderer('StyleX', StyleXAccordion)

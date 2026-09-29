import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXCollapsible from '@/stylex/collapsible'
import * as TailwindCollapsible from '@/ui/collapsible'

/**
 * Behavioral parity suite ported from Base UI's collapsible tests
 * (base-ui/packages/react/src/collapsible/{root,trigger,panel}/*.test.tsx,
 * checked at base-ui HEAD).
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - `describeConformance` on Root/Trigger/Panel (ref forwarding, `render=`
 *    element substitution, `nativeButton={false}`): React internals — foldkit
 *    fixes the rendered elements.
 *  - `<Collapsible.Trigger />` "throws when rendered outside a
 *    Collapsible.Root": creaseui has no standalone parts; trigger + panel are
 *    composed in a single `collapsible()` call.
 *  - `BaseUIChangeEventDetails` payloads and `eventDetails.cancel()`
 *    cancellation: foldkit dispatches plain Messages, not DOM event objects.
 *  - "passes state to className and style callbacks": creaseui exposes no
 *    state-callback styling API.
 *  - Panel `hidden`/`hiddenUntilFound`, `beforematch` find-in-page reveals,
 *    every CSS transition/animation/SSR/`React.Activity` case: no layout
 *    engine, animation timeline, or browser events exist at the vnode level.
 *    foldkit's `animatePanel` performs the open/close height transition.
 *  - Panel mounting during the "ending" transition phase: depends on
 *    `transitionStatus` internals and a `render=` prop.
 */

type Model = Readonly<{
  isOpen: boolean
}>

type Message = Readonly<
  | { _tag: 'Toggled'; isOpen: boolean }
  | { _tag: 'SetOpen'; isOpen: boolean }
>

const PANEL_CONTENT = 'This is panel content'

const initialModel = (isOpen = false): Model => ({ isOpen })

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'Toggled':
    case 'SetOpen':
      return { model: { ...model, isOpen: message.isOpen } }
  }
}

// Mirrors Base UI's "controlled without an external update": the toggle
// message is dispatched but the parent never applies it, so the open state
// cannot change.
const updateIgnoringToggle = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'Toggled':
      return { model }
    case 'SetOpen':
      return { model: { ...model, isOpen: message.isOpen } }
  }
}

type CollapsibleModule = Readonly<{
  collapsible: <Msg>(
    props: {
      id: string
      isOpen: boolean
      onToggle: (isOpen: boolean) => Msg
      trigger: Html | string
      content: Html | string
      isDisabled?: boolean
      ariaLabel?: string
      class?: string
      triggerClass?: string
      contentClass?: string
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const trigger = Scene.role('button', { name: 'Trigger' })
const panel = Scene.selector('#details-panel')
const inertWrapper = Scene.selector('[inert]')

const collapsibleView =
  (Collapsible: CollapsibleModule, options?: { isDisabled?: boolean }) =>
  (model: Model, h: HtmlBuilder<Message>) =>
    Collapsible.collapsible(
      {
        id: 'details',
        isOpen: model.isOpen,
        onToggle: isOpen => ({ _tag: 'Toggled', isOpen }),
        trigger: 'Trigger',
        content: PANEL_CONTENT,
        ...(options?.isDisabled === true ? { isDisabled: true } : {}),
      },
      h,
    )

const verifyRenderer = (name: string, Collapsible: CollapsibleModule) => {
  describe(`${name} Collapsible (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('sets ARIA attributes', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel(true)),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'details-panel'),
          Scene.expect(panel).toHaveId('details-panel'),
        )
      })

      // DIVERGENCE (documented): Base UI accepts a manual id on the Panel and
      // references it from the trigger. creaseui derives both ids from the
      // root `id` prop (`<id>-panel`), so there is no independent panel id —
      // the contract that aria-controls points at the rendered panel holds.
      it('references the panel id in trigger aria-controls', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel(true)),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'details-panel'),
          Scene.expect(panel).toHaveAttr('id', 'details-panel'),
        )
      })

      // DIVERGENCE (documented): Base UI drops aria-controls because the panel
      // unmounts while closed. creaseui keeps the panel mounted (inert) and
      // still drops the relationship attribute while closed, restoring it on
      // the next open.
      it('drops trigger aria-controls while closed and restores it on open', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel()),
          Scene.expect(trigger).not.toHaveAttr('aria-controls'),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'details-panel'),
          Scene.click(trigger),
          Scene.expect(trigger).not.toHaveAttr('aria-controls'),
        )
      })
    })

    describe('collapsible status', () => {
      it('marks the trigger data-disabled when disabled', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible, { isDisabled: true }) },
          Scene.given(initialModel()),
          Scene.expect(trigger).toHaveAttr('data-disabled', ''),
        )
      })

      it('does not toggle or call onOpenChange when clicked while disabled', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible, { isDisabled: true }) },
          Scene.given(initialModel()),
          // No handlers are emitted, so no interaction can dispatch onToggle.
          Scene.expect(trigger).not.toHaveHandler('OnClick'),
          Scene.expect(trigger).not.toHaveHandler('OnKeyDownPreventDefault'),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel).not.toHaveAttr('data-open'),
          Scene.expect(inertWrapper).toHaveAttr('aria-hidden', 'true'),
        )
      })

      // DIVERGENCE: Base UI renders a native `disabled` attribute on the
      // button trigger (and no aria-disabled). creaseui emits
      // `aria-disabled="true"` + `data-disabled` and keeps the button
      // technically enabled. Severity: medium — assistive tech still sees the
      // control as disabled, but `:disabled` styling and native form/tab
      // behavior do not apply.
      it.fails('renders the disabled attribute when disabled', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible, { isDisabled: true }) },
          Scene.given(initialModel()),
          Scene.expect(trigger).toHaveAttr('disabled'),
          Scene.expect(trigger).not.toHaveAttr('aria-disabled'),
        )
      })

      // DIVERGENCE: Base UI's disabled native button leaves the tab order
      // (and a non-native trigger gets tabindex="-1"). creaseui keeps
      // `tabIndex="0"` on the disabled trigger, so it stays keyboard
      // focusable. Severity: medium.
      it.fails('removes a disabled trigger from the tab order', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible, { isDisabled: true }) },
          Scene.given(initialModel()),
          Scene.expect(trigger).not.toHaveAttr('tabIndex', '0'),
        )
      })
    })

    describe('open state', () => {
      it('toggles open and closed when the trigger is clicked', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel()),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger).not.toHaveAttr('aria-controls'),
          Scene.expect(panel).not.toHaveAttr('data-open'),
          Scene.expect(inertWrapper).toExist(),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'details-panel'),
          Scene.expect(panel).toHaveAttr('data-open', ''),
          Scene.expect(inertWrapper).toBeAbsent(),
          Scene.click(trigger),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger).not.toHaveAttr('aria-controls'),
          Scene.expect(panel).not.toHaveAttr('data-open'),
          Scene.expect(inertWrapper).toExist(),
        )
      })

      it('does not change controlled open state without an external update', () => {
        Scene.scene(
          {
            update: updateIgnoringToggle,
            view: collapsibleView(Collapsible),
          },
          Scene.given(initialModel()),
          Scene.click(trigger),
          // The click still dispatched onToggle — the parent just did not
          // apply it, matching `open={false}` in Base UI.
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel).not.toHaveAttr('data-open'),
          Scene.expect(inertWrapper).toExist(),
        )
      })

      it('reflects externally driven open state changes (controlled mode)', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetOpen', isOpen: !model.isOpen }),
                  ],
                  ['Toggle'],
                ),
                collapsibleView(Collapsible)(model, h),
              ]),
          },
          Scene.given(initialModel()),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger).not.toHaveAttr('aria-controls'),
          Scene.expect(inertWrapper).toExist(),
          Scene.click(Scene.text('Toggle')),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'details-panel'),
          Scene.expect(trigger).toHaveAttr('data-open', ''),
          Scene.expect(panel).toHaveAttr('data-open', ''),
          Scene.expect(inertWrapper).toBeAbsent(),
          Scene.click(Scene.text('Toggle')),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger).not.toHaveAttr('aria-controls'),
        )
      })
    })

    describe('interactions', () => {
      // foldkit dispatches the plain onToggle Message once per activation —
      // there is no eventDetails payload, reason, or cancel channel.
      it('dispatches onToggle once per click with the next open state', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel()),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
        )
      })
    })

    describe('keyboard interactions', () => {
      it('key: Enter should toggle the Collapsible', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel()),
          Scene.expect(trigger).not.toHaveAttr('aria-controls'),
          Scene.keydown(trigger, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'details-panel'),
          Scene.expect(panel).toHaveAttr('data-open', ''),
          Scene.keydown(trigger, 'Enter'),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
        )
      })

      it('key: Space should toggle the Collapsible', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel()),
          Scene.keydown(trigger, ' '),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(panel).toHaveAttr('data-open', ''),
          Scene.keydown(trigger, ' '),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
        )
      })

      // Base UI parameterizes Enter and Space; foldkit gates both keys behind
      // the single keydown handler the disabled state omits, so one case
      // covers both.
      it('key: Enter/Space does not toggle the Collapsible when disabled', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible, { isDisabled: true }) },
          Scene.given(initialModel()),
          Scene.expect(trigger).not.toHaveHandler('OnKeyDownPreventDefault'),
          Scene.expect(trigger).not.toHaveHandler('OnClick'),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel).not.toHaveAttr('data-open'),
        )
      })
    })

    describe('prop: id', () => {
      // DIVERGENCE (documented): Base UI forwards a verbatim `id` prop on the
      // Trigger. creaseui namespaces the root id into deterministic part ids
      // (`<id>-button`, `<id>-panel`).
      it('derives the trigger and panel ids from the root id', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel(true)),
          Scene.expect(trigger).toHaveId('details-button'),
          Scene.expect(panel).toHaveId('details-panel'),
        )
      })
    })

    describe('prop: keepMounted', () => {
      // DIVERGENCE (documented): creaseui has no keepMounted prop — the panel
      // is always mounted and hidden with inert + aria-hidden + a 0fr grid
      // row while closed, matching Base UI's keepMounted={true} semantics.
      it('does not unmount the panel while closed', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel()),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel).toExist(),
          Scene.expect(panel).toHaveText(PANEL_CONTENT),
          Scene.expect(inertWrapper).toHaveAttr('aria-hidden', 'true'),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'details-panel'),
          Scene.expect(panel).toHaveAttr('data-open', ''),
          Scene.expect(inertWrapper).toBeAbsent(),
          Scene.click(trigger),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger).not.toHaveAttr('aria-controls'),
          Scene.expect(inertWrapper).toHaveAttr('aria-hidden', 'true'),
        )
      })
    })

    describe('style hooks', () => {
      it('marks the open trigger and panel data-open', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel()),
          Scene.expect(trigger).not.toHaveAttr('data-open'),
          Scene.expect(panel).not.toHaveAttr('data-open'),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('data-open', ''),
          Scene.expect(panel).toHaveAttr('data-open', ''),
        )
      })

      // DIVERGENCE: Base UI marks the open trigger `data-panel-open`.
      // creaseui reuses the generic `data-open` hook on both trigger and
      // panel. Severity: low — styling-hook name only.
      it.fails('marks the open trigger data-panel-open', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel(true)),
          Scene.expect(trigger).toHaveAttr('data-panel-open'),
        )
      })

      // DIVERGENCE: Base UI's keepMounted closed panel carries `data-closed`
      // and the `hidden` attribute. creaseui emits neither — it hides the
      // mounted panel with inert + aria-hidden + a collapsed grid row.
      // Severity: low.
      it.fails('marks the closed panel data-closed and hidden', () => {
        Scene.scene(
          { update, view: collapsibleView(Collapsible) },
          Scene.given(initialModel()),
          Scene.expect(panel).toHaveAttr('data-closed'),
          Scene.expect(panel).toHaveAttr('hidden'),
        )
      })
    })

    describe('untestable or absent capabilities', () => {
      it.todo(
        'uncontrolled mode — creaseui collapsible is controlled-only; ' +
          'the parent model owns isOpen',
      )
      it.todo(
        'eventDetails.cancel() prevents opening/closing — foldkit dispatches ' +
          'plain messages with no cancellation channel',
      )
      it.todo(
        'prop: hiddenUntilFound — creaseui exposes no find-in-page reveal ' +
          '(beforematch) on the panel',
      )
      it.todo(
        'prop: keepMounted={false} — creaseui keeps the panel mounted ' +
          'unconditionally',
      )
      it.todo(
        'CSS transition/animation phases (data-starting-style, ' +
          'data-ending-style, --collapsible-panel-height) — no layout engine ' +
          'or animation timeline exists in the vnode DSL',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindCollapsible)
verifyRenderer('StyleX', StyleXCollapsible)

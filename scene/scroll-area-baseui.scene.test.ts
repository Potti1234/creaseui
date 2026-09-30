import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXScrollArea from '@/stylex/scroll-area'
import * as TailwindScrollArea from '@/ui/scroll-area'

/**
 * Behavioral parity suite ported from Base UI's scroll-area tests
 * (base-ui/packages/react/src/scroll-area/{root,viewport,content,
 * corner,scrollbar,thumb}/*.test.tsx, checked at base-ui HEAD).
 *
 * creaseui's `scrollArea` is a single styled div backed by native
 * scrollbars — there are no Viewport/Scrollbar/Thumb/Corner parts and
 * no scroll-state machinery — so most of Base UI's suite has no
 * analogue and is recorded here instead of being dropped silently:
 *  - describeConformance in every file (React internals: ref
 *    instanceof, `render=` element substitution, StrictMode)
 *  - React context errors ("throws when rendered outside
 *    Root/Viewport/Scrollbar") and unmount-during-callback cases —
 *    creaseui has no part composition
 *  - 'sizing' (9 cases) and 'context stability' (1): real layout,
 *    ResizeObserver and CSS custom-property measurement
 *  - 'overflow data attributes' (root 8, viewport 1, scrollbars 1):
 *    scroll-metric-driven attributes — see the it.todo group below
 *  - 'subtree animations' (5): Web Animations API + GC observation
 *  - 'overscroll feedback' (6): rubber-band scroll offsets
 *  - 'data-scrolling' (8 across files) and 'data-hovering' (3): scroll
 *    events, timers and pointer modality — see it.todo
 *  - 'track pointer down' / 'track click by axis' / 'non-positive thumb
 *    offset' (13), 'track mouse down' preventDefault (4), thumb
 *    dragging / pointer-cancel / scroll-snap (11): pointer capture and
 *    track geometry on parts creaseui does not render
 *  - 'wheel' (11): no wheel step in the DSL; native wheel already works
 *    over native scrollbars
 *  - keepMounted / overflowEdgeThreshold / custom-renderer cases:
 *    props creaseui does not expose
 * No scroll-area e2e spec exists in e2e/*.spec.ts.
 */

type Model = Readonly<{
  direction: 'ltr' | 'rtl'
}>

type Message = Readonly<{ _tag: 'SetDirection'; direction: 'ltr' | 'rtl' }>

const initialModel: Model = { direction: 'ltr' }

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'SetDirection':
      return { model: { ...model, direction: message.direction } }
  }
}

type ScrollAreaModule = Readonly<{
  scrollArea: <Msg>(
    props: {
      class?: string
      children: ReadonlyArray<Html | string>
      orientation?: 'vertical' | 'horizontal' | 'both'
      direction?: 'ltr' | 'rtl'
      ariaLabel?: string
      tabIndex?: number
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const scrollAreaElement = Scene.selector('[data-slot="scroll-area"]')

const verifyRenderer = (name: string, ScrollArea: ScrollAreaModule) => {
  describe(`${name} ScrollArea (Base UI port)`, () => {
    describe('Viewport', () => {
      it('does not use a presentational role on the focusable viewport', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              ScrollArea.scrollArea(
                {
                  tabIndex: 0,
                  children: ['scrollable content'],
                },
                h,
              ),
          },
          Scene.given(initialModel),
          // creaseui emits no role at all — stronger than Base UI's
          // "not role=presentation" expectation.
          Scene.expect(scrollAreaElement).not.toHaveAttr('role'),
          Scene.expect(scrollAreaElement).toHaveAttr('tabIndex', '0'),
        )
      })

      // DIVERGENCE: Base UI measures overflow and emits tabindex="-1" on
      // a viewport whose content does not overflow either axis, keeping
      // it out of the tab order ('measures content mounted after the
      // viewport initial measurement'). creaseui statically emits
      // tabIndex=0, so a non-scrollable scroll area stays a tab stop.
      it.fails('keeps a non-overflowing viewport out of the tab order', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              ScrollArea.scrollArea({ children: ['small content'] }, h),
          },
          Scene.given(initialModel),
          Scene.expect(scrollAreaElement).toHaveAttr('tabIndex', '-1'),
        )
      })
    })

    describe('Scrollbar', () => {
      // DIVERGENCE (structural): Base UI puts data-orientation on the
      // Scrollbar track element; creaseui's single div is the scrollable
      // element itself, so the attribute lands there.
      it('sets the orientation data attribute', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              ScrollArea.scrollArea(
                {
                  orientation: 'horizontal',
                  children: ['scrollable content'],
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(scrollAreaElement).toHaveAttr(
            'data-orientation',
            'horizontal',
          ),
        )
      })

      // DIVERGENCE (intentional): Base UI's <ScrollArea.Scrollbar>
      // defaults orientation="vertical". creaseui's fused element scrolls
      // both axes by default, so its data-orientation default is "both"
      // — a value Base UI never emits on a single-axis scrollbar.
      it('emits data-orientation="both" when no orientation is given', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              ScrollArea.scrollArea({ children: ['scrollable content'] }, h),
          },
          Scene.given(initialModel),
          Scene.expect(scrollAreaElement).toHaveAttr('data-orientation', 'both'),
        )
      })

      it.todo(
        'is hidden from the accessibility tree by default — creaseui ' +
          'renders no Scrollbar part (native scrollbars)',
      )

      it.todo(
        'allows overriding aria-hidden — no Scrollbar part to decorate',
      )
    })

    describe('Corner', () => {
      it.todo(
        'is hidden from the accessibility tree by default — creaseui ' +
          'renders no Corner part (native scrollbars)',
      )

      it.todo(
        'allows overriding aria-hidden — no Corner part to decorate',
      )
    })

    describe('RTL', () => {
      // Base UI's 'correctly handles RTL' asserts scroll-range edge
      // attributes, which need real layout. Only the static direction
      // surface is portable to the vnode level.
      it('correctly handles RTL', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              ScrollArea.scrollArea(
                {
                  direction: 'rtl',
                  children: ['scrollable content'],
                },
                h,
              ),
          },
          Scene.given(initialModel),
          Scene.expect(scrollAreaElement).toHaveAttr('dir', 'rtl'),
        )
      })

      // Ports the rerender half of Base UI's 'recomputes horizontal
      // overflow edges when direction changes': the direction prop
      // flowing back into the rendered tree. The overflow-edge
      // recompute itself is scroll-metric work creaseui never does.
      it('recomputes the direction when the prop changes', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({
                      _tag: 'SetDirection',
                      direction: model.direction === 'ltr' ? 'rtl' : 'ltr',
                    }),
                  ],
                  ['switch direction'],
                ),
                ScrollArea.scrollArea(
                  {
                    direction: model.direction,
                    children: ['scrollable content'],
                  },
                  h,
                ),
              ]),
          },
          Scene.given(initialModel),
          Scene.expect(scrollAreaElement).toHaveAttr('dir', 'ltr'),
          Scene.click(Scene.text('switch direction')),
          Scene.expectHandled(),
          Scene.expect(scrollAreaElement).toHaveAttr('dir', 'rtl'),
        )
      })
    })

    describe('scroll state attributes', () => {
      it.todo(
        'adds [data-scrolling] attribute when viewport is scrolled — ' +
          'creaseui has no scroll-state machinery and the DSL has no ' +
          'scroll or timer steps',
      )

      it.todo(
        'reflects data-hovering while the pointer is over the ' +
          'viewport — creaseui tracks no hover state',
      )

      it.todo(
        'applies data-has-overflow-* and data-overflow-* edge ' +
          'attributes — creaseui never measures overflow',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindScrollArea)
verifyRenderer('StyleX', StyleXScrollArea)

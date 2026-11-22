import type { Html, HtmlBuilder } from 'foldkit/html'

import { foldkitApplication } from '@/docs/components/pages/authored-page'
import * as Motion from '@/lib/behaviors/motion'
import type { ButtonBehaviorProps } from '@/lib/button'

const css = `
[data-motion-demo] { width: min(100%, 24rem); }
[data-motion-demo] [data-motion-panel] { display: grid; grid-template-rows: 1fr; opacity: 1; transition: grid-template-rows 200ms ease-out, opacity 200ms ease-out; }
[data-motion-demo] [data-motion-panel][data-closed] { grid-template-rows: 0fr; opacity: 0; }
[data-motion-demo] [data-motion-content] { min-height: 0; overflow: hidden; }
[data-motion-demo] [data-motion-card] { margin-top: 1rem; border: 1px solid var(--border); border-radius: var(--radius-lg, .5rem); padding: 1rem; background: var(--muted); color: var(--foreground); font-size: .875rem; line-height: 1.5; }
[data-motion-demo] [data-motion-title] { margin: 0; font-weight: 500; }
[data-motion-demo] [data-motion-description] { margin-block: .5rem 1rem; color: var(--muted-foreground); }
@media (prefers-reduced-motion: reduce) { [data-motion-demo] [data-motion-panel] { transition: none; } }
`

type DemoButton<Msg> = (
  props: ButtonBehaviorProps<Msg> &
    Readonly<{ variant: 'outline' | 'ghost'; size?: 'sm' }>,
  h: HtmlBuilder<Msg>,
) => Html

export const motionDemo = <Msg>(
  model: Motion.Model,
  toMessage: (message: Motion.Message) => Msg,
  h: HtmlBuilder<Msg>,
  button: DemoButton<Msg>,
) =>
  h.div(
    [h.DataAttribute('motion-demo', '')],
    [
      h.style([], [css]),
      button(
        {
          id: `${model.id}-trigger`,
          variant: 'outline',
          ariaExpanded: model.isShowing,
          ariaControls: model.id,
          onClick: toMessage(
            model.isShowing ? Motion.Message.Hid() : Motion.Message.Showed(),
          ),
          children: [
            model.isShowing ? 'Hide motion panel' : 'Show motion panel',
          ],
        },
        h,
      ),
      ...(Motion.isMounted(model)
        ? [
            h.div(
              [
                h.Id(model.id),
                h.DataAttribute('motion-panel', ''),
                h.Role('region'),
                h.AriaLabelledBy(`${model.id}-trigger`),
                ...Motion.attributes(model),
              ],
              [
                h.div(
                  [h.DataAttribute('motion-content', '')],
                  [
                    h.div(
                      [h.DataAttribute('motion-card', '')],
                      [
                        h.p(
                          [h.DataAttribute('motion-title', '')],
                          ['Presence without measuring'],
                        ),
                        h.p(
                          [h.DataAttribute('motion-description', '')],
                          [
                            'This panel stays mounted until its exit finishes. Your CSS controls the fade, collapse, and reduced-motion behavior.',
                          ],
                        ),
                        button(
                          {
                            variant: 'ghost',
                            size: 'sm',
                            onClick: toMessage(Motion.Message.Hid()),
                            children: ['Close panel'],
                          },
                          h,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ]
        : []),
    ],
  )

export const motionSource = (renderer: 'tailwind' | 'stylex' | 'pleat') =>
  foldkitApplication({
    title: 'Collapsible — Motion presence',
    imports: `import { Runtime, Subscription } from 'foldkit'
import type { Document, HtmlBuilder } from 'foldkit/html'
import * as Collapsible from '@/${renderer === 'tailwind' ? 'ui' : renderer}/collapsible'
import * as Button from '@/${renderer === 'tailwind' ? 'ui' : renderer}/button'
import * as Motion from '@/lib/behaviors/motion'`,
    model:
      'export const Model = Motion.Model\nexport type Model = Motion.Model',
    messages:
      'export const Message = Motion.Message\nexport type Message = Motion.Message',
    init: "export const init = () => ({ model: Motion.init({ id: 'motion-panel' }) })",
    update: `export const update = (model: Model, message: Message) => {
  const result = Motion.update(model, message, { returnFocusTo: 'motion-trigger' })
  // Settled({ isOpen: false }) means exit finished and content may unmount.
  return { model: result.model, commands: result.commands ?? [] }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Motion presence',
  body: h.div([h.DataAttribute('motion-demo', '')], [
    h.style([], [${JSON.stringify(css)}]),
    Button.button({
      id: 'motion-trigger', variant: 'outline',
      ariaExpanded: model.isShowing, ariaControls: model.id,
      onClick: model.isShowing ? Message.Hid() : Message.Showed(),
      children: [model.isShowing ? 'Hide motion panel' : 'Show motion panel'],
    }, h),
    Motion.isMounted(model)
      ? h.div([h.Id(model.id), h.DataAttribute('motion-panel', ''), ...Motion.attributes(model)], [
          h.div([h.DataAttribute('motion-content', '')], [
            h.div([h.DataAttribute('motion-card', '')], [
              h.p([h.DataAttribute('motion-title', '')], ['Presence without measuring']),
              h.p([h.DataAttribute('motion-description', '')], ['This panel stays mounted until its exit finishes. Your CSS controls the fade, collapse, and reduced-motion behavior.']),
              Button.button({ variant: 'ghost', size: 'sm', onClick: Message.Hid(), children: ['Close panel'] }, h),
            ]),
          ]),
        ])
      : h.empty,
  ]),
})`,
  })

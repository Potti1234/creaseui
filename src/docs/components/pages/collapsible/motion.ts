import type { HtmlBuilder } from 'foldkit/html'

import { foldkitApplication } from '@/docs/components/pages/authored-page'
import * as Motion from '@/lib/behaviors/motion'

const css = `
[data-motion-demo] { width: min(100%, 24rem); }
[data-motion-demo] button { border: 1px solid currentColor; border-radius: .5rem; padding: .5rem 1rem; cursor: pointer; }
[data-motion-demo] [data-motion-panel] { display: grid; grid-template-rows: 1fr; opacity: 1; transition: grid-template-rows 200ms ease-out, opacity 200ms ease-out; }
[data-motion-demo] [data-motion-panel][data-closed] { grid-template-rows: 0fr; opacity: 0; }
[data-motion-demo] [data-motion-content] { min-height: 0; overflow: hidden; }
[data-motion-demo] p { margin-block: 1rem; }
@media (prefers-reduced-motion: reduce) { [data-motion-demo] [data-motion-panel] { transition: none; } }
`

export const motionDemo = <Msg>(
  model: Motion.Model,
  toMessage: (message: Motion.Message) => Msg,
  h: HtmlBuilder<Msg>,
) =>
  h.div(
    [h.DataAttribute('motion-demo', '')],
    [
      h.style([], [css]),
      h.button(
        [
          h.Id(`${model.id}-trigger`),
          h.Type('button'),
          h.AriaExpanded(model.isShowing),
          h.AriaControls(model.id),
          h.OnClick(
            toMessage(
              model.isShowing ? Motion.Message.Hid() : Motion.Message.Showed(),
            ),
          ),
        ],
        [model.isShowing ? 'Hide motion panel' : 'Show motion panel'],
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
                    h.p(
                      [],
                      [
                        'Motion keeps this content mounted until its exit finishes. CSS owns the fade, collapse, and reduced-motion preference.',
                      ],
                    ),
                    h.button(
                      [
                        h.Type('button'),
                        h.OnClick(toMessage(Motion.Message.Hid())),
                      ],
                      ['Close from inside'],
                    ),
                  ],
                ),
              ],
            ),
          ]
        : []),
      h.p(
        [h.AriaLive('polite')],
        [Motion.isMounted(model) ? 'Panel mounted' : 'Panel unmounted'],
      ),
    ],
  )

export const motionSource = (renderer: 'tailwind' | 'stylex' | 'pleat') =>
  foldkitApplication({
    title: 'Collapsible — Motion presence',
    imports: `import { Runtime, Subscription } from 'foldkit'
import type { Document, HtmlBuilder } from 'foldkit/html'
import * as Collapsible from '@/${renderer === 'tailwind' ? 'ui' : renderer}/collapsible'
import * as Motion from '@/lib/behaviors/motion'`,
    model:
      'export const Model = Motion.Model\nexport type Model = Motion.Model',
    messages:
      'export const Message = Motion.Message\nexport type Message = Motion.Message',
    init: "export const init = () => ({ model: Motion.init({ id: 'motion-panel' }) })",
    update: `export const update = (model: Model, message: Message) => {
  const result = Motion.update(model, message, { returnFocusTo: 'motion-trigger' })
  // Handle result.outMessage here to observe Settled and Exited facts.
  return { model: result.model, commands: result.commands ?? [] }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Motion presence',
  body: h.div([h.DataAttribute('motion-demo', '')], [
    h.style([], [${JSON.stringify(css)}]),
    h.button([
      h.Id('motion-trigger'), h.Type('button'),
      h.AriaExpanded(model.isShowing), h.AriaControls(model.id),
      h.OnClick(model.isShowing ? Message.Hid() : Message.Showed()),
    ], [model.isShowing ? 'Hide motion panel' : 'Show motion panel']),
    Motion.isMounted(model)
      ? h.div([h.Id(model.id), h.DataAttribute('motion-panel', ''), ...Motion.attributes(model)], [
          h.div([h.DataAttribute('motion-content', '')], [
            h.p([], ['Content unmounts after exit. Reduced-motion CSS disables transitions.']),
          ]),
        ])
      : h.empty,
  ]),
})`,
  })

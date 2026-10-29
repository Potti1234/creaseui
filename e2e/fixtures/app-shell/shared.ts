import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

/* App-shell fixture: provider + `collapsible: 'none'` sidebar + inset, the
   layout the tutorial app reported (journal A0.6). Renderer entry points
   only pass their styled component modules (the "kit"); kit types list just
   the props this fixture uses. */
export type Kit = Readonly<{
  sidebarProvider: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  sidebar: <Msg>(
    props: Readonly<{
      collapsible?: 'offcanvas' | 'icon' | 'none'
      children: ReadonlyArray<Html | string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  sidebarContent: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  sidebarInset: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const Model = S.Struct({})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  Mounted: {},
})
type Message = typeof Message.Type

const update = (model: Model): { model: Model } => ({ model })

const view =
  (kit: Kit) =>
  (_model: Model, h: HtmlBuilder<Message>): Html =>
    kit.sidebarProvider(
      {
        children: [
          kit.sidebar(
            {
              collapsible: 'none',
              children: [
                kit.sidebarContent(
                  {
                    children: [
                      h.div(
                        [h.DataAttribute('slot', 'fixture-nav-item')],
                        ['Navigation'],
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          kit.sidebarInset(
            {
              children: [
                h.div(
                  [h.DataAttribute('slot', 'fixture-content')],
                  ['Main content'],
                ),
              ],
            },
            h,
          ),
        ],
      },
      h,
    )

export const runAppShell = (kit: Kit) =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({ model: {} }),
      update,
      view: view(kit),
      container: document.getElementById('root'),
      devTools: false,
    }),
  )

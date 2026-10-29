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
  sidebarMenu: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  sidebarMenuItem: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  sidebarMenuSub: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  sidebarMenuSubItem: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  sidebarMenuSubButton: <Msg>(
    props: Readonly<{
      children: ReadonlyArray<Html | string>
      href?: string
      onClick?: Msg
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  sidebarMenuBadge: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const Model = S.Struct({})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  Mounted: {},
  SelectedSub: {},
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
                      // A sub-menu whose first entry navigates by Message
                      // (no URL): it must be a <button> so it is keyboard
                      // reachable, and it carries a count badge (A0.17).
                      kit.sidebarMenu(
                        {
                          children: [
                            kit.sidebarMenuItem(
                              {
                                children: [
                                  kit.sidebarMenuSub(
                                    {
                                      children: [
                                        kit.sidebarMenuSubItem(
                                          {
                                            children: [
                                              kit.sidebarMenuSubButton(
                                                {
                                                  children: ['Issues'],
                                                  onClick: Message.SelectedSub,
                                                },
                                                h,
                                              ),
                                              kit.sidebarMenuBadge(
                                                { children: ['3'] },
                                                h,
                                              ),
                                            ],
                                          },
                                          h,
                                        ),
                                        kit.sidebarMenuSubItem(
                                          {
                                            children: [
                                              kit.sidebarMenuSubButton(
                                                {
                                                  children: ['Docs'],
                                                  href: '#docs',
                                                },
                                                h,
                                              ),
                                            ],
                                          },
                                          h,
                                        ),
                                      ],
                                    },
                                    h,
                                  ),
                                ],
                              },
                              h,
                            ),
                          ],
                        },
                        h,
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
                // A one-line row that clips its own overflow, like a real
                // toolbar/title row: it still drives min-width:auto on the
                // inset, but must not paint past the viewport itself.
                h.div(
                  [
                    h.DataAttribute('slot', 'fixture-wide-row'),
                    h.Style({
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }),
                  ],
                  [
                    'wide row '.repeat(60) +
                      'a one-line row wider than the inset',
                  ],
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

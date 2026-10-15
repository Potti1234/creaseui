import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

/* F5 item-group fixture: linked, ordinary and mixed Items inside an
   ItemGroup must keep both the list structure and native link semantics. */
export type ItemsKit = Readonly<{
  itemGroup: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  item: <Msg>(
    props: Readonly<{
      children: ReadonlyArray<Html | string>
      element?: 'div' | 'a'
      href?: string
      variant?: 'outline'
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  itemContent: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  itemTitle: <Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

type Entry = Readonly<{ title: string; href?: string }>
const GROUPS: ReadonlyArray<
  Readonly<{ id: string; entries: ReadonlyArray<Entry> }>
> = [
  {
    id: 'items-linked',
    entries: [
      { title: 'Track one', href: '#track-one' },
      { title: 'Track two', href: '#track-two' },
    ],
  },
  { id: 'items-ordinary', entries: [{ title: 'Inbox' }, { title: 'Archive' }] },
  {
    id: 'items-mixed',
    entries: [
      { title: 'Open profile', href: '#profile' },
      { title: 'Storage used' },
      { title: 'Open billing', href: '#billing' },
    ],
  },
]

const Model = S.Struct({})
type Model = typeof Model.Type

const Message = defineMessageUnion({ Noop: {} })
type Message = typeof Message.Type

const view =
  (kit: ItemsKit) =>
  (_model: Model, h: HtmlBuilder<Message>): Html =>
    h.section(
      [h.Id('items')],
      GROUPS.map(({ id, entries }) =>
        h.div(
          [h.Id(id)],
          [
            kit.itemGroup(
              {
                children: entries.map(({ title, href }) =>
                  kit.item(
                    {
                      variant: 'outline',
                      ...(href === undefined ? {} : { element: 'a', href }),
                      children: [
                        kit.itemContent(
                          {
                            children: [kit.itemTitle({ children: [title] }, h)],
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                ),
              },
              h,
            ),
          ],
        ),
      ),
    )

export const runItemGroups = (kit: ItemsKit) =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({ model: {} }),
      update: (model: Model) => ({ model }),
      view: view(kit),
      container: document.getElementById('items-root'),
      devTools: false,
    }),
  )

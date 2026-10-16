import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

/* F5 item-group fixture: linked, ordinary and mixed Items inside an
   ItemGroup must keep both the list structure and native link semantics. */
type Separator = Readonly<{ separator: unknown }>
export type ItemsKit = Readonly<{
  /* Method syntax: each renderer's separator entry is its own type. */
  itemGroup<Msg>(
    props: Readonly<{ children: ReadonlyArray<Html | string | Separator> }>,
    h: HtmlBuilder<Msg>,
  ): Html
  itemGroupSeparator(): Separator
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

type Entry = Readonly<{ title: string; href?: string; separatorBefore?: true }>
const GROUPS: ReadonlyArray<
  Readonly<{ id: string; entries: ReadonlyArray<Entry> }>
> = [
  {
    id: 'items-separated',
    entries: [
      { title: 'Release notes', href: '#release-notes' },
      { title: 'Changelog', separatorBefore: true },
    ],
  },
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

/* Items outside an ItemGroup keep their native element semantics. */
const standaloneItems = (kit: ItemsKit, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Id('items-standalone')],
    [
      kit.item(
        {
          variant: 'outline',
          children: [
            kit.itemContent(
              { children: [kit.itemTitle({ children: ['Plain'] }, h)] },
              h,
            ),
          ],
        },
        h,
      ),
      kit.item(
        {
          variant: 'outline',
          element: 'a',
          href: '#standalone',
          children: [
            kit.itemContent(
              { children: [kit.itemTitle({ children: ['Linked'] }, h)] },
              h,
            ),
          ],
        },
        h,
      ),
    ],
  )

const view =
  (kit: ItemsKit) =>
  (_model: Model, h: HtmlBuilder<Message>): Html =>
    h.section(
      [h.Id('items')],
      [
        ...GROUPS.map(({ id, entries }) =>
          h.div(
            [h.Id(id)],
            [
              kit.itemGroup(
                {
                  children: entries.flatMap(
                    ({ title, href, separatorBefore }) => [
                      ...(separatorBefore ? [kit.itemGroupSeparator()] : []),
                      kit.item(
                        {
                          variant: 'outline',
                          ...(href === undefined ? {} : { element: 'a', href }),
                          children: [
                            kit.itemContent(
                              {
                                children: [
                                  kit.itemTitle({ children: [title] }, h),
                                ],
                              },
                              h,
                            ),
                          ],
                        },
                        h,
                      ),
                    ],
                  ),
                },
                h,
              ),
            ],
          ),
        ),
        standaloneItems(kit, h),
      ],
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

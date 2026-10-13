import type { DocsExample } from '@/docs/components/page-definition'
import { foldkitApplication } from '@/docs/components/pages/authored-page'

export type ActionBarKind = 'bottom' | 'top' | 'vertical'

export interface ActionBarFixture {
  readonly title: string
  readonly description?: string
  readonly heroOnly?: boolean
  readonly kind: ActionBarKind
}

export const actionBarFixtures: Readonly<
  [ActionBarFixture, ...Array<ActionBarFixture>]
> = [
  { title: 'Basic', heroOnly: true, kind: 'bottom' },
  {
    title: 'Top',
    description:
      'Use side="top" to pin the bar to the top edge of the viewport.',
    kind: 'top',
  },
  {
    title: 'Vertical',
    description:
      'Use orientation="vertical" to stack the selection text above the actions.',
    kind: 'vertical',
  },
]

export const emitApplication = (
  fixture: ActionBarFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  const sep = renderer === 'stylex' ? 'stylex' : 'ui'
  const side = fixture.kind === 'top' ? `, side: 'top'` : ''
  const orientation =
    fixture.kind === 'vertical' ? `, orientation: 'vertical'` : ''
  return foldkitApplication({
    title: `Action Bar — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'

import * as ActionBar from '@/${sep}/action-bar'
import * as Icon from '@/lib/icon'`,
    model: `export const Model = S.Struct({ selected: S.Number })
export type Model = typeof Model.Type`,
    messages: `export const ToggledSelection = taggedStruct('ToggledSelection')
export const ClosedActionBar = taggedStruct('ClosedActionBar')
export const DismissedAction = taggedStruct('DismissedAction')
export const IgnoredMountMessage = taggedStruct('IgnoredMountMessage')
export const Message = S.Union([
  ToggledSelection,
  ClosedActionBar,
  DismissedAction,
  IgnoredMountMessage,
])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({ model: { selected: 0 } })`,
    update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ToggledSelection':
      return { model: { ...model, selected: model.selected === 0 ? 3 : 0 } }
    case 'ClosedActionBar':
      return { model: { ...model, selected: 0 } }
    case 'DismissedAction':
    case 'IgnoredMountMessage':
      return { model }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Action Bar — ${fixture.title}',
  body: h.main(
    [h.Class('flex min-h-screen items-center justify-center p-8')],
    [
      h.button(
        [h.Class('rounded-md border px-3 py-2 text-sm'), h.OnClick(ToggledSelection({}))],
        [model.selected === 0 ? 'Select 3 tasks' : 'Clear selection'],
      ),
      ActionBar.actionBar(
        {
          open: model.selected > 0${side}${orientation},
          toParentMessage: mountMessage =>
            mountMessage._tag === 'RequestedClose'
              ? ClosedActionBar({})
              : IgnoredMountMessage({}),
          children: [
            ActionBar.actionBarSelection(
              { children: [\`\${String(model.selected)} selected\`] },
              h,
            ),
            ActionBar.actionBarSeparator({}, h),
            ActionBar.actionBarItem(
              { onSelect: ClosedActionBar({}), children: ['Mark done'] },
              h,
            ),
            ActionBar.actionBarClose(
              {
                onClose: ClosedActionBar({}),
                ariaLabel: 'Clear selection',
                children: [Icon.icon('x', { class: 'size-4' }, h)],
              },
              h,
            ),
          ],
        },
        h,
      ),
    ],
  ),
})`,
  })
}

export const actionBarExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  actionBarFixtures.map(fixture => ({
    title: fixture.title,
    ...(fixture.description === undefined
      ? {}
      : { description: fixture.description }),
    ...(fixture.heroOnly === true ? { heroOnly: true } : {}),
    code: emitApplication(fixture, renderer),
  }))

import { Schema as S } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { definePreviewProgram } from '@/docs/components/pages/authored-page'
import type { ActionBarFixture } from '@/docs/components/pages/action-bar/shared'
import { actionBarFixtures } from '@/docs/components/pages/action-bar/shared'
import * as ActionBar from '@/ui/action-bar'
import * as Button from '@/ui/button'

const ActionBarPreviewMessage = defineMessageUnion({
  ToggledSelection: {},
  ClosedActionBar: {},
  IgnoredMountMessage: {},
})
type ActionBarPreviewMessage = typeof ActionBarPreviewMessage.Type
const ActionBarPreviewModel = S.Struct({
  _docsPage: S.Literal('action-bar'),
  selected: S.Number,
})
type ActionBarPreviewModel = typeof ActionBarPreviewModel.Type

const previewBar = (
  fixture: ActionBarFixture,
  model: ActionBarPreviewModel,
  h: HtmlBuilder<ActionBarPreviewMessage>,
): Html =>
  ActionBar.actionBar(
    {
      open: model.selected > 0,
      ...(fixture.kind === 'top' ? { side: 'top' as const } : {}),
      ...(fixture.kind === 'vertical'
        ? { orientation: 'vertical' as const }
        : {}),
      toParentMessage: mountMessage =>
        mountMessage._tag === 'RequestedClose'
          ? ActionBarPreviewMessage.ClosedActionBar({})
          : ActionBarPreviewMessage.IgnoredMountMessage({}),
      children: [
        ActionBar.actionBarSelection(
          { children: [`${String(model.selected)} selected`] },
          h,
        ),
        ActionBar.actionBarSeparator({}, h),
        ActionBar.actionBarItem(
          {
            onSelect: ActionBarPreviewMessage.ClosedActionBar({}),
            children: ['Mark done'],
          },
          h,
        ),
        ActionBar.actionBarClose(
          { onClose: ActionBarPreviewMessage.ClosedActionBar({}) },
          h,
        ),
      ],
    },
    h,
  )

export const actionBarTailwindPreviewProgram = definePreviewProgram<
  ActionBarPreviewModel,
  ActionBarPreviewMessage
>({
  Model: ActionBarPreviewModel,
  Message: ActionBarPreviewMessage,
  init: () => ({ _docsPage: 'action-bar', selected: 0 }),
  update: (model, message) => {
    switch (message._tag) {
      case 'ToggledSelection':
        return { model: { ...model, selected: model.selected === 0 ? 3 : 0 } }
      case 'ClosedActionBar':
        return { model: { ...model, selected: 0 } }
      case 'IgnoredMountMessage':
        return { model }
    }
  },
  view: (index, model, h) => {
    const fixture = actionBarFixtures[index] ?? actionBarFixtures[0]
    return h.div(
      [],
      [
        Button.button(
          {
            variant: 'outline',
            onClick: ActionBarPreviewMessage.ToggledSelection({}),
            children: [
              model.selected === 0 ? 'Select 3 tasks' : 'Clear selection',
            ],
          },
          h,
        ),
        previewBar(fixture, model, h),
      ],
    )
  },
})

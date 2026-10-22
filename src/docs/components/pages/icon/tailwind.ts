import { Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import { definePreviewProgram } from '@/docs/components/pages/authored-page'
import {
  iconFixtures,
  type IconFixture,
  type IconItem,
} from '@/docs/components/pages/icon/shared'
import * as Icon from '@/ui/icon'

const InteractedWithIconPreview = defineMessageUnion({
  InteractedWithIconPreview: {},
})
type InteractedWithIconPreview = typeof InteractedWithIconPreview.Type
const IconPreviewModel = S.Struct({ _docsPage: S.Literal('icon') })
type IconPreviewModel = typeof IconPreviewModel.Type

const iconItem = <Msg>(item: IconItem, h: HtmlBuilder<Msg>) =>
  Icon.icon(
    {
      name: item.name,
      ...(item.size === undefined ? {} : { size: item.size }),
      ...(item.tone === undefined ? {} : { tone: item.tone }),
      ...(item.filled === true ? { filled: true } : {}),
      ...(item.rotation === undefined ? {} : { rotation: item.rotation }),
      ...(item.ariaLabel === undefined ? {} : { ariaLabel: item.ariaLabel }),
    },
    h,
  )

const children = <Msg>(fixture: IconFixture, h: HtmlBuilder<Msg>) => {
  const icons = fixture.items.map(item => iconItem(item, h))
  return fixture.text === undefined
    ? icons
    : [...icons.slice(0, 1), fixture.text, ...icons.slice(1)]
}

export const iconTailwindPreviewProgram = definePreviewProgram<
  IconPreviewModel,
  InteractedWithIconPreview
>({
  Model: IconPreviewModel,
  Message: InteractedWithIconPreview,
  init: () => ({ _docsPage: 'icon' }),
  update: model => ({ model: model }),
  view: (index, _model, h) =>
    h.div(
      [h.Class('flex items-center gap-3 text-sm')],
      children(iconFixtures[index] ?? iconFixtures[0], h),
    ),
})

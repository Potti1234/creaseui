import { Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import { definePreviewProgram } from '@/docs/components/pages/authored-page'
import {
  thumbnailFixtures,
  type ThumbnailItem,
} from '@/docs/components/pages/thumbnail/shared'
import * as Thumbnail from '@/ui/thumbnail'

const InteractedWithThumbnailPreview = defineMessageUnion({
  InteractedWithThumbnailPreview: {},
})
type InteractedWithThumbnailPreview = typeof InteractedWithThumbnailPreview.Type
const ThumbnailPreviewModel = S.Struct({ _docsPage: S.Literal('thumbnail') })
type ThumbnailPreviewModel = typeof ThumbnailPreviewModel.Type

const NO_OP = InteractedWithThumbnailPreview.InteractedWithThumbnailPreview()

const itemView = <Msg>(item: ThumbnailItem, noop: Msg, h: HtmlBuilder<Msg>) =>
  Thumbnail.thumbnail(
    {
      ...(item.src === undefined ? {} : { src: item.src }),
      ...(item.alt === undefined ? {} : { alt: item.alt }),
      label: item.label,
      ...(item.isLoading === true ? { isLoading: true } : {}),
      ...(item.isDisabled === true ? { isDisabled: true } : {}),
      ...(item.hasRemove === true ? { onRemove: noop } : {}),
      ...(item.hasClick === true ? { onClick: noop } : {}),
      ...(item.showRemoveOn === 'always'
        ? { showRemoveOn: 'always' as const }
        : {}),
    },
    h,
  )

const caption = <Msg>(text: string, h: HtmlBuilder<Msg>) =>
  h.span([h.Class('text-xs text-muted-foreground')], [text])

const itemBlock = <Msg>(item: ThumbnailItem, noop: Msg, h: HtmlBuilder<Msg>) =>
  item.caption === undefined
    ? itemView(item, noop, h)
    : h.div(
        [h.Class('flex flex-col items-center gap-1')],
        [itemView(item, noop, h), caption(item.caption, h)],
      )

const rowWrap = <Msg>(
  items: ReadonlyArray<ThumbnailItem>,
  noop: Msg,
  h: HtmlBuilder<Msg>,
) =>
  h.div(
    [h.Class('flex flex-wrap items-end gap-3')],
    items.map(item => itemBlock(item, noop, h)),
  )

export const thumbnailTailwindPreviewProgram = definePreviewProgram<
  ThumbnailPreviewModel,
  InteractedWithThumbnailPreview
>({
  Model: ThumbnailPreviewModel,
  Message: InteractedWithThumbnailPreview,
  init: () => ({ _docsPage: 'thumbnail' }),
  update: model => ({ model: model }),
  view: (index, _model, h) => {
    const fixture = thumbnailFixtures[index] ?? thumbnailFixtures[0]
    const noop = NO_OP as never
    if (fixture.layout === 'single')
      return itemView(fixture.items[0] ?? { label: '' }, noop, h)
    if (fixture.layout === 'sections') {
      const sections = [
        {
          label: fixture.items[0]?.caption ?? 'Enabled',
          items: fixture.items.slice(0, 2),
        },
        {
          label: fixture.items[2]?.caption ?? 'Disabled',
          items: fixture.items.slice(2),
        },
      ]
      return h.div(
        [h.Class('flex flex-col gap-4')],
        sections.map(section =>
          h.div(
            [h.Class('flex flex-col gap-1')],
            [
              caption(section.label, h),
              h.div(
                [h.Class('flex items-center gap-3')],
                section.items.map(item => itemView(item, noop, h)),
              ),
            ],
          ),
        ),
      )
    }
    return h.div(
      [h.Class('flex flex-col gap-4')],
      [caption(fixture.heading ?? '', h), rowWrap(fixture.items, noop, h)],
    )
  },
})

import * as stylex from '@stylexjs/stylex'
import type { HtmlBuilder } from 'foldkit/html'

import type { ExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  iconFixtures,
  type IconFixture,
  type IconItem,
} from '@/docs/components/pages/icon/shared'
import { className } from '@/stylex/style'
import * as Icon from '@/stylex/icon'

const styles = stylex.create({
  row: {
    gap: '0.75rem',
    alignItems: 'center',
    display: 'flex',
    fontSize: '0.875rem',
  },
})

const iconItem = <Msg>(item: IconItem, h: HtmlBuilder<Msg>) =>
  Icon.icon(
    {
      name: item.name,
      ...(item.size === undefined ? {} : { size: item.size }),
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

export const iconStyleXPreview: ExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) =>
  h.div(
    [h.Class(className(styles.row))],
    children(iconFixtures[exampleIndex] ?? iconFixtures[0], h),
  )

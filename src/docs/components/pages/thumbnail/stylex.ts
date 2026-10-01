import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  thumbnailFixtures,
  type ThumbnailItem,
} from '@/docs/components/pages/thumbnail/shared';
import { className } from '@/stylex/style';
import { tokens } from '../../../../stylex/tokens.stylex';
import * as Thumbnail from '@/stylex/thumbnail';

const styles = stylex.create({
  column: { gap: '0.75rem', display: 'flex', flexDirection: 'column', },
  section: { gap: '0.25rem', display: 'flex', flexDirection: 'column', },
  row: { gap: '0.75rem', alignItems: 'flex-end', display: 'flex', flexWrap: 'wrap', },
  rowCenter: { gap: '0.75rem', alignItems: 'center', display: 'flex', },
  item: { gap: '0.25rem', alignItems: 'center', display: 'flex', flexDirection: 'column', },
  caption: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
  },
});

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
      ...(item.showRemoveOn === 'always' ? { showRemoveOn: 'always' as const } : {}),
    },
    h,
  );

export const thumbnailStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = thumbnailFixtures[exampleIndex] ?? thumbnailFixtures[0];
  const noop = onMessageJson(
    JSON.stringify({ _tag: 'InteractedWithThumbnailPreview' }),
  );
  const caption = (text: string) =>
    h.span([h.Class(className(styles.caption))], [text]);
  const itemBlock = (item: ThumbnailItem) =>
    item.caption === undefined
      ? itemView(item, noop, h)
      : h.div(
          [h.Class(className(styles.item))],
          [itemView(item, noop, h), caption(item.caption)],
        );
  if (fixture.layout === 'single')
    return itemView(fixture.items[0] ?? { label: '' }, noop, h);
  if (fixture.layout === 'sections') {
    const sections = [
      { label: fixture.items[0]?.caption ?? 'Enabled', items: fixture.items.slice(0, 2) },
      { label: fixture.items[2]?.caption ?? 'Disabled', items: fixture.items.slice(2) },
    ];
    return h.div(
      [h.Class(className(styles.column))],
      sections.map(section =>
        h.div(
          [h.Class(className(styles.section))],
          [
            caption(section.label),
            h.div(
              [h.Class(className(styles.rowCenter))],
              section.items.map(item => itemView(item, noop, h)),
            ),
          ],
        ),
      ),
    );
  }
  return h.div(
    [h.Class(className(styles.column))],
    [
      caption(fixture.heading ?? ''),
      h.div(
        [h.Class(className(styles.row))],
        fixture.items.map(item => itemBlock(item)),
      ),
    ],
  );
};

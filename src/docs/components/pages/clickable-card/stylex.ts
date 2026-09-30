import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  clickableCardFixtures,
  type ClickableCardFixture,
} from '@/docs/components/pages/clickable-card/shared';
import * as Button from '@/stylex/button';
import * as ClickableCard from '@/stylex/clickable-card';
import { className } from '@/stylex/style';

const styles = stylex.create({
  stack2: { gap: '0.5rem', display: 'flex', flexDirection: 'column', },
  stack3: { gap: '0.75rem', display: 'flex', flexDirection: 'column', },
  stack1: { gap: '0.25rem', display: 'flex', flexDirection: 'column', },
  heading: {
    fontSize: '1.25rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: '1.75rem',
  },
  body: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
});

const textBlock = <Msg>(
  heading: string,
  bodyText: string,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.Class(className(styles.stack2))],
    [
      h.h4([h.Class(className(styles.heading))], [heading]),
      h.p([h.Class(className(styles.body))], [bodyText]),
    ],
  );

const body = <Msg>(
  fixture: ClickableCardFixture,
  h: HtmlBuilder<Msg>,
): Html => {
  switch (fixture.kind) {
    case 'settings':
      return textBlock(
        'Settings',
        'Click anywhere on this card to navigate. Nested buttons and links work independently.',
        h,
      );
    case 'report':
      return textBlock(
        'Quarterly report',
        'A raised shadow signals the whole card is clickable, lifting it above the surrounding content.',
        h,
      );
    case 'product':
      return h.div(
        [h.Class(className(styles.stack3))],
        [
          h.div(
            [h.Class(className(styles.stack1))],
            [
              h.h4([h.Class(className(styles.heading))], ['Wireless Headphones']),
              h.p([h.Class(className(styles.body))], ['$79.99']),
            ],
          ),
          Button.button({ variant: 'default', children: ['Add to cart'] }, h),
        ],
      );
  }
};

export const clickableCardStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture =
    clickableCardFixtures[exampleIndex] ?? clickableCardFixtures[0];
  return ClickableCard.clickableCard(
    {
      label: fixture.label,
      href: '#',
      width: '20rem',
      ...(fixture.elevation === undefined
        ? {}
        : { elevation: fixture.elevation }),
      children: [body(fixture, h)],
    },
    h,
  );
};

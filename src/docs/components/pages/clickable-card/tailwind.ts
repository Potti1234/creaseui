import { Schema as S } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  clickableCardFixtures,
  type ClickableCardFixture,
} from '@/docs/components/pages/clickable-card/shared';
import * as Button from '@/ui/button';
import * as ClickableCard from '@/ui/clickable-card';

const ClickableCardPreviewMessage = defineMessageUnion({
  ClickableCardPreviewMessage: {},
});
type ClickableCardPreviewMessage = typeof ClickableCardPreviewMessage.Type;
const ClickableCardPreviewModel = S.Struct({
  _docsPage: S.Literal('clickable-card'),
});
type ClickableCardPreviewModel = typeof ClickableCardPreviewModel.Type;

const textBlock = <Msg>(
  heading: string,
  body: string,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-2')],
    [
      h.h4(
        [h.Class('scroll-m-20 text-xl font-semibold tracking-tight')],
        [heading],
      ),
      h.p([h.Class('text-sm text-muted-foreground')], [body]),
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
        [h.Class('flex flex-col gap-3')],
        [
          h.div(
            [h.Class('flex flex-col gap-1')],
            [
              h.h4(
                [h.Class('scroll-m-20 text-xl font-semibold tracking-tight')],
                ['Wireless Headphones'],
              ),
              h.p([h.Class('text-sm text-muted-foreground')], ['$79.99']),
            ],
          ),
          Button.button({ variant: 'default', children: ['Add to cart'] }, h),
        ],
      );
  }
};

export const clickableCardTailwindPreviewProgram = definePreviewProgram<
  ClickableCardPreviewModel,
  ClickableCardPreviewMessage
>({
  Model: ClickableCardPreviewModel,
  Message: ClickableCardPreviewMessage,
  init: () => ({ _docsPage: 'clickable-card' }),
  update: model => ({ model: model }),
  view: (index, _model, h) => {
    const fixture = clickableCardFixtures[index] ?? clickableCardFixtures[0];
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
  },
});

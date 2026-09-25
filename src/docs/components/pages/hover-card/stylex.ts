import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  hoverCardFixtures,
  hoverCardRtlSides,
  hoverCardSides,
} from '@/docs/components/pages/hover-card/shared';
import * as Button from '@/stylex/button';
import * as HoverCard from '@/stylex/hover-card';
import { className } from '@/stylex/style';

const styles = stylex.create({
  row: { gap: '0.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', },
  content: { gap: '0.125rem', display: 'flex', flexDirection: 'column', width: '16rem', },
  gapSm: { gap: '0.25rem', display: 'flex', flexDirection: 'column', },
  heading: { fontWeight: 600 },
  headingMedium: { fontWeight: 500 },
  meta: { color: 'var(--muted-foreground)', fontSize: '0.75rem', lineHeight: '1rem', marginBlockStart: '0.25rem', },
  muted: { color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: '1.25rem', },
});

interface HoverCardPreviewShape {
  readonly hoverCards: ReadonlyArray<HoverCard.Model>;
}

const toMsg = <Msg>(onMessageJson: (messageJson: string) => Msg, index: number) =>
  (message: HoverCard.Message): Msg =>
    onMessageJson(JSON.stringify({ _tag: 'GotHoverCardMessage', index, message }));

export const hoverCardStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const fixture = hoverCardFixtures[exampleIndex] ?? hoverCardFixtures[0];
  const { hoverCards } = model as HoverCardPreviewShape;
  const firstCard = hoverCards[0];

  if (fixture.kind === 'basic' && firstCard !== undefined) {
    return HoverCard.hoverCard({
      model: firstCard,
      toParentMessage: toMsg(onMessageJson, 0),
      trigger: Button.button({ variant: 'link', children: ['Hover Here'] }, h),
      ariaLabel: 'Preview the Next.js profile',
      content: h.div([h.Class(className(styles.content))], [
        h.div([h.Class(className(styles.heading))], ['@nextjs']),
        h.div([], ['The React Framework – created and maintained by @vercel.']),
        h.div([h.Class(className(styles.meta))], ['Joined December 2021']),
      ]),
    }, h);
  }

  if (fixture.kind === 'rtl') {
    return h.div(
      [h.Class(className(styles.row))],
      hoverCards.map((hoverCard, cardIndex) => {
        const entry = hoverCardRtlSides[cardIndex] ?? hoverCardRtlSides[0];
        return HoverCard.hoverCard({
          model: hoverCard,
          toParentMessage: toMsg(onMessageJson, cardIndex),
          trigger: Button.button({ variant: 'outline', children: [entry.label] }, h),
          ariaLabel: `Hover card on the ${entry.side} side`,
          side: entry.side,
          content: h.div([h.Dir('rtl'), h.Class(className(styles.content))], [
            h.div([h.Class(className(styles.heading))], ['سماعات لاسلكية']),
            h.div([h.Class(className(styles.muted))], ['٩٩.٩٩ $']),
          ]),
        }, h);
      }),
    );
  }

  return h.div(
    [h.Class(className(styles.row))],
    hoverCards.map((hoverCard, cardIndex) => {
      const side = hoverCardSides[cardIndex] ?? 'bottom';
      return HoverCard.hoverCard({
        model: hoverCard,
        toParentMessage: toMsg(onMessageJson, cardIndex),
        trigger: Button.button({ variant: 'outline', children: [side.charAt(0).toUpperCase() + side.slice(1)] }, h),
        ariaLabel: `Hover card on the ${side} side`,
        side,
        content: h.div([h.Class(className(styles.gapSm))], [
          h.h4([h.Class(className(styles.headingMedium))], ['Hover Card']),
          h.p([], [`This hover card appears on the ${side} side of the trigger.`]),
        ]),
      }, h);
    }),
  );
};

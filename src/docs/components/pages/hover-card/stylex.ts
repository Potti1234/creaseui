import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { hoverCardFixtures } from '@/docs/components/pages/hover-card/shared';
import * as HoverCard from '@/stylex/hover-card';

const styles = stylex.create({
  content: { display: 'grid', gap: '0.25rem' },
  heading: { fontWeight: 600 },
  copy: { fontSize: '0.875rem', lineHeight: '1.25rem' },
});

export const hoverCardStyleXPreview: StyleXExamplePreviewProvider = <Msg>(exampleIndex: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = hoverCardFixtures[exampleIndex] ?? hoverCardFixtures[0];
  const hoverCardModel = (model as { hoverCard: HoverCard.Model }).hoverCard;
  return HoverCard.hoverCard({
    model: hoverCardModel,
    toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotHoverCardPreviewMessage', message })),
    trigger: '@foldkit',
    ariaLabel: 'Preview the Foldkit profile',
    side: fixture.side,
    content: h.div([h.Class(stylex.props(styles.content).className ?? '')], [
      h.h4([h.Class(stylex.props(styles.heading).className ?? '')], ['@foldkit']),
      h.p([h.Class(stylex.props(styles.copy).className ?? '')], ['Typed functional web applications without a virtual DOM.']),
    ]),
  }, h);
};

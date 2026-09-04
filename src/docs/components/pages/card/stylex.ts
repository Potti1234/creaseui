import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { cardFixtures } from '@/docs/components/pages/card/shared';
import * as Card from '@/stylex/card';

const styles = stylex.create({ card: { width: '100%', maxWidth: '24rem' }, footerCopy: { marginInlineStart: 'auto', fontSize: '0.875rem', fontWeight: 500 } });
export const cardStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, _model: unknown, _onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = cardFixtures[index] ?? cardFixtures[0];
  return fixture.title === 'Article'
    ? Card.card({ element: 'article', layoutStyle: styles.card, children: [Card.cardHeader({ children: [Card.cardTitle({ element: 'h2', children: ['Release notes'] }, h), Card.cardDescription({ children: ['Crease UI 0.1.0'] }, h)] }, h), Card.cardContent({ children: ['A source-owned component library for Foldkit applications.'] }, h)] }, h)
    : Card.card({ layoutStyle: styles.card, children: [Card.cardHeader({ children: [Card.cardTitle({ children: ['Deploy project'] }, h), Card.cardDescription({ children: ['Production is ready.'] }, h)] }, h), Card.cardContent({ children: ['All checks passed.'] }, h), Card.cardFooter({ children: [h.span([h.Class(stylex.props(styles.footerCopy).className ?? '')], ['Ready to deploy'])] }, h)] }, h);
};

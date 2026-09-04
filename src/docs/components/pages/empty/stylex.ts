import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { emptyFixtures } from '@/docs/components/pages/empty/shared';
import * as Button from '@/stylex/button';
import * as Empty from '@/stylex/empty';

const styles = stylex.create({ empty: { width: '100%', maxWidth: '36rem' }, bordered: { width: '100%', maxWidth: '36rem', borderColor: 'var(--border)', borderRadius: '0.625rem', borderStyle: 'solid', borderWidth: 1 } });
export const emptyStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, _model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = emptyFixtures[index] ?? emptyFixtures[0];
  const content = Empty.empty({ layoutStyle: styles.empty, children: [
    Empty.emptyHeader({ children: [Empty.emptyMedia({ variant: 'icon', children: [fixture.icon] }, h), Empty.emptyTitle({ children: [fixture.heading] }, h), Empty.emptyDescription({ children: [fixture.copy] }, h)] }, h),
    Empty.emptyContent({ children: [Button.button({ ...(fixture.outline ? { variant: 'outline' as const } : {}), onClick: onMessageJson(JSON.stringify({ _tag: 'InteractedWithDocsPreview' })), children: [fixture.action] }, h)] }, h),
  ] }, h);
  return fixture.bordered ? h.div([h.Class(stylex.props(styles.bordered).className ?? '')], [content]) : content;
};

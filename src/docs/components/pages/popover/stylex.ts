import type { HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { popoverFixtures } from '@/docs/components/pages/popover/shared';
import * as Popover from '@/stylex/popover';

const styles = stylex.create({
  content: { display: 'grid', gap: '0.5rem' },
  heading: { fontWeight: 500 },
  copy: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
});

export const popoverStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = popoverFixtures[exampleIndex] ?? popoverFixtures[0];
  const popoverModel = (model as { popover: Popover.Model }).popover;
  return Popover.popover({
    model: popoverModel,
    toParentMessage: message => onMessageJson(JSON.stringify({
      _tag: 'GotPopoverPreviewMessage',
      message,
    })),
    trigger: 'Open dimensions',
    side: fixture.side,
    align: fixture.align,
    content: h.div([h.Class(stylex.props(styles.content).className ?? '')], [
      h.h4([h.Class(stylex.props(styles.heading).className ?? '')], ['Dimensions']),
      h.p([h.Class(stylex.props(styles.copy).className ?? '')], [
        'Set the dimensions for the layer.',
      ]),
    ]),
  }, h);
};

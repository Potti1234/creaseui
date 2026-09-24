import type { HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { popoverFixtures } from '@/docs/components/pages/popover/shared';
import * as Popover from '@/stylex/popover';

const styles = stylex.create({
  content: { gap: '0.5rem', display: 'grid', },
  heading: { fontWeight: 500 },
  copy: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  input: { borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: '1px', paddingBlock: '0.5rem', paddingInline: '0.75rem' },
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
    focusSelector: 'input',
    content: h.div([h.Class(stylex.props(styles.content).className ?? '')], [
      h.h4([h.Class(stylex.props(styles.heading).className ?? '')], ['Dimensions']),
      h.p([h.Class(stylex.props(styles.copy).className ?? '')], [
        'Set the dimensions for the layer.',
      ]),
      h.input([h.Type('number'), h.AriaLabel('Width'), h.Class(stylex.props(styles.input).className ?? '')]),
    ]),
  }, h);
};

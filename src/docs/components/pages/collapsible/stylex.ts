import type { HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Collapsible from '@/stylex/collapsible';

const styles = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  externalTrigger: {
    borderColor: 'var(--border)',
    borderRadius: '0.375rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: '0.5rem',
    paddingInline: '0.75rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  content: {
    marginTop: '0.75rem',
  },
  trigger: {
    width: 'fit-content',
  },
});

export const collapsibleStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const isOpen = (model as { isOpen: boolean }).isOpen;
  const toggle = (next: boolean): Msg => onMessageJson(JSON.stringify({
    _tag: 'ToggledCollapsiblePreview',
    isOpen: next,
  }));
  const disclosure = Collapsible.collapsible({
    id: `docs-collapsible-${String(exampleIndex)}`,
    isOpen: exampleIndex === 2 ? false : isOpen,
    onToggle: toggle,
    ...(exampleIndex === 2 ? { isDisabled: true } : {}),
    trigger: exampleIndex === 0
      ? (isOpen ? 'Hide details' : 'Show details')
      : exampleIndex === 1 ? 'Architecture notes' : 'Unavailable details',
    content: exampleIndex === 1
      ? 'Messages describe facts and update owns transitions.'
      : 'Foldkit keeps disclosure state explicit.',
    triggerLayoutStyle: styles.trigger,
    contentLayoutStyle: styles.content,
  }, h);

  return exampleIndex === 0
    ? h.div([h.Class(stylex.props(styles.stack).className ?? '')], [
        h.button([
          h.Type('button'),
          h.OnClick(toggle(!isOpen)),
          h.Class(stylex.props(styles.externalTrigger).className ?? ''),
        ], [isOpen ? 'Close details externally' : 'Open details externally']),
        disclosure,
      ])
    : disclosure;
};

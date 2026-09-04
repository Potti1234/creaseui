import type { Html, HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { bubbleFixtures } from '@/docs/components/pages/bubble/shared';
import * as Bubble from '@/stylex/bubble';

const styles = stylex.create({ group: { width: '100%', maxWidth: '28rem' } });
const message = <Msg>(text: string, variant: Exclude<Bubble.BubbleVariant, null>, align: 'start' | 'end', h: HtmlBuilder<Msg>): Html => Bubble.bubble({ variant, align, children: [Bubble.bubbleContent({ variant, children: [text] }, h)] }, h);

export const bubbleStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, _model: unknown, _onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = bubbleFixtures[index] ?? bubbleFixtures[0];
  if (fixture.title === 'Conversation') return Bubble.bubbleGroup({ layoutStyle: styles.group, children: [message('Can you review the Foldkit update?', 'secondary', 'start', h), message('Yes — I will check the model and command flow.', 'default', 'end', h)] }, h);
  if (fixture.title === 'Reaction') return Bubble.bubble({ variant: 'tinted', children: [Bubble.bubbleContent({ variant: 'tinted', children: ['The documentation build passed.'] }, h), Bubble.bubbleReactions({ children: ['👍 3'] }, h)] }, h);
  return message('Message could not be sent.', 'destructive', 'end', h);
};

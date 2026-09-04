import type { Html, HtmlBuilder } from 'foldkit/html';

import { bubbleFixtures } from '@/docs/components/pages/bubble/shared';
import * as Bubble from '@/ui/bubble';

export type BubbleStaticPreview = <Msg>(model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) => Html;
const message = <Msg>(text: string, variant: Bubble.BubbleVariant, align: 'start' | 'end', h: HtmlBuilder<Msg>) => Bubble.bubble({ variant, align, children: [Bubble.bubbleContent({ children: [text] }, h)] }, h);

export const bubbleTailwindPreviews: ReadonlyArray<BubbleStaticPreview> = bubbleFixtures.map((_fixture, index) => <Msg>(_model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) => {
  if (index === 0) return Bubble.bubbleGroup({ class: 'w-full max-w-md', children: [message('Can you review the Foldkit update?', 'secondary', 'start', h), message('Yes — I will check the model and command flow.', 'default', 'end', h)] }, h);
  if (index === 1) return Bubble.bubble({ variant: 'tinted', children: [Bubble.bubbleContent({ children: ['The documentation build passed.'] }, h), Bubble.bubbleReactions({ children: ['👍 3'] }, h)] }, h);
  return message('Message could not be sent.', 'destructive', 'end', h);
});

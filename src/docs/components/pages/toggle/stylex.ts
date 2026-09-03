import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { toggleChildren } from '@/docs/components/pages/toggle/shared';
import * as Toggle from '@/stylex/toggle';

export const toggleStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => Toggle.toggle({
  isPressed: (model as { isPressed: boolean }).isPressed,
  onToggle: onMessageJson(JSON.stringify({ _tag: 'ToggledTogglePreview' })),
  children: [toggleChildren[exampleIndex] ?? toggleChildren[0]],
  ...(exampleIndex === 1 ? { variant: 'outline' as const } : {}),
  ...(exampleIndex === 2 ? { isDisabled: true } : {}),
  ...(exampleIndex === 3
    ? { ariaLabel: 'Bold formatting', size: 'sm' as const }
    : {}),
}, h);

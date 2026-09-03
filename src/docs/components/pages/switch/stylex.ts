import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { switchLabels } from '@/docs/components/pages/switch/shared';
import * as Switch from '@/stylex/switch';

export const switchStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => Switch.switchControl({
  id: `docs-switch-${String(exampleIndex)}`,
  isChecked: (model as { isChecked: boolean }).isChecked,
  onToggle: isChecked => onMessageJson(JSON.stringify({
    _tag: 'ToggledSwitchPreview',
    isChecked,
  })),
  label: switchLabels[exampleIndex] ?? switchLabels[0],
  ...(exampleIndex === 0
    ? {
        description: 'Receive build and deployment updates.',
        name: 'notifications',
        value: 'enabled',
      }
    : {}),
  ...(exampleIndex === 1 ? { size: 'sm' as const } : {}),
  ...(exampleIndex === 2
    ? {
        isDisabled: true,
        description: 'Required by your organization.',
      }
    : {}),
  ...(exampleIndex === 3
    ? {
        isReadOnly: true,
        description: 'Supplied by your identity provider.',
      }
    : {}),
  ...(exampleIndex === 4
    ? {
        direction: 'rtl' as const,
        description: 'The thumb follows the inline direction.',
      }
    : {}),
}, h);

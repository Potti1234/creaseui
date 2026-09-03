import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { checkboxLabels } from '@/docs/components/pages/checkbox/shared';
import * as Checkbox from '@/stylex/checkbox';

export const checkboxStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => Checkbox.checkbox({
  id: `docs-checkbox-${String(exampleIndex)}`,
  isChecked: (model as { isChecked: boolean }).isChecked,
  onToggle: isChecked => onMessageJson(JSON.stringify({
    _tag: 'ToggledCheckboxPreview',
    isChecked,
  })),
  label: checkboxLabels[exampleIndex] ?? checkboxLabels[0],
  ...(exampleIndex === 0
    ? {
        description: 'Required before creating the account.',
        name: 'terms',
        value: 'accepted',
      }
    : {}),
  ...(exampleIndex === 1 ? { isIndeterminate: true } : {}),
  ...(exampleIndex === 2 ? { isDisabled: true } : {}),
  ...(exampleIndex === 3
    ? {
        isReadOnly: true,
        description: 'This status is supplied by your identity provider.',
      }
    : {}),
}, h);

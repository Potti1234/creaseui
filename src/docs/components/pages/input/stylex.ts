import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { inputLabel } from '@/docs/components/pages/input/shared';
import * as Input from '@/stylex/input';

const styles = stylex.create({
  input: { maxWidth: '24rem' },
});

export const inputStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => Input.input({
  id: `docs-input-${String(exampleIndex)}`,
  value: (model as { value: string }).value,
  onInput: value => onMessageJson(JSON.stringify({
    _tag: 'ChangedTextDocsPreview',
    value,
  })),
  layoutStyle: styles.input,
  label: inputLabel(exampleIndex),
  ...(exampleIndex === 0
    ? {
        type: 'email' as const,
        autocomplete: 'email',
        inputMode: 'email' as const,
        description: 'We will only use this for account notices.',
        placeholder: 'you@example.com',
      }
    : {}),
  ...(exampleIndex === 1
    ? { description: 'Use lowercase letters and hyphens.', isInvalid: true }
    : {}),
  ...(exampleIndex === 2 ? { isDisabled: true } : {}),
  ...(exampleIndex === 3
    ? {
        name: 'email',
        form: 'profile',
        autocomplete: 'email',
        inputMode: 'email' as const,
        isReadOnly: true,
      }
    : {}),
}, h);

import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { textareaLabel } from '@/docs/components/pages/textarea/shared';
import * as Textarea from '@/stylex/textarea';

const styles = stylex.create({
  textarea: { maxWidth: '28rem' },
});

export const textareaStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const control = Textarea.textarea({
    id: `docs-textarea-${String(exampleIndex)}`,
    value: (model as { value: string }).value,
    onInput: value => onMessageJson(JSON.stringify({
      _tag: 'ChangedTextDocsPreview',
      value,
    })),
    layoutStyle: styles.textarea,
    label: textareaLabel(exampleIndex),
    ...(exampleIndex === 0
      ? {
          description: 'Include enough context for the reviewer.',
          placeholder: 'Describe the change…',
          rows: 4,
        }
      : {}),
    ...(exampleIndex === 1
      ? {
          description: 'Release notes must contain at least 20 characters.',
          isInvalid: true,
        }
      : {}),
    ...(exampleIndex === 2 ? { isDisabled: true } : {}),
    ...(exampleIndex === 3
      ? {
          name: 'notes',
          form: 'textarea-profile',
          rows: 5,
          wrap: 'hard' as const,
          resize: 'none' as const,
          isReadOnly: true,
        }
      : {}),
  }, h);

  return exampleIndex === 3
    ? h.div([], [h.form([h.Id('textarea-profile')], []), control])
    : control;
};

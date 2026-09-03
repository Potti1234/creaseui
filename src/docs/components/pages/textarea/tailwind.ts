import { textPreviewProgram } from '@/docs/components/pages/authored-page';
import {
  textareaInitialValues,
  textareaLabel,
} from '@/docs/components/pages/textarea/shared';
import * as Textarea from '@/ui/textarea';

export const textareaTailwindPreviewProgram = textPreviewProgram(
  'textarea',
  textareaInitialValues,
  (index, value, onInput, h) => {
    const control = Textarea.textarea({
      id: `docs-textarea-${String(index)}`,
      value,
      onInput,
      class: 'max-w-md',
      label: textareaLabel(index),
      ...(index === 0
        ? {
            description: 'Include enough context for the reviewer.',
            placeholder: 'Describe the change…',
            rows: 4,
          }
        : {}),
      ...(index === 1
        ? {
            description: 'Release notes must contain at least 20 characters.',
            isInvalid: true,
          }
        : {}),
      ...(index === 2 ? { isDisabled: true } : {}),
      ...(index === 3
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

    return index === 3
      ? h.div([], [h.form([h.Id('textarea-profile')], []), control])
      : control;
  },
);

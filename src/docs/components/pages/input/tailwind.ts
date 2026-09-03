import { textPreviewProgram } from '@/docs/components/pages/authored-page';
import { inputInitialValues, inputLabel } from '@/docs/components/pages/input/shared';
import * as Input from '@/ui/input';

export const inputTailwindPreviewProgram = textPreviewProgram(
  'input',
  inputInitialValues,
  (index, value, onInput, h) => Input.input({
    id: `docs-input-${String(index)}`,
    value,
    onInput,
    class: 'max-w-sm',
    label: inputLabel(index),
    ...(index === 0
      ? {
          type: 'email' as const,
          autocomplete: 'email',
          inputMode: 'email' as const,
          description: 'We will only use this for account notices.',
          placeholder: 'you@example.com',
        }
      : {}),
    ...(index === 1
      ? { description: 'Use lowercase letters and hyphens.', isInvalid: true }
      : {}),
    ...(index === 2 ? { isDisabled: true } : {}),
    ...(index === 3
      ? {
          name: 'email',
          form: 'profile',
          autocomplete: 'email',
          inputMode: 'email' as const,
          isReadOnly: true,
        }
      : {}),
  }, h),
);

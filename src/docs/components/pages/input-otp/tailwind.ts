import { textPreviewProgram } from '@/docs/components/pages/authored-page';
import {
  inputOtpAriaLabel,
  inputOtpInitialValues,
} from '@/docs/components/pages/input-otp/shared';
import * as InputOtp from '@/ui/input-otp';

export const inputOtpTailwindPreviewProgram = textPreviewProgram(
  'input-otp',
  inputOtpInitialValues,
  (index, value, onInput, h) => InputOtp.inputOtp({
    id: `docs-input-otp-${String(index)}`,
    value,
    onInput,
    length: 6,
    ariaLabel: inputOtpAriaLabel(index),
    ...(index === 1
      ? {
          separator: (slot: number) =>
            slot === 2
              ? InputOtp.inputOtpSeparator(h)
              : h.span([], []),
        }
      : {}),
    ...(index === 2
      ? { pattern: /[A-Z0-9]/u, inputMode: 'text' as const }
      : {}),
  }, h),
);

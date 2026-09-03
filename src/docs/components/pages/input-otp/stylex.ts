import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { inputOtpAriaLabel } from '@/docs/components/pages/input-otp/shared';
import * as InputOtp from '@/stylex/input-otp';

export const inputOtpStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => InputOtp.inputOtp({
  id: `docs-input-otp-${String(exampleIndex)}`,
  value: (model as { value: string }).value,
  onInput: value => onMessageJson(JSON.stringify({
    _tag: 'ChangedTextDocsPreview',
    value,
  })),
  length: 6,
  ariaLabel: inputOtpAriaLabel(exampleIndex),
  ...(exampleIndex === 1
    ? {
        separator: (slot: number) =>
          slot === 2
            ? InputOtp.inputOtpSeparator(h)
            : h.span([], []),
      }
    : {}),
  ...(exampleIndex === 2
    ? { pattern: /[A-Z0-9]/u, inputMode: 'text' as const }
    : {}),
}, h);

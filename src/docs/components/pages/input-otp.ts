
import { authoredPage, controlledStringApplication, textPreviewProgram } from '@/docs/components/pages/authored-page';
import * as InputOtp from '@/ui/input-otp';

const previewProgram = textPreviewProgram('input-otp', ['123', '123', 'A1B'], (index, value, onInput, h) => InputOtp.inputOtp({ id: `docs-input-otp-${String(index)}`, value, onInput, length: 6, ariaLabel: index === 0 ? 'Verification code' : index === 1 ? 'Recovery code' : 'Invite code', ...(index === 1 ? { separator: (slot: number) => slot === 2 ? InputOtp.inputOtpSeparator(h) : h.span([], []) } : {}), ...(index === 2 ? { pattern: /[A-Z0-9]/u, inputMode: 'text' as const } : {}) }, h));

const source = (name: string, initialValue: string, config: string): string => controlledStringApplication({
  componentName: 'InputOtp', componentSlug: 'input-otp', exampleName: name,
  field: 'code', initialValue, messageName: 'ChangedCode',
  viewBody: `InputOtp.inputOtp({
  id: 'verification-code',
  value: model.code,
  onInput: value => ChangedCode({ value }),
  ${config}
}, h),`,
});

export const inputOtpPage = authoredPage({
  slug: 'input-otp', title: 'Input OTP', kind: 'helper',
  previewProgram,
  definition: {
    kind: 'helper', description: 'Captures a short verification code through one accessible input rendered as distinct visual slots.',
    architecture: 'Input OTP is controlled and stateless. Store the normalized code string in the parent Model; onInput emits only characters accepted by pattern up to length.',
    apiHref: 'https://foldkit.dev/ui/input',
    styling: 'The visual slots are presentation. Keep the hidden native input as the sole editable control and use separator only to clarify meaningful groups.',
    accessibility: 'The slots are aria-hidden while the real input carries the label, invalid state, autocomplete hint, and keyboard behavior.',
    keyboard: [['Typing / paste', 'Filters input through pattern and truncates it to length.'], ['Backspace', 'Removes the preceding character from the native input.']],
    examples: [
      {
        title: 'Six-digit code', description: 'A single parent string drives all six visual slots and supports one-time-code autofill.',

        code: source('Six-digit code', '123', `length: 6,
  ariaLabel: 'Verification code',`),
      },
      {
        title: 'Grouped code', description: 'A visual separator can clarify code groups without splitting the editable value.',

        code: source('Grouped code', '123', `length: 6,
  ariaLabel: 'Recovery code',
  separator: index => index === 2
    ? InputOtp.inputOtpSeparator(h)
    : h.span([], []),`),
      },
      {
        title: 'Alphanumeric', description: 'Change both pattern and input mode when the code is not numeric.',

        code: source('Alphanumeric', 'A1B', `length: 6,
  pattern: /[A-Z0-9]/u,
  inputMode: 'text',
  ariaLabel: 'Invite code',`),
      },
    ],
  },
});

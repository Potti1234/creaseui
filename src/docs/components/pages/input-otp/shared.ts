import type { DocsExample } from '@/docs/components/page-definition';
import { controlledStringApplication } from '@/docs/components/pages/authored-page';

export const inputOtpInitialValues = ['123', '123', 'A1B'] as const;

const metadata = [
  {
    title: 'Six-digit code',
    description: 'A single parent string drives all six visual slots and supports one-time-code autofill.',
    ariaLabel: 'Verification code',
    config: `length: 6,
  ariaLabel: 'Verification code',`,
  },
  {
    title: 'Grouped code',
    description: 'A visual separator can clarify code groups without splitting the editable value.',
    ariaLabel: 'Recovery code',
    config: `length: 6,
  ariaLabel: 'Recovery code',
  separator: index => index === 2
    ? InputOtp.inputOtpSeparator(h)
    : h.span([], []),`,
  },
  {
    title: 'Alphanumeric',
    description: 'Change both pattern and input mode when the code is not numeric.',
    ariaLabel: 'Invite code',
    config: `length: 6,
  pattern: /[A-Z0-9]/u,
  inputMode: 'text',
  ariaLabel: 'Invite code',`,
  },
] as const;

export const inputOtpAriaLabel = (index: number): string =>
  (metadata[index] ?? metadata[0]).ariaLabel;

export const inputOtpExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map((item, index) => ({
  title: item.title,
  description: item.description,
  code: controlledStringApplication({
    componentName: 'InputOtp',
    componentSlug: 'input-otp',
    renderer,
    exampleName: item.title,
    field: 'code',
    initialValue: inputOtpInitialValues[index] ?? '',
    messageName: 'ChangedCode',
    viewBody: `InputOtp.inputOtp({
  id: 'verification-code',
  value: model.code,
  onInput: value => ChangedCode({ value }),
  ${item.config}
}, h),`,
  }),
}));

import type { DocsExample } from '@/docs/components/page-definition';
import { controlledBooleanApplication } from '@/docs/components/pages/authored-page';

export const switchInitialValues = [true, false, true, true, true] as const;
export const switchLabels = [
  'Notifications',
  'Compact mode',
  'Security scanning',
  'Account verified',
  'واجهة عربية',
] as const;

const metadata = [
  {
    title: 'Notifications',
    description: 'Apply an immediate preference through a typed toggle Message.',
    config: `description: 'Receive build and deployment updates.',`,
  },
  {
    title: 'Small',
    description: 'Use the compact size in a dense but still clearly labeled settings row.',
    config: `size: 'sm',`,
  },
  {
    title: 'Disabled',
    description: 'Explain organization-managed state in adjacent copy.',
    config: `isDisabled: true,
  description: 'Required by your organization.',`,
  },
  {
    title: 'Read only',
    description: 'Keep an externally managed state focusable and understandable without allowing changes.',
    config: `isReadOnly: true,
  description: 'Supplied by your identity provider.',`,
  },
  {
    title: 'RTL',
    description: 'Mirror thumb travel when the switch is rendered in a right-to-left subtree.',
    config: `direction: 'rtl',`,
  },
] as const;

export const switchExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map((item, index) => ({
  title: item.title,
  description: item.description,
  code: controlledBooleanApplication({
    componentName: 'Switch',
    componentSlug: 'switch',
    renderer,
    exampleName: item.title,
    field: 'notificationsEnabled',
    initialValue: switchInitialValues[index] ?? false,
    messageName: 'ToggledNotifications',
    messageField: 'isChecked',
    viewBody: `Switch.switchControl({
  id: 'notifications',
  isChecked: model.notificationsEnabled,
  onToggle: isChecked => ToggledNotifications({ isChecked }),
  label: 'Notifications',
  name: 'notifications',
  value: 'enabled',
  ${item.config}
}, h),`,
  }),
}));

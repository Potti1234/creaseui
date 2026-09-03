import type { DocsExample } from '@/docs/components/page-definition';
import { controlledBooleanApplication } from '@/docs/components/pages/authored-page';

export const toggleInitialValues = [false, true, true, true] as const;
export const toggleChildren = ['Bold', 'Italic', 'Managed', 'B'] as const;

const metadata = [
  {
    title: 'Formatting',
    description: 'Derive the next pressed value from the current Model when constructing the Message.',
    config: '',
  },
  {
    title: 'Outline',
    description: 'Outline treatment works well when the toggle sits beside ordinary buttons.',
    config: `variant: 'outline',`,
  },
  {
    title: 'Disabled',
    description: 'Native disabled state prevents pointer and keyboard activation while retaining the current pressed value for assistive technology.',
    config: `isDisabled: true,`,
  },
  {
    title: 'Compact named control',
    description: 'Provide ariaLabel whenever visual content alone does not form a usable accessible name.',
    config: `size: 'sm',
  ariaLabel: 'Bold formatting',`,
  },
] as const;

export const toggleExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map((item, index) => ({
  title: item.title,
  description: item.description,
  code: controlledBooleanApplication({
    componentName: 'Toggle',
    componentSlug: 'toggle',
    renderer,
    exampleName: item.title,
    field: 'isPressed',
    initialValue: toggleInitialValues[index] ?? false,
    messageName: 'ToggledPressed',
    messageField: 'isPressed',
    viewBody: `Toggle.toggle({
  isPressed: model.isPressed,
  onToggle: ToggledPressed({ isPressed: !model.isPressed }),
  children: ['Bold'],
  ${item.config}
}, h),`,
  }),
}));

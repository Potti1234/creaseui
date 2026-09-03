import type { DocsExample } from '@/docs/components/page-definition';
import { controlledBooleanApplication } from '@/docs/components/pages/authored-page';

const metadata = [
  {
    title: 'Details',
    description: 'Control the open state from the application update loop.',
    initialValue: false,
    tailwindConfig: `triggerClass: 'rounded-md border px-3 py-2 text-sm',\n  contentClass: 'pt-3 text-sm text-muted-foreground',`,
    stylexConfig: '',
  },
  {
    title: 'Open by Default',
    description: 'Initial openness comes from init rather than view-local state.',
    initialValue: true,
    tailwindConfig: `triggerClass: 'font-medium',\n  contentClass: 'pt-2 text-sm text-muted-foreground',`,
    stylexConfig: '',
  },
  {
    title: 'Disabled',
    description: 'A disabled trigger exposes the panel state but does not dispatch Messages.',
    initialValue: false,
    tailwindConfig: 'isDisabled: true,',
    stylexConfig: 'isDisabled: true,',
  },
] as const;

export const collapsibleInitialValues = metadata.map(item => item.initialValue);

export const collapsibleExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map(item => ({
  title: item.title,
  description: item.description,
  code: controlledBooleanApplication({
    componentName: 'Collapsible',
    componentSlug: 'collapsible',
    renderer,
    exampleName: item.title,
    field: 'isOpen',
    initialValue: item.initialValue,
    messageName: 'ToggledDetails',
    messageField: 'isOpen',
    viewBody: `Collapsible.collapsible({
  id: 'details',
  isOpen: model.isOpen,
  onToggle: isOpen => ToggledDetails({ isOpen }),
  trigger: model.isOpen ? 'Hide details' : 'Show details',
  content: 'Foldkit keeps disclosure state in the application Model.',
  ${renderer === 'tailwind' ? item.tailwindConfig : item.stylexConfig}
}, h),`,
  }),
}));

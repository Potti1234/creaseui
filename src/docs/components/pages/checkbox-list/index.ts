import { authoredPage } from '@/docs/components/pages/authored-page';
import { checkboxListExamples } from '@/docs/components/pages/checkbox-list/shared';
import { checkboxListTailwindPreviewProgram } from '@/docs/components/pages/checkbox-list/tailwind';

export const checkboxListPage = authoredPage({
  slug: 'checkbox-list',
  title: 'Checkbox List',
  kind: 'helper',
  previewProgram: checkboxListTailwindPreviewProgram,
  definition: {
    kind: 'helper',
    description: 'A checkbox group with list semantics: rows with labels, descriptions, dividers, and optional end content.',
    architecture: 'Checkbox List is a stateless render helper. The parent Model owns the checked values and the list maps them onto rows rendered through the shared Checkbox primitive.',
    apiHref: 'https://github.com/facebook/astryx/blob/main/packages/core/src/CheckboxList/CheckboxList.tsx',
    styling: 'Rows render with dividers when hasDividers is set; density adjusts row padding. Checked rows get a primary tint background.',
    accessibility: 'The list is a role=group labelled by its field label; each row is a single tab stop that delegates clicks to the checkbox control. Indeterminate state announces via aria-checked=mixed.',
    examples: checkboxListExamples('tailwind'),
    stylexExamples: checkboxListExamples('stylex'),
  },
});

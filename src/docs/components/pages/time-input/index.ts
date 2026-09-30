import { authoredPage } from '@/docs/components/pages/authored-page';
import { timeInputExamples } from '@/docs/components/pages/time-input/shared';
import { timeInputTailwindPreviewProgram } from '@/docs/components/pages/time-input/tailwind';

export const timeInputPage = authoredPage({
  slug: 'time-input',
  title: 'Time Input',
  kind: 'submodel',
  previewProgram: timeInputTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    description: 'Segmented time entry supporting 12h/24h formats, seconds, min/max windows, and keyboard increments.',
    architecture: 'Time Input is a submodel: its Model owns the focused segment and draft text while the parent Model owns the committed "HH:MM[:SS]" value. Edits report ChangedValue OutMessages upward.',
    apiHref: 'https://github.com/facebook/astryx/blob/main/packages/core/src/TimeInput/TimeInput.tsx',
    styling: 'A segmented control with hour/minute(/seconds) fields, an AM/PM segment in 12h mode, and a trailing picker button; status renders an attached message strip.',
    accessibility: 'Each segment is a spinbutton with labelled min/max; the field is a role=group labelled by its label, and clear/picker affordances are labelled buttons.',
    examples: timeInputExamples('tailwind'),
    stylexExamples: timeInputExamples('stylex'),
  },
});

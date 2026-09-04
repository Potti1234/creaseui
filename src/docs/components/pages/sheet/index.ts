import { authoredPage } from '@/docs/components/pages/authored-page';
import { sheetExamples } from '@/docs/components/pages/sheet/shared';
import { sheetTailwindPreviewProgram } from '@/docs/components/pages/sheet/tailwind';

export const sheetPage = authoredPage({
  slug: 'sheet',
  title: 'Sheet',
  kind: 'submodel',
  previewProgram: sheetTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    description: 'Presents modal task content from a screen edge while preserving the underlying page context.',
    architecture: 'Sheet reuses Foldkit’s Dialog child Model. Programmatic open and child update return focus/animation Commands that the parent must map through GotSheetMessage.',
    apiHref: 'https://foldkit.dev/ui/dialog',
    composition: 'Trigger (parent Message)\nSheet submodel\n└── edge panel\n    ├── header / title / description\n    ├── content\n    ├── footer\n    └── close action',
    styling: 'Right and left sheets suit settings or navigation; top and bottom sheets suit short contextual workflows. Avoid using a sheet for content that needs the full page.',
    accessibility: 'Sheet inherits Dialog’s title/description relationships, focus trap, Escape behavior, and trigger focus restoration. Use initialFocusAttributes once when a specific control should receive focus.',
    keyboard: [
      ['Tab / Shift+Tab', 'Cycles within the open sheet.'],
      ['Escape', 'Closes the sheet and returns focus to its trigger.'],
    ],
    examples: sheetExamples('tailwind'),
    stylexExamples: sheetExamples('stylex'),
  },
});

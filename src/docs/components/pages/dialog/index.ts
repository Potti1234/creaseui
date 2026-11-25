import { authoredPage } from '@/docs/components/pages/authored-page'
import { dialogExamples } from '@/docs/components/pages/dialog/shared'
import { dialogTailwindPreviewProgram } from '@/docs/components/pages/dialog/tailwind'

export const dialogPage = authoredPage({
  slug: 'dialog',
  title: 'Dialog',
  kind: 'submodel',
  previewProgram: dialogTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    description:
      'Opens focused content in a modal surface with focus trapping, restoration, dismissal, and optional transitions.',
    architecture:
      'CreaseUI Dialog owns visibility and animation state across all three renderers. Map the Commands returned by open, close, and update to the parent Message. Each instance needs a stable, unique id and a child Model.',
    apiHref:
      'https://github.com/Potti1234/creaseui/blob/main/src/lib/behaviors/dialog.ts',
    composition:
      'Trigger (parent Message)\nDialog submodel\n└── panel\n    ├── header / title / description\n    ├── content\n    ├── footer\n    └── close action',
    styling:
      'Use dialogs for focused tasks that can be completed or cancelled in place. Keep content short enough that the modal context remains understandable.',
    accessibility:
      'The native dialog is labelled by its title and optional description. Foldkit core contains focus, handles Escape on the topmost dialog, restores focus on close, and locks page scroll. Claim initialFocusAttributes on the intended first control. Transitions honor reduced motion across all three renderers.',
    keyboard: [
      ['Tab / Shift+Tab', 'Cycles focus within the open dialog.'],
      ['Escape', 'Closes the dialog and restores trigger focus.'],
    ],
    examples: dialogExamples('tailwind'),
    stylexExamples: dialogExamples('stylex'),
    pleatExamples: dialogExamples('pleat'),
  },
})

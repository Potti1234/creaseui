import { authoredPage } from '@/docs/components/pages/authored-page'
import { bottomSheetExamples } from '@/docs/components/pages/bottom-sheet/shared'
import { bottomSheetTailwindPreviewProgram } from '@/docs/components/pages/bottom-sheet/tailwind'

export const bottomSheetPage = authoredPage({
  slug: 'bottom-sheet',
  title: 'Bottom Sheet',
  kind: 'submodel',
  previewProgram: bottomSheetTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    description:
      'A mobile sheet that rises from the bottom edge with optional snap points, drag-to-dismiss, and a multi-sheet switcher.',
    architecture:
      'BottomSheet composes the Dialog submodel and layers a pointer-gesture state machine on top: drag phases, detent offsets computed from snap points, velocity-aware settle, and magnetic capture. The switcher variant keeps one shared dialog whose sheets swap content with a retained-fade transition.',
    apiHref:
      'https://github.com/facebook/astryx/blob/main/packages/core/src/BottomSheet/BottomSheet.tsx',
    styling:
      'The sheet hugs the bottom edge inside a centered 640px column with a top-edge grab handle and rounded top corners; the scrim thins as the sheet slides down to its peek detent.',
    accessibility:
      'The underlying Dialog supplies focus containment, Escape dismissal, and labelled heading slots; sheets labelled required refuse dismissal while info sheets swipe away. The handle is keyboard-focusable and the scrim thins rather than removes background context at the peek stop.',
    keyboard: [
      ['Escape', 'Dismisses the sheet (unless its purpose is required).'],
      ['Tab', 'Cycles focus within the sheet while it is open.'],
      [
        'Drag the handle',
        'Snaps between detents; a fast flick can dismiss info sheets.',
      ],
    ],
    examples: bottomSheetExamples('tailwind'),
    stylexExamples: bottomSheetExamples('stylex'),
  },
})

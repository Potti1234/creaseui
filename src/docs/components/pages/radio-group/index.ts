import { authoredPage } from '@/docs/components/pages/authored-page'
import { radioGroupExamples } from '@/docs/components/pages/radio-group/shared'
import { radioGroupTailwindPreviewProgram } from '@/docs/components/pages/radio-group/tailwind'

export const radioGroupPage = authoredPage({
  slug: 'radio-group',
  title: 'Radio Group',
  kind: 'submodel',
  previewProgram: radioGroupTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    description:
      'Chooses exactly one value from a visible set of mutually exclusive options.',
    architecture:
      'Radio Group uses a CreaseUI-owned Foldkit Submodel shared by Tailwind, StyleX, and Pleat. The child tracks roving focus. The parent owns the selected Option<string>, routes child messages through update, and stores the Selected out-message value.',
    apiHref:
      'https://github.com/Potti1234/creaseui/blob/main/src/lib/behaviors/radio-group.ts',
    styling:
      'Keep the full choice set visible. Descriptions are useful when labels alone do not explain the consequence of each choice.',
    accessibility:
      'ariaLabel names the group, each option has a linked label and only present descriptions are referenced. An optional name emits the hidden form value. Read-only groups remain navigable without committing a new selection.',
    keyboard: [
      [
        'Arrow keys',
        'Moves focus across enabled options and selects in editable groups.',
      ],
      ['Home / Page Up', 'Moves to the first enabled option.'],
      ['End / Page Down', 'Moves to the last enabled option.'],
      ['Space', 'Selects the focused option in editable groups.'],
    ],
    examples: radioGroupExamples('tailwind'),
    stylexExamples: radioGroupExamples('stylex'),
    pleatExamples: radioGroupExamples('pleat'),
  },
})

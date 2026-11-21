import { authoredPage } from '@/docs/components/pages/authored-page'
import { pointerKindExamples } from '@/docs/components/pages/pointer-kind/shared'
import { pointerKindTailwindPreviewProgram } from '@/docs/components/pages/pointer-kind/tailwind'

export const pointerKindPage = authoredPage({
  slug: 'pointer-kind',
  title: 'Pointer Kind',
  kind: 'submodel',
  previewProgram: pointerKindTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    source: {
      path: 'src/lib/behaviors/pointer-kind.ts',
      registryItem: 'pointer-kind',
    },
    usage: `import * as PointerKind from '@/lib/behaviors/pointer-kind'

const pointerKind = PointerKind.init()
// Run ReadPointerKind({}) after mounting and lift subscriptions into the parent.
// Delegate ChangedPointerKind messages to PointerKind.update.
PointerKind.canHover(pointerKind) ? 'Hover to open' : 'Tap to open'`,
    composition:
      'Parent Model\n├── PointerKind Model / init / update\n├── ReadPointerKind Command\n└── lifted media-query subscriptions',
    description:
      'Read pointer precision and hover support without guessing from screen size.',
    architecture:
      'PointerKind keeps capabilities in a Schema Model. A catch-up Command runs after mounting, and lifted Foldkit subscriptions follow media-query changes.',
    styling:
      'Use canHover to choose interaction copy or policy. Keep a press fallback available even when hover is supported.',
    accessibility:
      'Unknown is not hover support. Essential actions must remain accessible by keyboard and touch.',
    examples: pointerKindExamples('tailwind'),
    stylexExamples: pointerKindExamples('stylex'),
    pleatExamples: pointerKindExamples('pleat'),
  },
})

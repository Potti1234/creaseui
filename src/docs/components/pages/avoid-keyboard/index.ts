import { authoredPage } from '@/docs/components/pages/authored-page'
import { avoidKeyboardExamples } from '@/docs/components/pages/avoid-keyboard/shared'
import { avoidKeyboardTailwindPreviewProgram } from '@/docs/components/pages/avoid-keyboard/tailwind'

export const avoidKeyboardPage = authoredPage({
  slug: 'avoid-keyboard',
  title: 'Avoid Keyboard',
  kind: 'helper',
  previewProgram: avoidKeyboardTailwindPreviewProgram,
  definition: {
    kind: 'helper',
    source: {
      path: 'src/lib/behaviors/avoid-keyboard.ts',
      registryItem: 'avoid-keyboard',
    },
    usage: `import { Mount } from 'foldkit'
import * as AvoidKeyboard from '@/lib/behaviors/avoid-keyboard'

h.div([
  h.OnMount(Mount.mapMessage(AvoidKeyboard.AvoidKeyboard({}), message =>
    GotAvoidKeyboard({ message }),
  )),
], [h.p([], ['Ready to send'])])`,
    composition:
      'Footer wrapper\n└── AvoidKeyboard Mount\n    ├── viewport listeners / animation frame\n    └── restored translate on cleanup',
    description: 'Keep a footer or status bar above the on-screen keyboard.',
    architecture:
      'AvoidKeyboard owns viewport listeners and translate through a scoped Mount. The demo observes its data-keyboard attribute to report the actual keyboard state.',
    styling:
      'Mount an inner wrapper, leave translate without a transition, and add bottom padding when the bar needs a gap above the keyboard.',
    accessibility:
      'The field keeps its native focus and label. Lifting the bar does not move focus or change layout; reserve space for content behind fixed footers.',
    examples: avoidKeyboardExamples('tailwind'),
    stylexExamples: avoidKeyboardExamples('stylex'),
    pleatExamples: avoidKeyboardExamples('pleat'),
  },
})

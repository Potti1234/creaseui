import { authoredPage } from '@/docs/components/pages/authored-page'
import { clickableCardExamples } from '@/docs/components/pages/clickable-card/shared'
import { clickableCardTailwindPreviewProgram } from '@/docs/components/pages/clickable-card/tailwind'

export const clickableCardPage = authoredPage({
  slug: 'clickable-card',
  title: 'Clickable Card',
  kind: 'helper',
  previewProgram: clickableCardTailwindPreviewProgram,
  definition: {
    kind: 'helper',
    description:
      'An interactive card for navigation or action targets. Nested interactive elements work independently.',
    architecture:
      'Clickable Card is a stateless render helper. The parent supplies the label, destination or onClick message, and children; the card returns Html wired to a pressable-container mount that ignores nested interactive elements and existing text selections.',
    apiHref:
      'https://github.com/Potti1234/creaseui/blob/main/src/ui/clickable-card.ts',
    styling:
      'Use `elevation` to raise the card when the resting shadow should signal interactivity, and `variant` for a chromatic background. The hover/press tint is an inert overlay, so nested content stays interactive.',
    accessibility:
      'The required `label` becomes the accessible name of the hidden control (anchor when `href` is set, button otherwise). Presses on nested buttons, links, and selected text never trigger the card.',
    examples: clickableCardExamples('tailwind'),
    stylexExamples: clickableCardExamples('stylex'),
  },
})

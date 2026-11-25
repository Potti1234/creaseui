import { authoredPage } from '@/docs/components/pages/authored-page'
import { collapsibleExamples } from '@/docs/components/pages/collapsible/shared'
import { collapsibleTailwindPreviewProgram } from '@/docs/components/pages/collapsible/tailwind'

export const collapsiblePage = authoredPage({
  slug: 'collapsible',
  title: 'Collapsible',
  kind: 'helper',
  previewProgram: collapsibleTailwindPreviewProgram,
  definition: {
    kind: 'helper',
    description:
      'Shows or hides one region of content from a controlled disclosure button.',
    architecture:
      'Collapsible uses the shared CreaseUI Disclosure behavior. Store isOpen in the parent Model and apply the next value received through onToggle.',
    apiHref:
      'https://github.com/Potti1234/creaseui/blob/main/src/ui/collapsible.ts',
    styling:
      'Use the renderer-specific typed trigger and content styling hooks for the two rendered regions. Height animation is coordinated by the primitive without hidden application state.',
    accessibility:
      'The trigger and panel receive linked disclosure attributes, including expanded state and panel identity. Keep the trigger label meaningful in both states.',
    keyboard: [
      ['Enter / Space', 'Toggles the disclosure from its focused trigger.'],
    ],
    examples: collapsibleExamples('tailwind'),
    stylexExamples: collapsibleExamples('stylex'),
    pleatExamples: collapsibleExamples('pleat'),
  },
})

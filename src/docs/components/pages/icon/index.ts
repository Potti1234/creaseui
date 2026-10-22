import { authoredPage } from '@/docs/components/pages/authored-page'
import { iconExamples } from '@/docs/components/pages/icon/shared'
import { iconTailwindPreviewProgram } from '@/docs/components/pages/icon/tailwind'

export const iconPage = authoredPage({
  slug: 'icon',
  title: 'Icon',
  kind: 'helper',
  previewProgram: iconTailwindPreviewProgram,
  definition: {
    kind: 'helper',
    description:
      'Renders a Lucide icon by name for ordinary app UI: next to text, in cards, lists and headers.',
    architecture:
      'Icon is a stateless render helper. The icon data lives in the shared icon source; the component only picks the size and accessible name, so app code never imports implementation helpers.',
    apiHref: 'https://github.com/Potti1234/creaseui/blob/main/src/ui/icon.ts',
    styling:
      'Pick sm, md or lg. The icon draws with currentColor, so it follows the color of the text around it.',
    accessibility:
      'Without ariaLabel the icon is decorative and aria-hidden; pair it with visible text. A standalone icon that carries meaning needs ariaLabel, which renders role="img" with that name.',
    examples: iconExamples('tailwind'),
    stylexExamples: iconExamples('stylex'),
    pleatExamples: iconExamples('pleat'),
  },
})

import type { DocsGuide } from '../types'
import { behaviorGuides } from './behaviors'
import { gettingStarted, theming } from './setup'

export const guides: Readonly<Record<string, DocsGuide>> = {
  '/docs/getting-started': gettingStarted,
  '/docs/theming': theming,
  ...behaviorGuides,
}

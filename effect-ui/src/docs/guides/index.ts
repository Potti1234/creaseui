import type { DocsGuide } from '../types'
import { behaviorGuides } from './behaviors'
import { lintGuides } from './lint'
import { tutorialGuides } from './tutorial'
import { galleryGuides } from './galleries'
import { gettingStarted, theming } from './setup'

export const guides: Readonly<Record<string, DocsGuide>> = {
  '/docs/getting-started': gettingStarted,
  '/docs/theming': theming,
  ...behaviorGuides,
  ...lintGuides,
  ...tutorialGuides,
  ...galleryGuides,
}

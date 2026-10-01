import { authoredPage } from '@/docs/components/pages/authored-page';
import { tourExamples } from '@/docs/components/pages/tour/shared';
import { tourTailwindPreviewProgram } from '@/docs/components/pages/tour/tailwind';

export const tourPage = authoredPage({
  slug: 'tour',
  title: 'Tour',
  kind: 'submodel',
  previewProgram: tourTailwindPreviewProgram,
  definition: {
    kind: 'submodel',
    description:
      'A guided product tour: spotlight callouts anchored to elements on the page, stepped through with Next / Back / Done.',
    architecture:
      'Tour owns an active-step state machine and a measured target rect. Each step re-keys a callout that mounts an anchorSetup against the target element, while an observer stream keeps the highlight glued to the target across scroll and resize.',
    apiHref:
      'https://github.com/facebook/astryx/blob/main/packages/lab/src/Tour/Tour.tsx',
    styling:
      'The highlight is a fixed ring drawn around the target rect with 4px of padding; with hasBackdrop the same ring carries the 9999px scrim shadow so the page dims while the target stays lit. The callout is a card positioned by the same anchor engine Popover uses.',
    accessibility:
      'The callout is role=dialog labelled by its heading and receives focus after anchoring; a visible close control and Escape both dismiss with the "close" source. Steps must target interactive elements, matching Popover\'s anchor contract.',
    keyboard: [
      ['Escape', 'Dismisses the tour (reported as a close).'],
      ['Enter / Space', 'Activates the focused tour control (Back, Next, Done, Close).'],
      ['Tab', 'Moves focus within the callout; the target stays the anchor.'],
    ],
    examples: tourExamples('tailwind'),
    stylexExamples: tourExamples('stylex'),
  },
});

import * as AspectRatio from '@/ui/aspect-ratio';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'AspectRatio', componentSlug: 'aspect-ratio', exampleName: name, viewBody });

export const aspectRatioPage = authoredPage({
  slug: 'aspect-ratio', title: 'Aspect Ratio', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Keeps media or composed content at a stable width-to-height ratio.',
    architecture: 'Aspect Ratio is a stateless layout helper backed by the native aspect-ratio style.',
    apiHref: 'https://foldkit.dev/ui/overview',
    styling: 'Set the width on the wrapper or its parent. Children can fill the ratio box with absolute or full-size layout classes.',
    accessibility: 'The wrapper adds no semantics. Images and media inside it still need appropriate alternative text or captions.',
    examples: [
      {
        title: 'Video', description: 'Use 16 / 9 for common video and landscape media.',
        preview: (_model, h) => AspectRatio.aspectRatio({ ratio: 16 / 9, class: 'w-full max-w-lg overflow-hidden rounded-lg bg-muted', children: [h.div([h.Class('flex size-full items-center justify-center text-sm text-muted-foreground')], ['16:9'])] }, h),
        code: source('Video', `AspectRatio.aspectRatio({
  ratio: 16 / 9,
  class: 'w-full max-w-lg overflow-hidden rounded-lg bg-muted',
  children: [
    h.div([h.Class('flex size-full items-center justify-center')], ['16:9']),
  ],
}, h),`),
      },
      {
        title: 'Square', description: 'A ratio of 1 keeps avatars and artwork square.',
        preview: (_model, h) => AspectRatio.aspectRatio({ ratio: 1, class: 'w-48 rounded-lg bg-muted', children: [h.div([h.Class('flex size-full items-center justify-center text-sm text-muted-foreground')], ['1:1'])] }, h),
        code: source('Square', `AspectRatio.aspectRatio({
  ratio: 1,
  class: 'w-48 rounded-lg bg-muted',
  children: [h.div([h.Class('flex size-full items-center justify-center')], ['1:1'])],
}, h),`),
      },
    ],
  },
});

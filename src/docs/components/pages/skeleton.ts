import * as Skeleton from '@/ui/skeleton';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Skeleton', componentSlug: 'skeleton', exampleName: name, viewBody });

export const skeletonPage = authoredPage({
  slug: 'skeleton', title: 'Skeleton', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Reserves the shape of content while data is loading.',
    architecture: 'Skeleton is stateless. The parent Model decides whether to render loading placeholders or resolved content.',
    apiHref: 'https://foldkit.dev/ui/overview',
    styling: 'Match skeleton dimensions to the content they replace so loading does not cause layout shift.',
    accessibility: 'Mark the surrounding region busy and provide an accessible loading label when the wait is meaningful. Skeleton shapes themselves remain decorative.',
    examples: [
      {
        title: 'Profile', description: 'Mirror the avatar and text geometry of the eventual profile row.',
        preview: (_model, h) => h.div([h.Class('flex items-center gap-4')], [
          Skeleton.skeleton({ class: 'size-12 rounded-full' }, h),
          h.div([h.Class('space-y-2')], [
            Skeleton.skeleton({ class: 'h-4 w-48' }, h),
            Skeleton.skeleton({ class: 'h-4 w-32' }, h),
          ]),
        ]),
        code: source('Profile', `h.div([h.Class('flex items-center gap-4')], [
  Skeleton.skeleton({ class: 'size-12 rounded-full' }, h),
  h.div([h.Class('space-y-2')], [
    Skeleton.skeleton({ class: 'h-4 w-48' }, h),
    Skeleton.skeleton({ class: 'h-4 w-32' }, h),
  ]),
]),`),
      },
      {
        title: 'Card', description: 'Reserve media and copy as one stable loading composition.',
        preview: (_model, h) => h.div([h.Class('w-full max-w-sm space-y-3')], [
          Skeleton.skeleton({ class: 'aspect-video w-full' }, h),
          Skeleton.skeleton({ class: 'h-4 w-3/4' }, h),
          Skeleton.skeleton({ class: 'h-4 w-1/2' }, h),
        ]),
        code: source('Card', `h.div([h.Class('w-full max-w-sm space-y-3')], [
  Skeleton.skeleton({ class: 'aspect-video w-full' }, h),
  Skeleton.skeleton({ class: 'h-4 w-3/4' }, h),
  Skeleton.skeleton({ class: 'h-4 w-1/2' }, h),
]),`),
      },
    ],
  },
});

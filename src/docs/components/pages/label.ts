import * as Label from '@/ui/label';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string => staticComponentApplication({ componentName: 'Label', componentSlug: 'label', exampleName: name, viewBody });

export const labelPage = authoredPage({
  slug: 'label', title: 'Label', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Associates visible text with a form control.',
    architecture: 'Label is a stateless native label helper. Controlled input values and change Messages remain in the parent application.',
    apiHref: 'https://foldkit.dev/ui/input',
    accessibility: 'Set for to the exact control id. isRequired and isDisabled mirror presentation; native required and disabled semantics remain on the control.',
    examples: [
      {
        title: 'Input Label', description: 'Match the label for value to the input id.',
        staticPreview: (_model, h) => h.div([h.Class('grid w-full max-w-sm gap-2')], [Label.label({ for: 'docs-email', children: ['Email address'] }, h), h.input([h.Id('docs-email'), h.Type('email'), h.Class('h-9 rounded-md border px-3')])]),
        code: source('Input Label', `h.div([h.Class('grid w-full max-w-sm gap-2')], [
  Label.label({ for: 'email', children: ['Email address'] }, h),
  h.input([h.Id('email'), h.Type('email'), h.Class('h-9 rounded-md border px-3')]),
]),`),
      },
      {
        title: 'Supporting Text', description: 'Keep requirements adjacent to the labeled control.',
        staticPreview: (_model, h) => h.div([h.Class('grid w-full max-w-sm gap-2')], [Label.label({ for: 'docs-project', children: ['Project name'] }, h), h.input([h.Id('docs-project'), h.Class('h-9 rounded-md border px-3')]), h.p([h.Class('text-xs text-muted-foreground')], ['Use 3–32 characters.'])]),
        code: source('Supporting Text', `h.div([h.Class('grid w-full max-w-sm gap-2')], [
  Label.label({ for: 'project', children: ['Project name'] }, h),
  h.input([h.Id('project'), h.Class('h-9 rounded-md border px-3')]),
  h.p([h.Class('text-xs text-muted-foreground')], ['Use 3–32 characters.']),
]),`),
      },
    ],
  },
});

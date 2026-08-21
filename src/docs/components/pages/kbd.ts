import * as Kbd from '@/ui/kbd';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Kbd', componentSlug: 'kbd', exampleName: name, viewBody });

export const kbdPage = authoredPage({
  slug: 'kbd', title: 'Kbd', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Formats keyboard keys and shortcuts inline with explanatory text.',
    architecture: 'Kbd is a stateless semantic helper that returns native kbd markup.',
    apiHref: 'https://foldkit.dev/ui/overview',
    accessibility: 'Keep the written shortcut understandable and match the actual keyboard interaction. Use Kbd for notation, not as an interactive control.',
    examples: [
      {
        title: 'Key', description: 'Display a single key inline with instructions.',
        preview: (_model, h) => h.p([h.Class('text-sm')], ['Press ', Kbd.kbd({ children: ['Esc'] }, h), ' to close.']),
        code: source('Key', `h.p([h.Class('text-sm')], [
  'Press ',
  Kbd.kbd({ children: ['Esc'] }, h),
  ' to close.',
]),`),
      },
      {
        title: 'Shortcut', description: 'Group keys that form one shortcut.',
        preview: (_model, h) => Kbd.kbdGroup({ children: [Kbd.kbd({ children: ['⌘'] }, h), Kbd.kbd({ children: ['K'] }, h)] }, h),
        code: source('Shortcut', `Kbd.kbdGroup({
  children: [
    Kbd.kbd({ children: ['⌘'] }, h),
    Kbd.kbd({ children: ['K'] }, h),
  ],
}, h),`),
      },
    ],
  },
});

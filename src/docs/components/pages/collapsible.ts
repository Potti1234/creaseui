import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import * as Collapsible from '@/ui/collapsible';
import { authoredPage, controlledBooleanApplication, definePreviewProgram } from '@/docs/components/pages/authored-page';

const PreviewModel = S.Struct({ _docsPage: S.Literal('collapsible'), isOpen: S.Boolean });
type PreviewModel = typeof PreviewModel.Type;
const ToggledPreview = m('ToggledCollapsiblePreview', { isOpen: S.Boolean });
type PreviewMessage = typeof ToggledPreview.Type;
const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel, Message: ToggledPreview,
  init: index => ({ _docsPage: 'collapsible', isOpen: index === 1 }),
  update: (model, message) => [{ ...model, isOpen: message.isOpen }, []],
  view: (index, model, h) => {
    const disclosure = Collapsible.collapsible({ id: `docs-collapsible-${String(index)}`, isOpen: index === 2 ? false : model.isOpen, onToggle: isOpen => ToggledPreview({ isOpen }), ...(index === 2 ? { isDisabled: true } : {}), trigger: index === 0 ? (model.isOpen ? 'Hide details' : 'Show details') : index === 1 ? 'Architecture notes' : 'Unavailable details', content: index === 1 ? 'Messages describe facts and update owns transitions.' : 'Foldkit keeps disclosure state explicit.', triggerClass: 'rounded-md border px-3 py-2 text-sm', contentClass: 'pt-3 text-sm text-muted-foreground' }, h);
    return index === 0
      ? h.div([h.Class('space-y-3')], [h.button([h.Type('button'), h.OnClick(ToggledPreview({ isOpen: !model.isOpen })), h.Class('rounded-md border px-3 py-2 text-sm')], [model.isOpen ? 'Close details externally' : 'Open details externally']), disclosure])
      : disclosure;
  },
});

const source = (name: string, initialValue: boolean, config: string): string => controlledBooleanApplication({
  componentName: 'Collapsible', componentSlug: 'collapsible', exampleName: name, field: 'isOpen', initialValue,
  messageName: 'ToggledDetails', messageField: 'isOpen',
  viewBody: `Collapsible.collapsible({
  id: 'details',
  isOpen: model.isOpen,
  onToggle: isOpen => ToggledDetails({ isOpen }),
  trigger: model.isOpen ? 'Hide details' : 'Show details',
  content: 'Foldkit keeps disclosure state in the application Model.',
  ${config}
}, h),`,
});

export const collapsiblePage = authoredPage({
  slug: 'collapsible', title: 'Collapsible', kind: 'helper',
  previewProgram,
  definition: {
    kind: 'helper', description: 'Shows or hides one region of content from a controlled disclosure button.',
    architecture: 'Collapsible adapts Foldkit’s stateless Disclosure helper. Store isOpen in the parent Model and return the next value through onToggle; no child submodel is needed.',
    apiHref: 'https://foldkit.dev/ui/disclosure',
    styling: 'Use triggerClass and contentClass for the two rendered regions. Height animation is coordinated by the primitive without hidden application state.',
    accessibility: 'The trigger and panel receive linked disclosure attributes, including expanded state and panel identity. Keep the trigger label meaningful in both states.',
    keyboard: [['Enter / Space', 'Toggles the disclosure from its focused trigger.']],
    examples: [
      {
        title: 'Details', description: 'Control the open state from the application update loop.',

        code: source('Details', false, `triggerClass: 'rounded-md border px-3 py-2 text-sm',
  contentClass: 'pt-3 text-sm text-muted-foreground',`),
      },
      {
        title: 'Open by Default', description: 'Initial openness comes from init rather than view-local state.',

        code: source('Open by Default', true, `triggerClass: 'font-medium',
  contentClass: 'pt-2 text-sm text-muted-foreground',`),
      },
      {
        title: 'Disabled', description: 'A disabled trigger exposes the panel state but does not dispatch Messages.',

        code: source('Disabled', false, `isDisabled: true,`),
      },
    ],
  },
});

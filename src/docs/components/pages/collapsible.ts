import * as Collapsible from '@/ui/collapsible';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, controlledBooleanApplication } from '@/docs/components/pages/authored-page';

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
        preview: (model, h) => Collapsible.collapsible({ id: 'docs-collapsible-details', isOpen: model.isCollapsibleOpen, onToggle: (isOpen) => State.ToggledCollapsible({ isOpen }), trigger: model.isCollapsibleOpen ? 'Hide details' : 'Show details', content: 'Foldkit keeps disclosure state explicit.', triggerClass: 'rounded-md border px-3 py-2 text-sm', contentClass: 'pt-3 text-sm text-muted-foreground' }, h),
        code: source('Details', false, `triggerClass: 'rounded-md border px-3 py-2 text-sm',
  contentClass: 'pt-3 text-sm text-muted-foreground',`),
      },
      {
        title: 'Open by Default', description: 'Initial openness comes from init rather than view-local state.',
        preview: (model, h) => Collapsible.collapsible({ id: 'docs-collapsible-open', isOpen: model.isCollapsibleOpen, onToggle: (isOpen) => State.ToggledCollapsible({ isOpen }), trigger: 'Architecture notes', content: 'Messages describe facts and update owns transitions.', triggerClass: 'font-medium', contentClass: 'pt-2 text-sm text-muted-foreground' }, h),
        code: source('Open by Default', true, `triggerClass: 'font-medium',
  contentClass: 'pt-2 text-sm text-muted-foreground',`),
      },
      {
        title: 'Disabled', description: 'A disabled trigger exposes the panel state but does not dispatch Messages.',
        preview: (_model, h) => Collapsible.collapsible({ id: 'docs-collapsible-disabled', isOpen: false, onToggle: (isOpen) => State.ToggledCollapsible({ isOpen }), isDisabled: true, trigger: 'Unavailable details', content: 'Unavailable' }, h),
        code: source('Disabled', false, `isDisabled: true,`),
      },
    ],
  },
});

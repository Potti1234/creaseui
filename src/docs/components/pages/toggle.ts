import * as Toggle from '@/ui/toggle';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, controlledBooleanApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, initialValue: boolean, config: string): string => controlledBooleanApplication({
  componentName: 'Toggle', componentSlug: 'toggle', exampleName: name, field: 'isPressed', initialValue,
  messageName: 'ToggledPressed', messageField: 'isPressed',
  viewBody: `Toggle.toggle({
  isPressed: model.isPressed,
  onToggle: ToggledPressed({ isPressed: !model.isPressed }),
  children: ['Bold'],
  ${config}
}, h),`,
});

export const togglePage = authoredPage({
  slug: 'toggle', title: 'Toggle', kind: 'helper',
  definition: {
    kind: 'helper', description: 'Represents one independently pressed or unpressed formatting option.',
    architecture: 'Toggle is a stateless controlled button. The parent Model stores pressed state and onToggle dispatches the next domain fact.',
    apiHref: 'https://foldkit.dev/ui/button',
    styling: 'Use outline when a persistent boundary helps distinguish the control from nearby content. Icon-only toggles require an accessible name in their surrounding composition.',
    accessibility: 'The helper exposes aria-pressed and preserves native button keyboard behavior. Pressed state must remain distinguishable beyond color alone.',
    keyboard: [['Enter / Space', 'Toggles the focused pressed button.']],
    examples: [
      {
        title: 'Formatting', description: 'Derive the next pressed value from the current Model when constructing the Message.',
        preview: (model, h) => Toggle.toggle({ isPressed: model.togglePressed, onToggle: State.ToggledPreview(), children: ['Bold'] }, h),
        code: source('Formatting', false, ''),
      },
      {
        title: 'Outline', description: 'Outline treatment works well when the toggle sits beside ordinary buttons.',
        preview: (model, h) => Toggle.toggle({ variant: 'outline', isPressed: model.togglePressed, onToggle: State.ToggledPreview(), children: ['Italic'] }, h),
        code: source('Outline', true, `variant: 'outline',`),
      },
      {
        title: 'Disabled', description: 'Disabled state remains focusable and exposes the current pressed value.',
        preview: (model, h) => Toggle.toggle({ isDisabled: true, isPressed: model.togglePressed, onToggle: State.ToggledPreview(), children: ['Managed'] }, h),
        code: source('Disabled', true, `isDisabled: true,`),
      },
    ],
  },
});

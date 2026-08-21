import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import * as Toggle from '@/ui/toggle';
import { authoredPage, controlledBooleanApplication, definePreviewProgram } from '@/docs/components/pages/authored-page';

const PreviewModel = S.Struct({ _docsPage: S.Literal('toggle'), isPressed: S.Boolean });
type PreviewModel = typeof PreviewModel.Type;
const ToggledPreview = m('ToggledTogglePreview');
type PreviewMessage = typeof ToggledPreview.Type;
const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel, Message: ToggledPreview,
  init: index => ({ _docsPage: 'toggle', isPressed: index !== 0 }),
  update: model => [{ ...model, isPressed: !model.isPressed }, []],
  view: (index, model, h) => Toggle.toggle({ isPressed: model.isPressed, onToggle: ToggledPreview(), children: [index === 0 ? 'Bold' : index === 1 ? 'Italic' : 'Managed'], ...(index === 1 ? { variant: 'outline' as const } : {}), ...(index === 2 ? { isDisabled: true } : {}) }, h),
});

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
  previewProgram,
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

        code: source('Formatting', false, ''),
      },
      {
        title: 'Outline', description: 'Outline treatment works well when the toggle sits beside ordinary buttons.',

        code: source('Outline', true, `variant: 'outline',`),
      },
      {
        title: 'Disabled', description: 'Disabled state remains focusable and exposes the current pressed value.',

        code: source('Disabled', true, `isDisabled: true,`),
      },
    ],
  },
});

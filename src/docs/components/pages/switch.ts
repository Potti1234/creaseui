import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import * as Switch from '@/ui/switch';
import { authoredPage, controlledBooleanApplication, definePreviewProgram } from '@/docs/components/pages/authored-page';

const PreviewModel = S.Struct({ _docsPage: S.Literal('switch'), isChecked: S.Boolean });
type PreviewModel = typeof PreviewModel.Type;
const ToggledPreview = m('ToggledSwitchPreview', { isChecked: S.Boolean });
type PreviewMessage = typeof ToggledPreview.Type;
const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel, Message: ToggledPreview,
  init: index => ({ _docsPage: 'switch', isChecked: index !== 1 }),
  update: (model, message) => [{ ...model, isChecked: message.isChecked }, []],
  view: (index, model, h) => Switch.switchControl({ id: `docs-switch-${String(index)}`, isChecked: index === 2 ? true : model.isChecked, onToggle: isChecked => ToggledPreview({ isChecked }), label: index === 0 ? 'Notifications' : index === 1 ? 'Compact mode' : 'Security scanning', ...(index === 0 ? { description: 'Receive build and deployment updates.' } : {}), ...(index === 1 ? { size: 'sm' as const } : {}), ...(index === 2 ? { isDisabled: true, description: 'Required by your organization.' } : {}) }, h),
});

const source = (name: string, initialValue: boolean, config: string): string => controlledBooleanApplication({
  componentName: 'Switch', componentSlug: 'switch', exampleName: name, field: 'notificationsEnabled', initialValue,
  messageName: 'ToggledNotifications', messageField: 'isChecked',
  viewBody: `Switch.switchControl({
  id: 'notifications',
  isChecked: model.notificationsEnabled,
  onToggle: isChecked => ToggledNotifications({ isChecked }),
  label: 'Notifications',
  ${config}
}, h),`,
});

export const switchPage = authoredPage({
  slug: 'switch', title: 'Switch', kind: 'helper',
  previewProgram,
  definition: {
    kind: 'helper', description: 'Controls an immediate on/off setting with a visible label and optional description.',
    architecture: 'Switch is a stateless controlled helper. The parent Model owns the setting and onToggle returns the next boolean in a domain Message.',
    apiHref: 'https://foldkit.dev/ui/switch',
    styling: 'Use the small size only in dense settings lists. Prefer Checkbox when the choice belongs to a submitted form rather than applying immediately.',
    accessibility: 'Switch exposes switch semantics, checked state, linked label and description, and a focusable disabled state.',
    keyboard: [['Space', 'Toggles the focused switch.']],
    examples: [
      {
        title: 'Notifications', description: 'Apply an immediate preference through a typed toggle Message.',

        code: source('Notifications', true, `description: 'Receive build and deployment updates.',`),
      },
      {
        title: 'Small', description: 'Use the compact size in a dense but still clearly labeled settings row.',

        code: source('Small', false, `size: 'sm',`),
      },
      {
        title: 'Disabled', description: 'Explain organization-managed state in adjacent copy.',

        code: source('Disabled', true, `isDisabled: true,
  description: 'Required by your organization.',`),
      },
    ],
  },
});

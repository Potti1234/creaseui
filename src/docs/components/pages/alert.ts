import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import * as Alert from '@/ui/alert';
import { authoredPage, definePreviewProgram, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({
    componentName: 'Alert',
    componentSlug: 'alert',
    exampleName: name,
    viewBody,
  });

const alertView = <Msg>(
  variant: 'default' | 'destructive',
  title: string,
  description: string,
  h: Parameters<typeof Alert.alert<Msg>>[1],
) =>
  Alert.alert(
    {
      variant,
      class: 'max-w-xl',
      children: [
        Alert.alertTitle({ children: [title] }, h),
        Alert.alertDescription({ children: [description] }, h),
      ],
    },
    h,
  );

const PreviewModel = S.Struct({ _docsPage: S.Literal('alert') });
type PreviewModel = typeof PreviewModel.Type;
const PreviewMessage = m('InteractedWithAlertPreview');
type PreviewMessage = typeof PreviewMessage.Type;

const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init: () => ({ _docsPage: 'alert' }),
  update: (model) => [model, []],
  view: (index, _model, h) => index === 0
    ? alertView('default', 'Heads up', 'You can add components with the Crease registry.', h)
    : alertView('destructive', 'Something went wrong', 'Your session could not be refreshed.', h),
});

export const alertPage = authoredPage({
  slug: 'alert',
  title: 'Alert',
  kind: 'helper',
  previewProgram,
  definition: {
    kind: 'helper',
    description:
      'Calls attention to important information without interrupting the current task.',
    architecture:
      'Alert is a stateless composition of semantic view helpers. Render it directly wherever the information belongs; application state decides when it is present.',
    apiHref: 'https://foldkit.dev/ui/overview',
    styling:
      'Compose alert, alertTitle, and alertDescription. The destructive variant changes the semantic color treatment while class remains available for layout.',
    accessibility:
      'The container uses role="alert", so reserve it for information that should be announced immediately. Use ordinary prose for non-urgent static guidance.',
    examples: [
      {
        title: 'Default',
        description: 'Use the default treatment for timely, non-destructive information.',
        preview: (_model, h) =>
          alertView('default', 'Heads up', 'You can add components with the Crease registry.', h),
        code: source(
          'Default',
          `Alert.alert({
  class: 'max-w-xl',
  children: [
    Alert.alertTitle({ children: ['Heads up'] }, h),
    Alert.alertDescription({ children: ['You can add components with the Crease registry.'] }, h),
  ],
}, h),`,
        ),
      },
      {
        title: 'Destructive',
        description: 'Use destructive styling for errors that require the reader’s attention.',
        preview: (_model, h) =>
          alertView('destructive', 'Upload failed', 'Check your connection and try again.', h),
        code: source(
          'Destructive',
          `Alert.alert({
  variant: 'destructive',
  class: 'max-w-xl',
  children: [
    Alert.alertTitle({ children: ['Upload failed'] }, h),
    Alert.alertDescription({ children: ['Check your connection and try again.'] }, h),
  ],
}, h),`,
        ),
      },
    ],
  },
});

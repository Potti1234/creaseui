import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { collapsibleInitialValues } from '@/docs/components/pages/collapsible/shared';
import * as Collapsible from '@/ui/collapsible';

const PreviewModel = S.Struct({ _docsPage: S.Literal('collapsible'), isOpen: S.Boolean });
type PreviewModel = typeof PreviewModel.Type;
const ToggledPreview = m('ToggledCollapsiblePreview', { isOpen: S.Boolean });
type PreviewMessage = typeof ToggledPreview.Type;

export const collapsibleTailwindPreviewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: ToggledPreview,
  init: index => ({ _docsPage: 'collapsible', isOpen: collapsibleInitialValues[index] ?? false }),
  update: (model, message) => [{ ...model, isOpen: message.isOpen }, []],
  view: (index, model, h) => {
    const disclosure = Collapsible.collapsible({
      id: `docs-collapsible-${String(index)}`,
      isOpen: index === 2 ? false : model.isOpen,
      onToggle: isOpen => ToggledPreview({ isOpen }),
      ...(index === 2 ? { isDisabled: true } : {}),
      trigger: index === 0
        ? (model.isOpen ? 'Hide details' : 'Show details')
        : index === 1 ? 'Architecture notes' : 'Unavailable details',
      content: index === 1
        ? 'Messages describe facts and update owns transitions.'
        : 'Foldkit keeps disclosure state explicit.',
      triggerClass: 'rounded-md border px-3 py-2 text-sm',
      contentClass: 'pt-3 text-sm text-muted-foreground',
    }, h);

    return index === 0
      ? h.div([h.Class('space-y-3')], [
          h.button([
            h.Type('button'),
            h.OnClick(ToggledPreview({ isOpen: !model.isOpen })),
            h.Class('rounded-md border px-3 py-2 text-sm'),
          ], [model.isOpen ? 'Close details externally' : 'Open details externally']),
          disclosure,
        ])
      : disclosure;
  },
});

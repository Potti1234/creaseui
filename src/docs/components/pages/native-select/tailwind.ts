import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { fruitOptions } from '@/docs/components/pages/native-select/shared';
import * as NativeSelect from '@/ui/native-select';

const PreviewModel = S.Struct({
  _docsPage: S.Literal('native-select'),
  value: S.String,
});
type PreviewModel = typeof PreviewModel.Type;
const ChangedPreview = m('ChangedNativeSelectPreview', { value: S.String });
type PreviewMessage = typeof ChangedPreview.Type;

export const nativeSelectTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: ChangedPreview,
  init: () => ({ _docsPage: 'native-select', value: 'apple' }),
  update: (model, message) => [{ ...model, value: message.value }, []],
  view: (index, model, h) => NativeSelect.nativeSelect({
    id: `docs-native-select-${String(index)}`,
    value: model.value,
    onChange: value => ChangedPreview({ value }),
    label: index === 0 ? 'Fruit' : 'Destination',
    ...(index === 0
      ? {
          description: 'Choose one for the delivery.',
          options: fruitOptions,
        }
      : {
          options: [{ value: 'apple', label: 'Local pickup' }],
          groups: [{
            label: 'Europe',
            options: [
              { value: 'banana', label: 'Berlin' },
              { value: 'blueberry', label: 'Paris' },
            ],
          }],
        }),
  }, h),
});

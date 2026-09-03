import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { fruitOptions } from '@/docs/components/pages/native-select/shared';
import * as NativeSelect from '@/stylex/native-select';

export const nativeSelectStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => NativeSelect.nativeSelect({
  id: `docs-native-select-${String(exampleIndex)}`,
  value: (model as { value: string }).value,
  onChange: value => onMessageJson(JSON.stringify({
    _tag: 'ChangedNativeSelectPreview',
    value,
  })),
  label: exampleIndex === 0 ? 'Fruit' : 'Destination',
  ...(exampleIndex === 0
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
}, h);

import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  type Alignment,
  toggleGroupItems,
} from '@/docs/components/pages/toggle-group/shared';
import * as ToggleGroup from '@/stylex/toggle-group';

const PreviewToggleGroup = ToggleGroup.create<Alignment>();

type PreviewModel = Readonly<{
  toggleGroup: ToggleGroup.Model;
  value: Alignment;
  values: ReadonlyArray<Alignment>;
}>;

export const toggleGroupStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const previewModel = model as PreviewModel;
  return PreviewToggleGroup.toggleGroup({
    model: previewModel.toggleGroup,
    toParentMessage: message => onMessageJson(JSON.stringify({
      _tag: 'GotToggleGroupPreviewMessage',
      message,
    })),
    ariaLabel: 'Text alignment',
    ...(exampleIndex === 1
      ? { values: previewModel.values }
      : { value: previewModel.value }),
    items: exampleIndex === 3
      ? toggleGroupItems.map(item =>
          item.value === 'center' ? { ...item, isDisabled: true } : item)
      : toggleGroupItems,
    ...(exampleIndex === 1 ? { arrangement: 'wrapped' as const } : {}),
    ...(exampleIndex === 2 ? { direction: 'rtl' as const } : {}),
    ...(exampleIndex === 3 ? { variant: 'outline' as const } : {}),
  }, h);
};

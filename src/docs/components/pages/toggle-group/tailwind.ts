import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import {
  definePreviewProgram,
} from '@/docs/components/pages/authored-page';
import {
  type Alignment,
  toggleGroupItems,
} from '@/docs/components/pages/toggle-group/shared';
import * as ToggleGroup from '@/ui/toggle-group';

const PreviewToggleGroup = ToggleGroup.create<Alignment>();
const GotToggleGroupPreviewMessage = m('GotToggleGroupPreviewMessage', {
  message: ToggleGroup.Message,
});
type PreviewMessage = typeof GotToggleGroupPreviewMessage.Type;
const PreviewModel = S.Struct({
  _docsPage: S.Literal('toggle-group'),
  toggleGroup: ToggleGroup.Model,
  value: S.Literals(['left', 'center', 'right']),
  values: S.Array(S.Literals(['left', 'center', 'right'])),
});
type PreviewModel = typeof PreviewModel.Type;

export const toggleGroupTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: GotToggleGroupPreviewMessage,
  init: index => ({
    _docsPage: 'toggle-group',
    toggleGroup: ToggleGroup.init({
      id: `docs-toggle-group-${String(index)}`,
    }),
    value: index === 2 ? 'right' : 'center',
    values: ['left'],
  }),
  update: (model, message) => {
    const [toggleGroup, commands, maybeSelection] =
      PreviewToggleGroup.update(model.toggleGroup, message.message);
    const selected = Option.getOrUndefined(maybeSelection)?.value;
    const isMultiple = model.toggleGroup.id.endsWith('-1');
    return [
      {
        ...model,
        toggleGroup,
        value: selected === undefined || isMultiple ? model.value : selected,
        values: selected === undefined || !isMultiple
          ? model.values
          : model.values.includes(selected)
            ? model.values.filter(value => value !== selected)
            : [...model.values, selected],
      },
      Command.mapMessages(
        commands,
        next => GotToggleGroupPreviewMessage({ message: next }),
      ),
    ];
  },
  view: (index, model, h) => PreviewToggleGroup.toggleGroup({
    model: model.toggleGroup,
    toParentMessage: message => GotToggleGroupPreviewMessage({ message }),
    ariaLabel: 'Text alignment',
    ...(index === 1 ? { values: model.values } : { value: model.value }),
    items: index === 3
      ? toggleGroupItems.map(item =>
          item.value === 'center' ? { ...item, isDisabled: true } : item)
      : toggleGroupItems,
    ...(index === 1 ? { arrangement: 'wrapped' as const } : {}),
    ...(index === 2 ? { direction: 'rtl' as const } : {}),
    ...(index === 3 ? { variant: 'outline' as const } : {}),
  }, h),
});

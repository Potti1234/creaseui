import type { Option } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { selectFixtures, selectFruits } from '@/docs/components/pages/select/shared';
import * as Select from '@/stylex/select';

export const selectStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = selectFixtures[index] ?? selectFixtures[0];
  const preview = model as { select: Select.Model; maybeFruit: Option.Option<string> };
  return Select.select({
    model: preview.select, maybeSelectedValue: preview.maybeFruit,
    toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotSelectPreviewMessage', message })),
    items: selectFruits, itemToValue: item => item.value, itemToLabel: item => item.label,
    placeholder: 'Select a fruit', ariaLabel: 'Fruit', name: 'fruit',
    ...(fixture.grouped ? { itemGroupKey: (item: typeof selectFruits[number]) => item.value === 'blueberry' ? 'Berries' : 'Common', groupToHeading: (group: string) => group } : {}),
    ...(fixture.disabled ? { itemToConfig: (item: typeof selectFruits[number]) => ({ isDisabled: item.value === 'banana' }) } : {}),
    ...(fixture.readOnly ? { isReadOnly: true, direction: 'rtl' as const } : {}),
  }, h);
};

import type { Option } from 'effect';
import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  selectFixtures,
  type SelectFixture,
  type SelectItem,
} from '@/docs/components/pages/select/shared';
import * as Field from '@/stylex/field';
import * as Select from '@/stylex/select';

const styles = stylex.create({
  triggerWide: { maxWidth: '12rem', width: '100%', },
  triggerWider: { maxWidth: '16rem', width: '100%', },
  triggerSmall: { width: '8rem' },
});

const Bundle = Select.create<string>();

interface SelectPreviewShape {
  readonly select: Select.Model;
  readonly maybeSelected: Option.Option<string>;
}

export const selectStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const preview = model as SelectPreviewShape;
  const fixture: SelectFixture =
    selectFixtures[exampleIndex] ?? selectFixtures[0];
  const select: Html = Bundle.select({
    model: preview.select,
    maybeSelectedValue: preview.maybeSelected,
    toParentMessage: message =>
      onMessageJson(
        JSON.stringify({ _tag: 'GotSelectPreviewMessage', message }),
      ),
    ariaLabel: 'Example select',
    placeholder: fixture.placeholder,
    items: fixture.items,
    itemToValue: (item: SelectItem) => item.value,
    itemToLabel: (item: SelectItem) => item.label,
    itemToConfig: (item: SelectItem) => ({
      isDisabled: item.isDisabled ?? false,
    }),
    ...(fixture.groups
      ? {
          itemGroupKey: (item: SelectItem) => item.group ?? '',
          groupToHeading: (group: string) => group,
        }
      : {}),
    ...(fixture.isDisabled === true ? { isDisabled: true } : {}),
    ...(fixture.kind === 'invalid' ? { isInvalid: true } : {}),
    ...(fixture.rtl === true ? { direction: 'rtl' as const } : {}),
    ...(fixture.triggerWidthStylex === undefined
      ? {}
      : {
          triggerLayoutStyle:
            styles[fixture.triggerWidthStylex as keyof typeof styles],
        }),
  }, h);
  return fixture.kind === 'invalid'
    ? h.div([], [
        Field.field({
          isInvalid: true,
          children: [
            Field.fieldLabel({ children: ['Fruit'] }, h),
            select,
            Field.fieldError({ children: ['Please select a fruit.'] }, h),
          ],
        }, h),
      ])
    : select;
};

import { Option } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  comboboxCountries,
  comboboxFixtures,
  comboboxFrameworks,
  comboboxRtlCategories,
  comboboxTimezones,
  type ComboboxFixture,
} from '@/docs/components/pages/combobox/shared';
import * as Icon from '@/lib/icon';
import * as Button from '@/stylex/button';
import * as Combobox from '@/stylex/combobox';
import { className } from '@/stylex/style';

const styles = stylex.create({
  row: { gap: '0.5rem', alignItems: 'center', display: 'flex', },
  stack: { gap: '0.5rem', display: 'grid', },
  icon: { height: '1rem', width: '1rem', },
  itemCol: { display: 'flex', flexDirection: 'column' },
  itemMeta: { color: 'var(--muted-foreground)', fontSize: '0.75rem' },
});

type Preview = Readonly<{
  combobox: Combobox.Model;
  maybeValue: Option.Option<string>;
}>;

const labelFor =
  <Item extends { value: string; label: string }>(items: ReadonlyArray<Item>) =>
  (value: string): string =>
    items.find(item => item.value === value)?.label ?? value;

export const comboboxStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html | undefined => {
  const fixture = comboboxFixtures[index];
  if (fixture === undefined) return undefined;
  const preview = model as Preview;
  const toParentMessage = (message: Combobox.Message): Msg =>
    onMessageJson(JSON.stringify({ _tag: 'GotComboboxPreviewMessage', message }));

  const combo = ((): Html => {
    if (fixture.kind === 'groups') {
      return Combobox.combobox(
        {
          model: preview.combobox,
          maybeSelectedValue: preview.maybeValue,
          restingInputValue: Option.match(preview.maybeValue, {
            onNone: () => '',
            onSome: labelFor(comboboxTimezones),
          }),
          toParentMessage,
          items: comboboxTimezones,
          itemToValue: item => item.value,
          itemToLabel: item => item.label,
          placeholder: 'Select a timezone',
          ariaLabel: 'Timezone',
          formName: 'docs-combobox',
          itemGroupKey: item => item.group,
          groupToHeading: group => group,
        },
        h,
      );
    }
    if (fixture.kind === 'custom') {
      return Combobox.combobox(
        {
          model: preview.combobox,
          maybeSelectedValue: preview.maybeValue,
          restingInputValue: Option.match(preview.maybeValue, {
            onNone: () => '',
            onSome: labelFor(comboboxCountries),
          }),
          toParentMessage,
          items: comboboxCountries,
          itemToValue: item => item.value,
          itemToLabel: item => item.label,
          placeholder: 'Select country',
          ariaLabel: 'Country',
          formName: 'docs-combobox',
          itemToConfig: item => ({
            content: h.span([h.Class(className(styles.itemCol))], [
              h.span([], [item.label]),
              h.span([h.Class(className(styles.itemMeta))], [item.continent]),
            ]),
            searchText: `${item.label} ${item.continent}`,
          }),
        },
        h,
      );
    }
    if (fixture.kind === 'rtl') {
      return Combobox.combobox(
        {
          model: preview.combobox,
          maybeSelectedValue: preview.maybeValue,
          restingInputValue: Option.match(preview.maybeValue, {
            onNone: () => '',
            onSome: labelFor(comboboxRtlCategories),
          }),
          toParentMessage,
          items: comboboxRtlCategories,
          itemToValue: item => item.value,
          itemToLabel: item => item.label,
          placeholder: 'أضف فئات',
          ariaLabel: 'الفئات',
          formName: 'docs-combobox',
          direction: 'rtl',
        },
        h,
      );
    }
    return Combobox.combobox(
      {
        model: preview.combobox,
        maybeSelectedValue: preview.maybeValue,
        restingInputValue: Option.match(preview.maybeValue, {
          onNone: () => '',
          onSome: labelFor(comboboxFrameworks),
        }),
        toParentMessage,
        items: comboboxFrameworks,
        itemToValue: item => item.value,
        itemToLabel: item => item.label,
        placeholder: 'Select a framework',
        ariaLabel: 'Framework',
        formName: 'docs-combobox',
        ...(fixture.isInvalid === true ? { isInvalid: true } : {}),
        ...(fixture.isDisabled === true ? { isDisabled: true } : {}),
      },
      h,
    );
  })();

  return fixture.kind === 'clear'
    ? h.div([h.Class(className(styles.row))], [
        combo,
        Button.button(
          {
            variant: 'ghost',
            size: 'icon',
            ariaLabel: 'Clear selection',
            onClick: onMessageJson(JSON.stringify({ _tag: 'ClickedClear' })),
            children: [Icon.icon('x', { class: className(styles.icon) }, h)],
          },
          h,
        ),
      ])
    : h.div([h.Class(className(styles.stack))], [combo]);
};

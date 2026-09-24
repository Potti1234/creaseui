import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  comboboxCountries,
  comboboxFixtures,
  comboboxFrameworks,
  comboboxRtlCategories,
  comboboxTimezones,
  type ComboboxFixture,
} from '@/docs/components/pages/combobox/shared';
import * as Icon from '@/lib/icon';
import * as Button from '@/ui/button';
import * as Combobox from '@/ui/combobox';

const PreviewMessages = defineMessageUnion({
  GotComboboxPreviewMessage: { message: Combobox.Message },
  ClickedClear: {},
});
type PreviewMessage = typeof PreviewMessages.Type;

const PreviewModel = S.Struct({
  _docsPage: S.Literal('combobox'),
  combobox: Combobox.Model,
  maybeValue: S.Option(S.String),
});
type PreviewModel = typeof PreviewModel.Type;

const labelFor =
  <Item extends { value: string; label: string }>(items: ReadonlyArray<Item>) =>
  (value: string): string =>
    items.find(item => item.value === value)?.label ?? value;

const commonProps = (model: PreviewModel) => ({
  model: model.combobox,
  maybeSelectedValue: model.maybeValue,
  toParentMessage: (message: Combobox.Message): PreviewMessage =>
    PreviewMessages.GotComboboxPreviewMessage({ message }),
  formName: 'docs-combobox',
});

const frameworksView = (
  fixture: ComboboxFixture,
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
) =>
  Combobox.combobox(
    {
      ...commonProps(model),
      restingInputValue: Option.match(model.maybeValue, {
        onNone: () => '',
        onSome: labelFor(comboboxFrameworks),
      }),
      items: comboboxFrameworks,
      itemToValue: item => item.value,
      itemToLabel: item => item.label,
      placeholder: 'Select a framework',
      ariaLabel: 'Framework',
      ...(fixture.isInvalid === true ? { isInvalid: true } : {}),
      ...(fixture.isDisabled === true ? { isDisabled: true } : {}),
    },
    h,
  );

const timezonesView = (model: PreviewModel, h: HtmlBuilder<PreviewMessage>) =>
  Combobox.combobox(
    {
      ...commonProps(model),
      restingInputValue: Option.match(model.maybeValue, {
        onNone: () => '',
        onSome: labelFor(comboboxTimezones),
      }),
      items: comboboxTimezones,
      itemToValue: item => item.value,
      itemToLabel: item => item.label,
      placeholder: 'Select a timezone',
      ariaLabel: 'Timezone',
      itemGroupKey: item => item.group,
      groupToHeading: group => group,
    },
    h,
  );

const countriesView = (model: PreviewModel, h: HtmlBuilder<PreviewMessage>) =>
  Combobox.combobox(
    {
      ...commonProps(model),
      restingInputValue: Option.match(model.maybeValue, {
        onNone: () => '',
        onSome: labelFor(comboboxCountries),
      }),
      items: comboboxCountries,
      itemToValue: item => item.value,
      itemToLabel: item => item.label,
      placeholder: 'Select country',
      ariaLabel: 'Country',
      itemToConfig: item => ({
        content: h.span([h.Class('flex flex-col')], [
          h.span([], [item.label]),
          h.span([h.Class('text-muted-foreground text-xs')], [item.continent]),
        ]),
        searchText: `${item.label} ${item.continent}`,
      }),
    },
    h,
  );

const rtlView = (model: PreviewModel, h: HtmlBuilder<PreviewMessage>) =>
  Combobox.combobox(
    {
      ...commonProps(model),
      restingInputValue: Option.match(model.maybeValue, {
        onNone: () => '',
        onSome: labelFor(comboboxRtlCategories),
      }),
      items: comboboxRtlCategories,
      itemToValue: item => item.value,
      itemToLabel: item => item.label,
      placeholder: 'أضف فئات',
      ariaLabel: 'الفئات',
      direction: 'rtl',
    },
    h,
  );

export const comboboxTailwindPreviewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: PreviewMessages,
  init: index => ({
    _docsPage: 'combobox',
    combobox: (() => {
      const initial = Combobox.init({
        id: `docs-combobox-${String(index)}`,
        isAnimated: true,
      });
      // Seed inputValue for the pre-selected clear example — upstream combobox
      // does not derive it from the resting label yet (foldkit finding F15).
      return comboboxFixtures[index]?.kind === 'clear'
        ? { ...initial, inputValue: 'Next.js' }
        : initial;
    })(),
    maybeValue:
      comboboxFixtures[index]?.kind === 'clear'
        ? Option.some('nextjs')
        : Option.none(),
  }),
  update: (model, message) => {
    switch (message._tag) {
      case 'GotComboboxPreviewMessage': {
        const next = Combobox.update(model.combobox, message.message);
        const maybeOut = Option.fromNullishOr(next.outMessage);
        const maybeValue = Option.match(maybeOut, {
          onNone: () => model.maybeValue,
          onSome: out =>
            out._tag === 'Selected'
              ? Option.some(out.value)
              : Option.none<string>(),
        });
        return {
          model: { ...model, combobox: next.model, maybeValue },
          commands: Command.mapMessages(next.commands ?? [], child =>
            PreviewMessages.GotComboboxPreviewMessage({ message: child }),
          ),
        };
      }
      case 'ClickedClear': {
        const next = Combobox.update(
          model.combobox,
          Combobox.Message.UpdatedInputValue({ value: '' }),
        );
        return {
          model: {
            ...model,
            combobox: next.model,
            maybeValue: Option.none(),
          },
          commands: Command.mapMessages(next.commands ?? [], child =>
            PreviewMessages.GotComboboxPreviewMessage({ message: child }),
          ),
        };
      }
    }
  },
  view: (index, model, h) => {
    const fixture = comboboxFixtures[index] ?? comboboxFixtures[0]!;
    const combo =
      fixture.kind === 'groups'
        ? timezonesView(model, h)
        : fixture.kind === 'custom'
          ? countriesView(model, h)
          : fixture.kind === 'rtl'
            ? rtlView(model, h)
            : frameworksView(fixture, model, h);
    return fixture.kind === 'clear'
      ? h.div([h.Class('flex items-center gap-2')], [
          combo,
          Button.button(
            {
              variant: 'ghost',
              size: 'icon',
              ariaLabel: 'Clear selection',
              onClick: PreviewMessages.ClickedClear(),
              children: [Icon.icon('x', { class: 'size-4' }, h)],
            },
            h,
          ),
        ])
      : h.div([h.Class('grid gap-2')], [combo]);
  },
});

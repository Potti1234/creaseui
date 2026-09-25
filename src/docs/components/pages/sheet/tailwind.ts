import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  sheetFixtures,
  type SheetFixture,
  type SheetInstance,
} from '@/docs/components/pages/sheet/shared';
import * as Button from '@/ui/button';
import * as Input from '@/ui/input';
import * as Label from '@/ui/label';
import * as Sheet from '@/ui/sheet';

const GotSheetPreviewMessage = defineMessageUnion({
  ClickedOpenSheet: { id: S.String },
  ChangedSheetInput: { id: S.String, value: S.String },
  GotSheetPreviewMessage: { id: S.String, message: Sheet.Message },
});
type PreviewMessage = typeof GotSheetPreviewMessage.Type;

const PreviewModel = S.Struct({
  _docsPage: S.Literal('sheet'),
  sheets: S.Record(S.String, Sheet.Model),
  values: S.Record(S.String, S.String),
});
type PreviewModel = typeof PreviewModel.Type;

const LOREM: ReadonlyArray<string> = Array.from({ length: 10 }, () =>
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');

const fieldView = (
  field: { id: string; label: string; value: string },
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
): Html =>
  h.div([h.Class('grid gap-3')], [
    Label.label({ for: `sheet-field-${field.id}`, children: [field.label] }, h),
    Input.input({
      id: `sheet-field-${field.id}`,
      value: model.values[field.id] ?? field.value,
      onInput: value =>
        GotSheetPreviewMessage.ChangedSheetInput({ id: field.id, value }),
    }, h),
  ]);

const instanceView = (
  instance: SheetInstance,
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
): Html => {
  const content: Array<Html> = [];
  if (instance.fields !== undefined) {
    content.push(
      h.div(
        [h.Class('grid flex-1 auto-rows-min gap-6 px-4')],
        instance.fields.map(field => fieldView(field, model, h)),
      ),
    );
  }
  if (instance.loremBody === true) {
    content.push(
      h.div(
        [h.Class('overflow-y-auto px-4')],
        LOREM.map(paragraph =>
          h.p([h.Class('mb-2 leading-relaxed')], [paragraph])),
      ),
    );
  }
  return Sheet.sheet({
    model: model.sheets[instance.id] ?? Sheet.init({ id: `sheet-${instance.id}`, isAnimated: true }),
    toParentMessage: message =>
      GotSheetPreviewMessage.GotSheetPreviewMessage({
        id: instance.id,
        message,
      }),
    side: instance.side,
    title: instance.panelTitle,
    ...(instance.panelDescription === undefined
      ? {}
      : { description: instance.panelDescription }),
    ...(instance.showCloseButton === false ? { showCloseButton: false } : {}),
    ...(instance.rtl === true ? { direction: 'rtl' as const } : {}),
    ...(content.length === 0 ? {} : { content: () => content }),
    ...(instance.footer === undefined
      ? {}
      : {
          footer: slots => [
            h.button(
              [
                ...slots.closeButton,
                h.Type('button'),
                h.Class(
                  'rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground',
                ),
              ],
              [instance.footer!.save],
            ),
            h.button(
              [
                ...slots.closeButton,
                ...slots.initialFocusAttributes(),
                h.Type('button'),
                h.Class('rounded-md border px-4 py-2 text-sm'),
              ],
              [instance.footer!.cancel],
            ),
          ],
        }),
  }, h);
};

const fixtureView = (
  fixture: SheetFixture,
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
): Html =>
  h.div(
    [h.Class('flex flex-wrap gap-2')],
    fixture.instances
      .map(instance =>
        Button.button({
          variant: 'outline',
          onClick: GotSheetPreviewMessage.ClickedOpenSheet({ id: instance.id }),
          children: [instance.trigger],
        }, h))
      .concat(
        fixture.instances.map(instance => instanceView(instance, model, h)),
      ),
  );

const mapSheet = (
  model: PreviewModel,
  id: string,
  result: ReturnType<typeof Sheet.update>,
) => ({
  model: {
    ...model,
    sheets: { ...model.sheets, [id]: result.model },
  },
  commands: Command.mapMessages(result.commands ?? [], next =>
    GotSheetPreviewMessage.GotSheetPreviewMessage({ id, message: next })),
});

export const sheetTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: GotSheetPreviewMessage,
  init: index => {
    const fixture = sheetFixtures[index] ?? sheetFixtures[0];
    return {
      _docsPage: 'sheet',
      sheets: Object.fromEntries(
        fixture.instances.map(instance => [
          instance.id,
          Sheet.init({ id: `docs-sheet-${instance.id}`, isAnimated: true }),
        ]),
      ),
      values: Object.fromEntries(
        fixture.instances
          .flatMap(instance => instance.fields ?? [])
          .map(field => [field.id, field.value]),
      ),
    };
  },
  update: (model, message) => {
    switch (message._tag) {
      case 'ClickedOpenSheet': {
        const sheet = model.sheets[message.id];
        if (sheet === undefined) {
          return { model };
        }
        return mapSheet(model, message.id, Sheet.open(sheet));
      }
      case 'ChangedSheetInput':
        return {
          model: {
            ...model,
            values: { ...model.values, [message.id]: message.value },
          },
        };
      case 'GotSheetPreviewMessage': {
        const sheet = model.sheets[message.id];
        if (sheet === undefined) {
          return { model };
        }
        return mapSheet(
          model,
          message.id,
          Sheet.update(sheet, message.message),
        );
      }
    }
  },
  view: (index, model, h) =>
    fixtureView(sheetFixtures[index] ?? sheetFixtures[0], model, h),
});

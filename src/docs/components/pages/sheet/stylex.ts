import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  sheetFixtures,
  type SheetFixture,
  type SheetInstance,
} from '@/docs/components/pages/sheet/shared';
import * as Button from '@/stylex/button';
import * as Input from '@/stylex/input';
import * as Label from '@/stylex/label';
import * as Sheet from '@/stylex/sheet';
import { className } from '@/stylex/style';

const styles = stylex.create({
  wrap: { gap: '0.5rem', display: 'flex', flexWrap: 'wrap', },
  fieldsWrap: {
    gap: '1.5rem',
    paddingInline: '1rem',
    display: 'grid',
    flexGrow: 1,
    gridAutoRows: 'min-content',
  },
  field: { gap: '0.75rem', display: 'grid', },
  loremWrap: { paddingInline: '1rem', overflowY: 'auto', },
  paragraph: { lineHeight: 1.625, marginBottom: '0.5rem', },
  footerSave: {
    borderRadius: '0.375rem',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    fontSize: '0.875rem',
  },
  footerCancel: {
    borderColor: 'var(--border)',
    borderRadius: '0.375rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    fontSize: '0.875rem',
  },
});

interface PreviewShape {
  readonly sheets: Readonly<Record<string, Sheet.Model>>;
  readonly values: Readonly<Record<string, string>>;
}

const LOREM: ReadonlyArray<string> = Array.from({ length: 10 }, () =>
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');

const instanceView = <Msg>(
  instance: SheetInstance,
  preview: PreviewShape,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const content: Array<Html> = [];
  if (instance.fields !== undefined) {
    content.push(
      h.div(
        [h.Class(className(styles.fieldsWrap))],
        instance.fields.map(field =>
          h.div([h.Class(className(styles.field))], [
            Label.label(
              {
                for: `sheet-field-${field.id}`,
                children: [field.label],
              },
              h,
            ),
            Input.input(
              {
                id: `sheet-field-${field.id}`,
                value: preview.values[field.id] ?? field.value,
                onInput: value =>
                  onMessageJson(
                    JSON.stringify({
                      _tag: 'ChangedSheetInput',
                      id: field.id,
                      value,
                    }),
                  ),
              },
              h,
            ),
          ]),
        ),
      ),
    );
  }
  if (instance.loremBody === true) {
    content.push(
      h.div(
        [h.Class(className(styles.loremWrap))],
        LOREM.map(paragraph =>
          h.p([h.Class(className(styles.paragraph))], [paragraph])),
      ),
    );
  }
  return Sheet.sheet(
    {
      model:
        preview.sheets[instance.id] ??
        Sheet.init({ id: `sheet-${instance.id}`, isAnimated: true }),
      toParentMessage: message =>
        onMessageJson(
          JSON.stringify({
            _tag: 'GotSheetPreviewMessage',
            id: instance.id,
            message,
          }),
        ),
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
                  h.Class(className(styles.footerSave)),
                ],
                [instance.footer!.save],
              ),
              h.button(
                [
                  ...slots.closeButton,
                  ...slots.initialFocusAttributes(),
                  h.Type('button'),
                  h.Class(className(styles.footerCancel)),
                ],
                [instance.footer!.cancel],
              ),
            ],
          }),
    },
    h,
  );
};

export const sheetStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const preview = model as PreviewShape;
  const fixture: SheetFixture =
    sheetFixtures[exampleIndex] ?? sheetFixtures[0];
  return h.div(
    [h.Class(className(styles.wrap))],
    fixture.instances
      .map(instance =>
        Button.button(
          {
            variant: 'outline',
            onClick: onMessageJson(
              JSON.stringify({
                _tag: 'ClickedOpenSheet',
                id: instance.id,
              }),
            ),
            children: [instance.trigger],
          },
          h,
        ))
      .concat(
        fixture.instances.map(instance =>
          instanceView(instance, preview, onMessageJson, h)),
      ),
  );
};

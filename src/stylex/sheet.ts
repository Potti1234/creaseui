import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html';

import { Dialog as DialogPrimitive } from '@foldkit/ui';

import * as Icon from '@/lib/icon';
import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'

const styles = stylex.create({
  bottomDialog: { alignItems: 'stretch', flexDirection: 'column', justifyContent: 'flex-end' },
  bottomPanel: { transform: { default: 'none', ':is([data-closed])': 'translateY(100%)' }, borderTopWidth: 1, height: 'auto', width: '100%', },
  leftDialog: { alignItems: 'stretch', flexDirection: 'row', justifyContent: 'flex-start' },
  leftPanel: { transform: { default: 'none', ':is([data-closed])': 'translateX(-100%)' }, borderRightWidth: 1, height: '100%', maxWidth: '24rem', width: '75%', },
  rightDialog: { alignItems: 'stretch', flexDirection: 'row', justifyContent: 'flex-end' },
  rightPanel: { transform: { default: 'none', ':is([data-closed])': 'translateX(100%)' }, borderLeftWidth: 1, height: '100%', maxWidth: '24rem', width: '75%', },
  topDialog: { alignItems: 'stretch', flexDirection: 'column', justifyContent: 'flex-start' },
  topPanel: { transform: { default: 'none', ':is([data-closed])': 'translateY(-100%)' }, borderBottomWidth: 1, height: 'auto', width: '100%', },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

/* Ported from shadcn/ui sheet.tsx on top of the foldkit Dialog submodel.
   The fullscreen native <dialog> is the flex positioning context, so each
   side aligns the panel to an edge without fixed panel positioning. Radix
   slide keyframes are foldkit data-closed CSS transitions. */

export const Model = DialogPrimitive.Model;
export type Model = typeof Model.Type;
export const Message = DialogPrimitive.Message;
export type Message = typeof Message.Type;
export const OutMessage = DialogPrimitive.OutMessage;
export type OutMessage = typeof OutMessage.Type;

export const init = DialogPrimitive.init;
export const update = DialogPrimitive.update;
export const open = DialogPrimitive.open;
export const close = DialogPrimitive.close;

export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

const DIALOG_CLASS: Readonly<Record<SheetSide, StaticStyles>> = {
  top: styles.topDialog,
  right: styles.rightDialog,
  bottom: styles.bottomDialog,
  left: styles.leftDialog,
};

const OVERLAY_CLASS = overlayStyles.overlay

const CONTENT_CLASS = overlayStyles.panel

const SIDE_CLASS: Readonly<Record<SheetSide, StaticStyles>> = {
  right: styles.rightPanel,
  left: styles.leftPanel,
  top: styles.topPanel,
  bottom: styles.bottomPanel,
};

const HEADER_CLASS = overlayStyles.header
const FOOTER_CLASS = overlayStyles.footer
const TITLE_CLASS = overlayStyles.title
const DESCRIPTION_CLASS = overlayStyles.description

const CLOSE_CLASS = overlayStyles.close

export type SheetSlots = Readonly<{
  closeButton: ReadonlyArray<ChildAttribute>;
  initialFocusAttributes: () => ReadonlyArray<ChildAttribute>;
}>;
export type SheetPartProps = Readonly<{
  children: ReadonlyArray<Html | string>;
  layoutStyle?: ComponentLayoutStyle;
}>;
export type SheetTextPartProps = SheetPartProps &
  Readonly<{ attributes: ReadonlyArray<ChildAttribute> }>;
export type SheetCloseProps = Readonly<{
  children?: ReadonlyArray<Html | string>;
  layoutStyle?: ComponentLayoutStyle;
  ariaLabel?: string;
}>;

export const sheetHeader = <Msg>(
  props: SheetPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'sheet-header'), h.Class(cn(HEADER_CLASS, props.layoutStyle))],
    [...props.children],
  );
export const sheetTitle = <Msg>(
  props: SheetTextPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.h2(
    [...props.attributes, h.DataAttribute('slot', 'sheet-title'), h.Class(cn(TITLE_CLASS, props.layoutStyle))],
    [...props.children],
  );
export const sheetDescription = <Msg>(
  props: SheetTextPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.p(
    [
      ...props.attributes,
      h.DataAttribute('slot', 'sheet-description'),
      h.Class(cn(DESCRIPTION_CLASS, props.layoutStyle)),
    ],
    [...props.children],
  );
export const sheetFooter = <Msg>(
  props: SheetPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'sheet-footer'), h.Class(cn(FOOTER_CLASS, props.layoutStyle))],
    [...props.children],
  );

export type SheetParts<Msg> = Readonly<{
  header: (props: SheetPartProps) => Html;
  title: (props: Omit<SheetTextPartProps, 'attributes'>) => Html;
  description: (props: Omit<SheetTextPartProps, 'attributes'>) => Html;
  footer: (props: SheetPartProps) => Html;
  close: (props?: SheetCloseProps) => Html;
  closeButtonAttributes: ReadonlyArray<ChildAttribute>;
  initialFocusAttributes: () => ReadonlyArray<ChildAttribute>;
}>;

export type SheetProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  title: string;
  description?: string;
  content?: (slots: SheetSlots) => ReadonlyArray<Html>;
  footer?: (slots: SheetSlots) => ReadonlyArray<Html>;
  layout?: (parts: SheetParts<Msg>) => ReadonlyArray<Html>;
  side?: SheetSide;
  showCloseButton?: boolean;
  layoutStyle?: ComponentLayoutStyle;
}>;

export const sheet = <Msg>(
  props: SheetProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const side = props.side ?? 'right';

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: DialogPrimitive.view,
    viewInputs: {
      toView: ({
        dialog: dialogAttributes,
        backdrop,
        panel,
        title,
        description,
        initialFocus,
        closeButton,
        isVisible,
      }: DialogPrimitive.RenderInfo) => {
        const hd = h;
        let initialFocusClaimed = false;
        const initialFocusAttributes = (): ReadonlyArray<ChildAttribute> => {
          initialFocusClaimed = true;
          return initialFocus;
        };
        const slots: SheetSlots = { closeButton, initialFocusAttributes };
        const parts: SheetParts<Msg> = {
          header: (partProps) => sheetHeader(partProps, hd),
          title: (partProps) => sheetTitle({ ...partProps, attributes: title }, hd),
          description: (partProps) =>
            sheetDescription({ ...partProps, attributes: description }, hd),
          footer: (partProps) => sheetFooter(partProps, hd),
          close: (partProps = {}) =>
            hd.button(
              [
                ...closeButton,
                ...(initialFocusClaimed ? [] : initialFocusAttributes()),
                hd.Type('button'),
                hd.DataAttribute('slot', 'sheet-close'),
                hd.AriaLabel(partProps.ariaLabel ?? 'Close'),
                hd.Class(cn(CLOSE_CLASS, partProps.layoutStyle)),
              ],
              [...(partProps.children ?? [Icon.x({ class: className(overlayStyles.icon) }, h)])],
            ),
          closeButtonAttributes: closeButton,
          initialFocusAttributes,
        };
        const content = props.layout?.(parts) ?? [
          parts.header({
            children: [
              parts.title({ children: [props.title] }),
              ...(props.description === undefined
                ? []
                : [parts.description({ children: [props.description] })]),
            ],
          }),
          ...(props.content?.(slots) ?? []),
          ...(props.footer === undefined
            ? []
            : [parts.footer({ children: props.footer(slots) })]),
          ...((props.showCloseButton ?? true) ? [parts.close()] : []),
        ];
        const panelFocusAttributes = initialFocusClaimed
          ? []
          : [...initialFocus, hd.Attribute('tabindex', '-1')];

        return hd.dialog(
          [
            ...dialogAttributes,
            hd.DataAttribute('slot', 'sheet'),
            hd.Class(className(overlayStyles.dialog, DIALOG_CLASS[side])),
          ],
          isVisible
            ? [
                hd.div(
                  [
                    ...backdrop,
                    hd.DataAttribute('slot', 'sheet-overlay'),
                    hd.Class(className(OVERLAY_CLASS)),
                  ],
                  [],
                ),
                hd.div(
                  [
                    ...panel,
                    ...panelFocusAttributes,
                    hd.DataAttribute('slot', 'sheet-content'),
                    hd.Class(cn(CONTENT_CLASS, SIDE_CLASS[side], props.layoutStyle)),
                  ],
                  content,
                ),
              ]
            : [],
        );
      },
    },
    toParentMessage: props.toParentMessage,
  });
};

/*
Minimal wiring:
const model = init({ id: 'settings-sheet', isAnimated: true })
const [nextModel, commands] = update(model, message)
sheet({
  model,
  toParentMessage: message => GotSheetMessage({ message }),
  title: 'Settings',
  description: 'Update your preferences.',
  side: 'right',
})
*/


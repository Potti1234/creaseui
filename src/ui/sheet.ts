import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html';

import { Dialog as DialogPrimitive } from '@foldkit/ui';

import * as Icon from '@/lib/icon';
import { cn } from '@/lib/utils';

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

const DIALOG_CLASS: Readonly<Record<SheetSide, string>> = {
  top: 'bg-transparent p-0 open:flex flex-col items-stretch justify-start',
  right: 'bg-transparent p-0 open:flex flex-row items-stretch justify-end',
  bottom: 'bg-transparent p-0 open:flex flex-col items-stretch justify-end',
  left: 'bg-transparent p-0 open:flex flex-row items-stretch justify-start',
};

const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 transition duration-200 ease-out data-[closed]:opacity-0';

const CONTENT_CLASS =
  'relative z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out duration-500 data-[closed]:duration-300';

const SIDE_CLASS: Readonly<Record<SheetSide, string>> = {
  right: 'h-full w-3/4 border-l data-[closed]:translate-x-full sm:max-w-sm',
  left: 'h-full w-3/4 border-r data-[closed]:-translate-x-full sm:max-w-sm',
  top: 'h-auto w-full border-b data-[closed]:-translate-y-full',
  bottom: 'h-auto w-full border-t data-[closed]:translate-y-full',
};

const HEADER_CLASS = 'flex flex-col gap-1.5 p-4';
const FOOTER_CLASS = 'mt-auto flex flex-col gap-2 p-4';
const TITLE_CLASS = 'font-semibold text-foreground';
const DESCRIPTION_CLASS = 'text-sm text-muted-foreground';

const CLOSE_CLASS =
  'absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[open]:bg-secondary';

export type SheetSlots = Readonly<{
  closeButton: ReadonlyArray<ChildAttribute>;
  initialFocusAttributes: () => ReadonlyArray<ChildAttribute>;
}>;
export type SheetPartProps = Readonly<{
  children: ReadonlyArray<Html | string>;
  class?: string;
}>;
export type SheetTextPartProps = SheetPartProps &
  Readonly<{ attributes: ReadonlyArray<ChildAttribute> }>;
export type SheetCloseProps = Readonly<{
  children?: ReadonlyArray<Html | string>;
  class?: string;
  ariaLabel?: string;
}>;

export const sheetHeader = <Msg>(
  props: SheetPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'sheet-header'), h.Class(cn(HEADER_CLASS, props.class))],
    [...props.children],
  );
export const sheetTitle = <Msg>(
  props: SheetTextPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.h2(
    [...props.attributes, h.DataAttribute('slot', 'sheet-title'), h.Class(cn(TITLE_CLASS, props.class))],
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
      h.Class(cn(DESCRIPTION_CLASS, props.class)),
    ],
    [...props.children],
  );
export const sheetFooter = <Msg>(
  props: SheetPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'sheet-footer'), h.Class(cn(FOOTER_CLASS, props.class))],
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
  class?: string;
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
                hd.Class(cn(CLOSE_CLASS, partProps.class)),
              ],
              [...(partProps.children ?? [Icon.x({ class: 'size-4' }, h)])],
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
            hd.Class(DIALOG_CLASS[side]),
          ],
          isVisible
            ? [
                hd.div(
                  [
                    ...backdrop,
                    hd.DataAttribute('slot', 'sheet-overlay'),
                    hd.Class(OVERLAY_CLASS),
                  ],
                  [],
                ),
                hd.div(
                  [
                    ...panel,
                    ...panelFocusAttributes,
                    hd.DataAttribute('slot', 'sheet-content'),
                    hd.Class(cn(CONTENT_CLASS, SIDE_CLASS[side], props.class)),
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

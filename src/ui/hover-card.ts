import { Effect, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { type Html, type HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { cn } from '@/lib/utils';

export const Model = S.Struct({
  id: S.String,
  isOpen: S.Boolean,
  closeVersion: S.Number,
  closeDelay: S.Number,
});
export type Model = typeof Model.Type;

export const Entered = m('Entered');
export const Left = m('Left');
export const CompletedWaitBeforeClosingHoverCard = m(
  'CompletedWaitBeforeClosingHoverCard',
  {
    version: S.Number,
  },
);
export const Message = S.Union([
  Entered,
  Left,
  CompletedWaitBeforeClosingHoverCard,
]);
export type Message = typeof Message.Type;

export type InitConfig = Readonly<{
  id: string;
  closeDelay?: number;
  showDelay?: number;
}>;
export const init = (config: InitConfig): Model => ({
  id: config.id,
  isOpen: false,
  closeVersion: 0,
  closeDelay: Math.max(0, config.closeDelay ?? 150),
});

const WaitBeforeClosing = Command.define('WaitBeforeClosingHoverCard', {
  args: { version: S.Number, delay: S.Number },
  messages: [CompletedWaitBeforeClosingHoverCard],
  execute: ({ version, delay }) =>
    Effect.sleep(`${delay} millis`).pipe(
      Effect.as(CompletedWaitBeforeClosingHoverCard({ version })),
    ),
});

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Entered':
      return [
        { ...model, isOpen: true, closeVersion: model.closeVersion + 1 },
        [],
      ];
    case 'Left': {
      const version = model.closeVersion + 1;
      return [
        { ...model, closeVersion: version },
        [WaitBeforeClosing({ version, delay: model.closeDelay })],
      ];
    }
    case 'CompletedWaitBeforeClosingHoverCard':
      return message.version === model.closeVersion
        ? [{ ...model, isOpen: false }, []]
        : [model, []];
  }
};

export const reflectShowDelay = (model: Model, _showDelay: number): Model =>
  model;

const CONTENT_CLASS =
  'absolute z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden transition duration-150 data-[closed]:pointer-events-none data-[closed]:scale-95 data-[closed]:opacity-0';

export type HoverCardSide = 'top' | 'right' | 'bottom' | 'left';
export type HoverCardAlign = 'start' | 'center' | 'end';

const positionClass = (side: HoverCardSide, align: HoverCardAlign): string => {
  const sideClass = {
    top: 'bottom-full mb-2',
    right: 'left-full ml-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
  }[side];
  const alignClass =
    side === 'top' || side === 'bottom'
      ? {
          start: 'left-0',
          center: 'left-1/2 -translate-x-1/2',
          end: 'right-0',
        }[align]
      : { start: 'top-0', center: 'top-1/2 -translate-y-1/2', end: 'bottom-0' }[
          align
        ];
  return `${sideClass} ${alignClass}`;
};

export type HoverCardProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  trigger: Html | string;
  content: Html | string;
  align?: HoverCardAlign;
  side?: HoverCardSide;
  isDisabled?: boolean;
  ariaLabel?: string;
  triggerClass?: string;
  class?: string;
}>;

export const hoverCard = <Msg>(
  props: HoverCardProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const panelId = `${props.model.id}-content`;
  const disabled = props.isDisabled ?? false;
  const enter = props.toParentMessage(Entered());
  const leave = props.toParentMessage(Left());

  return h.div(
    [
      h.DataAttribute('slot', 'hover-card'),
      h.OnMouseEnter(enter),
      h.OnMouseLeave(leave),
      h.Class('relative inline-flex'),
    ],
    [
      h.button(
        [
          h.Type('button'),
          h.Disabled(disabled),
          h.AriaExpanded(props.model.isOpen),
          h.AriaControls(panelId),
          h.OnFocus(enter),
          h.OnBlur(leave),
          ...(props.ariaLabel === undefined
            ? []
            : [h.AriaLabel(props.ariaLabel)]),
          h.DataAttribute('slot', 'hover-card-trigger'),
          h.Class(cn(props.triggerClass)),
        ],
        [props.trigger],
      ),
      h.div(
        [
          h.Id(panelId),
          h.DataAttribute('slot', 'hover-card-content'),
          h.DataAttribute('closed', String(!props.model.isOpen)),
          h.AriaHidden(!props.model.isOpen),
          h.Hidden(!props.model.isOpen),
          h.OnFocus(enter),
          h.OnBlur(leave),
          h.Class(
            cn(
              CONTENT_CLASS,
              positionClass(props.side ?? 'bottom', props.align ?? 'center'),
              props.class,
            ),
          ),
        ],
        [props.content],
      ),
    ],
  );
};

const styles = stylex.create({
  base: { display: 'inline-flex', position: 'relative' },
  bottom: { marginTop: '0.5rem', top: '100%' },
  left: { marginRight: '0.5rem', right: '100%' },
  right: { left: '100%', marginLeft: '0.5rem' },
  top: { bottom: '100%', marginBottom: '0.5rem' },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

import { Effect, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'

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

const CONTENT_CLASS = overlayStyles.panel

export type HoverCardSide = 'top' | 'right' | 'bottom' | 'left';
export type HoverCardAlign = 'start' | 'center' | 'end';

const positionClass = (
  side: HoverCardSide,
  _align: HoverCardAlign,
): StaticStyles => styles[side]

export type HoverCardProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  trigger: Html | string;
  content: Html | string;
  align?: HoverCardAlign;
  side?: HoverCardSide;
  isDisabled?: boolean;
  ariaLabel?: string;
  triggerLayoutStyle?: ComponentLayoutStyle;
  layoutStyle?: ComponentLayoutStyle;
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
      h.Class(className(styles.base)),
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
          h.Class(cn(props.triggerLayoutStyle)),
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
              props.layoutStyle,
            ),
          ),
        ],
        [props.content],
      ),
    ],
  );
};


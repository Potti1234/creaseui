const styles = stylex.create({
  action: {
    alignItems: 'center',
    backgroundColor: { default: tokens.transparent, ':hover': tokens.secondary },
    borderColor: tokens.border,
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.875rem',
    fontWeight: 500,
    height: '2rem',
    justifyContent: 'center',
    paddingInline: '0.75rem',
  },
  body: { display: 'grid', flexGrow: 1, gap: '0.25rem' },
  description: { color: tokens.mutedForeground, fontSize: '0.875rem' },
  dismiss: {
    backgroundColor: tokens.transparent,
    borderColor: tokens.transparent,
    borderRadius: tokens.controlRadius,
    color: { default: tokens.mutedForeground, ':hover': tokens.foreground },
    opacity: { default: 0.7, ':focus': 1 },
    padding: '0.25rem',
    position: 'absolute',
    right: '0.5rem',
    top: '0.5rem',
  },
  title: { fontSize: '0.875rem', fontWeight: 600 },
  toast: {
    alignItems: 'flex-start',
    backgroundColor: tokens.background,
    borderColor: tokens.border,
    borderRadius: tokens.radius,
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: tokens.shadowCard,
    color: tokens.foreground,
    display: 'flex',
    gap: '0.75rem',
    overflow: 'hidden',
    padding: '1rem',
    paddingRight: '2rem',
    pointerEvents: 'auto',
    position: 'relative',
    width: '100%',
  },
  viewport: {
    bottom: 0,
    display: 'flex',
    flexDirection: {
      default: 'column-reverse',
      '@media (min-width: 640px)': 'column',
    },
    gap: '0.5rem',
    maxHeight: '100vh',
    padding: '1rem',
    pointerEvents: 'none',
    position: 'fixed',
    right: 0,
    maxWidth: {
      default: '100%',
      '@media (min-width: 640px)': '26.25rem',
    },
    width: {
      default: '100%',
      '@media (min-width: 640px)': 'auto',
    },
    zIndex: 100,
  },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

import { Duration, Effect, Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import * as Icon from '@/lib/icon';
import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import type { ComponentLayoutStyle } from './contracts'
import { overlayStyles } from './overlay-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'

export const ToastPayload = S.Struct({
  title: S.String,
  description: S.optional(S.String),
  actionLabel: S.optional(S.String),
});
export type ToastPayload = typeof ToastPayload.Type;
export const Variant = S.Literals(['Success', 'Error', 'Warning', 'Info']);
export type Variant = typeof Variant.Type;
export const Entry = S.Struct({
  id: S.String,
  payload: ToastPayload,
  variant: Variant,
  sticky: S.Boolean,
  durationMs: S.Number,
});
export type Entry = typeof Entry.Type;
export const Model = S.Struct({
  id: S.String,
  nextId: S.Number,
  entries: S.Array(Entry),
});
export type Model = typeof Model.Type;

export const Dismissed = m('Dismissed', { id: S.String });
export const CompletedWaitBeforeDismissingSonner = m(
  'CompletedWaitBeforeDismissingSonner',
  { id: S.String },
);
export const Message = S.Union([
  Dismissed,
  CompletedWaitBeforeDismissingSonner,
]);
export type Message = typeof Message.Type;
export const DismissedToast = m('DismissedToast', { entry: Entry });
export const OutMessage = S.Union([DismissedToast]);
export type OutMessage = typeof OutMessage.Type;

export const init = (config: Readonly<{ id: string }>): Model => ({
  id: config.id,
  nextId: 0,
  entries: [],
});

const WaitBeforeDismissing = Command.define('WaitBeforeDismissingSonner', {
  args: { id: S.String, durationMs: S.Number },
  messages: [CompletedWaitBeforeDismissingSonner],
  execute: ({ id, durationMs }) =>
    Effect.sleep(`${durationMs} millis`).pipe(
      Effect.as(CompletedWaitBeforeDismissingSonner({ id })),
    ),
});
type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
  Option.Option<OutMessage>,
];

const remove = (model: Model, id: string): UpdateReturn => {
  const entry = model.entries.find((candidate) => candidate.id === id);
  return [
    {
      ...model,
      entries: model.entries.filter((candidate) => candidate.id !== id),
    },
    [],
    entry === undefined
      ? Option.none()
      : Option.some(DismissedToast({ entry })),
  ];
};

export const update = (model: Model, message: Message): UpdateReturn =>
  remove(model, message.id);

export type ToastInput = Readonly<{
  title: string;
  description?: string;
  actionLabel?: string;
  duration?: Duration.Input;
  sticky?: boolean;
}>;
export type ShowInput = ToastInput & Readonly<{ variant: Variant }>;

const toastInput = (variant: Variant, input: ToastInput): ShowInput => ({
  ...input,
  variant,
});
export const success = (input: ToastInput): ShowInput =>
  toastInput('Success', input);
export const error = (input: ToastInput): ShowInput =>
  toastInput('Error', input);
export const info = (input: ToastInput): ShowInput => toastInput('Info', input);
export const warning = (input: ToastInput): ShowInput =>
  toastInput('Warning', input);

export const show = (model: Model, input: ShowInput): UpdateReturn => {
  const id = `${model.id}-${model.nextId}`;
  const durationMs = Math.max(
    0,
    Duration.toMillis(input.duration ?? '4 seconds'),
  );
  const entry: Entry = {
    id,
    payload: {
      title: input.title,
      ...(input.description === undefined
        ? {}
        : { description: input.description }),
      ...(input.actionLabel === undefined
        ? {}
        : { actionLabel: input.actionLabel }),
    },
    variant: input.variant,
    sticky: input.sticky ?? false,
    durationMs,
  };
  return [
    { ...model, nextId: model.nextId + 1, entries: [...model.entries, entry] },
    entry.sticky ? [] : [WaitBeforeDismissing({ id, durationMs })],
    Option.none(),
  ];
};

export const dismiss = (model: Model, id: string): UpdateReturn =>
  remove(model, id);
export const dismissAll = (model: Model): UpdateReturn => [
  { ...model, entries: [] },
  [],
  Option.none(),
];
export const Added = Entry;

const variantIcon = <Msg>(variant: Variant, h: HtmlBuilder<Msg>): Html => {
  const config = { class: className(overlayStyles.icon) };
  switch (variant) {
    case 'Success':
      return Icon.circleCheck<Msg>(config, h);
    case 'Error':
      return Icon.octagonX<Msg>(config, h);
    case 'Warning':
      return Icon.triangleAlert<Msg>(config, h);
    case 'Info':
      return Icon.info<Msg>(config, h);
  }
};

export type SonnerProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  actionToMessage?: (entry: Entry) => Msg;
  ariaLabel?: string;
  layoutStyle?: ComponentLayoutStyle;
  entryLayoutStyle?: ComponentLayoutStyle;
}>;

export const sonner = <Msg>(
  props: SonnerProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.section(
    [
      h.AriaLabel(props.ariaLabel ?? 'Notifications'),
      h.AriaLive('polite'),
      h.DataAttribute('slot', 'sonner'),
      h.Class(
        cn(
          styles.viewport,
          props.layoutStyle,
        ),
      ),
    ],
    props.model.entries.map((entry) =>
      h.article(
        [
          h.Key(entry.id),
          h.Role(entry.variant === 'Error' ? 'alert' : 'status'),
          h.DataAttribute('slot', 'sonner-toast'),
          h.Class(
            cn(
              styles.toast,
              props.entryLayoutStyle,
            ),
          ),
        ],
        [
          variantIcon<Msg>(entry.variant, h),
          h.div(
            [h.Class(className(styles.body))],
            [
              h.div([h.Class(className(styles.title))], [entry.payload.title]),
              ...(entry.payload.description === undefined
                ? []
                : [
                    h.div(
                      [h.Class(className(styles.description))],
                      [entry.payload.description],
                    ),
                  ]),
            ],
          ),
          ...(entry.payload.actionLabel === undefined
            ? []
            : [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick(
                      props.actionToMessage?.(entry) ??
                        props.toParentMessage(Dismissed({ id: entry.id })),
                    ),
                    h.Class(className(styles.action)),
                  ],
                  [entry.payload.actionLabel],
                ),
              ]),
          h.button(
            [
              h.Type('button'),
              h.AriaLabel('Dismiss notification'),
              h.OnClick(props.toParentMessage(Dismissed({ id: entry.id }))),
              h.Class(className(styles.dismiss)),
            ],
            [Icon.x<Msg>({ class: className(overlayStyles.icon) }, h)],
          ),
        ],
      ),
    ),
  );
};


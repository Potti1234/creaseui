import { Duration, Effect, Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import * as Icon from '@/lib/icon';
import { cn } from '@/lib/utils';

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
  const config = { class: 'mt-0.5 size-4 shrink-0' };
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
  class?: string;
  entryClass?: string;
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
          'pointer-events-none fixed right-0 bottom-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:w-auto sm:max-w-[420px] sm:flex-col',
          props.class,
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
              'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border bg-popover p-4 pr-8 text-popover-foreground shadow-lg',
              props.entryClass,
            ),
          ),
        ],
        [
          variantIcon<Msg>(entry.variant, h),
          h.div(
            [h.Class('grid flex-1 gap-1')],
            [
              h.div([h.Class('text-sm font-semibold')], [entry.payload.title]),
              ...(entry.payload.description === undefined
                ? []
                : [
                    h.div(
                      [h.Class('text-sm text-muted-foreground')],
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
                    h.Class(
                      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring',
                    ),
                  ],
                  [entry.payload.actionLabel],
                ),
              ]),
          h.button(
            [
              h.Type('button'),
              h.AriaLabel('Dismiss notification'),
              h.OnClick(props.toParentMessage(Dismissed({ id: entry.id }))),
              h.Class(
                'absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 group-hover:opacity-100',
              ),
            ],
            [Icon.x<Msg>({ class: 'size-4' }, h)],
          ),
        ],
      ),
    ),
  );
};

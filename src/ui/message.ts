import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from '@/lib/utils';

type ChildrenProps = Readonly<{
  children: ReadonlyArray<Html | string>;
  class?: string;
}>;

const part = <Msg>(
  slot: string,
  base: string,
  props: ChildrenProps,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [h.DataAttribute('slot', slot), h.Class(cn(base, props.class))],
    [...props.children],
  );
};

export const messageGroup = <Msg>(
  props: ChildrenProps,
  h: HtmlBuilder<Msg>,
): Html => part<Msg>('message-group', 'flex min-w-0 flex-col gap-2', props, h);

export const message = <Msg>(
  props: ChildrenProps & Readonly<{ align?: 'start' | 'end' }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const align = props.align ?? 'start';
  return h.div(
    [
      h.DataAttribute('slot', 'message'),
      h.DataAttribute('align', align),
      h.Class(
        cn(
          'group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export const messageAvatar = <Msg>(
  props: ChildrenProps,
  h: HtmlBuilder<Msg>,
): Html =>
  part<Msg>(
    'message-avatar',
    'flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8',
    props,
    h,
  );
export const messageContent = <Msg>(
  props: ChildrenProps,
  h: HtmlBuilder<Msg>,
): Html =>
  part<Msg>(
    'message-content',
    'flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end',
    props,
    h,
  );
export const messageHeader = <Msg>(
  props: ChildrenProps,
  h: HtmlBuilder<Msg>,
): Html =>
  part<Msg>(
    'message-header',
    'flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0',
    props,
    h,
  );
export const messageFooter = <Msg>(
  props: ChildrenProps,
  h: HtmlBuilder<Msg>,
): Html =>
  part<Msg>(
    'message-footer',
    'flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end',
    props,
    h,
  );

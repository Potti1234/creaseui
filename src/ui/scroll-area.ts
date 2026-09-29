import type { Html, HtmlBuilder } from 'foldkit/html';

import * as ScrollAreaBehavior from '@/lib/scroll-area';
import { cn } from '@/lib/utils';

export const Model = ScrollAreaBehavior.Model;
export type Model = ScrollAreaBehavior.Model;
export const Message = ScrollAreaBehavior.Message;
export type Message = ScrollAreaBehavior.Message;
export const init = ScrollAreaBehavior.init;
export const update = ScrollAreaBehavior.update;

export type ScrollAreaProps = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
  orientation?: 'vertical' | 'horizontal' | 'both';
  direction?: 'ltr' | 'rtl';
  ariaLabel?: string;
  tabIndex?: number;
  model?: Model;
}>;

export const scrollArea = <Msg>(
  props: ScrollAreaProps &
    Readonly<{
      toParentMessage?: (message: Message) => Msg;
    }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const orientation = props.orientation ?? 'both';
  // Base UI keeps the viewport out of the tab order until overflow is
  // measured on either axis. An unwired scrollArea stays tabbable
  // (historical creaseui default); a wired model reflects the real
  // measurement — both flags false is the pre-measurement state → -1.
  const tabIndex =
    props.tabIndex ??
    (props.model === undefined ||
    props.model.hasOverflowX ||
    props.model.hasOverflowY
      ? 0
      : -1);

  return h.div(
    [
      h.DataAttribute('slot', 'scroll-area'),
      h.DataAttribute('orientation', orientation),
      ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
      ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]),
      h.Tabindex(tabIndex),
      ...(props.toParentMessage === undefined
        ? []
        : [h.OnMount(ScrollAreaBehavior.overflowMount(props.toParentMessage))]),
      h.Class(
        cn(
          'relative size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:size-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent',
          orientation === 'vertical'
            ? 'overflow-y-auto overflow-x-hidden'
            : orientation === 'horizontal'
              ? 'overflow-x-auto overflow-y-hidden'
              : 'overflow-auto',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

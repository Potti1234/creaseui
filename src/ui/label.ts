import { type Html, type HtmlBuilder } from 'foldkit/html';

import { cn } from '@/lib/utils';

export type LabelProps = Readonly<{
  for?: string;
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export const label = <Msg>(props: LabelProps, h: HtmlBuilder<Msg>): Html => {
  return h.label(
    [
      h.DataAttribute('slot', 'label'),
      ...(props.for === undefined ? [] : [h.For(props.for)]),
      h.Class(
        cn(
          'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

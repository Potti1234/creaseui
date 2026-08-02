import { type Html, type HtmlBuilder } from 'foldkit/html';

import { cn } from '@/lib/utils';

export type ProgressProps = Readonly<{
  /** `null` renders an indeterminate progress indicator. */
  value: number | null;
  class?: string;
}>;

export const progress = <Msg>(
  props: ProgressProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const value =
    props.value === null ? null : Math.min(100, Math.max(0, props.value));

  return h.div(
    [
      h.Role('progressbar'),
      h.AriaValuemin(0),
      h.AriaValuemax(100),
      ...(value === null ? [] : [h.AriaValuenow(value)]),
      h.DataAttribute(
        'state',
        value === null ? 'indeterminate' : 'determinate',
      ),
      h.DataAttribute('slot', 'progress'),
      h.Class(
        cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
          props.class,
        ),
      ),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'progress-indicator'),
          h.Class('h-full w-full flex-1 bg-primary transition-all'),
          h.Style({
            transform:
              value === null
                ? 'translateX(-60%)'
                : `translateX(-${100 - value}%)`,
          }),
          ...(value === null
            ? [
                h.Class(
                  'animate-[progress-indeterminate_1.5s_ease-in-out_infinite]',
                ),
              ]
            : []),
        ],
        [],
      ),
    ],
  );
};

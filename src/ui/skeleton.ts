import { type Html, type HtmlBuilder } from 'foldkit/html';

import { cn } from '@/lib/utils';

export type SkeletonProps = Readonly<{
  class?: string;
}>;

export const skeleton = <Msg>(
  props: SkeletonProps = {},
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'skeleton'),
      h.Class(cn('animate-pulse rounded-md bg-accent', props.class)),
    ],
    [],
  );
};

import { type VariantProps, cva } from 'class-variance-authority';
import { type Html, type HtmlBuilder } from 'foldkit/html';

import { cn } from '@/lib/utils';

type SlotProps = Readonly<{
  children: ReadonlyArray<Html | string>;
  class?: string;
}>;

const slotDiv =
  (slot: string, baseClass: string) =>
  <Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html => {
    return h.div(
      [h.DataAttribute('slot', slot), h.Class(cn(baseClass, props.class))],
      [...props.children],
    );
  };

export const itemVariants = cva(
  'group/item flex flex-wrap items-center rounded-md border border-transparent text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-accent/50',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border-border',
        muted: 'bg-muted/50',
      },
      size: {
        default: 'gap-3 p-3',
        sm: 'gap-2.5 px-3 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ItemVariants = VariantProps<typeof itemVariants>;

export type ItemProps = SlotProps &
  Readonly<{
    variant?: ItemVariants['variant'];
    size?: ItemVariants['size'];
  }>;

export const item = <Msg>(props: ItemProps, h: HtmlBuilder<Msg>): Html => {
  const variant = props.variant ?? 'default';
  const size = props.size ?? 'default';

  return h.div(
    [
      h.DataAttribute('slot', 'item'),
      h.DataAttribute('variant', variant),
      h.DataAttribute('size', size),
      h.Class(cn(itemVariants({ variant, size }), props.class)),
    ],
    [...props.children],
  );
};

export const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "size-8 rounded-sm border bg-muted [&_svg:not([class*='size-'])]:size-4",
        image:
          'size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type ItemMediaVariants = VariantProps<typeof itemMediaVariants>;

export type ItemMediaProps = SlotProps &
  Readonly<{
    variant?: ItemMediaVariants['variant'];
  }>;

export const itemMedia = <Msg>(
  props: ItemMediaProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const variant = props.variant ?? 'default';

  return h.div(
    [
      h.DataAttribute('slot', 'item-media'),
      h.DataAttribute('variant', variant),
      h.Class(cn(itemMediaVariants({ variant }), props.class)),
    ],
    [...props.children],
  );
};

export const itemContent = slotDiv(
  'item-content',
  'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none',
);

export const itemTitle = slotDiv(
  'item-title',
  'flex w-fit items-center gap-2 text-sm leading-snug font-medium',
);

export const itemDescription = <Msg>(
  props: SlotProps,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.p(
    [
      h.DataAttribute('slot', 'item-description'),
      h.Class(
        cn(
          'line-clamp-2 text-sm leading-normal font-normal text-balance text-muted-foreground',
          '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export const itemActions = slotDiv('item-actions', 'flex items-center gap-2');

export const itemHeader = slotDiv(
  'item-header',
  'flex basis-full items-center justify-between gap-2',
);

export const itemFooter = slotDiv(
  'item-footer',
  'flex basis-full items-center justify-between gap-2',
);

export const itemGroup = <Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html => {
  return h.div(
    [
      h.Role('list'),
      h.DataAttribute('slot', 'item-group'),
      h.Class(cn('group/item-group flex flex-col', props.class)),
    ],
    [...props.children],
  );
};

export type ItemSeparatorProps = Readonly<{
  class?: string;
}>;

export const itemSeparator = <Msg>(
  props: ItemSeparatorProps = {},
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.Role('none'),
      h.DataAttribute('slot', 'item-separator'),
      h.DataAttribute('orientation', 'horizontal'),
      h.Class(
        cn(
          'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
          'my-0',
          props.class,
        ),
      ),
    ],
    [],
  );
};

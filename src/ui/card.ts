import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from '@/lib/utils';

/* Ported from shadcn/ui card.tsx. Class strings copied verbatim, including the
   data-slot attributes shadcn uses for structural selectors
   (has-data-[slot=card-action]). Card has no behavior, so there is no foldkit
   UI primitive underneath — these are plain view functions. */

type Slot = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export type CardProps = Slot &
  Readonly<{
    element?: 'div' | 'section' | 'article';
  }>;

const slotDiv =
  (slot: string, baseClass: string) =>
  <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html => {
    return h.div(
      [h.DataAttribute('slot', slot), h.Class(cn(baseClass, props.class))],
      [...props.children],
    );
  };

export const card = <Msg>(props: CardProps, h: HtmlBuilder<Msg>): Html => {
  const attributes = [
    h.DataAttribute('slot', 'card'),
    h.Class(
      cn(
        'bg-card text-card-foreground flex flex-col gap-4 rounded-xl border py-4 shadow-sm',
        props.class,
      ),
    ),
  ];
  const children = [...props.children];

  switch (props.element ?? 'div') {
    case 'section':
      return h.section(attributes, children);
    case 'article':
      return h.article(attributes, children);
    default:
      return h.div(attributes, children);
  }
};

export const cardHeader = slotDiv(
  'card-header',
  '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4',
);

export type CardTitleProps = Slot & Readonly<{ element?: 'h2' | 'h3' | 'h4' }>;
export const cardTitle = <Msg>(props: CardTitleProps, h: HtmlBuilder<Msg>): Html => {
  const attributes = [h.DataAttribute('slot', 'card-title'), h.Class(cn('leading-none font-semibold', props.class))];
  switch (props.element ?? 'h3') {
    case 'h2': return h.h2(attributes, [...props.children]);
    case 'h4': return h.h4(attributes, [...props.children]);
    default: return h.h3(attributes, [...props.children]);
  }
};

export const cardDescription = slotDiv(
  'card-description',
  'text-muted-foreground text-sm',
);

export const cardAction = slotDiv(
  'card-action',
  'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
);

export const cardContent = slotDiv('card-content', 'px-4');

export const cardFooter = slotDiv(
  'card-footer',
  'flex items-center px-4 [.border-t]:pt-4',
);

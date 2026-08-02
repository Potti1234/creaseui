import { type Html, type HtmlBuilder } from 'foldkit/html';

import { cn } from '@/lib/utils';

type SlotProps = Readonly<{
  children: ReadonlyArray<Html | string>;
  class?: string;
}>;

export const table = <Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'table-container'),
      h.Class('relative w-full overflow-x-auto'),
    ],
    [
      h.table(
        [
          h.DataAttribute('slot', 'table'),
          h.Class(cn('w-full caption-bottom text-sm', props.class)),
        ],
        [...props.children],
      ),
    ],
  );
};

const tablePart =
  (
    element: 'thead' | 'tbody' | 'tfoot' | 'tr' | 'th' | 'td' | 'caption',
    slot: string,
    baseClass: string,
  ) =>
  <Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html => {
    const attributes = [
      h.DataAttribute('slot', slot),
      h.Class(cn(baseClass, props.class)),
    ];

    switch (element) {
      case 'thead':
        return h.thead(attributes, [...props.children]);
      case 'tbody':
        return h.tbody(attributes, [...props.children]);
      case 'tfoot':
        return h.tfoot(attributes, [...props.children]);
      case 'tr':
        return h.tr(attributes, [...props.children]);
      case 'th':
        return h.th(attributes, [...props.children]);
      case 'td':
        return h.td(attributes, [...props.children]);
      case 'caption':
        return h.caption(attributes, [...props.children]);
    }
  };

export const tableHeader = tablePart(
  'thead',
  'table-header',
  '[&_tr]:border-b',
);

export const tableBody = tablePart(
  'tbody',
  'table-body',
  '[&_tr:last-child]:border-0',
);

export const tableFooter = tablePart(
  'tfoot',
  'table-footer',
  'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
);

export const tableRow = tablePart(
  'tr',
  'table-row',
  'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[selected]:bg-muted',
);

export const tableHead = tablePart(
  'th',
  'table-head',
  'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
);

export const tableCell = tablePart(
  'td',
  'table-cell',
  'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
);

export const tableCaption = tablePart(
  'caption',
  'table-caption',
  'mt-4 text-sm text-muted-foreground',
);

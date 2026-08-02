import { type Html, type HtmlBuilder } from 'foldkit/html';

import { SIDEBAR_BLOCK_IDS } from '@/route';

/* /blocks/sidebar — index of all sidebar blocks, mirroring
   ui.shadcn.com/blocks/sidebar: each block previewed in a framed, same-origin
   iframe pointing at its full-page route, with a title row above. */

const BLOCK_DESCRIPTIONS: Readonly<Record<string, string>> = {
  '01': 'A simple sidebar with navigation grouped by section.',
  '02': 'A sidebar with collapsible sections.',
  '03': 'A sidebar with submenus.',
  '04': 'A floating sidebar with submenus.',
  '05': 'A sidebar with collapsible submenus.',
  '06': 'A sidebar with submenus as dropdowns.',
  '07': 'A sidebar that collapses to icons.',
  '08': 'An inset sidebar with secondary navigation.',
  '09': 'Collapsible nested sidebars.',
  '10': 'A sidebar in a popover.',
  '11': 'A sidebar with a collapsible file tree.',
  '12': 'A sidebar with a calendar.',
  '13': 'A sidebar in a dialog.',
  '14': 'A sidebar on the right.',
  '15': 'A left and right sidebar.',
  '16': 'A sidebar with a sticky site header.',
};

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => {
  return h.div(
    [
      h.Class(
        'mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8',
      ),
    ],
    [
      h.div(
        [h.Class('flex flex-col items-start gap-4')],
        [
          h.h1(
            [
              h.Class(
                'leading-tighter max-w-3xl text-3xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] xl:text-5xl xl:tracking-tighter',
              ),
            ],
            ['Sidebar Blocks'],
          ),
          h.p(
            [
              h.Class(
                'max-w-4xl text-base text-balance text-foreground sm:text-lg',
              ),
            ],
            [
              'The shadcn/ui sidebar blocks rebuilt on foldkit. Each preview is the real page — click Open to view it full screen.',
            ],
          ),
        ],
      ),
      ...SIDEBAR_BLOCK_IDS.map((id) =>
        h.div(
          [h.Class('flex flex-col gap-3')],
          [
            h.div(
              [h.Class('flex items-center justify-between gap-4')],
              [
                h.div(
                  [h.Class('flex flex-col gap-0.5')],
                  [
                    h.h2([h.Class('text-sm font-medium')], [`sidebar-${id}`]),
                    h.p(
                      [h.Class('text-sm text-muted-foreground')],
                      [BLOCK_DESCRIPTIONS[id] ?? ''],
                    ),
                  ],
                ),
                h.a(
                  [
                    h.Href(`/blocks/sidebar/${id}`),
                    h.Class(
                      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-xs transition-all hover:bg-accent hover:text-accent-foreground',
                    ),
                  ],
                  ['Open'],
                ),
              ],
            ),
            h.iframe(
              [
                h.Src(`/blocks/sidebar/${id}`),
                h.Attribute('loading', 'lazy'),
                h.Class(
                  'h-[800px] w-full rounded-xl border bg-background shadow-sm',
                ),
              ],
              [],
            ),
          ],
        ),
      ),
    ],
  );
};

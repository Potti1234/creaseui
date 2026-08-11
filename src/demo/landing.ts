import { Match as M, Schema as S } from 'effect';
import type { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { evo } from 'foldkit/struct';

import * as Chart from '@/lib/echarts';
import * as Icon from '@/lib/icon';
import { chartsPath, createPath } from '@/route';
import { badge } from '@/ui/badge';
import { button } from '@/ui/button';
import {
  card,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
} from '@/ui/card';
import { input } from '@/ui/input';
import { kbd } from '@/ui/kbd';
import { separator } from '@/ui/separator';

/* The crease/ui landing page (route: /). Copy and structure follow
   brand/LANDING.md. Interactive bits: the before/after comparison slider;
   everything else is static or a standalone chart. */

// MODEL

export const Model = S.Struct({
  comparePercent: S.Number,
});
export type Model = typeof Model.Type;

// MESSAGE

export const DraggedCompare = m('DraggedCompare', { value: S.Number });
export const ChangedDemoEmail = m('ChangedDemoEmail');
export const GotChartMessage = m('GotChartMessage', {
  message: Chart.ChartMessage,
});

export const Message = S.Union([
  DraggedCompare,
  ChangedDemoEmail,
  GotChartMessage,
]);
export type Message = typeof Message.Type;

// INIT

export const init = (): Model => ({ comparePercent: 50 });

// UPDATE

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      DraggedCompare: ({ value }) => [
        evo(model, { comparePercent: () => value }),
        [],
      ],
      ChangedDemoEmail: () => [model, []],
      GotChartMessage: () => [model, []],
    }),
  );

// HERO CHART — standalone ECharts card in the collage

const HERO_CHART_ID = 'landing-hero-chart';
const HERO_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const HERO_DATA = [186, 305, 237, 173, 209, 274];

Chart.registerChart(HERO_CHART_ID, (theme) => ({
  grid: Chart.compactGrid({ bottom: 4, top: 8 }),
  xAxis: { ...Chart.categoryAxis(theme, HERO_MONTHS), show: false },
  yAxis: { ...Chart.valueAxis(theme), show: false },
  tooltip: Chart.shadcnTooltip(theme),
  series: [
    {
      name: 'Revenue',
      type: 'line',
      smooth: 0.4,
      showSymbol: false,
      lineStyle: { width: 2, color: theme.chart1 },
      itemStyle: { color: theme.chart1 },
      areaStyle: { color: Chart.areaGradient(theme.chart1) },
      data: [...HERO_DATA],
    },
  ],
}));

// VIEW HELPERS

const toChart = (message: Chart.ChartMessage): Message =>
  GotChartMessage({ message });

const sectionHeading = (
  title: string,
  copy: string,
  h: HtmlBuilder<Message>,
): Html => {
  return h.div(
    [h.Class('flex max-w-2xl flex-col gap-3')],
    [
      h.h2(
        [
          h.Class(
            'text-2xl font-semibold tracking-tight text-balance sm:text-3xl',
          ),
        ],
        [title],
      ),
      h.p([h.Class('text-muted-foreground text-balance')], [copy]),
    ],
  );
};

const heroCollage = (h: HtmlBuilder<Message>): Html => {
  return h.div(
    [h.Class('grid w-full max-w-xl gap-4')],
    [
      card(
        {
          class: 'gap-3',
          children: [
            cardHeader(
              {
                children: [
                  cardTitle({ children: ['Revenue'] }, h),
                  cardDescription(
                    { children: ['+18.2% from last quarter'] },
                    h,
                  ),
                ],
              },
              h,
            ),
            cardContent(
              {
                children: [
                  Chart.chart(
                    {
                      hostId: HERO_CHART_ID,
                      ariaLabel: 'Revenue trend for the last 6 months',
                      toMessage: toChart,
                      class: 'h-32 w-full',
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
          ],
        },
        h,
      ),
      h.div(
        [h.Class('grid grid-cols-[1fr_auto] items-start gap-4')],
        [
          card(
            {
              class: 'gap-3',
              children: [
                cardHeader(
                  {
                    children: [
                      cardTitle({ children: ['Create account'] }, h),
                      cardDescription(
                        {
                          children: ['Same card. Different framework.'],
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                cardContent(
                  {
                    children: [
                      input(
                        {
                          id: 'landing-demo-email',
                          value: '',
                          onInput: () => ChangedDemoEmail(),
                          label: 'Email',
                          placeholder: 'm@example.com',
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                cardFooter(
                  {
                    class: 'justify-end gap-2',
                    children: [
                      button({ variant: 'outline', children: ['Cancel'] }, h),
                      button({ children: ['Continue'] }, h),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          h.div(
            [h.Class('flex flex-col items-start gap-2')],
            [
              badge({ children: ['New'] }, h),
              badge({ variant: 'secondary', children: ['Beta'] }, h),
              badge({ variant: 'outline', children: ['MIT'] }, h),
              badge({ variant: 'destructive', children: ['Deprecated'] }, h),
              h.div(
                [
                  h.Class(
                    'text-muted-foreground mt-2 flex items-center gap-1 text-xs',
                  ),
                ],
                [kbd({ children: ['⌘'] }, h), kbd({ children: ['B'] }, h)],
              ),
            ],
          ),
        ],
      ),
    ],
  );
};

const hero = (h: HtmlBuilder<Message>): Html => {
  return h.section(
    [
      h.Class(
        'mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24',
      ),
    ],
    [
      h.div(
        [h.Class('flex flex-col items-start gap-6')],
        [
          h.div(
            [h.Class('flex items-center gap-3')],
            [
              h.img([
                h.Src('/logo-mark.svg'),
                h.Alt('crease/ui'),
                h.Class('size-9 rounded-md'),
              ]),
              h.span(
                [h.Class('text-lg font-semibold tracking-tight')],
                [
                  'crease',
                  h.span([h.Class('text-[oklch(0.62_0.15_145)]')], ['/']),
                  'ui',
                ],
              ),
            ],
          ),
          h.h1(
            [
              h.Class(
                'text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl',
              ),
            ],
            ['Beautiful components for foldkit.'],
          ),
          h.p(
            [h.Class('text-muted-foreground max-w-md text-lg text-balance')],
            [
              'The shadcn/ui design language, rebuilt on foldkit UI. Copy the code, own the code, ship.',
            ],
          ),
          h.div(
            [h.Class('flex flex-wrap items-center gap-3')],
            [
              h.a(
                [h.Href(createPath())],
                [button({ children: ['Get Started'] }, h)],
              ),
              h.a(
                [h.Href(chartsPath('area'))],
                [
                  button(
                    { variant: 'outline', children: ['Browse Components'] },
                    h,
                  ),
                ],
              ),
            ],
          ),
          h.p(
            [h.Class('text-muted-foreground text-xs')],
            [
              'MIT licensed · Built on foldkit UI · Works with any shadcn theme',
            ],
          ),
        ],
      ),
      heroCollage(h),
    ],
  );
};

const comparisonSlider = (model: Model, h: HtmlBuilder<Message>): Html => {
  const percent = Math.min(100, Math.max(0, model.comparePercent));

  return h.section(
    [
      h.Class(
        'mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-16 md:px-8',
      ),
    ],
    [
      sectionHeading(
        'Spot the difference.',
        'We rebuilt the ui.shadcn.com/create preview board — all 33 cards — on foldkit. Every card within a few pixels of the original. Drag to compare.',
        h,
      ),
      h.div(
        [
          h.Class(
            'relative w-full cursor-ew-resize touch-none overflow-hidden rounded-xl border shadow-sm select-none',
          ),
        ],
        [
          h.img([
            h.Src('/comparison/shadcn-board.png'),
            h.Alt('The original shadcn/ui create board'),
            h.Class('block w-full'),
          ]),
          h.div(
            [
              h.Class('absolute inset-0'),
              h.Style({
                'clip-path': `inset(0 ${100 - percent}% 0 0)`,
              }),
            ],
            [
              h.img([
                h.Src('/comparison/foldkit-board.png'),
                h.Alt('The same board rebuilt with crease/ui on foldkit'),
                h.Class('block w-full'),
              ]),
            ],
          ),
          h.div(
            [
              h.Class(
                'bg-foreground/60 pointer-events-none absolute inset-y-0 w-px',
              ),
              h.Style({ left: `${percent}%` }),
            ],
            [],
          ),
          h.span(
            [
              h.Class(
                'bg-background/90 text-foreground pointer-events-none absolute top-3 left-3 rounded-md border px-2 py-1 text-xs font-medium',
              ),
            ],
            ['crease/ui (foldkit)'],
          ),
          h.span(
            [
              h.Class(
                'bg-background/90 text-foreground pointer-events-none absolute top-3 right-3 rounded-md border px-2 py-1 text-xs font-medium',
              ),
            ],
            ['shadcn/ui (React)'],
          ),
          h.input([
            h.Type('range'),
            h.Min('0'),
            h.Max('100'),
            h.Value(String(percent)),
            h.OnInput((value) => DraggedCompare({ value: Number(value) || 0 })),
            h.AriaLabel('Comparison slider between crease/ui and shadcn/ui'),
            h.Class(
              'absolute inset-0 h-full w-full cursor-ew-resize opacity-0',
            ),
          ]),
        ],
      ),
    ],
  );
};

const howItWorks = (h: HtmlBuilder<Message>): Html => {
  const layer = (name: string, role: string): Html =>
    h.div(
      [h.Class('flex flex-col gap-1 rounded-xl border p-4')],
      [
        h.span([h.Class('text-sm font-semibold')], [name]),
        h.span([h.Class('text-muted-foreground text-sm')], [role]),
      ],
    );

  return h.section(
    [h.Class('bg-muted/40 border-y')],
    [
      h.div(
        [
          h.Class(
            'mx-auto grid w-full max-w-[1200px] items-start gap-10 px-4 py-16 md:grid-cols-2 md:px-8',
          ),
        ],
        [
          h.div(
            [h.Class('flex flex-col gap-6')],
            [
              sectionHeading(
                'Three layers, no magic.',
                'foldkit UI provides behavior and accessibility. crease/ui is the styled layer you copy into your project. Your app owns all of it.',
                h,
              ),
              h.div(
                [h.Class('grid gap-2')],
                [
                  layer(
                    'foldkit UI',
                    'Headless primitives — behavior, ARIA, focus.',
                  ),
                  layer(
                    'crease/ui',
                    'The visible layer — class strings you already know.',
                  ),
                  layer(
                    'Your app',
                    'Model, update, view. No hidden state anywhere.',
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col gap-4')],
            [
              h.div(
                [
                  h.Class(
                    'bg-background flex flex-col gap-3 rounded-xl border p-4 shadow-sm',
                  ),
                ],
                [
                  h.div(
                    [h.Class('flex items-center justify-between gap-2')],
                    [
                      h.code(
                        [h.Class('font-mono text-sm')],
                        ['npx shadcn add @crease/button'],
                      ),
                      badge(
                        {
                          variant: 'secondary',
                          children: ['registry — coming soon'],
                        },
                        h,
                      ),
                    ],
                  ),
                  separator({}, h),
                  h.p(
                    [h.Class('text-muted-foreground text-sm')],
                    [
                      'Today: copy the component file into your project. It is yours — rename it, gut it, extend it.',
                    ],
                  ),
                ],
              ),
              h.ul(
                [h.Class('text-muted-foreground grid gap-2 text-sm')],
                [
                  h.li(
                    [h.Class('flex items-center gap-2')],
                    [
                      Icon.check({ class: 'size-4' }, h),
                      'You own the code — no dependency to babysit.',
                    ],
                  ),
                  h.li(
                    [h.Class('flex items-center gap-2')],
                    [
                      Icon.check({ class: 'size-4' }, h),
                      'shadcn-compatible tokens — your theme drops in.',
                    ],
                  ),
                  h.li(
                    [h.Class('flex items-center gap-2')],
                    [
                      Icon.check({ class: 'size-4' }, h),
                      'Every component is a plain foldkit view function.',
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
};

const numbers = (h: HtmlBuilder<Message>): Html => {
  const stat = (value: string, label: string, href: string): Html =>
    h.a(
      [
        h.Href(href),
        h.Class(
          'hover:bg-muted/50 flex flex-col gap-1 rounded-xl border p-6 transition-colors',
        ),
      ],
      [
        h.span([h.Class('text-3xl font-semibold tracking-tight')], [value]),
        h.span([h.Class('text-muted-foreground text-sm')], [label]),
      ],
    );

  return h.section(
    [
      h.Class(
        'mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-16 md:px-8',
      ),
    ],
    [
      sectionHeading(
        'Every component you expect.',
        'Ported from shadcn/ui with the class strings you already know — plus the whole chart collection rebuilt on Apache ECharts, because Recharts is React-only.',
        h,
      ),
      h.div(
        [h.Class('grid gap-4 sm:grid-cols-3')],
        [
          stat('49', 'components — buttons to dialogs to tables', '/create'),
          stat(
            '70',
            'charts on Apache ECharts, canvas-rendered',
            '/charts/area',
          ),
          stat(
            '16',
            'application blocks — full sidebar shells',
            '/blocks/sidebar',
          ),
        ],
      ),
    ],
  );
};

const honestSection = (model: Model, h: HtmlBuilder<Message>): Html => {
  return h.section(
    [h.Class('bg-muted/40 border-y')],
    [
      h.div(
        [
          h.Class(
            'mx-auto grid w-full max-w-[1200px] items-start gap-10 px-4 py-16 md:grid-cols-2 md:px-8',
          ),
        ],
        [
          h.div(
            [h.Class('flex flex-col gap-6')],
            [
              sectionHeading(
                'No hidden state. Really, none.',
                'foldkit is an Elm-architecture framework: every dialog, dropdown and slider lives in your Model, changes through your update, renders from your view. You wire it explicitly — that is the cost. In exchange: state you can see, replay, and test.',
                h,
              ),
              h.p(
                [h.Class('text-muted-foreground text-sm')],
                ['If that paragraph made you nod, you are home.'],
              ),
            ],
          ),
          h.pre(
            [
              h.Attribute('tabindex', '0'),
              h.Class(
                'bg-background overflow-x-auto rounded-xl border p-4 font-mono text-xs leading-relaxed shadow-sm',
              ),
            ],
            [
              h.code(
                [],
                [
                  [
                    '// the dialog is in YOUR model',
                    "dialog: Dialog.init({ id: 'confirm', isAnimated: true })",
                    '',
                    '// opening it is YOUR update arm',
                    'ClickedDelete: () =>',
                    '  applyDialog(model, Dialog.open(model.dialog))',
                    '',
                    '// rendering it is YOUR view call',
                    'Dialog.dialog({',
                    '  model: model.dialog,',
                    "  title: 'Are you absolutely sure?',",
                    '  footer: slots => [...],',
                    '})',
                  ].join('\n'),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
};

const faq = (h: HtmlBuilder<Message>): Html => {
  const item = (question: string, answer: string): Html =>
    h.div(
      [h.Class('flex flex-col gap-1.5')],
      [
        h.h3([h.Class('text-sm font-semibold')], [question]),
        h.p([h.Class('text-muted-foreground text-sm')], [answer]),
      ],
    );

  return h.section(
    [
      h.Class(
        'mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-16 md:px-8',
      ),
    ],
    [
      sectionHeading('Questions, answered.', '', h),
      h.div(
        [h.Class('grid gap-8 md:grid-cols-2')],
        [
          item(
            'Is this affiliated with shadcn?',
            'No. crease/ui is an independent MIT reimplementation of the design system on foldkit, with gratitude. The name shadcn/ui belongs to its author.',
          ),
          item(
            'Do I need React?',
            'No. No React, no JSX, no virtual-DOM interop. foldkit only.',
          ),
          item(
            'Is it accessible?',
            'Behavior and ARIA come from foldkit UI’s headless primitives; crease/ui adds the styling layer on top.',
          ),
          item(
            'Can I use my shadcn theme?',
            'Yes — crease/ui uses shadcn’s CSS token contract (--background, --primary, --radius and friends), so existing themes drop in unchanged.',
          ),
        ],
      ),
    ],
  );
};

const footer = (h: HtmlBuilder<Message>): Html => {
  return h.footer(
    [h.Class('border-t')],
    [
      h.div(
        [
          h.Class(
            'text-muted-foreground mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm md:px-8',
          ),
        ],
        [
          h.span([], ['crease/ui — the visible layer.']),
          h.div(
            [h.Class('flex items-center gap-4')],
            [
              h.a(
                [
                  h.Href('https://foldkit.dev'),
                  h.Class('hover:text-foreground'),
                ],
                ['foldkit.dev'],
              ),
              h.span([], ['MIT']),
              h.span(
                [],
                ['Credits: shadcn/ui · foldkit UI · Apache ECharts · Lucide'],
              ),
            ],
          ),
        ],
      ),
    ],
  );
};

// VIEW

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  return h.div(
    [],
    [
      hero(h),
      comparisonSlider(model, h),
      howItWorks(h),
      numbers(h),
      honestSection(model, h),
      faq(h),
      footer(h),
    ],
  );
};

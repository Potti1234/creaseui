import { Effect, Match as M, Schema as S } from 'effect';
import type { Runtime} from 'foldkit';
import { Command, Subscription } from 'foldkit';
import type { Document, Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { UrlRequest, load, pushUrl } from 'foldkit/navigation';
import { Url, toString as urlToString } from 'foldkit/url';
import { defineView } from 'foldkit/submodel';
import { evo } from 'foldkit/struct';

import * as BlocksIndexPage from '@/demo/blocks/index-page';
import * as Blocks from '@/demo/blocks/registry';
import * as Board from '@/demo/board';
import * as Landing from '@/demo/landing';
import * as ChartsArea from '@/demo/charts/area';
import * as ChartsBar from '@/demo/charts/bar';
import * as ChartsLine from '@/demo/charts/line';
import * as ChartsPie from '@/demo/charts/pie';
import * as ChartsRadar from '@/demo/charts/radar';
import * as ChartsRadial from '@/demo/charts/radial';
import * as ChartsTooltip from '@/demo/charts/tooltip';
import * as AccordionDocs from '@/docs/components/accordion';
import * as CalendarDocs from '@/docs/components/calendar';
import * as ComponentCatalog from '@/docs/components/catalog';
import * as Icon from '@/lib/icon';
import {
  AppRoute,
  type ChartSection,
  chartsPath,
  isChartSection,
  urlToAppRoute,
} from '@/route';
import { cn } from '@/lib/utils';

// MODEL

export const Model = S.Struct({
  route: AppRoute,
  isDark: S.Boolean,
  board: Board.Model,
  blocks: Blocks.Model,
  landing: Landing.Model,
  chartsArea: ChartsArea.Model,
  chartsBar: ChartsBar.Model,
  chartsLine: ChartsLine.Model,
  chartsPie: ChartsPie.Model,
  chartsRadar: ChartsRadar.Model,
  chartsRadial: ChartsRadial.Model,
  chartsTooltip: ChartsTooltip.Model,
  accordionDocs: AccordionDocs.Model,
  calendarDocs: CalendarDocs.Model,
  catalogDocs: ComponentCatalog.Model,
});
export type Model = typeof Model.Type;

// MESSAGE

export const CompletedNavigateInternal = m('CompletedNavigateInternal');
export const CompletedLoadExternal = m('CompletedLoadExternal');
export const ClickedLink = m('ClickedLink', { request: UrlRequest });
export const ChangedUrl = m('ChangedUrl', { url: Url });
export const ClickedThemeToggle = m('ClickedThemeToggle');
export const CompletedApplyTheme = m('CompletedApplyTheme');
export const GotBoardMessage = m('GotBoardMessage', { message: Board.Message });
export const GotLandingMessage = m('GotLandingMessage', {
  message: Landing.Message,
});
export const GotBlocksMessage = m('GotBlocksMessage', {
  message: Blocks.Message,
});
export const GotChartsAreaMessage = m('GotChartsAreaMessage', {
  message: ChartsArea.Message,
});
export const GotChartsBarMessage = m('GotChartsBarMessage', {
  message: ChartsBar.Message,
});
export const GotChartsLineMessage = m('GotChartsLineMessage', {
  message: ChartsLine.Message,
});
export const GotChartsPieMessage = m('GotChartsPieMessage', {
  message: ChartsPie.Message,
});
export const GotChartsRadarMessage = m('GotChartsRadarMessage', {
  message: ChartsRadar.Message,
});
export const GotChartsRadialMessage = m('GotChartsRadialMessage', {
  message: ChartsRadial.Message,
});
export const GotChartsTooltipMessage = m('GotChartsTooltipMessage', {
  message: ChartsTooltip.Message,
});
export const GotAccordionDocsMessage = m('GotAccordionDocsMessage', {
  message: AccordionDocs.Message,
});
export const GotCalendarDocsMessage = m('GotCalendarDocsMessage', {
  message: CalendarDocs.Message,
});
export const GotCatalogDocsMessage = m('GotCatalogDocsMessage', {
  message: ComponentCatalog.Message,
});

export const Message = S.Union([
  CompletedNavigateInternal,
  CompletedLoadExternal,
  ClickedLink,
  ChangedUrl,
  ClickedThemeToggle,
  CompletedApplyTheme,
  GotBoardMessage,
  GotBlocksMessage,
  GotLandingMessage,
  GotChartsAreaMessage,
  GotChartsBarMessage,
  GotChartsLineMessage,
  GotChartsPieMessage,
  GotChartsRadarMessage,
  GotChartsRadialMessage,
  GotChartsTooltipMessage,
  GotAccordionDocsMessage,
  GotCalendarDocsMessage,
  GotCatalogDocsMessage,
]);
export type Message = typeof Message.Type;

// INIT

export const init: Runtime.RoutingApplicationInit<Model, Message> = (
  url: Url,
) => [
  {
    route: urlToAppRoute(url),
    isDark: document.documentElement.classList.contains('dark'),
    board: Board.init(),
    blocks: Blocks.init(),
    landing: Landing.init(),
    chartsArea: ChartsArea.init(),
    chartsBar: ChartsBar.init(),
    chartsLine: ChartsLine.init(),
    chartsPie: ChartsPie.init(),
    chartsRadar: ChartsRadar.init(),
    chartsRadial: ChartsRadial.init(),
    chartsTooltip: ChartsTooltip.init(),
    accordionDocs: AccordionDocs.init(),
    calendarDocs: CalendarDocs.init(),
    catalogDocs: ComponentCatalog.init(),
  },
  [],
];

// COMMAND

const NavigateInternal = Command.define('NavigateInternal', {
  args: { url: S.String },
  messages: [CompletedNavigateInternal],
  execute: ({ url }) => pushUrl(url).pipe(Effect.as(CompletedNavigateInternal())),
});

const LoadExternal = Command.define('LoadExternal', {
  args: { href: S.String },
  messages: [CompletedLoadExternal],
  execute: ({ href }) => load(href).pipe(Effect.as(CompletedLoadExternal())),
});

const ApplyTheme = Command.define('ApplyTheme', {
  args: { isDark: S.Boolean },
  messages: [CompletedApplyTheme],
  execute: ({ isDark }) =>
    Effect.sync(() => {
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      localStorage.setItem('creaseui-theme', isDark ? 'dark' : 'light');
      return CompletedApplyTheme();
    }),
});

// UPDATE

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];
const withUpdateReturn = M.withReturnType<UpdateReturn>();

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    withUpdateReturn,
    M.tagsExhaustive({
      CompletedNavigateInternal: () => [model, []],
      CompletedLoadExternal: () => [model, []],
      CompletedApplyTheme: () => [model, []],

      ClickedThemeToggle: () => {
        const isDark = !model.isDark;
        return [evo(model, { isDark: () => isDark }), [ApplyTheme({ isDark })]];
      },

      ClickedLink: ({ request }) =>
        M.value(request).pipe(
          withUpdateReturn,
          M.tagsExhaustive({
            Internal: ({ url }) => [
              model,
              [NavigateInternal({ url: urlToString(url) })],
            ],
            External: ({ href }) => [model, [LoadExternal({ href })]],
          }),
        ),

      ChangedUrl: ({ url }) => [
        evo(model, { route: () => urlToAppRoute(url) }),
        [],
      ],

      GotBoardMessage: ({ message: childMessage }) => {
        const [board, commands] = Board.update(model.board, childMessage);
        return [
          evo(model, { board: () => board }),
          Command.mapMessages(commands, (next) =>
            GotBoardMessage({ message: next }),
          ),
        ];
      },

      GotBlocksMessage: ({ message: childMessage }) => {
        const [blocks, commands] = Blocks.update(model.blocks, childMessage);
        return [
          evo(model, { blocks: () => blocks }),
          Command.mapMessages(commands, (next) =>
            GotBlocksMessage({ message: next }),
          ),
        ];
      },

      GotLandingMessage: ({ message: childMessage }) => {
        const [landing, commands] = Landing.update(model.landing, childMessage);
        return [
          evo(model, { landing: () => landing }),
          Command.mapMessages(commands, (next) =>
            GotLandingMessage({ message: next }),
          ),
        ];
      },

      GotChartsAreaMessage: ({ message: childMessage }) => {
        const [page, commands] = ChartsArea.update(
          model.chartsArea,
          childMessage,
        );
        return [
          evo(model, { chartsArea: () => page }),
          Command.mapMessages(commands, (next) =>
            GotChartsAreaMessage({ message: next }),
          ),
        ];
      },

      GotChartsBarMessage: ({ message: childMessage }) => {
        const [page, commands] = ChartsBar.update(
          model.chartsBar,
          childMessage,
        );
        return [
          evo(model, { chartsBar: () => page }),
          Command.mapMessages(commands, (next) =>
            GotChartsBarMessage({ message: next }),
          ),
        ];
      },

      GotChartsLineMessage: ({ message: childMessage }) => {
        const [page, commands] = ChartsLine.update(
          model.chartsLine,
          childMessage,
        );
        return [
          evo(model, { chartsLine: () => page }),
          Command.mapMessages(commands, (next) =>
            GotChartsLineMessage({ message: next }),
          ),
        ];
      },

      GotChartsPieMessage: ({ message: childMessage }) => {
        const [page, commands] = ChartsPie.update(
          model.chartsPie,
          childMessage,
        );
        return [
          evo(model, { chartsPie: () => page }),
          Command.mapMessages(commands, (next) =>
            GotChartsPieMessage({ message: next }),
          ),
        ];
      },

      GotChartsRadarMessage: ({ message: childMessage }) => {
        const [page, commands] = ChartsRadar.update(
          model.chartsRadar,
          childMessage,
        );
        return [
          evo(model, { chartsRadar: () => page }),
          Command.mapMessages(commands, (next) =>
            GotChartsRadarMessage({ message: next }),
          ),
        ];
      },

      GotChartsRadialMessage: ({ message: childMessage }) => {
        const [page, commands] = ChartsRadial.update(
          model.chartsRadial,
          childMessage,
        );
        return [
          evo(model, { chartsRadial: () => page }),
          Command.mapMessages(commands, (next) =>
            GotChartsRadialMessage({ message: next }),
          ),
        ];
      },

      GotChartsTooltipMessage: ({ message: childMessage }) => {
        const [page, commands] = ChartsTooltip.update(
          model.chartsTooltip,
          childMessage,
        );
        return [
          evo(model, { chartsTooltip: () => page }),
          Command.mapMessages(commands, (next) =>
            GotChartsTooltipMessage({ message: next }),
          ),
        ];
      },

      GotAccordionDocsMessage: ({ message: childMessage }) => {
        const [page, commands] = AccordionDocs.update(
          model.accordionDocs,
          childMessage,
        );
        return [
          evo(model, { accordionDocs: () => page }),
          Command.mapMessages(commands, (next) =>
            GotAccordionDocsMessage({ message: next }),
          ),
        ];
      },
      GotCalendarDocsMessage: ({ message: childMessage }) => {
        const [page, commands] = CalendarDocs.update(
          model.calendarDocs,
          childMessage,
        );
        return [
          evo(model, { calendarDocs: () => page }),
          Command.mapMessages(commands, (next) =>
            GotCalendarDocsMessage({ message: next }),
          ),
        ];
      },
      GotCatalogDocsMessage: ({ message: childMessage }) => {
        const [catalogDocs, commands] = ComponentCatalog.update(
          model.catalogDocs,
          childMessage,
        );
        return [
          evo(model, { catalogDocs: () => catalogDocs }),
          Command.mapMessages(commands, (next) =>
            GotCatalogDocsMessage({ message: next }),
          ),
        ];
      },
    }),
  );

// SUBSCRIPTIONS

export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift(Board.subscriptions)<Model, Message>({
    toChildModel: (model) => model.board,
    toParentMessage: (message) => GotBoardMessage({ message }),
  }),
  Subscription.lift(ComponentCatalog.subscriptions)<Model, Message>({
    toChildModel: (model) => model.catalogDocs,
    toParentMessage: (message) => GotCatalogDocsMessage({ message }),
  }),
);

// VIEW

const headerLink = (
  href: string,
  label: string,
  isActive: boolean,
  className: string,
  h: HtmlBuilder<Message>,
): Html => {
  return h.a(
    [
      h.Href(href),
      h.Class(
        cn(
          'text-sm font-medium transition-colors hover:text-foreground',
          isActive ? 'text-foreground' : 'text-muted-foreground',
          className,
        ),
      ),
    ],
    [label],
  );
};

const header = (model: Model, h: HtmlBuilder<Message>): Html => {
  const isCharts = model.route._tag === 'Charts';

  return h.header(
    [h.Class('sticky top-0 z-40 border-b bg-background/95 backdrop-blur')],
    [
      h.div(
        [
          h.Class(
            'mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4 md:gap-6 md:px-8',
          ),
        ],
        [
          h.a([h.Href('/'), h.Class('text-sm font-semibold')], ['crease/ui']),
          headerLink(
            '/docs/components/accordion',
            'Docs',
            model.route._tag === 'ComponentDocs',
            '',
            h,
          ),
          headerLink(
            '/create',
            'Create',
            model.route._tag === 'Create',
            'hidden sm:inline-flex',
            h,
          ),
          headerLink(
            chartsPath('area'),
            'Charts',
            isCharts,
            'hidden sm:inline-flex',
            h,
          ),
          headerLink(
            '/blocks/sidebar',
            'Blocks',
            model.route._tag === 'BlocksIndex',
            'hidden sm:inline-flex',
            h,
          ),
          h.details(
            [h.Class('relative ml-auto sm:hidden')],
            [
              h.summary(
                [
                  h.AriaLabel('Open site navigation'),
                  h.Class(
                    'flex size-10 cursor-pointer list-none items-center justify-center rounded-md hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50',
                  ),
                ],
                [Icon.icon('menu', { class: 'size-4' }, h)],
              ),
              h.nav(
                [
                  h.AriaLabel('Site navigation'),
                  h.Class(
                    'absolute top-11 right-0 z-50 grid min-w-44 gap-1 rounded-lg border bg-background p-2 shadow-lg',
                  ),
                ],
                [
                  headerLink(
                    '/docs/components/accordion',
                    'Docs',
                    model.route._tag === 'ComponentDocs',
                    'rounded-md px-3 py-2 hover:bg-accent',
                    h,
                  ),
                  headerLink(
                    '/create',
                    'Create',
                    model.route._tag === 'Create',
                    'rounded-md px-3 py-2 hover:bg-accent',
                    h,
                  ),
                  headerLink(
                    chartsPath('area'),
                    'Charts',
                    isCharts,
                    'rounded-md px-3 py-2 hover:bg-accent',
                    h,
                  ),
                  headerLink(
                    '/blocks/sidebar',
                    'Blocks',
                    model.route._tag === 'BlocksIndex',
                    'rounded-md px-3 py-2 hover:bg-accent',
                    h,
                  ),
                ],
              ),
            ],
          ),
          h.button(
            [
              h.Type('button'),
              h.OnClick(ClickedThemeToggle()),
              h.AriaLabel(
                model.isDark ? 'Switch to light mode' : 'Switch to dark mode',
              ),
              h.Title(
                model.isDark ? 'Switch to light mode' : 'Switch to dark mode',
              ),
              h.Class(
                'group relative inline-flex size-10 shrink-0 items-center justify-center rounded-md text-foreground outline-none transition-[color,background-color,transform] duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96] sm:ml-auto',
              ),
            ],
            [
              h.span(
                [h.Class('relative size-4')],
                [
                  Icon.icon(
                    'sun',
                    {
                      class:
                        'theme-toggle-icon absolute inset-0 size-4 scale-100 opacity-100 transition-[scale,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] dark:scale-25 dark:opacity-0',
                    },
                    h,
                  ),
                  Icon.icon(
                    'moon',
                    {
                      class:
                        'theme-toggle-icon absolute inset-0 size-4 scale-25 opacity-0 transition-[scale,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] dark:scale-100 dark:opacity-100',
                    },
                    h,
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

/* Page views are plain (model) => Html functions; wrap them once as
   SubmodelViews so h.submodel can embed them with message lifting. */
const boardView = defineView<Board.Model, Board.Message>(Board.view);
const landingView = defineView<Landing.Model, Landing.Message>(Landing.view);
const accordionDocsView = defineView<
  AccordionDocs.Model,
  AccordionDocs.Message
>(AccordionDocs.view);
const calendarDocsView = defineView<CalendarDocs.Model, CalendarDocs.Message>(
  CalendarDocs.view,
);
const catalogDocsView = defineView<
  ComponentCatalog.Model,
  ComponentCatalog.Message,
  string
>((catalogModel, slug, h) => ComponentCatalog.view(catalogModel, slug, h));
const blocksRegistryView = defineView<Blocks.Model, Blocks.Message, string>(
  (blocksModel, blockId, h) => Blocks.view(blocksModel, blockId, h),
);

const blocksView = (
  model: Model,
  blockId: string,
  h: HtmlBuilder<Message>,
): Html => {
  return h.submodel({
    slotId: 'sidebar-blocks',
    model: model.blocks,
    view: blocksRegistryView,
    viewInputs: blockId,
    toParentMessage: (message: Blocks.Message): Message =>
      GotBlocksMessage({ message }),
  });
};
const chartsAreaView = defineView<ChartsArea.Model, ChartsArea.Message>(
  ChartsArea.view,
);
const chartsBarView = defineView<ChartsBar.Model, ChartsBar.Message>(
  ChartsBar.view,
);
const chartsLineView = defineView<ChartsLine.Model, ChartsLine.Message>(
  ChartsLine.view,
);
const chartsPieView = defineView<ChartsPie.Model, ChartsPie.Message>(
  ChartsPie.view,
);
const chartsRadarView = defineView<ChartsRadar.Model, ChartsRadar.Message>(
  ChartsRadar.view,
);
const chartsRadialView = defineView<ChartsRadial.Model, ChartsRadial.Message>(
  ChartsRadial.view,
);
const chartsTooltipView = defineView<
  ChartsTooltip.Model,
  ChartsTooltip.Message
>(ChartsTooltip.view);

const chartsSectionView = (
  model: Model,
  section: ChartSection,
  h: HtmlBuilder<Message>,
): Html => {
  return M.value(section).pipe(
    M.withReturnType<Html>(),
    M.when('area', () =>
      h.submodel({
        slotId: 'charts-area',
        model: model.chartsArea,
        view: chartsAreaView,
        toParentMessage: (message: ChartsArea.Message): Message =>
          GotChartsAreaMessage({ message }),
      }),
    ),
    M.when('bar', () =>
      h.submodel({
        slotId: 'charts-bar',
        model: model.chartsBar,
        view: chartsBarView,
        toParentMessage: (message: ChartsBar.Message): Message =>
          GotChartsBarMessage({ message }),
      }),
    ),
    M.when('line', () =>
      h.submodel({
        slotId: 'charts-line',
        model: model.chartsLine,
        view: chartsLineView,
        toParentMessage: (message: ChartsLine.Message): Message =>
          GotChartsLineMessage({ message }),
      }),
    ),
    M.when('pie', () =>
      h.submodel({
        slotId: 'charts-pie',
        model: model.chartsPie,
        view: chartsPieView,
        toParentMessage: (message: ChartsPie.Message): Message =>
          GotChartsPieMessage({ message }),
      }),
    ),
    M.when('radar', () =>
      h.submodel({
        slotId: 'charts-radar',
        model: model.chartsRadar,
        view: chartsRadarView,
        toParentMessage: (message: ChartsRadar.Message): Message =>
          GotChartsRadarMessage({ message }),
      }),
    ),
    M.when('radial', () =>
      h.submodel({
        slotId: 'charts-radial',
        model: model.chartsRadial,
        view: chartsRadialView,
        toParentMessage: (message: ChartsRadial.Message): Message =>
          GotChartsRadialMessage({ message }),
      }),
    ),
    M.when('tooltip', () =>
      h.submodel({
        slotId: 'charts-tooltip',
        model: model.chartsTooltip,
        view: chartsTooltipView,
        toParentMessage: (message: ChartsTooltip.Message): Message =>
          GotChartsTooltipMessage({ message }),
      }),
    ),
    M.exhaustive,
  );
};

const homeView = (h: HtmlBuilder<Message>): Html => {
  return h.div(
    [h.Class('mx-auto flex max-w-xl flex-col items-start gap-4 px-8 py-16')],
    [
      h.h1([h.Class('text-3xl font-semibold tracking-tight')], ['crease/ui']),
      h.p(
        [h.Class('text-muted-foreground')],
        ['shadcn/ui rebuilt on foldkit UI. Pick a demo:'],
      ),
      h.ul(
        [h.Class('list-disc pl-5 text-sm leading-7')],
        [
          h.li(
            [],
            [
              h.a(
                [h.Href('/create'), h.Class('underline underline-offset-4')],
                ['/create — the ui.shadcn.com/create preview board'],
              ),
            ],
          ),
          h.li(
            [],
            [
              h.a(
                [
                  h.Href(chartsPath('area')),
                  h.Class('underline underline-offset-4'),
                ],
                ['/charts — shadcn charts rendered with Apache ECharts'],
              ),
            ],
          ),
        ],
      ),
    ],
  );
};

const notFoundView = (path: string, h: HtmlBuilder<Message>): Html => {
  return h.div(
    [h.Class('mx-auto max-w-xl px-8 py-16')],
    [h.p([h.Class('text-muted-foreground')], [`No page at ${path}.`])],
  );
};

/* Each page subtree is KEYED by route (and by charts section). Without keys,
   snabbdom patches the next page into the previous page's DOM in place; since
   neither submodel's model changed, the submodel boundary skips re-rendering
   and the old page's content stays on screen after navigation. A distinct key
   per page forces a subtree replacement on route change. */
const pageView = (model: Model, h: HtmlBuilder<Message>): Html => {
  const keyed = (key: string, content: Html): Html =>
    h.keyed('div')(key, [], [content]);

  return M.value(model.route).pipe(
    M.withReturnType<Html>(),
    M.tagsExhaustive({
      Home: () =>
        keyed(
          'page-home',
          h.submodel({
            slotId: 'landing',
            model: model.landing,
            view: landingView,
            toParentMessage: (message: Landing.Message): Message =>
              GotLandingMessage({ message }),
          }),
        ),
      Create: () =>
        keyed(
          'page-create',
          h.submodel({
            slotId: 'create-board',
            model: model.board,
            view: boardView,
            toParentMessage: (message: Board.Message): Message =>
              GotBoardMessage({ message }),
          }),
        ),
      Charts: ({ section }) =>
        isChartSection(section)
          ? keyed(
              `page-charts-${section}`,
              chartsSectionView(model, section, h),
            )
          : keyed('page-not-found', notFoundView(`/charts/${section}`, h)),
      BlocksIndex: () => keyed('page-blocks-index', BlocksIndexPage.view(h)),
      Block: ({ blockId }) =>
        keyed(`page-block-${blockId}`, blocksView(model, blockId, h)),
      ComponentDocs: ({ component }) =>
        component === 'accordion'
          ? keyed(
              'page-docs-accordion',
              h.submodel({
                slotId: 'docs-accordion',
                model: model.accordionDocs,
                view: accordionDocsView,
                toParentMessage: (message: AccordionDocs.Message): Message =>
                  GotAccordionDocsMessage({ message }),
              }),
            )
          : component === 'calendar'
            ? keyed(
                'page-docs-calendar',
                h.submodel({
                  slotId: 'docs-calendar',
                  model: model.calendarDocs,
                  view: calendarDocsView,
                  toParentMessage: (message: CalendarDocs.Message): Message =>
                    GotCalendarDocsMessage({ message }),
                }),
              )
            : ComponentCatalog.hasCatalogPage(component)
              ? keyed(
                  `page-docs-${component}`,
                  h.submodel({
                    slotId: `docs-${component}`,
                    model: model.catalogDocs,
                    view: catalogDocsView,
                    viewInputs: component,
                    toParentMessage: (
                      message: ComponentCatalog.Message,
                    ): Message => GotCatalogDocsMessage({ message }),
                  }),
                )
              : keyed(
                  'page-not-found',
                  notFoundView(`/docs/components/${component}`, h),
                ),
      NotFound: ({ path }) => keyed('page-not-found', notFoundView(path, h)),
    }),
  );
};

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  // Block pages are full-viewport layouts (shown inside the index's iframes),
  // so they render without the global header.
  const isFullPage = model.route._tag === 'Block';
  const title =
    model.route._tag === 'ComponentDocs'
      ? `${ComponentCatalog.titleFor(model.route.component) ?? 'Not Found'} - crease/ui`
      : 'crease/ui';

  return {
    title,
    body: isFullPage
      ? h.div([], [pageView(model, h)])
      : h.div([], [header(model, h), pageView(model, h)]),
  };
};

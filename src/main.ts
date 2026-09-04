import { Effect, Match as M, Schema as S } from "effect";
import type { Runtime } from "foldkit";
import { Command, Subscription } from "foldkit";
import type { Document, Html, HtmlBuilder } from "foldkit/html";
import { m } from "foldkit/message";
import { UrlRequest, load, pushUrl } from "foldkit/navigation";
import { Url, toString as urlToString } from "foldkit/url";
import { defineView } from "foldkit/submodel";
import { evo } from "foldkit/struct";

import * as BlocksIndexPage from "@/demo/blocks/index-page";
import * as BlocksStyleXPage from "@/demo/blocks-stylex/featured-page";
import * as TanStackTablePage from "@/demo/blocks-stylex/tanstack-table-page";
import * as Blocks from "@/demo/blocks/registry";
import * as Board from "@/demo/board";
import * as BoardStyleX from "@/demo/board-stylex";
import * as BoardConstrained from "@/demo/board-constrained";
import * as Landing from "@/demo/landing";
import * as ChartsArea from "@/demo/charts/area";
import * as ChartsBar from "@/demo/charts/bar";
import * as ChartsLine from "@/demo/charts/line";
import * as ChartsPie from "@/demo/charts/pie";
import * as ChartsRadar from "@/demo/charts/radar";
import * as ChartsRadial from "@/demo/charts/radial";
import * as ChartsTooltip from "@/demo/charts/tooltip";
import * as ChartsStyleX from "@/demo/charts-stylex/page";
import * as ComponentCatalog from "@/docs/components/catalog";
import * as Page from "@/app/page";
import * as Icon from "@/lib/icon";
import {
  AppRoute,
  type ChartSection,
  blocksIndexPath,
  blocksStyleXPath,
  blocksStyleXTablePath,
  chartsPath,
  componentDocsPath,
  createPath,
  homePath,
  isChartSection,
  urlToAppRoute,
} from "@/route";
import { cn } from "@/lib/utils";

// MODEL

export const Model = S.Struct({
  route: AppRoute,
  isDark: S.Boolean,
  page: Page.Page,
});
export type Model = typeof Model.Type;

// FLAGS

export const Flags = S.Struct({
  isDark: S.Boolean,
});
export type Flags = typeof Flags.Type;

export const flags: Effect.Effect<Flags> = Effect.sync(() => ({
  isDark: document.documentElement.classList.contains("dark"),
}));

// MESSAGE

export const CompletedNavigateInternal = m("CompletedNavigateInternal");
export const CompletedLoadExternal = m("CompletedLoadExternal");
export const ClickedLink = m("ClickedLink", { request: UrlRequest });
export const ChangedUrl = m("ChangedUrl", { url: Url });
export const ClickedThemeToggle = m("ClickedThemeToggle");
export const CompletedApplyTheme = m("CompletedApplyTheme");
export const IgnoredBlocksPreviewInput = m("IgnoredBlocksPreviewInput");
export const ChangedCreateRenderer = m("ChangedCreateRenderer", {
  renderer: Page.CreateRenderer,
});
export const ChangedChartsRenderer = m("ChangedChartsRenderer", {
  renderer: Page.CreateRenderer,
});
export const GotBoardMessage = m("GotBoardMessage", { message: Board.Message });
export const GotBoardStyleXMessage = m("GotBoardStyleXMessage", {
  message: BoardStyleX.Message,
});
export const GotLandingMessage = m("GotLandingMessage", {
  message: Landing.Message,
});
export const GotBlocksMessage = m("GotBlocksMessage", {
  message: Blocks.Message,
});
export const GotBlocksStyleXMessage = m("GotBlocksStyleXMessage", {
  message: BlocksStyleXPage.Message,
});
export const GotTanStackTableMessage = m("GotTanStackTableMessage", {
  message: TanStackTablePage.Message,
});
export const GotChartsAreaMessage = m("GotChartsAreaMessage", {
  message: ChartsArea.Message,
});
export const GotChartsBarMessage = m("GotChartsBarMessage", {
  message: ChartsBar.Message,
});
export const GotChartsLineMessage = m("GotChartsLineMessage", {
  message: ChartsLine.Message,
});
export const GotChartsPieMessage = m("GotChartsPieMessage", {
  message: ChartsPie.Message,
});
export const GotChartsRadarMessage = m("GotChartsRadarMessage", {
  message: ChartsRadar.Message,
});
export const GotChartsRadialMessage = m("GotChartsRadialMessage", {
  message: ChartsRadial.Message,
});
export const GotChartsTooltipMessage = m("GotChartsTooltipMessage", {
  message: ChartsTooltip.Message,
});
export const GotChartsStyleXMessage = m("GotChartsStyleXMessage", {
  message: ChartsStyleX.Message,
});
export const GotCatalogDocsMessage = m("GotCatalogDocsMessage", {
  message: ComponentCatalog.Message,
});

export const Message = S.Union([
  CompletedNavigateInternal,
  CompletedLoadExternal,
  ClickedLink,
  ChangedUrl,
  ClickedThemeToggle,
  CompletedApplyTheme,
  IgnoredBlocksPreviewInput,
  ChangedCreateRenderer,
  ChangedChartsRenderer,
  GotBoardMessage,
  GotBoardStyleXMessage,
  GotBlocksMessage,
  GotBlocksStyleXMessage,
  GotTanStackTableMessage,
  GotLandingMessage,
  GotChartsAreaMessage,
  GotChartsBarMessage,
  GotChartsLineMessage,
  GotChartsPieMessage,
  GotChartsRadarMessage,
  GotChartsRadialMessage,
  GotChartsTooltipMessage,
  GotChartsStyleXMessage,
  GotCatalogDocsMessage,
]);
export type Message = typeof Message.Type;

// INIT

export const init: Runtime.RoutingApplicationInit<Model, Message, Flags> = (
  flags,
  url: Url,
) => {
  const route = urlToAppRoute(url);
  return [{ route, isDark: flags.isDark, page: Page.init(route) }, []];
};

// COMMAND

const NavigateInternal = Command.define("NavigateInternal", {
  args: { url: S.String },
  messages: [CompletedNavigateInternal],
  execute: ({ url }) =>
    pushUrl(url).pipe(Effect.as(CompletedNavigateInternal())),
});

const LoadExternal = Command.define("LoadExternal", {
  args: { href: S.String },
  messages: [CompletedLoadExternal],
  execute: ({ href }) => load(href).pipe(Effect.as(CompletedLoadExternal())),
});

const ApplyTheme = Command.define("ApplyTheme", {
  args: { isDark: S.Boolean },
  messages: [CompletedApplyTheme],
  execute: ({ isDark }) =>
    Effect.sync(() => {
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
      localStorage.setItem("creaseui-theme", isDark ? "dark" : "light");
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
      IgnoredBlocksPreviewInput: () => [model, []],

      ChangedCreateRenderer: ({ renderer }) => {
        if (model.page._tag !== "CreatePage") return [model, []];
        const currentPage = model.page;
        return [
          evo(model, {
            page: () => evo(currentPage, { renderer: () => renderer }),
          }),
          [],
        ];
      },

      ChangedChartsRenderer: ({ renderer }) => {
        if (model.page._tag !== "ChartsPage") return [model, []];
        const currentPage = model.page;
        return [
          evo(model, {
            page: () => evo(currentPage, { renderer: () => renderer }),
          }),
          [],
        ];
      },

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

      ChangedUrl: ({ url }) => {
        const route = urlToAppRoute(url);
        const page =
          model.page._tag === "ChartsPage" && route._tag === "Charts"
            ? model.page
            : Page.init(route);
        return [
          evo(model, {
            route: () => route,
            page: () => page,
          }),
          [],
        ];
      },

      GotBoardMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "CreatePage") return [model, []];
        const currentPage = model.page;
        const [board, commands] = Board.update(
          currentPage.tailwindBoard,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { tailwindBoard: () => board }),
          }),
          Command.mapMessages(commands, (next) =>
            GotBoardMessage({ message: next }),
          ),
        ];
      },

      GotBlocksMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "BlockPage") return [model, []];
        const currentPage = model.page;
        const [blocks, commands] = Blocks.update(
          currentPage.blocks,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { blocks: () => blocks }),
          }),
          Command.mapMessages(commands, (next) =>
            GotBlocksMessage({ message: next }),
          ),
        ];
      },

      GotBlocksStyleXMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "BlocksStyleXPage") return [model, []];
        const currentPage = model.page;
        const [table] = BlocksStyleXPage.update(
          currentPage.table,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { table: () => table }),
          }),
          [],
        ];
      },

      GotTanStackTableMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "BlocksStyleXTablePage") return [model, []];
        const currentPage = model.page;
        const [table, commands] = TanStackTablePage.update(currentPage.table, childMessage);
        return [
          evo(model, { page: () => evo(currentPage, { table: () => table }) }),
          Command.mapMessages(commands, (next) =>
            GotTanStackTableMessage({ message: next }),
          ),
        ];
      },

      GotLandingMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "LandingPage") return [model, []];
        const currentPage = model.page;
        const [landing, commands] = Landing.update(
          currentPage.landing,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { landing: () => landing }),
          }),
          Command.mapMessages(commands, (next) =>
            GotLandingMessage({ message: next }),
          ),
        ];
      },

      GotBoardStyleXMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "CreatePage") return [model, []];
        const currentPage = model.page;
        const [board, commands] = BoardStyleX.update(
          currentPage.styleXBoard,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { styleXBoard: () => board }),
          }),
          Command.mapMessages(commands, (next) =>
            GotBoardStyleXMessage({ message: next }),
          ),
        ];
      },

      GotChartsAreaMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "ChartsPage") return [model, []];
        const currentPage = model.page;
        const [page, commands] = ChartsArea.update(
          currentPage.area,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { area: () => page }),
          }),
          Command.mapMessages(commands, (next) =>
            GotChartsAreaMessage({ message: next }),
          ),
        ];
      },

      GotChartsBarMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "ChartsPage") return [model, []];
        const currentPage = model.page;
        const [page, commands] = ChartsBar.update(
          currentPage.bar,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { bar: () => page }),
          }),
          Command.mapMessages(commands, (next) =>
            GotChartsBarMessage({ message: next }),
          ),
        ];
      },

      GotChartsLineMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "ChartsPage") return [model, []];
        const currentPage = model.page;
        const [page, commands] = ChartsLine.update(
          currentPage.line,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { line: () => page }),
          }),
          Command.mapMessages(commands, (next) =>
            GotChartsLineMessage({ message: next }),
          ),
        ];
      },

      GotChartsPieMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "ChartsPage") return [model, []];
        const currentPage = model.page;
        const [page, commands] = ChartsPie.update(
          currentPage.pie,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { pie: () => page }),
          }),
          Command.mapMessages(commands, (next) =>
            GotChartsPieMessage({ message: next }),
          ),
        ];
      },

      GotChartsRadarMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "ChartsPage") return [model, []];
        const currentPage = model.page;
        const [page, commands] = ChartsRadar.update(
          currentPage.radar,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { radar: () => page }),
          }),
          Command.mapMessages(commands, (next) =>
            GotChartsRadarMessage({ message: next }),
          ),
        ];
      },

      GotChartsRadialMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "ChartsPage") return [model, []];
        const currentPage = model.page;
        const [page, commands] = ChartsRadial.update(
          currentPage.radial,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { radial: () => page }),
          }),
          Command.mapMessages(commands, (next) =>
            GotChartsRadialMessage({ message: next }),
          ),
        ];
      },

      GotChartsTooltipMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "ChartsPage") return [model, []];
        const currentPage = model.page;
        const [page, commands] = ChartsTooltip.update(
          currentPage.tooltip,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { tooltip: () => page }),
          }),
          Command.mapMessages(commands, (next) =>
            GotChartsTooltipMessage({ message: next }),
          ),
        ];
      },

      GotChartsStyleXMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "ChartsPage") return [model, []];
        const currentPage = model.page;
        const [charts, commands] = ChartsStyleX.update(
          currentPage.styleXCharts,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { styleXCharts: () => charts }),
          }),
          Command.mapMessages(commands, (next) =>
            GotChartsStyleXMessage({ message: next }),
          ),
        ];
      },

      GotCatalogDocsMessage: ({ message: childMessage }) => {
        if (model.page._tag !== "CatalogDocsPage") return [model, []];
        const currentPage = model.page;
        const [catalogDocs, commands] = ComponentCatalog.update(
          currentPage.docs,
          childMessage,
        );
        return [
          evo(model, {
            page: () => evo(currentPage, { docs: () => catalogDocs }),
          }),
          Command.mapMessages(commands, (next) =>
            GotCatalogDocsMessage({ message: next }),
          ),
        ];
      },
    }),
  );

// SUBSCRIPTIONS

const inactiveBoard = Board.init();
const inactiveBoardStyleX = BoardStyleX.init();
const inactiveCatalogDocs = ComponentCatalog.init();
const inactiveTanStackTablePage = TanStackTablePage.init();

// Both boards compose the same slider subscription names. Prefix the StyleX
// record here so Foldkit can host both without weakening duplicate-key checks.
const boardStyleXSubscriptions = {
  styleXBrightnessPointer: BoardStyleX.subscriptions.brightnessPointer!,
  styleXBrightnessEscape: BoardStyleX.subscriptions.brightnessEscape!,
  styleXColorTempPointer: BoardStyleX.subscriptions.colorTempPointer!,
  styleXColorTempEscape: BoardStyleX.subscriptions.colorTempEscape!,
  styleXVolumePointer: BoardStyleX.subscriptions.volumePointer!,
  styleXVolumeEscape: BoardStyleX.subscriptions.volumeEscape!,
  styleXFadePointer: BoardStyleX.subscriptions.fadePointer!,
  styleXFadeEscape: BoardStyleX.subscriptions.fadeEscape!,
  styleXPayoutAmountPointer: BoardStyleX.subscriptions.payoutAmountPointer!,
  styleXPayoutAmountEscape: BoardStyleX.subscriptions.payoutAmountEscape!,
  styleXShadePositionPointer: BoardStyleX.subscriptions.shadePositionPointer!,
  styleXShadePositionEscape: BoardStyleX.subscriptions.shadePositionEscape!,
};

export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift(Board.subscriptions)<Model, Message>({
    toChildModel: (model) =>
      model.page._tag === "CreatePage"
        ? model.page.tailwindBoard
        : inactiveBoard,
    toParentMessage: (message) => GotBoardMessage({ message }),
    when: (model) =>
      model.page._tag === "CreatePage" && model.page.renderer === "tailwind",
  }),
  Subscription.lift(boardStyleXSubscriptions)<Model, Message>({
    toChildModel: (model) =>
      model.page._tag === "CreatePage"
        ? model.page.styleXBoard
        : inactiveBoardStyleX,
    toParentMessage: (message) => GotBoardStyleXMessage({ message }),
    when: (model) =>
      model.page._tag === "CreatePage" && model.page.renderer === "stylex",
  }),
  Subscription.lift(ComponentCatalog.subscriptions)<Model, Message>({
    toChildModel: (model) =>
      model.page._tag === "CatalogDocsPage"
        ? model.page.docs
        : inactiveCatalogDocs,
    toParentMessage: (message) => GotCatalogDocsMessage({ message }),
  }),
  Subscription.lift(TanStackTablePage.subscriptions)<Model, Message>({
    toChildModel: (model) =>
      model.page._tag === "BlocksStyleXTablePage"
        ? model.page.table
        : inactiveTanStackTablePage,
    toParentMessage: (message) => GotTanStackTableMessage({ message }),
    when: (model) => model.page._tag === "BlocksStyleXTablePage",
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
          "text-sm font-medium transition-colors hover:text-foreground",
          isActive ? "text-foreground" : "text-muted-foreground",
          className,
        ),
      ),
    ],
    [label],
  );
};

const createRendererSwitcher = (
  page: typeof Page.Create.Type,
  className: string,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Role("group"),
      h.AriaLabel("Create renderer"),
      h.Class(
        cn(
          "items-center rounded-md border bg-muted/40 p-0.5",
          className,
        ),
      ),
    ],
    (["tailwind", "stylex"] as const).map((renderer) =>
      h.button(
        [
          h.Type("button"),
          h.OnClick(ChangedCreateRenderer({ renderer })),
          h.AriaPressed(page.renderer === renderer ? "true" : "false"),
          h.Class(
            cn(
              "min-h-8 rounded-[5px] px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              page.renderer === renderer
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            ),
          ),
        ],
        [renderer === "tailwind" ? "Tailwind" : "StyleX"],
      ),
    ),
  );

const chartsRendererSwitcher = (
  page: typeof Page.Charts.Type,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Role("group"),
      h.AriaLabel("Charts renderer"),
      h.Class("flex items-center rounded-md border bg-muted/40 p-0.5"),
    ],
    (["tailwind", "stylex"] as const).map((renderer) =>
      h.button(
        [
          h.Type("button"),
          h.OnClick(ChangedChartsRenderer({ renderer })),
          h.AriaPressed(page.renderer === renderer ? "true" : "false"),
          h.Class(
            cn(
              "min-h-8 rounded-[5px] px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              page.renderer === renderer
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            ),
          ),
        ],
        [renderer === "tailwind" ? "Tailwind" : "StyleX"],
      ),
    ),
  );

const header = (model: Model, h: HtmlBuilder<Message>): Html => {
  const isCharts = model.route._tag === "Charts";

  return h.header(
    [h.Class("sticky top-0 z-40 border-b bg-background/95 backdrop-blur")],
    [
      h.div(
        [
          h.Class(
            "mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4 md:gap-6 md:px-8",
          ),
        ],
        [
          h.a(
            [h.Href(homePath()), h.Class("text-sm font-semibold")],
            ["crease/ui"],
          ),
          headerLink(
            componentDocsPath("accordion"),
            "Docs",
            model.route._tag === "ComponentDocs",
            "hidden sm:inline-flex",
            h,
          ),
          headerLink(
            createPath(),
            "Create",
            model.route._tag === "Create",
            "hidden sm:inline-flex",
            h,
          ),
          ...(model.page._tag === "CreatePage"
            ? [createRendererSwitcher(model.page, "flex", h)]
            : []),
          headerLink(
            chartsPath("area"),
            "Charts",
            isCharts,
            "hidden sm:inline-flex",
            h,
          ),
          ...(model.page._tag === "ChartsPage"
            ? [chartsRendererSwitcher(model.page, h)]
            : []),
          headerLink(
            blocksIndexPath(),
            "Blocks",
            model.route._tag === "BlocksIndex",
            "hidden sm:inline-flex",
            h,
          ),
          headerLink(
            blocksStyleXPath(),
            "Blocks StyleX",
            model.route._tag === "BlocksStyleX" || model.route._tag === "BlocksStyleXTable",
            "hidden lg:inline-flex",
            h,
          ),
          h.details(
            [h.Class("relative ml-auto sm:hidden")],
            [
              h.summary(
                [
                  h.AriaLabel("Open site navigation"),
                  h.Class(
                    "flex size-10 cursor-pointer list-none items-center justify-center rounded-md hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
                  ),
                ],
                [Icon.icon("menu", { class: "size-4" }, h)],
              ),
              h.nav(
                [
                  h.AriaLabel("Site navigation"),
                  h.Class(
                    "absolute top-11 right-0 z-50 grid min-w-44 gap-1 rounded-lg border bg-background p-2 shadow-lg",
                  ),
                ],
                [
                  headerLink(
                    componentDocsPath("accordion"),
                    "Docs",
                    model.route._tag === "ComponentDocs",
                    "rounded-md px-3 py-2 hover:bg-accent",
                    h,
                  ),
                  headerLink(
                    createPath(),
                    "Create",
                    model.route._tag === "Create",
                    "rounded-md px-3 py-2 hover:bg-accent",
                    h,
                  ),
                  headerLink(
                    chartsPath("area"),
                    "Charts",
                    isCharts,
                    "rounded-md px-3 py-2 hover:bg-accent",
                    h,
                  ),
                  headerLink(
                    blocksIndexPath(),
                    "Blocks",
                    model.route._tag === "BlocksIndex",
                    "rounded-md px-3 py-2 hover:bg-accent",
                    h,
                  ),
                  headerLink(
                    blocksStyleXPath(),
                    "Blocks StyleX",
                    model.route._tag === "BlocksStyleX" || model.route._tag === "BlocksStyleXTable",
                    "rounded-md px-3 py-2 hover:bg-accent",
                    h,
                  ),
                ],
              ),
            ],
          ),
          h.button(
            [
              h.Type("button"),
              h.OnClick(ClickedThemeToggle()),
              h.AriaLabel(
                model.isDark ? "Switch to light mode" : "Switch to dark mode",
              ),
              h.Title(
                model.isDark ? "Switch to light mode" : "Switch to dark mode",
              ),
              h.Class(
                "group relative inline-flex size-10 shrink-0 items-center justify-center rounded-md text-foreground outline-none transition-[color,background-color,transform] duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96] sm:ml-auto",
              ),
            ],
            [
              h.span(
                [h.Class("relative size-4")],
                [
                  Icon.icon(
                    "sun",
                    {
                      class:
                        "theme-toggle-icon absolute inset-0 size-4 scale-100 opacity-100 transition-[scale,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] dark:scale-25 dark:opacity-0",
                    },
                    h,
                  ),
                  Icon.icon(
                    "moon",
                    {
                      class:
                        "theme-toggle-icon absolute inset-0 size-4 scale-25 opacity-0 transition-[scale,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] dark:scale-100 dark:opacity-100",
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
const boardConstrainedView = defineView<
  BoardConstrained.Model,
  BoardConstrained.Message
>(BoardConstrained.view);
const landingView = defineView<Landing.Model, Landing.Message>(Landing.view);
const catalogDocsView = defineView<
  ComponentCatalog.Model,
  ComponentCatalog.Message,
  string
>((catalogModel, slug, h) => ComponentCatalog.view(catalogModel, slug, h));
const blocksRegistryView = defineView<Blocks.Model, Blocks.Message, string>(
  (blocksModel, blockId, h) => Blocks.view(blocksModel, blockId, h),
);
const blocksStyleXView = defineView<
  BlocksStyleXPage.Model,
  BlocksStyleXPage.Message
>(BlocksStyleXPage.view);
const tanStackTableView = defineView<
  TanStackTablePage.Model,
  TanStackTablePage.Message
>(TanStackTablePage.view);

const blocksView = (
  model: Model,
  blockId: string,
  h: HtmlBuilder<Message>,
): Html => {
  if (model.page._tag !== "BlockPage") return h.empty;
  return h.submodel({
    slotId: "sidebar-blocks",
    model: model.page.blocks,
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
const chartsStyleXView = defineView<
  ChartsStyleX.Model,
  ChartsStyleX.Message,
  ChartSection
>(ChartsStyleX.view);

const chartsSectionView = (
  model: Model,
  section: ChartSection,
  h: HtmlBuilder<Message>,
): Html => {
  if (model.page._tag !== "ChartsPage") return h.empty;
  const page = model.page;
  if (page.renderer === "stylex") {
    return h.submodel({
      slotId: `charts-stylex-${section}`,
      model: page.styleXCharts,
      view: chartsStyleXView,
      viewInputs: section,
      toParentMessage: (message: ChartsStyleX.Message): Message =>
        GotChartsStyleXMessage({ message }),
    });
  }
  return M.value(section).pipe(
    M.withReturnType<Html>(),
    M.when("area", () =>
      h.submodel({
        slotId: "charts-area",
        model: page.area,
        view: chartsAreaView,
        toParentMessage: (message: ChartsArea.Message): Message =>
          GotChartsAreaMessage({ message }),
      }),
    ),
    M.when("bar", () =>
      h.submodel({
        slotId: "charts-bar",
        model: page.bar,
        view: chartsBarView,
        toParentMessage: (message: ChartsBar.Message): Message =>
          GotChartsBarMessage({ message }),
      }),
    ),
    M.when("line", () =>
      h.submodel({
        slotId: "charts-line",
        model: page.line,
        view: chartsLineView,
        toParentMessage: (message: ChartsLine.Message): Message =>
          GotChartsLineMessage({ message }),
      }),
    ),
    M.when("pie", () =>
      h.submodel({
        slotId: "charts-pie",
        model: page.pie,
        view: chartsPieView,
        toParentMessage: (message: ChartsPie.Message): Message =>
          GotChartsPieMessage({ message }),
      }),
    ),
    M.when("radar", () =>
      h.submodel({
        slotId: "charts-radar",
        model: page.radar,
        view: chartsRadarView,
        toParentMessage: (message: ChartsRadar.Message): Message =>
          GotChartsRadarMessage({ message }),
      }),
    ),
    M.when("radial", () =>
      h.submodel({
        slotId: "charts-radial",
        model: page.radial,
        view: chartsRadialView,
        toParentMessage: (message: ChartsRadial.Message): Message =>
          GotChartsRadialMessage({ message }),
      }),
    ),
    M.when("tooltip", () =>
      h.submodel({
        slotId: "charts-tooltip",
        model: page.tooltip,
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
    [h.Class("mx-auto flex max-w-xl flex-col items-start gap-4 px-8 py-16")],
    [
      h.h1([h.Class("text-3xl font-semibold tracking-tight")], ["crease/ui"]),
      h.p(
        [h.Class("text-muted-foreground")],
        ["shadcn/ui rebuilt on foldkit UI. Pick a demo:"],
      ),
      h.ul(
        [h.Class("list-disc pl-5 text-sm leading-7")],
        [
          h.li(
            [],
            [
              h.a(
                [h.Href(createPath()), h.Class("underline underline-offset-4")],
                ["/create — the ui.shadcn.com/create preview board"],
              ),
            ],
          ),
          h.li(
            [],
            [
              h.a(
                [
                  h.Href(chartsPath("area")),
                  h.Class("underline underline-offset-4"),
                ],
                ["/charts — shadcn charts rendered with Apache ECharts"],
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
    [h.Class("mx-auto max-w-xl px-8 py-16")],
    [h.p([h.Class("text-muted-foreground")], [`No page at ${path}.`])],
  );
};

/* Each page subtree is KEYED by route (and by charts section). Without keys,
   snabbdom patches the next page into the previous page's DOM in place; since
   neither submodel's model changed, the submodel boundary skips re-rendering
   and the old page's content stays on screen after navigation. A distinct key
   per page forces a subtree replacement on route change. */
const pageView = (model: Model, h: HtmlBuilder<Message>): Html => {
  const keyed = (key: string, content: Html): Html =>
    h.keyed("div")(key, [], [content]);

  return M.value(model.route).pipe(
    M.withReturnType<Html>(),
    M.tagsExhaustive({
      Home: () =>
        model.page._tag === "LandingPage"
          ? keyed(
              "page-home",
              h.submodel({
                slotId: "landing",
                model: model.page.landing,
                view: landingView,
                toParentMessage: (message: Landing.Message): Message =>
                  GotLandingMessage({ message }),
              }),
            )
          : keyed("page-not-found", notFoundView("/", h)),
      Create: () =>
        model.page._tag === "CreatePage"
          ? model.page.renderer === "tailwind"
            ? keyed(
                "page-create-tailwind",
                h.submodel({
                  slotId: "create-board-tailwind",
                  model: model.page.tailwindBoard,
                  view: boardView,
                  toParentMessage: (message: Board.Message): Message =>
                    GotBoardMessage({ message }),
                }),
              )
            : keyed(
                "page-create-stylex",
                h.submodel({
                  slotId: "create-board-stylex",
                  model: model.page.styleXBoard,
                  view: boardConstrainedView,
                  toParentMessage: (message: BoardConstrained.Message): Message =>
                    GotBoardStyleXMessage({ message }),
                }),
              )
          : keyed("page-not-found", notFoundView(createPath(), h)),
      Charts: ({ section }) =>
        isChartSection(section)
          ? keyed(
              `page-charts-${section}-${model.page._tag === "ChartsPage" ? model.page.renderer : "missing"}`,
              chartsSectionView(model, section, h),
            )
          : keyed("page-not-found", notFoundView(`/charts/${section}`, h)),
      BlocksIndex: () => keyed("page-blocks-index", BlocksIndexPage.view(h)),
      BlocksStyleX: () =>
        model.page._tag === "BlocksStyleXPage"
          ? keyed(
              "page-blocks-stylex",
              h.submodel({
                slotId: "blocks-stylex",
                model: model.page.table,
                view: blocksStyleXView,
                toParentMessage: (message: BlocksStyleXPage.Message): Message =>
                  GotBlocksStyleXMessage({ message }),
              }),
            )
          : keyed("page-not-found", notFoundView(blocksStyleXPath(), h)),
      BlocksStyleXTable: () =>
        model.page._tag === "BlocksStyleXTablePage"
          ? keyed(
              "page-blocks-stylex-table",
              h.submodel({
                slotId: "blocks-stylex-table",
                model: model.page.table,
                view: tanStackTableView,
                toParentMessage: (message: TanStackTablePage.Message): Message =>
                  GotTanStackTableMessage({ message }),
              }),
            )
          : keyed("page-not-found", notFoundView(blocksStyleXTablePath(), h)),
      Block: ({ blockId }) =>
        keyed(`page-block-${blockId}`, blocksView(model, blockId, h)),
      ComponentDocs: ({ component }) =>
        ComponentCatalog.hasCatalogPage(component) &&
        model.page._tag === "CatalogDocsPage"
          ? keyed(
              `page-docs-${component}`,
              h.submodel({
                slotId: `docs-${component}`,
                model: model.page.docs,
                view: catalogDocsView,
                viewInputs: component,
                toParentMessage: (message: ComponentCatalog.Message): Message =>
                  GotCatalogDocsMessage({ message }),
              }),
            )
          : keyed(
              "page-not-found",
              notFoundView(`/docs/components/${component}`, h),
            ),
      NotFound: ({ path }) => keyed("page-not-found", notFoundView(path, h)),
    }),
  );
};

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  // Block pages are full-viewport layouts (shown inside the index's iframes),
  // so they render without the global header.
  const isFullPage = model.route._tag === "Block";
  const title =
    model.route._tag === "ComponentDocs"
      ? `${ComponentCatalog.titleFor(model.route.component) ?? "Not Found"} - crease/ui`
      : "crease/ui";

  return {
    title,
    body: isFullPage
      ? h.div([], [pageView(model, h)])
      : h.div([], [header(model, h), pageView(model, h)]),
  };
};

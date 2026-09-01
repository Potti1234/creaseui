import { Schema as S, pipe } from "effect";
import { Route } from "foldkit";
import { literal, r, slash, string } from "foldkit/route";

export const ChartSection = S.Literals([
  "area",
  "bar",
  "line",
  "pie",
  "radar",
  "radial",
  "tooltip",
]);
export type ChartSection = typeof ChartSection.Type;

export const CHART_SECTIONS: ReadonlyArray<ChartSection> = [
  "area",
  "bar",
  "line",
  "pie",
  "radar",
  "radial",
  "tooltip",
];

export const isChartSection = S.is(ChartSection);

export const SIDEBAR_BLOCK_IDS: ReadonlyArray<string> = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
];

export const HomeRoute = r("Home");
export const CreateRoute = r("Create");
export const CreateStyleXRoute = r("CreateStyleX");
export const CreateConstrainedRoute = r("CreateConstrained");
export const StyleXRoute = r("StyleX");
export const ChartsRoute = r("Charts", { section: S.String });
export const ChartsStyleXRoute = r("ChartsStyleX");
export const BlocksIndexRoute = r("BlocksIndex");
export const BlocksStyleXRoute = r("BlocksStyleX");
export const BlocksStyleXTableRoute = r("BlocksStyleXTable");
export const BlockRoute = r("Block", { blockId: S.String });
export const ComponentDocsRoute = r("ComponentDocs", { component: S.String });
export const NotFoundRoute = r("NotFound", { path: S.String });

export const AppRoute = S.Union([
  HomeRoute,
  CreateRoute,
  CreateStyleXRoute,
  CreateConstrainedRoute,
  StyleXRoute,
  ChartsRoute,
  ChartsStyleXRoute,
  BlocksIndexRoute,
  BlocksStyleXRoute,
  BlocksStyleXTableRoute,
  BlockRoute,
  ComponentDocsRoute,
  NotFoundRoute,
]);

export type HomeRoute = typeof HomeRoute.Type;
export type CreateRoute = typeof CreateRoute.Type;
export type CreateStyleXRoute = typeof CreateStyleXRoute.Type;
export type CreateConstrainedRoute = typeof CreateConstrainedRoute.Type;
export type ChartsRoute = typeof ChartsRoute.Type;
export type ChartsStyleXRoute = typeof ChartsStyleXRoute.Type;
export type BlocksIndexRoute = typeof BlocksIndexRoute.Type;
export type BlocksStyleXRoute = typeof BlocksStyleXRoute.Type;
export type BlocksStyleXTableRoute = typeof BlocksStyleXTableRoute.Type;
export type BlockRoute = typeof BlockRoute.Type;
export type ComponentDocsRoute = typeof ComponentDocsRoute.Type;
export type NotFoundRoute = typeof NotFoundRoute.Type;
export type AppRoute = typeof AppRoute.Type;

const homeRouter = pipe(Route.root, Route.mapTo(HomeRoute));

const createRouter = pipe(literal("create"), Route.mapTo(CreateRoute));

const createStyleXRouter = pipe(
  literal("create-stylex"),
  Route.mapTo(CreateStyleXRoute),
);

const createConstrainedRouter = pipe(
  literal("create-constrained"),
  Route.mapTo(CreateConstrainedRoute),
);

const stylexRouter = pipe(literal("stylex"), Route.mapTo(StyleXRoute));

const chartsRouter = pipe(
  literal("charts"),
  slash(string("section")),
  Route.mapTo(ChartsRoute),
);

const chartsStyleXRouter = pipe(
  literal("charts-stylex"),
  Route.mapTo(ChartsStyleXRoute),
);

const blocksIndexRouter = pipe(
  literal("blocks"),
  slash(literal("sidebar")),
  Route.mapTo(BlocksIndexRoute),
);

const blocksStyleXRouter = pipe(
  literal("blocks-stylex"),
  Route.mapTo(BlocksStyleXRoute),
);

const blocksStyleXTableRouter = pipe(
  literal("blocks-stylex"),
  slash(literal("table")),
  Route.mapTo(BlocksStyleXTableRoute),
);

const blockRouter = pipe(
  literal("blocks"),
  slash(literal("sidebar")),
  slash(string("blockId")),
  Route.mapTo(BlockRoute),
);

const componentDocsRouter = pipe(
  literal("docs"),
  slash(literal("components")),
  slash(string("component")),
  Route.mapTo(ComponentDocsRoute),
);

const routeParser = Route.oneOf(
  createRouter,
  createStyleXRouter,
  createConstrainedRouter,
  stylexRouter,
  chartsRouter,
  chartsStyleXRouter,
  blockRouter,
  blocksIndexRouter,
  blocksStyleXTableRouter,
  blocksStyleXRouter,
  componentDocsRouter,
  homeRouter,
);

export const urlToAppRoute = Route.parseUrlWithFallback(
  routeParser,
  NotFoundRoute,
);

export const homePath = (): string => homeRouter();

export const createPath = (): string => createRouter();

export const createStyleXPath = (): string => createStyleXRouter();

export const createConstrainedPath = (): string => createConstrainedRouter();

export const stylexPath = (): string => stylexRouter();

export const chartsPath = (section: ChartSection): string =>
  chartsRouter({ section });

export const chartsStyleXPath = (): string => chartsStyleXRouter();

export const blocksIndexPath = (): string => blocksIndexRouter();

export const blocksStyleXPath = (): string => blocksStyleXRouter();

export const blocksStyleXTablePath = (): string => blocksStyleXTableRouter();

export const blockPath = (blockId: string): string => blockRouter({ blockId });

export const componentDocsPath = (component: string): string =>
  componentDocsRouter({ component });

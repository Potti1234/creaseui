import { Match as M, Schema as S } from "effect";
import { taggedStruct } from "foldkit/schema";

import * as BlocksTailwindFeature from "@/demo/blocks/featured-page";
import * as SidebarStyleX from "@/demo/blocks-stylex/sidebar-page";
import * as BlocksFeature from "@/demo/blocks/registry";
import * as BlocksStyleXFeature from "@/demo/blocks-stylex/featured-page";
import * as TanStackTableFeature from "@/demo/blocks-stylex/tanstack-table-page";
import * as BoardFeature from "@/demo/board";
import * as BoardConstrained from "@/demo/board-constrained";
import * as LandingFeature from "@/demo/landing";
import * as ChartsArea from "@/demo/charts/area";
import * as ChartsBar from "@/demo/charts/bar";
import * as ChartsLine from "@/demo/charts/line";
import * as ChartsPie from "@/demo/charts/pie";
import * as ChartsRadar from "@/demo/charts/radar";
import * as ChartsRadial from "@/demo/charts/radial";
import * as ChartsTooltip from "@/demo/charts/tooltip";
import * as ChartsStyleX from "@/demo/charts-stylex/page";
import * as ComponentCatalog from "@/docs/components/catalog";
import * as CopyFeedback from "@/docs/copy-feedback";
import type { AppRoute } from "@/route";

export const Landing = taggedStruct("LandingPage", { landing: LandingFeature.Model });
export const CreateRenderer = S.Literals(["tailwind", "stylex"]);
export type CreateRenderer = typeof CreateRenderer.Type;
export const Create = taggedStruct("CreatePage", {
  renderer: CreateRenderer,
  tailwindBoard: BoardFeature.Model,
  styleXBoard: BoardConstrained.Model,
});
export const BlockCategory = S.Literals(["all", "dashboard", "sidebar", "login"]);
export const BlockCodePanel = S.Struct({
  files: S.Record(S.String, S.String),
  codeFile: S.String,
});
export type BlockCodePanel = typeof BlockCodePanel.Type;
export const BlocksIndex = taggedStruct("BlocksIndexPage", { renderer: CreateRenderer, category: BlockCategory, codeBlocks: S.Record(S.String, BlockCodePanel), copiedCode: CopyFeedback.Model });
export const BlocksStyleXTable = taggedStruct("BlocksStyleXTablePage", {
  table: TanStackTableFeature.Model,
});
export const Block = taggedStruct("BlockPage", { blocks: BlocksFeature.Model, styleXSidebar: SidebarStyleX.Model, styleXFeatured: BlocksStyleXFeature.Model, tailwindFeatured: BlocksTailwindFeature.Model });
export const Charts = taggedStruct("ChartsPage", {
  renderer: CreateRenderer,
  area: ChartsArea.Model,
  bar: ChartsBar.Model,
  line: ChartsLine.Model,
  pie: ChartsPie.Model,
  radar: ChartsRadar.Model,
  radial: ChartsRadial.Model,
  tooltip: ChartsTooltip.Model,
  styleXCharts: ChartsStyleX.Model,
});
export const CatalogDocs = taggedStruct("CatalogDocsPage", {
  docs: ComponentCatalog.Model,
});
export const NotFound = taggedStruct("NotFoundPage");

export const Page = S.Union([
  Landing,
  Create,
  BlocksIndex,
  BlocksStyleXTable,
  Block,
  Charts,
  CatalogDocs,
  NotFound,
]);
export type Page = typeof Page.Type;

export const init = (route: AppRoute): Page =>
  M.value(route).pipe(
    M.withReturnType<Page>(),
    M.tagsExhaustive({
      Home: () => Landing({ landing: LandingFeature.init() }),
      Create: () =>
        Create({
          renderer: "tailwind",
          tailwindBoard: BoardFeature.init(),
          styleXBoard: BoardConstrained.init(),
        }),
      Charts: () =>
        Charts({
          renderer: "tailwind",
          area: ChartsArea.init(),
          bar: ChartsBar.init(),
          line: ChartsLine.init(),
          pie: ChartsPie.init(),
          radar: ChartsRadar.init(),
          radial: ChartsRadial.init(),
          tooltip: ChartsTooltip.init(),
          styleXCharts: ChartsStyleX.init(),
        }),
      BlocksIndex: () => BlocksIndex({renderer: "tailwind", category: "all", codeBlocks: {}, copiedCode: null}),
      BlocksStyleX: () => BlocksIndex({renderer: "stylex", category: "all", codeBlocks: {}, copiedCode: null}),
      BlocksStyleXTable: () => BlocksStyleXTable({ table: TanStackTableFeature.init() }),
      Block: () => Block({ blocks: BlocksFeature.init(), styleXSidebar: SidebarStyleX.init(), styleXFeatured: BlocksStyleXFeature.init(), tailwindFeatured: BlocksTailwindFeature.init() }),
      ComponentDocs: ({ component }) =>
        ComponentCatalog.hasCatalogPage(component)
          ? CatalogDocs({ docs: ComponentCatalog.init(component) })
          : NotFound(),
      NotFound: () => NotFound(),
    }),
  );

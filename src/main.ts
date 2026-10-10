import { Effect, Equal, Match as M, Option, Schema as S } from 'effect'
import type { Runtime, Update } from 'foldkit'
import { Command, Subscription } from 'foldkit'
import * as Dom from 'foldkit/dom'
import type { Document, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { UrlRequest, load, pushUrl } from 'foldkit/navigation'
import { Url, toString as urlToString } from 'foldkit/url'
import * as Render from 'foldkit/render'
import { defineView } from 'foldkit/submodel'
import { modifyFields } from 'foldkit/struct'

import * as BlocksTailwindPage from '@/demo/blocks/featured-page'
import * as SidebarStyleX from '@/demo/blocks-stylex/sidebar-page'
import { resolveBlock } from '@/demo/blocks/catalog'
import * as BlocksIndexPage from '@/demo/blocks/index-page'
import * as BlocksStyleXPage from '@/demo/blocks-stylex/featured-page'
import * as TanStackTablePage from '@/demo/blocks-stylex/tanstack-table-page'
import * as Blocks from '@/demo/blocks/registry'
import * as Board from '@/demo/board'
import * as BoardStyleX from '@/demo/board-stylex'
import * as Landing from '@/demo/landing'
import * as ChartsArea from '@/demo/charts/area'
import * as ChartsBar from '@/demo/charts/bar'
import * as ChartsLine from '@/demo/charts/line'
import * as ChartsPie from '@/demo/charts/pie'
import * as ChartsRadar from '@/demo/charts/radar'
import * as ChartsRadial from '@/demo/charts/radial'
import * as ChartsTooltip from '@/demo/charts/tooltip'
import * as ChartsStyleX from '@/demo/charts-stylex/page'
import * as ComponentCatalog from '@/docs/components/catalog'
import * as GettingStartedPage from '@/docs/getting-started-view'
import * as CopyFeedback from '@/docs/copy-feedback'
import * as CodeFile from '@/lib/code-file'
import * as Page from '@/app/page'
import * as Chrome from '@/site/chrome'
import * as DocsSearch from '@/site/docs-search'
import { counterpartUrl, renderer } from '@/site/config'
import {
  AppRoute,
  type ChartSection,
  blocksIndexPath,
  blocksStyleXTablePath,
  chartsPath,
  componentDocsPath,
  gettingStartedPath,
  createPath,
  homePath,
  isChartSection,
  urlToAppRoute,
} from '@/route'

// MODEL

export const Model = S.Struct({
  route: AppRoute,
  currentUrl: S.String,
  isDark: S.Boolean,
  page: Page.Page,
  docsSearch: DocsSearch.Model,
})
export type Model = typeof Model.Type

// FLAGS

export const Flags = S.Struct({
  isDark: S.Boolean,
})
export type Flags = typeof Flags.Type

export const flags: Effect.Effect<Flags> = Effect.sync(() => ({
  isDark: document.documentElement.classList.contains('dark'),
}))

// MESSAGE

export const Message = defineMessageUnion({
  CompletedNavigateInternal: {},
  CompletedLoadExternal: {},
  CompletedScrollToTop: {},
  CompletedScrollToFragment: {},
  ClickedLink: { request: UrlRequest },
  ChangedUrl: { url: Url },
  ClickedThemeToggle: {},
  CompletedApplyTheme: {},
  IgnoredBlocksPreviewInput: {},
  ChangedBlocksCategory: { category: Page.BlockCategory },
  ToggledBlockCode: { block: S.String },
  LoadedBlockCode: {
    block: S.String,
    renderer: Page.Renderer,
    primary: S.String,
    files: S.Record(S.String, S.String),
  },
  SelectedBlockCodeFile: { block: S.String, path: S.String },
  GotCodeFileMessage: {
    message: CodeFile.Message,
  },
  GotBlocksCopyMessage: {
    message: CopyFeedback.Message,
  },
  GotBlocksTailwindMessage: { message: BlocksTailwindPage.Message },
  GotSidebarStyleXMessage: { message: SidebarStyleX.Message },
  GotBoardMessage: { message: Board.Message },
  GotBoardStyleXMessage: {
    message: BoardStyleX.Message,
  },
  GotBlocksMessage: {
    message: Blocks.Message,
  },
  GotBlocksStyleXMessage: {
    message: BlocksStyleXPage.Message,
  },
  GotTanStackTableMessage: {
    message: TanStackTablePage.Message,
  },
  GotLandingMessage: {
    message: Landing.Message,
  },
  GotChartsAreaMessage: {
    message: ChartsArea.Message,
  },
  GotChartsBarMessage: {
    message: ChartsBar.Message,
  },
  GotChartsLineMessage: {
    message: ChartsLine.Message,
  },
  GotChartsPieMessage: {
    message: ChartsPie.Message,
  },
  GotChartsRadarMessage: {
    message: ChartsRadar.Message,
  },
  GotChartsRadialMessage: {
    message: ChartsRadial.Message,
  },
  GotChartsTooltipMessage: {
    message: ChartsTooltip.Message,
  },
  GotChartsStyleXMessage: {
    message: ChartsStyleX.Message,
  },
  GotCatalogDocsMessage: {
    message: ComponentCatalog.Message,
  },
  GotDocsSearchMessage: { message: DocsSearch.Message },
})
export type Message = typeof Message.Type

// INIT

export const init: Runtime.RoutingApplicationInit<Model, Message, Flags> = (
  flags,
  url: Url,
) => {
  const route = urlToAppRoute(url)
  return {
    model: {
      route,
      currentUrl: urlToString(url),
      isDark: flags.isDark,
      page: Page.init(route),
      docsSearch: DocsSearch.init(),
    },
    commands: Option.isSome(url.hash)
      ? [ScrollToFragment({ hash: url.hash.value })]
      : [],
  }
}

// COMMAND

const NavigateInternal = Command.define('NavigateInternal', {
  args: { url: S.String },
  messages: [Message.CompletedNavigateInternal],
  execute: ({ url }) =>
    pushUrl(url).pipe(Effect.as(Message.CompletedNavigateInternal())),
})

const LoadExternal = Command.define('LoadExternal', {
  args: { href: S.String },
  messages: [Message.CompletedLoadExternal],
  execute: ({ href }) =>
    load(href).pipe(Effect.as(Message.CompletedLoadExternal())),
})

const ApplyTheme = Command.define('ApplyTheme', {
  args: { isDark: S.Boolean },
  messages: [Message.CompletedApplyTheme],
  execute: ({ isDark }) =>
    Effect.sync(() => {
      document.documentElement.classList.toggle('dark', isDark)
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
      localStorage.setItem('creaseui-theme', isDark ? 'dark' : 'light')
      return Message.CompletedApplyTheme()
    }),
})

const ScrollToTop = Command.define('ScrollToTop', {
  messages: [Message.CompletedScrollToTop],
  execute: Render.afterPaint.pipe(
    Effect.andThen(
      Effect.sync(() => window.scrollTo({ top: 0, behavior: 'instant' })),
    ),
    Effect.as(Message.CompletedScrollToTop()),
  ),
})

const ScrollToFragment = Command.define('ScrollToFragment', {
  args: { hash: S.String },
  messages: [Message.CompletedScrollToFragment],
  execute: ({ hash }) =>
    Effect.try(() => decodeURIComponent(hash)).pipe(
      Effect.catch(() => Effect.succeed(hash)),
      Effect.flatMap(id =>
        Dom.scrollIntoViewAfterPaint(`#${CSS.escape(id)}`, { block: 'start' }),
      ),
      Effect.catch(() => Effect.void),
      Effect.as(Message.CompletedScrollToFragment()),
    ),
})

const LoadBlockCode = Command.define('LoadBlockCode', {
  args: { renderer: Page.Renderer, name: S.String },
  messages: [Message.LoadedBlockCode],
  execute: ({ renderer, name }) =>
    Effect.promise(() => BlocksIndexPage.loadBlockSources(renderer, name)).pipe(
      Effect.map(({ primary, files }) =>
        Message.LoadedBlockCode({ block: name, renderer, primary, files }),
      ),
    ),
})

// UPDATE

type UpdateReturn = Update.Return<Model, Message>
const withUpdateReturn = M.withReturnType<UpdateReturn>()

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    withUpdateReturn,
    M.tagsExhaustive({
      CompletedNavigateInternal: () => ({ model: model }),
      CompletedScrollToTop: () => ({ model: model }),
      CompletedScrollToFragment: () => ({ model: model }),
      CompletedLoadExternal: () => ({ model: model }),
      CompletedApplyTheme: () => ({ model: model }),
      IgnoredBlocksPreviewInput: () => ({ model: model }),
      GotDocsSearchMessage: ({ message }) => {
        const next = DocsSearch.update(model.docsSearch, message)
        return {
          model: { ...model, docsSearch: next.model },
          commands: [
            ...Command.mapMessages(next.commands ?? [], message =>
              Message.GotDocsSearchMessage({ message }),
            ),
            ...(next.outMessage?._tag === 'SelectedDoc'
              ? [
                  NavigateInternal({
                    url: new URL(
                      componentDocsPath(next.outMessage.slug),
                      model.currentUrl,
                    ).href,
                  }),
                ]
              : []),
          ],
        }
      },

      ChangedBlocksCategory: ({ category }) =>
        model.page._tag === 'BlocksIndexPage'
          ? {
              model: {
                ...model,
                page: { ...model.page, category, codeBlocks: {} },
              },
            }
          : { model: model },
      ToggledBlockCode: ({ block }) => {
        if (model.page._tag !== 'BlocksIndexPage') return { model: model }
        const page = model.page
        if (page.codeBlocks[block] !== undefined) {
          const codeBlocks = Object.fromEntries(
            Object.entries(page.codeBlocks).filter(([name]) => name !== block),
          )
          return { model: { ...model, page: { ...page, codeBlocks } } }
        }
        const codeBlocks = {
          ...page.codeBlocks,
          [block]: { files: {}, codeFile: '' },
        }
        return {
          model: { ...model, page: { ...page, codeBlocks } },
          commands: [LoadBlockCode({ renderer: page.renderer, name: block })],
        }
      },
      LoadedBlockCode: ({ block, renderer, primary, files }) => {
        if (
          model.page._tag !== 'BlocksIndexPage' ||
          model.page.codeBlocks[block] === undefined ||
          model.page.renderer !== renderer
        )
          return { model: model }
        const codeBlocks = {
          ...model.page.codeBlocks,
          [block]: { files, codeFile: primary },
        }
        return { model: { ...model, page: { ...model.page, codeBlocks } } }
      },
      SelectedBlockCodeFile: ({ block, path }) => {
        const panel =
          model.page._tag === 'BlocksIndexPage'
            ? model.page.codeBlocks[block]
            : undefined
        if (
          model.page._tag !== 'BlocksIndexPage' ||
          panel === undefined ||
          panel.files[path] === undefined
        )
          return { model: model }
        const codeBlocks = {
          ...model.page.codeBlocks,
          [block]: { ...panel, codeFile: path },
        }
        return { model: { ...model, page: { ...model.page, codeBlocks } } }
      },
      GotCodeFileMessage: () => ({ model: model }),
      GotBlocksCopyMessage: ({ message: child }) => {
        if (model.page._tag !== 'BlocksIndexPage') return { model: model }
        const page = model.page
        const { model: copiedCode, commands: copiedCodeCommands__ } =
          CopyFeedback.update(page.copiedCode, child)
        const commands = copiedCodeCommands__ ?? []
        return {
          model: { ...model, page: { ...page, copiedCode } },
          commands: Command.mapMessages(commands, message =>
            Message.GotBlocksCopyMessage({ message }),
          ),
        }
      },
      GotBlocksTailwindMessage: ({ message: child }) => {
        if (model.page._tag !== 'BlockPage') return { model: model }
        const tailwindFeatured = BlocksTailwindPage.update(
          model.page.tailwindFeatured,
          child,
        ).model
        return {
          model: { ...model, page: { ...model.page, tailwindFeatured } },
        }
      },
      GotSidebarStyleXMessage: ({ message: child }) => {
        if (model.page._tag !== 'BlockPage') return { model: model }
        const { model: styleXSidebar, commands: styleXSidebarCommands__ } =
          SidebarStyleX.update(model.page.styleXSidebar, child)
        const commands = styleXSidebarCommands__ ?? []
        return {
          model: { ...model, page: { ...model.page, styleXSidebar } },
          commands: Command.mapMessages(commands, message =>
            Message.GotSidebarStyleXMessage({ message }),
          ),
        }
      },
      ClickedThemeToggle: () => {
        const isDark = !model.isDark
        return {
          model: modifyFields(model, { isDark: () => isDark }),
          commands: [ApplyTheme({ isDark })],
        }
      },

      ClickedLink: ({ request }) =>
        M.value(request).pipe(
          withUpdateReturn,
          M.tagsExhaustive({
            Internal: ({ url }) => ({
              model: model,
              commands: [NavigateInternal({ url: urlToString(url) })],
            }),
            External: ({ href }) => ({
              model: model,
              commands: [LoadExternal({ href })],
            }),
          }),
        ),

      ChangedUrl: ({ url }) => {
        const route = urlToAppRoute(url)
        const routeChanged = !Equal.equals(model.route, route)
        const page =
          !routeChanged ||
          (model.page._tag === 'ChartsPage' && route._tag === 'Charts')
            ? model.page
            : Page.init(route)
        return {
          model: modifyFields(model, {
            route: () => route,
            currentUrl: () => urlToString(url),
            page: () => page,
          }),
          commands: Option.isSome(url.hash)
            ? [ScrollToFragment({ hash: url.hash.value })]
            : routeChanged
              ? [ScrollToTop()]
              : [],
        }
      },

      GotBoardMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'CreatePage') return { model: model }
        const currentPage = model.page
        const { model: board, commands: boardCommands__ } = Board.update(
          currentPage.tailwindBoard,
          childMessage,
        )
        const commands = boardCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () =>
              modifyFields(currentPage, { tailwindBoard: () => board }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotBoardMessage({ message: next }),
          ),
        }
      },

      GotBlocksMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'BlockPage') return { model: model }
        const currentPage = model.page
        const { model: blocks, commands: blocksCommands__ } = Blocks.update(
          currentPage.blocks,
          childMessage,
        )
        const commands = blocksCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { blocks: () => blocks }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotBlocksMessage({ message: next }),
          ),
        }
      },

      GotBlocksStyleXMessage: ({ message: child }) => {
        if (model.page._tag !== 'BlockPage') return { model: model }
        const styleXFeatured = BlocksStyleXPage.update(
          model.page.styleXFeatured,
          child,
        ).model
        return { model: { ...model, page: { ...model.page, styleXFeatured } } }
      },

      GotTanStackTableMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'BlocksStyleXTablePage') return { model: model }
        const currentPage = model.page
        const { model: table, commands: tableCommands__ } =
          TanStackTablePage.update(currentPage.table, childMessage)
        const commands = tableCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { table: () => table }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotTanStackTableMessage({ message: next }),
          ),
        }
      },

      GotLandingMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'LandingPage') return { model: model }
        const currentPage = model.page
        const { model: landing, commands: landingCommands__ } = Landing.update(
          currentPage.landing,
          childMessage,
        )
        const commands = landingCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { landing: () => landing }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotLandingMessage({ message: next }),
          ),
        }
      },

      GotBoardStyleXMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'CreatePage') return { model: model }
        const currentPage = model.page
        const { model: board, commands: boardCommands__ } = BoardStyleX.update(
          currentPage.styleXBoard,
          childMessage,
        )
        const commands = boardCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { styleXBoard: () => board }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotBoardStyleXMessage({ message: next }),
          ),
        }
      },

      GotChartsAreaMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'ChartsPage') return { model: model }
        const currentPage = model.page
        const { model: page, commands: pageCommands__ } = ChartsArea.update(
          currentPage.area,
          childMessage,
        )
        const commands = pageCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { area: () => page }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotChartsAreaMessage({ message: next }),
          ),
        }
      },

      GotChartsBarMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'ChartsPage') return { model: model }
        const currentPage = model.page
        const { model: page, commands: pageCommands__ } = ChartsBar.update(
          currentPage.bar,
          childMessage,
        )
        const commands = pageCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { bar: () => page }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotChartsBarMessage({ message: next }),
          ),
        }
      },

      GotChartsLineMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'ChartsPage') return { model: model }
        const currentPage = model.page
        const { model: page, commands: pageCommands__ } = ChartsLine.update(
          currentPage.line,
          childMessage,
        )
        const commands = pageCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { line: () => page }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotChartsLineMessage({ message: next }),
          ),
        }
      },

      GotChartsPieMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'ChartsPage') return { model: model }
        const currentPage = model.page
        const { model: page, commands: pageCommands__ } = ChartsPie.update(
          currentPage.pie,
          childMessage,
        )
        const commands = pageCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { pie: () => page }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotChartsPieMessage({ message: next }),
          ),
        }
      },

      GotChartsRadarMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'ChartsPage') return { model: model }
        const currentPage = model.page
        const { model: page, commands: pageCommands__ } = ChartsRadar.update(
          currentPage.radar,
          childMessage,
        )
        const commands = pageCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { radar: () => page }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotChartsRadarMessage({ message: next }),
          ),
        }
      },

      GotChartsRadialMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'ChartsPage') return { model: model }
        const currentPage = model.page
        const { model: page, commands: pageCommands__ } = ChartsRadial.update(
          currentPage.radial,
          childMessage,
        )
        const commands = pageCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { radial: () => page }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotChartsRadialMessage({ message: next }),
          ),
        }
      },

      GotChartsTooltipMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'ChartsPage') return { model: model }
        const currentPage = model.page
        const { model: page, commands: pageCommands__ } = ChartsTooltip.update(
          currentPage.tooltip,
          childMessage,
        )
        const commands = pageCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () => modifyFields(currentPage, { tooltip: () => page }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotChartsTooltipMessage({ message: next }),
          ),
        }
      },

      GotChartsStyleXMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'ChartsPage') return { model: model }
        const currentPage = model.page
        const { model: charts, commands: chartsCommands__ } =
          ChartsStyleX.update(currentPage.styleXCharts, childMessage)
        const commands = chartsCommands__ ?? []
        return {
          model: modifyFields(model, {
            page: () =>
              modifyFields(currentPage, { styleXCharts: () => charts }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotChartsStyleXMessage({ message: next }),
          ),
        }
      },

      GotCatalogDocsMessage: ({ message: childMessage }) => {
        if (model.page._tag !== 'CatalogDocsPage') return { model: model }
        const currentPage = model.page
        const { model: catalogDocs, commands: catalogDocsCommands__ } =
          ComponentCatalog.update(currentPage.docs, childMessage)
        const commands = catalogDocsCommands__ ?? []
        const nextModel = modifyFields(model, {
          page: () => modifyFields(currentPage, { docs: () => catalogDocs }),
        })
        return {
          model: nextModel,
          commands: Command.mapMessages(commands, next =>
            Message.GotCatalogDocsMessage({ message: next }),
          ),
        }
      },
    }),
  )

// SUBSCRIPTIONS

const inactiveBoard = Board.init()
const inactiveBoardStyleX = BoardStyleX.init()
const inactiveCatalogDocs = ComponentCatalog.init()
const inactiveTanStackTablePage = TanStackTablePage.init()

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
}

export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift(DocsSearch.subscriptions)<Model, Message>({
    toChildModel: model => model.docsSearch,
    toParentMessage: message => Message.GotDocsSearchMessage({ message }),
    when: model => model.route._tag !== 'Block',
  }),
  Subscription.lift(Board.subscriptions)<Model, Message>({
    toChildModel: model =>
      model.page._tag === 'CreatePage'
        ? model.page.tailwindBoard
        : inactiveBoard,
    toParentMessage: message => Message.GotBoardMessage({ message }),
    when: model =>
      model.page._tag === 'CreatePage' && model.page.renderer === 'tailwind',
  }),
  Subscription.lift(boardStyleXSubscriptions)<Model, Message>({
    toChildModel: model =>
      model.page._tag === 'CreatePage'
        ? model.page.styleXBoard
        : inactiveBoardStyleX,
    toParentMessage: message => Message.GotBoardStyleXMessage({ message }),
    when: model =>
      model.page._tag === 'CreatePage' && model.page.renderer === 'stylex',
  }),
  Subscription.lift(ComponentCatalog.subscriptions)<Model, Message>({
    toChildModel: model =>
      model.page._tag === 'CatalogDocsPage'
        ? model.page.docs
        : inactiveCatalogDocs,
    toParentMessage: message => Message.GotCatalogDocsMessage({ message }),
  }),
  Subscription.lift(TanStackTablePage.subscriptions)<Model, Message>({
    toChildModel: model =>
      model.page._tag === 'BlocksStyleXTablePage'
        ? model.page.table
        : inactiveTanStackTablePage,
    toParentMessage: message => Message.GotTanStackTableMessage({ message }),
    when: model => model.page._tag === 'BlocksStyleXTablePage',
  }),
)

// VIEW

/* Page views are plain (model) => Html functions; wrap them once as
   SubmodelViews so h.submodel can embed them with message lifting. */
const boardView = defineView<Board.Model, Board.Message>(Board.view)
const boardStyleXView = defineView<BoardStyleX.Model, BoardStyleX.Message>(
  BoardStyleX.view,
)
const landingView = defineView<Landing.Model, Landing.Message, boolean>(
  (landingModel, isDark, h) => Landing.view(landingModel, h, isDark),
)
const docsSearchView = defineView<DocsSearch.Model, DocsSearch.Message>(
  DocsSearch.view,
)
const catalogDocsView = defineView<
  ComponentCatalog.Model,
  ComponentCatalog.Message,
  { slug: string; dark: boolean; renderer: Page.Renderer }
>((catalogModel, { slug, dark, renderer }, h) =>
  ComponentCatalog.view({ ...catalogModel, renderer }, slug, dark, h),
)
const blocksRegistryView = defineView<Blocks.Model, Blocks.Message, string>(
  (blocksModel, blockId, h) => Blocks.view(blocksModel, blockId, h),
)
const blocksStyleXView = defineView<
  BlocksStyleXPage.Model,
  BlocksStyleXPage.Message,
  string
>(BlocksStyleXPage.viewBlock)
const blocksTailwindView = defineView<
  BlocksTailwindPage.Model,
  BlocksTailwindPage.Message,
  string
>(BlocksTailwindPage.viewBlock)
const sidebarStyleXView = defineView<
  SidebarStyleX.Model,
  SidebarStyleX.Message,
  string
>(SidebarStyleX.view)
const tanStackTableView = defineView<
  TanStackTablePage.Model,
  TanStackTablePage.Message
>(TanStackTablePage.view)

const blocksView = (
  model: Model,
  blockId: string,
  h: HtmlBuilder<Message>,
): Html => {
  if (model.page._tag !== 'BlockPage') return h.empty
  const resolved = resolveBlock(blockId)
  const block = resolved === undefined ? undefined : { ...resolved, renderer }
  if (block === undefined) return h.p([], ['Unknown block.'])
  const page = model.page
  if (block.name.startsWith('sidebar-')) {
    const id = block.name.slice(8)
    return block.renderer === 'stylex'
      ? h.submodel({
          slotId: 'sidebar-stylex',
          model: page.styleXSidebar,
          view: sidebarStyleXView,
          viewInputs: id,
          toParentMessage: message =>
            Message.GotSidebarStyleXMessage({ message }),
        })
      : h.submodel({
          slotId: 'sidebar-blocks',
          model: page.blocks,
          view: blocksRegistryView,
          viewInputs: id,
          toParentMessage: message => Message.GotBlocksMessage({ message }),
        })
  }
  return block.renderer === 'stylex'
    ? h.submodel({
        slotId: 'featured-stylex',
        model: page.styleXFeatured,
        view: blocksStyleXView,
        viewInputs: block.name,
        toParentMessage: message => Message.GotBlocksStyleXMessage({ message }),
      })
    : h.submodel({
        slotId: 'featured-tailwind',
        model: page.tailwindFeatured,
        view: blocksTailwindView,
        viewInputs: block.name,
        toParentMessage: message =>
          Message.GotBlocksTailwindMessage({ message }),
      })
}
const chartsAreaView = defineView<ChartsArea.Model, ChartsArea.Message>(
  ChartsArea.view,
)
const chartsBarView = defineView<ChartsBar.Model, ChartsBar.Message>(
  ChartsBar.view,
)
const chartsLineView = defineView<ChartsLine.Model, ChartsLine.Message>(
  ChartsLine.view,
)
const chartsPieView = defineView<ChartsPie.Model, ChartsPie.Message>(
  ChartsPie.view,
)
const chartsRadarView = defineView<ChartsRadar.Model, ChartsRadar.Message>(
  ChartsRadar.view,
)
const chartsRadialView = defineView<ChartsRadial.Model, ChartsRadial.Message>(
  ChartsRadial.view,
)
const chartsTooltipView = defineView<
  ChartsTooltip.Model,
  ChartsTooltip.Message
>(ChartsTooltip.view)
const chartsStyleXView = defineView<
  ChartsStyleX.Model,
  ChartsStyleX.Message,
  ChartSection
>(ChartsStyleX.view)

const chartsSectionView = (
  model: Model,
  section: ChartSection,
  h: HtmlBuilder<Message>,
): Html => {
  if (model.page._tag !== 'ChartsPage') return h.empty
  const page = model.page
  if (page.renderer === 'stylex') {
    return h.submodel({
      slotId: `charts-stylex-${section}`,
      model: page.styleXCharts,
      view: chartsStyleXView,
      viewInputs: section,
      toParentMessage: (message: ChartsStyleX.Message): Message =>
        Message.GotChartsStyleXMessage({ message }),
    })
  }
  return M.value(section).pipe(
    M.withReturnType<Html>(),
    M.when('area', () =>
      h.submodel({
        slotId: 'charts-area',
        model: page.area,
        view: chartsAreaView,
        toParentMessage: (message: ChartsArea.Message): Message =>
          Message.GotChartsAreaMessage({ message }),
      }),
    ),
    M.when('bar', () =>
      h.submodel({
        slotId: 'charts-bar',
        model: page.bar,
        view: chartsBarView,
        toParentMessage: (message: ChartsBar.Message): Message =>
          Message.GotChartsBarMessage({ message }),
      }),
    ),
    M.when('line', () =>
      h.submodel({
        slotId: 'charts-line',
        model: page.line,
        view: chartsLineView,
        toParentMessage: (message: ChartsLine.Message): Message =>
          Message.GotChartsLineMessage({ message }),
      }),
    ),
    M.when('pie', () =>
      h.submodel({
        slotId: 'charts-pie',
        model: page.pie,
        view: chartsPieView,
        toParentMessage: (message: ChartsPie.Message): Message =>
          Message.GotChartsPieMessage({ message }),
      }),
    ),
    M.when('radar', () =>
      h.submodel({
        slotId: 'charts-radar',
        model: page.radar,
        view: chartsRadarView,
        toParentMessage: (message: ChartsRadar.Message): Message =>
          Message.GotChartsRadarMessage({ message }),
      }),
    ),
    M.when('radial', () =>
      h.submodel({
        slotId: 'charts-radial',
        model: page.radial,
        view: chartsRadialView,
        toParentMessage: (message: ChartsRadial.Message): Message =>
          Message.GotChartsRadialMessage({ message }),
      }),
    ),
    M.when('tooltip', () =>
      h.submodel({
        slotId: 'charts-tooltip',
        model: page.tooltip,
        view: chartsTooltipView,
        toParentMessage: (message: ChartsTooltip.Message): Message =>
          Message.GotChartsTooltipMessage({ message }),
      }),
    ),
    M.exhaustive,
  )
}

const notFoundView = Chrome.notFound

/* Each page subtree is KEYED by route (and by charts section). Without keys,
   snabbdom patches the next page into the previous page's DOM in place; since
   neither submodel's model changed, the submodel boundary skips re-rendering
   and the old page's content stays on screen after navigation. A distinct key
   per page forces a subtree replacement on route change. */
const pageView = (model: Model, h: HtmlBuilder<Message>): Html => {
  const keyed = (key: string, content: Html): Html =>
    h.keyed('div')(key, [], [content])

  return M.value(model.route).pipe(
    M.withReturnType<Html>(),
    M.tagsExhaustive({
      Home: () =>
        model.page._tag === 'LandingPage'
          ? keyed(
              'page-home',
              h.submodel({
                slotId: 'landing',
                model: model.page.landing,
                view: landingView,
                viewInputs: model.isDark,
                toParentMessage: (message: Landing.Message): Message =>
                  Message.GotLandingMessage({ message }),
              }),
            )
          : keyed('page-not-found', notFoundView('/', h)),
      Create: () =>
        model.page._tag === 'CreatePage'
          ? model.page.renderer === 'tailwind'
            ? keyed(
                'page-create-tailwind',
                h.submodel({
                  slotId: 'create-board-tailwind',
                  model: model.page.tailwindBoard,
                  view: boardView,
                  toParentMessage: (message: Board.Message): Message =>
                    Message.GotBoardMessage({ message }),
                }),
              )
            : keyed(
                'page-create-stylex',
                h.submodel({
                  slotId: 'create-board-stylex',
                  model: model.page.styleXBoard,
                  view: boardStyleXView,
                  toParentMessage: (message: BoardStyleX.Message): Message =>
                    Message.GotBoardStyleXMessage({ message }),
                }),
              )
          : keyed('page-not-found', notFoundView(createPath(), h)),
      Charts: ({ section }) =>
        isChartSection(section)
          ? keyed(
              `page-charts-${section}-${model.page._tag === 'ChartsPage' ? model.page.renderer : 'missing'}`,
              chartsSectionView(model, section, h),
            )
          : keyed('page-not-found', notFoundView(`/charts/${section}`, h)),
      BlocksIndex: () =>
        model.page._tag === 'BlocksIndexPage'
          ? keyed(
              'page-blocks',
              BlocksIndexPage.view(
                {
                  ...model.page,
                  isDark: model.isDark,
                  onCategory: category =>
                    Message.ChangedBlocksCategory({ category }),
                  onToggleCode: block => Message.ToggledBlockCode({ block }),
                  onSelectCodeFile: (block, path) =>
                    Message.SelectedBlockCodeFile({ block, path }),
                  onCodeFileMessage: message =>
                    Message.GotCodeFileMessage({ message }),
                  onCopyCode: code =>
                    Message.GotBlocksCopyMessage({
                      message: CopyFeedback.Message.ClickedDocsCopyCode({
                        code,
                      }),
                    }),
                },
                h,
              ),
            )
          : h.empty,
      BlocksStyleX: () =>
        model.page._tag === 'BlocksIndexPage'
          ? keyed(
              'page-blocks',
              BlocksIndexPage.view(
                {
                  ...model.page,
                  isDark: model.isDark,
                  onCategory: category =>
                    Message.ChangedBlocksCategory({ category }),
                  onToggleCode: block => Message.ToggledBlockCode({ block }),
                  onSelectCodeFile: (block, path) =>
                    Message.SelectedBlockCodeFile({ block, path }),
                  onCodeFileMessage: message =>
                    Message.GotCodeFileMessage({ message }),
                  onCopyCode: code =>
                    Message.GotBlocksCopyMessage({
                      message: CopyFeedback.Message.ClickedDocsCopyCode({
                        code,
                      }),
                    }),
                },
                h,
              ),
            )
          : h.empty,
      BlocksStyleXTable: () =>
        model.page._tag === 'BlocksStyleXTablePage'
          ? keyed(
              'page-blocks-stylex-table',
              h.submodel({
                slotId: 'blocks-stylex-table',
                model: model.page.table,
                view: tanStackTableView,
                toParentMessage: (
                  message: TanStackTablePage.Message,
                ): Message => Message.GotTanStackTableMessage({ message }),
              }),
            )
          : keyed('page-not-found', notFoundView(blocksStyleXTablePath(), h)),
      Block: ({ blockId }) =>
        keyed(`page-block-${blockId}`, blocksView(model, blockId, h)),
      ComponentDocs: ({ component }) =>
        ComponentCatalog.hasCatalogPage(component) &&
        model.page._tag === 'CatalogDocsPage'
          ? keyed(
              `page-docs-${component}`,
              h.submodel({
                slotId: `docs-${component}`,
                model: model.page.docs,
                view: catalogDocsView,
                viewInputs: {
                  slug: ComponentCatalog.canonicalComponentSlug(component),
                  dark: model.isDark,
                  renderer,
                },
                toParentMessage: (message: ComponentCatalog.Message): Message =>
                  Message.GotCatalogDocsMessage({ message }),
              }),
            )
          : keyed(
              'page-not-found',
              notFoundView(`/docs/components/${component}`, h),
            ),
      GettingStarted: () =>
        model.page._tag === 'GettingStartedPage'
          ? keyed('page-getting-started', GettingStartedPage.view(h))
          : keyed('page-not-found', notFoundView(gettingStartedPath(), h)),
      NotFound: ({ path }) => keyed('page-not-found', notFoundView(path, h)),
    }),
  )
}

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  // Block pages are full-viewport layouts (shown inside the index's iframes),
  // so they render without the global header.
  const isFullPage = model.route._tag === 'Block'
  const title =
    model.route._tag === 'ComponentDocs'
      ? `${ComponentCatalog.titleFor(model.route.component) ?? 'Not Found'} - crease/ui`
      : model.route._tag === 'GettingStarted'
        ? 'Get Started - crease/ui'
        : 'crease/ui'

  return {
    title,
    body: isFullPage
      ? h.div([], [pageView(model, h)])
      : h.div(
          [],
          [
            Chrome.header(
              {
                route: model.route,
                isDark: model.isDark,
                onThemeToggle: Message.ClickedThemeToggle(),
                onSearchOpen: Message.GotDocsSearchMessage({
                  message: DocsSearch.Message.OpenedSearch(),
                }),
                isSearchOpen: model.docsSearch.dialog.isOpen,
                counterpartHref: counterpartUrl(new URL(model.currentUrl)),
              },
              h,
            ),
            pageView(model, h),
            h.submodel({
              slotId: 'site-docs-search',
              model: model.docsSearch,
              view: docsSearchView,
              toParentMessage: message =>
                Message.GotDocsSearchMessage({ message }),
            }),
          ],
        ),
  }
}

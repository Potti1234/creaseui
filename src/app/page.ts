import { Match as M, Schema as S } from 'effect'
import { ts } from 'foldkit/schema'

import * as BlocksFeature from '@/demo/blocks/registry'
import * as BoardFeature from '@/demo/board'
import * as LandingFeature from '@/demo/landing'
import * as ChartsArea from '@/demo/charts/area'
import * as ChartsBar from '@/demo/charts/bar'
import * as ChartsLine from '@/demo/charts/line'
import * as ChartsPie from '@/demo/charts/pie'
import * as ChartsRadar from '@/demo/charts/radar'
import * as ChartsRadial from '@/demo/charts/radial'
import * as ChartsTooltip from '@/demo/charts/tooltip'
import * as ComponentCatalog from '@/docs/components/catalog'
import type { AppRoute } from '@/route'

export const Landing = ts('LandingPage', { landing: LandingFeature.Model })
export const Create = ts('CreatePage', { board: BoardFeature.Model })
export const BlocksIndex = ts('BlocksIndexPage')
export const Block = ts('BlockPage', { blocks: BlocksFeature.Model })
export const Charts = ts('ChartsPage', {
  area: ChartsArea.Model,
  bar: ChartsBar.Model,
  line: ChartsLine.Model,
  pie: ChartsPie.Model,
  radar: ChartsRadar.Model,
  radial: ChartsRadial.Model,
  tooltip: ChartsTooltip.Model,
})
export const CatalogDocs = ts('CatalogDocsPage', {
  docs: ComponentCatalog.Model,
})
export const NotFound = ts('NotFoundPage')

export const Page = S.Union([
  Landing,
  Create,
  BlocksIndex,
  Block,
  Charts,
  CatalogDocs,
  NotFound,
])
export type Page = typeof Page.Type

export const init = (route: AppRoute): Page =>
  M.value(route).pipe(
    M.withReturnType<Page>(),
    M.tagsExhaustive({
      Home: () => Landing({ landing: LandingFeature.init() }),
      Create: () => Create({ board: BoardFeature.init() }),
      Charts: () =>
        Charts({
          area: ChartsArea.init(),
          bar: ChartsBar.init(),
          line: ChartsLine.init(),
          pie: ChartsPie.init(),
          radar: ChartsRadar.init(),
          radial: ChartsRadial.init(),
          tooltip: ChartsTooltip.init(),
        }),
      BlocksIndex: () => BlocksIndex(),
      Block: () => Block({ blocks: BlocksFeature.init() }),
      ComponentDocs: ({ component }) =>
        ComponentCatalog.hasCatalogPage(component)
          ? CatalogDocs({ docs: ComponentCatalog.init(component) })
          : NotFound(),
      NotFound: () => NotFound(),
    }),
  )

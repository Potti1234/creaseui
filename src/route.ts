import { Schema as S, pipe } from 'effect'
import { Route } from 'foldkit'
import { literal, r, slash, string } from 'foldkit/route'

export const ChartSection = S.Literals([
  'area',
  'bar',
  'line',
  'pie',
  'radar',
  'radial',
  'tooltip',
])
export type ChartSection = typeof ChartSection.Type

export const CHART_SECTIONS: ReadonlyArray<ChartSection> = [
  'area',
  'bar',
  'line',
  'pie',
  'radar',
  'radial',
  'tooltip',
]

export const isChartSection = S.is(ChartSection)

export const SIDEBAR_BLOCK_IDS: ReadonlyArray<string> = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
]

export const HomeRoute = r('Home')
export const CreateRoute = r('Create')
export const ChartsRoute = r('Charts', { section: S.String })
export const BlocksIndexRoute = r('BlocksIndex')
export const BlockRoute = r('Block', { blockId: S.String })
export const NotFoundRoute = r('NotFound', { path: S.String })

export const AppRoute = S.Union([
  HomeRoute,
  CreateRoute,
  ChartsRoute,
  BlocksIndexRoute,
  BlockRoute,
  NotFoundRoute,
])

export type HomeRoute = typeof HomeRoute.Type
export type CreateRoute = typeof CreateRoute.Type
export type ChartsRoute = typeof ChartsRoute.Type
export type BlocksIndexRoute = typeof BlocksIndexRoute.Type
export type BlockRoute = typeof BlockRoute.Type
export type NotFoundRoute = typeof NotFoundRoute.Type
export type AppRoute = typeof AppRoute.Type

const homeRouter = pipe(Route.root, Route.mapTo(HomeRoute))

const createRouter = pipe(literal('create'), Route.mapTo(CreateRoute))

const chartsRouter = pipe(
  literal('charts'),
  slash(string('section')),
  Route.mapTo(ChartsRoute),
)

const blocksIndexRouter = pipe(
  literal('blocks'),
  slash(literal('sidebar')),
  Route.mapTo(BlocksIndexRoute),
)

const blockRouter = pipe(
  literal('blocks'),
  slash(literal('sidebar')),
  slash(string('blockId')),
  Route.mapTo(BlockRoute),
)

const routeParser = Route.oneOf(
  createRouter,
  chartsRouter,
  blockRouter,
  blocksIndexRouter,
  homeRouter,
)

export const urlToAppRoute = Route.parseUrlWithFallback(
  routeParser,
  NotFoundRoute,
)

export const chartsPath = (section: ChartSection): string => `/charts/${section}`

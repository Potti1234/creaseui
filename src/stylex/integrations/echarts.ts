import * as stylex from '@stylexjs/stylex'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as ECharts from '@/lib/echarts'

import type { ComponentLayoutStyle } from '../contracts'
import { className } from '../style'

export type ChartMessage = ECharts.ChartMessage
export const ChartMessage = ECharts.ChartMessage
export type ChartTheme = ECharts.ChartTheme
export type OptionBuilder = ECharts.OptionBuilder

export const areaGradient = ECharts.areaGradient
export const categoryAxis = ECharts.categoryAxis
export const colorWithOpacity = ECharts.colorWithOpacity
export const compactGrid = ECharts.compactGrid
export const registerChart = ECharts.registerChart
export const shadcnLegend = ECharts.shadcnLegend
export const shadcnTooltip = ECharts.shadcnTooltip
export const valueAxis = ECharts.valueAxis

export type EChartSize = 'default' | 'compact' | 'square' | 'wide'

export type EChartProps<Message> = Readonly<{
  ariaLabel: string
  hostId: string
  layoutStyle?: ComponentLayoutStyle
  size?: EChartSize
  toMessage: (message: ChartMessage) => Message
  variant?: string
}>

const styles = stylex.create({
  compact: {
    aspectRatio: '16 / 7',
    minHeight: '12rem',
  },
  default: {
    aspectRatio: '16 / 9',
    minHeight: '14rem',
  },
  host: {
    display: 'block',
    width: '100%',
  },
  square: {
    marginInline: 'auto',
    aspectRatio: '1 / 1',
    maxHeight: '18rem',
  },
  wide: {
    aspectRatio: '2 / 1',
    minHeight: '16rem',
  },
})

const sizeStyles = {
  compact: styles.compact,
  default: styles.default,
  square: styles.square,
  wide: styles.wide,
} as const

export const eChart = <Message>(props: EChartProps<Message>, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'echart'),
      h.Role('img'),
      h.AriaLabel(props.ariaLabel),
      h.Class(className(styles.host, sizeStyles[props.size ?? 'default'], props.layoutStyle)),
      h.OnMount(Mount.mapMessage(
        ECharts.MountChart({ hostId: props.hostId, variant: props.variant ?? '' }),
        props.toMessage,
      )),
    ],
    [],
  )

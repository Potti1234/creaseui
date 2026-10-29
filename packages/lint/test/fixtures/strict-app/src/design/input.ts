import type { Html, HtmlBuilder } from 'foldkit/html'

import type { ComponentLayoutStyle } from './contracts'

export type InputProps = Readonly<{
  placeholder?: string
  level?: number
  disabled?: boolean
  layoutStyle?: ComponentLayoutStyle
}>

export const input = <Msg>(props: InputProps, h: HtmlBuilder<Msg>): Html =>
  h.input([h.DataAttribute('placeholder', props.placeholder ?? '')], [])

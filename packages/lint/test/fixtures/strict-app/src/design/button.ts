import type { Html, HtmlBuilder } from 'foldkit/html'

import type { ComponentLayoutStyle } from './contracts'

export type ButtonProps = Readonly<{
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon' | 'icon-sm'
  layoutStyle?: ComponentLayoutStyle
  children: ReadonlyArray<string | Html>
}>

export const button = <Msg>(props: ButtonProps, h: HtmlBuilder<Msg>): Html =>
  h.button([h.DataAttribute('slot', 'button')], [...props.children])

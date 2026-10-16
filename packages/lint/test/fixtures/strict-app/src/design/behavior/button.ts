import type { Html, HtmlBuilder } from 'foldkit/html'

export const renderButton = <Msg>(label: string, h: HtmlBuilder<Msg>): Html =>
  h.button([], [label])

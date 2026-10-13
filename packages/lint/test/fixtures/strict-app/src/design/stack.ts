import type { Html, HtmlBuilder } from 'foldkit/html'

export const stack = <Msg>(
  props: Readonly<{ children: ReadonlyArray<Html | string> }>,
  h: HtmlBuilder<Msg>,
): Html => h.div([h.DataAttribute('slot', 'stack')], [...props.children])

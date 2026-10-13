import type { Html, HtmlBuilder } from 'foldkit/html'

export const text = <Msg>(
  props: Readonly<{ children: ReadonlyArray<string> }>,
  h: HtmlBuilder<Msg>,
): Html => h.p([h.DataAttribute('slot', 'text')], [...props.children])

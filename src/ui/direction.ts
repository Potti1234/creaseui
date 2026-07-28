import { type Html, html } from 'foldkit/html'

export type Direction = 'ltr' | 'rtl'

export const direction = <Msg>(props: Readonly<{
  direction: Direction
  children: ReadonlyArray<Html | string>
  class?: string
}>): Html => {
  const h = html<Msg>()
  return h.div(
    [h.Dir(props.direction), ...(props.class === undefined ? [] : [h.Class(props.class)])],
    [...props.children],
  )
}

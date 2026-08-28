import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'

const styles = stylex.create({ root: { gap: '0.5rem', alignItems: 'center', display: 'flex', fontSize: '0.875rem', fontWeight: 500, lineHeight: 1, userSelect: 'none', } })
export type LabelProps = Readonly<{ for?: string; children: ReadonlyArray<Html | string>; layoutStyle?: ComponentLayoutStyle }>
export const label = <Msg>(props: LabelProps, h: HtmlBuilder<Msg>): Html => h.label([
  h.DataAttribute('slot', 'label'), ...(props.for === undefined ? [] : [h.For(props.for)]), h.Class(className(styles.root, props.layoutStyle)),
], [...props.children])


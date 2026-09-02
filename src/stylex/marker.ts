import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

type MarkerVariant = 'default' | 'separator' | 'border'
export type MarkerPurpose = 'annotation' | 'status' | 'decorative'
type ChildrenProps = Readonly<{ children: ReadonlyArray<Html | string>; layoutStyle?: ComponentLayoutStyle }>
const styles = stylex.create({
  root: { gap: '0.5rem', alignItems: 'center', color: tokens.mutedForeground, display: 'flex', fontSize: '0.875rem', position: 'relative', textAlign: 'left', minHeight: '1rem', width: '100%', },
  default: {}, separator: {}, border: { borderBlockEndColor: tokens.border, borderBlockEndStyle: 'solid', borderBlockEndWidth: 1, paddingBottom: '0.5rem' },
  icon: { flexShrink: 0, height: '1rem', width: '1rem' }, content: { overflowWrap: 'break-word', minWidth: 0, },
})
export const markerVariants = (options: Readonly<{ variant?: MarkerVariant | null }> = {}): string => className(styles.root, styles[options.variant ?? 'default'])
export const marker = <Msg>(props: ChildrenProps & Readonly<{ variant?: MarkerVariant; purpose?: MarkerPurpose; ariaLabel?: string }>, h: HtmlBuilder<Msg>): Html => { const purpose = props.purpose ?? 'annotation'; return h.div([h.DataAttribute('slot', 'marker'), h.DataAttribute('variant', props.variant ?? 'default'), h.DataAttribute('purpose', purpose), ...(purpose === 'decorative' ? [h.Role('none'), h.AriaHidden(true)] : [h.Role(purpose === 'status' ? 'status' : 'note')]), ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]), h.Class(className(styles.root, styles[props.variant ?? 'default'], props.layoutStyle))], [...props.children]) }
export const markerIcon = <Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html => h.span([h.DataAttribute('slot', 'marker-icon'), h.AriaHidden(true), h.Class(className(styles.icon, props.layoutStyle))], [...props.children])
export const markerContent = <Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html => h.span([h.DataAttribute('slot', 'marker-content'), h.Class(className(styles.content, props.layoutStyle))], [...props.children])

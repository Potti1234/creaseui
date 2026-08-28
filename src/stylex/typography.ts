import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'

type TextProps = Readonly<{ children: ReadonlyArray<Html | string>; layoutStyle?: ComponentLayoutStyle }>
const styles = stylex.create({
  h1: { fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: '2.5rem', textAlign: 'center', textWrap: 'balance', scrollMarginTop: '5rem', },
  h2: { borderBlockEndColor: tokens.border, borderBlockEndStyle: 'solid', borderBlockEndWidth: 1, fontSize: '1.875rem', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: '2.25rem', paddingBottom: '0.5rem', scrollMarginTop: '5rem' },
  h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: '2rem', scrollMarginTop: '5rem' },
  h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: '1.75rem', scrollMarginTop: '5rem' },
  p: { lineHeight: '1.75rem' }, blockquote: { borderInlineStartColor: tokens.border, borderInlineStartStyle: 'solid', borderInlineStartWidth: 2, fontStyle: 'italic', paddingInlineStart: '1.5rem', marginTop: '1.5rem', },
  code: { borderRadius: foundationTokens.radiusSm, paddingBlock: '0.2rem', paddingInline: '0.3rem', backgroundColor: foundationTokens.muted, fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 600, position: 'relative', },
  lead: { color: tokens.mutedForeground, fontSize: '1.25rem', lineHeight: '1.75rem' }, large: { fontSize: '1.125rem', fontWeight: 600 }, small: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1 }, muted: { color: tokens.mutedForeground, fontSize: '0.875rem' },
})
export const typographyH1 = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.h1([h.DataAttribute('slot','typography-h1'),h.Class(className(styles.h1,p.layoutStyle))],[...p.children])
export const typographyH2 = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.h2([h.DataAttribute('slot','typography-h2'),h.Class(className(styles.h2,p.layoutStyle))],[...p.children])
export const typographyH3 = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.h3([h.DataAttribute('slot','typography-h3'),h.Class(className(styles.h3,p.layoutStyle))],[...p.children])
export const typographyH4 = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.h4([h.DataAttribute('slot','typography-h4'),h.Class(className(styles.h4,p.layoutStyle))],[...p.children])
export const typographyP = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.p([h.DataAttribute('slot','typography-p'),h.Class(className(styles.p,p.layoutStyle))],[...p.children])
export const typographyBlockquote = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.blockquote([h.DataAttribute('slot','typography-blockquote'),h.Class(className(styles.blockquote,p.layoutStyle))],[...p.children])
export const typographyInlineCode = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.code([h.DataAttribute('slot','typography-inline-code'),h.Class(className(styles.code,p.layoutStyle))],[...p.children])
export const typographyLead = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.p([h.DataAttribute('slot','typography-lead'),h.Class(className(styles.lead,p.layoutStyle))],[...p.children])
export const typographyLarge = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.div([h.DataAttribute('slot','typography-large'),h.Class(className(styles.large,p.layoutStyle))],[...p.children])
export const typographySmall = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.small([h.DataAttribute('slot','typography-small'),h.Class(className(styles.small,p.layoutStyle))],[...p.children])
export const typographyMuted = <Msg>(p: TextProps, h: HtmlBuilder<Msg>): Html => h.p([h.DataAttribute('slot','typography-muted'),h.Class(className(styles.muted,p.layoutStyle))],[...p.children])


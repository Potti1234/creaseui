import * as stylex from '@stylexjs/stylex'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import { className } from '../style'
import { tokens } from '../tokens.stylex'
import { compositionTokens } from './composition-tokens.stylex.const'
import { semanticSystemTheme } from './semantic-theme.stylex'
import type { PrimitiveData } from './types'

export type TextElement = 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'strong' | 'code'
export type TextVariant = 'inherit' | 'body' | 'caption' | 'label' | 'headingSm' | 'headingMd' | 'display' | 'hero'
export type TextTone = 'primary' | 'secondary' | 'accent' | 'danger'

export type TextProps = Readonly<{
  as?: TextElement
  children: ReadonlyArray<Html | string>
  align?: 'left' | 'center' | 'right'
  data?: PrimitiveData
  measure?: 'none' | 'hero'
  numeric?: 'proportional' | 'tabular'
  tone?: TextTone
  variant?: TextVariant
}>

const styles = stylex.create({
  alignCenter: { textAlign: 'center' },
  alignLeft: { textAlign: 'left' },
  alignRight: { textAlign: 'right' },
  body: { fontSize: semanticSystemTheme.typeBodySize, lineHeight: semanticSystemTheme.typeBodyLeading, textWrap: 'pretty' },
  caption: { fontSize: semanticSystemTheme.typeSupportingSize, lineHeight: semanticSystemTheme.typeSupportingLeading, textWrap: 'pretty' },
  display: { fontSize: compositionTokens.fontDisplay, fontWeight: 700, lineHeight: compositionTokens.lineHeading },
  headingMd: { fontSize: compositionTokens.fontHeadingMd, fontWeight: 600, lineHeight: compositionTokens.lineHeading, textWrap: 'balance' },
  headingSm: { fontSize: compositionTokens.fontHeadingSm, fontWeight: 600, lineHeight: compositionTokens.lineHeading, textWrap: 'balance' },
  hero: { fontSize: { default: '2rem', '@media (min-width: 768px)': '3rem' }, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, textWrap: 'balance' },
  inherit: { fontSize: 'inherit', lineHeight: 'inherit' },
  label: { fontSize: semanticSystemTheme.typeLabelSize, fontWeight: 500, lineHeight: semanticSystemTheme.typeLabelLeading },
  measureHero: { textWrap: 'pretty', maxWidth: '42rem', },
  measureNone: { maxWidth: 'none' },
  numericProportional: { fontVariantNumeric: 'proportional-nums' },
  numericTabular: { fontVariantNumeric: 'tabular-nums' },
  toneAccent: { color: tokens.primary },
  toneDanger: { color: tokens.destructive },
  tonePrimary: { color: tokens.foreground },
  toneSecondary: { color: tokens.mutedForeground },
})

const element = <Message>(as: TextElement, attributes: ReadonlyArray<Attribute<Message>>, children: TextProps['children'], h: HtmlBuilder<Message>): Html => {
  switch (as) {
    case 'code': return h.code(attributes, children)
    case 'div': return h.div(attributes, children)
    case 'h1': return h.h1(attributes, children)
    case 'h2': return h.h2(attributes, children)
    case 'h3': return h.h3(attributes, children)
    case 'h4': return h.h4(attributes, children)
    case 'p': return h.p(attributes, children)
    case 'strong': return h.strong(attributes, children)
    case 'span': return h.span(attributes, children)
  }
}

export const text = <Message>(props: TextProps, h: HtmlBuilder<Message>): Html => {
  const variant = { body: styles.body, caption: styles.caption, display: styles.display, headingMd: styles.headingMd, headingSm: styles.headingSm, hero: styles.hero, inherit: styles.inherit, label: styles.label }[props.variant ?? 'body']
  const tone = { accent: styles.toneAccent, danger: styles.toneDanger, primary: styles.tonePrimary, secondary: styles.toneSecondary }[props.tone ?? 'primary']
  const align = props.align === undefined ? [] : [{ center: styles.alignCenter, left: styles.alignLeft, right: styles.alignRight }[props.align]]
  const measure = props.measure === undefined ? [] : [{ hero: styles.measureHero, none: styles.measureNone }[props.measure]]
  const numeric = props.numeric === undefined ? [] : [{ proportional: styles.numericProportional, tabular: styles.numericTabular }[props.numeric]]
  return element(
    props.as ?? 'span',
    [
      h.Class(className(variant, tone, ...align, ...measure, ...numeric)),
      ...Object.entries(props.data ?? {}).map(([name, value]) =>
        h.DataAttribute(name, value),
      ),
    ],
    props.children,
    h,
  )
}


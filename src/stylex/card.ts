import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

const styles = stylex.create({
  card: {
    borderColor: tokens.border,
    borderRadius: tokens.cardRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    gap: '1rem',
    paddingBlock: '1rem',
    backgroundColor: tokens.card,
    boxShadow: tokens.shadowCard,
    color: tokens.cardForeground,
    display: 'flex',
    flexDirection: 'column',
  },
  cardFlush: {
    overflow: 'hidden',
    paddingBlock: 0,
  },
  header: {
    gap: '0.25rem',
    paddingInline: '1rem',
    display: 'grid',
  },
  title: {
    fontWeight: 600,
    lineHeight: 1,
  },
  description: {
    color: tokens.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  action: {
    alignSelf: 'start',
    gridColumnStart: '2',
    gridRowEnd: 'span 2',
    gridRowStart: '1',
    justifySelf: 'end',
  },
  content: { paddingInline: '1rem' },
  footer: {
    paddingInline: '1rem',
    alignItems: 'center',
    display: 'flex',
  },
})

type Slot = Readonly<{
  children: ReadonlyArray<Html | string>
  /** Parent-layout positioning only. Add visual choices as named variants. */
  layoutStyle?: ComponentLayoutStyle
}>

export type CardProps = Slot & Readonly<{
  element?: 'div' | 'section' | 'article'
  density?: 'default' | 'flush'
}>

const slot =
  (name: string, slotStyle: StaticStyles) =>
  <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html =>
    h.div(
      [h.DataAttribute('slot', name), h.Class(className(slotStyle, props.layoutStyle))],
      [...props.children],
    )

export const card = <Msg>(props: CardProps, h: HtmlBuilder<Msg>): Html => {
  const attributes = [
    h.DataAttribute('slot', 'card'),
    h.Class(className(styles.card, props.density === 'flush' && styles.cardFlush, props.layoutStyle)),
  ]
  const children = [...props.children]

  switch (props.element ?? 'div') {
    case 'section': return h.section(attributes, children)
    case 'article': return h.article(attributes, children)
    default: return h.div(attributes, children)
  }
}

export const cardHeader = slot('card-header', styles.header)
export const cardTitle = slot('card-title', styles.title)
export const cardDescription = slot('card-description', styles.description)
export const cardAction = slot('card-action', styles.action)
export const cardContent = slot('card-content', styles.content)
export const cardFooter = slot('card-footer', styles.footer)


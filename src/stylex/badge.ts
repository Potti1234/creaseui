import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type {
  Assert,
  BadgeVariant,
  ComponentLayoutStyle,
  HasExactlyKeys,
} from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

export type { BadgeVariant } from './contracts'

const base = stylex.create({
  root: {
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    gap: '0.25rem',
    overflow: 'hidden',
    paddingBlock: '0.125rem',
    paddingInline: '0.5rem',
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.75rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1rem',
    whiteSpace: 'nowrap',
    width: 'fit-content',
  },
})

const variants = stylex.create({
  default: {
    borderColor: tokens.transparent,
    backgroundColor: tokens.primary,
    color: tokens.primaryForeground,
  },
  secondary: {
    borderColor: tokens.transparent,
    backgroundColor: tokens.secondary,
    color: tokens.secondaryForeground,
  },
  destructive: {
    borderColor: tokens.transparent,
    backgroundColor: tokens.destructiveSurface,
    color: tokens.destructiveForeground,
  },
  outline: {
    borderColor: tokens.border,
    backgroundColor: tokens.transparent,
    color: tokens.foreground,
  },
})

type _VariantMapIsExhaustive = Assert<HasExactlyKeys<typeof variants, BadgeVariant>>

export type BadgeProps = Readonly<{
  children: ReadonlyArray<Html | string>
  variant?: BadgeVariant
  /** Parent-layout positioning only. Add visual choices as named variants. */
  layoutStyle?: ComponentLayoutStyle
}>

export const badge = <Msg>(props: BadgeProps, h: HtmlBuilder<Msg>): Html =>
  h.span(
    [h.Class(className(base.root, variants[props.variant ?? 'default'], props.layoutStyle))],
    [...props.children],
  )


import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as IconSource from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { className } from './style'
import { tokens } from './tokens.stylex'

export type IconName = IconSource.IconName

/* The supported way to render an ordinary icon in app code and in every
   Crease component: the Lucide source stays in `@/lib/icon`, this component
   owns size, tone and labelling. */
export const iconNames: ReadonlyArray<IconName> = IconSource.iconNames

export type IconSize = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type IconProps = Readonly<{
  name: IconName
  /** 8, 12, 14, 16, 20, 24 or 32px. Omit it to follow the surrounding text or the slot the icon sits in. */
  size?: IconSize
  /** `muted` and `primary` use the theme's muted foreground and primary colours; omit it to inherit the text colour. */
  tone?: 'muted' | 'primary'
  /** Fills the glyph with its stroke colour, e.g. an active star or heart. */
  filled?: boolean
  /** Turns the glyph, e.g. a disclosure chevron (`isOpen ? 180 : 0`); changes animate unless reduced motion is requested. */
  rotation?: 0 | 90 | 180
  /** Gives a standalone icon an accessible name; without it the icon is decorative (aria-hidden). */
  ariaLabel?: string
  /** Marks a leading or trailing icon so the surrounding control can adjust its padding. */
  dataIcon?: 'inline-start' | 'inline-end'
  /** Placement from the surrounding layout, e.g. a margin. */
  layoutStyle?: ComponentLayoutStyle
}>

const sizes = stylex.create({
  '3xs': { flexShrink: 0, height: '0.5rem', width: '0.5rem' },
  '2xs': { flexShrink: 0, height: '0.75rem', width: '0.75rem' },
  xs: { flexShrink: 0, height: '0.875rem', width: '0.875rem' },
  sm: { flexShrink: 0, height: '1rem', width: '1rem' },
  md: { flexShrink: 0, height: '1.25rem', width: '1.25rem' },
  lg: { flexShrink: 0, height: '1.5rem', width: '1.5rem' },
  xl: { flexShrink: 0, height: '2rem', width: '2rem' },
})

const turn = stylex.create({
  rotatable: {
    transitionDuration: {
      default: interactionTokens.motionFast,
      '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone,
    },
    transitionProperty: 'transform',
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  90: { transform: 'rotate(90deg)' },
  180: { transform: 'rotate(180deg)' },
})

const tones = stylex.create({
  muted: { color: tokens.mutedForeground },
  primary: { color: tokens.primary },
})

const fill = stylex.create({
  filled: { fill: 'currentColor' },
})

const classes = (props: IconProps): string =>
  className(
    ...(props.size === undefined ? [] : [sizes[props.size]]),
    ...(props.tone === undefined ? [] : [tones[props.tone]]),
    ...(props.filled === true ? [fill.filled] : []),
    ...(props.rotation === undefined ? [] : [turn.rotatable]),
    ...(props.rotation === 90 || props.rotation === 180
      ? [turn[props.rotation]]
      : []),
    ...(props.layoutStyle === undefined ? [] : [props.layoutStyle]),
  )

export const icon = <Msg>(props: IconProps, h: HtmlBuilder<Msg>): Html =>
  IconSource.icon(
    props.name,
    {
      ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
      ...(props.dataIcon === undefined ? {} : { dataIcon: props.dataIcon }),
      class: classes(props),
    },
    h,
  )

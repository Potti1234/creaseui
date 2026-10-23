import { Style, When } from '@pleat/core'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as IconSource from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { interactionTokens } from './interaction-tokens'
import { className } from './style'
import { tokens } from './tokens'

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

const sizes: Record<IconSize, Style.Style> = {
  '3xs': Style.make({ flexShrink: 0, height: '0.5rem', width: '0.5rem' }),
  '2xs': Style.make({ flexShrink: 0, height: '0.75rem', width: '0.75rem' }),
  xs: Style.make({ flexShrink: 0, height: '0.875rem', width: '0.875rem' }),
  sm: Style.make({ flexShrink: 0, height: '1rem', width: '1rem' }),
  md: Style.make({ flexShrink: 0, height: '1.25rem', width: '1.25rem' }),
  lg: Style.make({ flexShrink: 0, height: '1.5rem', width: '1.5rem' }),
  xl: Style.make({ flexShrink: 0, height: '2rem', width: '2rem' }),
}

const rotatable = Style.make({
  transitionDuration: interactionTokens.motionFast,
  transitionProperty: 'transform',
  transitionTimingFunction: interactionTokens.easingStandard,
}).pipe(
  Style.when(When.reducedMotion, {
    transitionDuration: interactionTokens.motionNone,
  }),
)

const turns = {
  90: Style.make({ transform: 'rotate(90deg)' }),
  180: Style.make({ transform: 'rotate(180deg)' }),
}

const tones = {
  muted: Style.make({ color: tokens.mutedForeground }),
  primary: Style.make({ color: tokens.primary }),
}

const filled = Style.make({ fill: 'currentColor' })

export const icon = <Msg>(props: IconProps, h: HtmlBuilder<Msg>): Html =>
  IconSource.icon(
    props.name,
    {
      ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
      ...(props.dataIcon === undefined ? {} : { dataIcon: props.dataIcon }),
      class: className(
        props.size === undefined ? undefined : sizes[props.size],
        props.tone === undefined ? undefined : tones[props.tone],
        props.filled === true ? filled : undefined,
        props.rotation === undefined ? undefined : rotatable,
        props.rotation === 90 || props.rotation === 180
          ? turns[props.rotation]
          : undefined,
        props.layoutStyle,
      ),
    },
    h,
  )

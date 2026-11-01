// @ts-nocheck: snapshot of creaseui-demo chapter-09:src/ui/icon.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as IconSource from '../lib/icon'

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
  /** Layout and state classes from the surrounding component, e.g. a margin or a rotation. */
  class?: string
}>

const sizes: Record<IconSize, string> = {
  '3xs': 'size-2 shrink-0',
  '2xs': 'size-3 shrink-0',
  xs: 'size-3.5 shrink-0',
  sm: 'size-4 shrink-0',
  md: 'size-5 shrink-0',
  lg: 'size-6 shrink-0',
  xl: 'size-8 shrink-0',
}

const tones = {
  muted: 'text-muted-foreground',
  primary: 'text-primary',
}

const rotations = {
  0: 'transition-transform motion-reduce:transition-none',
  90: 'rotate-90 transition-transform motion-reduce:transition-none',
  180: 'rotate-180 transition-transform motion-reduce:transition-none',
}

const classes = (props: IconProps): string =>
  [
    props.size === undefined ? undefined : sizes[props.size],
    props.tone === undefined ? undefined : tones[props.tone],
    props.filled === true ? 'fill-current' : undefined,
    props.rotation === undefined ? undefined : rotations[props.rotation],
    props.class,
  ]
    .filter(value => value !== undefined && value !== '')
    .join(' ')

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

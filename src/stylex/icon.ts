import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as IconSource from '@/lib/icon'
import { className } from './style'

export type IconName = IconSource.IconName

/* The supported way to render an ordinary icon in app code: the Lucide
   source stays in `@/lib/icon`, this component owns size and labelling. */
export const iconNames: ReadonlyArray<IconName> = IconSource.iconNames

export type IconProps = Readonly<{
  name: IconName
  size?: 'sm' | 'md' | 'lg'
  /** Gives a standalone icon an accessible name; without it the icon is decorative (aria-hidden). */
  ariaLabel?: string
}>

const sizes = stylex.create({
  sm: { flexShrink: 0, height: '1rem', width: '1rem' },
  md: { flexShrink: 0, height: '1.25rem', width: '1.25rem' },
  lg: { flexShrink: 0, height: '1.5rem', width: '1.5rem' },
})

export const icon = <Msg>(props: IconProps, h: HtmlBuilder<Msg>): Html =>
  IconSource.icon(
    props.name,
    {
      ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
      class: className(sizes[props.size ?? 'sm']),
    },
    h,
  )

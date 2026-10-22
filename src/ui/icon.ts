import type { Html, HtmlBuilder } from 'foldkit/html'

import * as IconSource from '@/lib/icon'

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

const sizes = {
  sm: 'size-4 shrink-0',
  md: 'size-5 shrink-0',
  lg: 'size-6 shrink-0',
}

export const icon = <Msg>(props: IconProps, h: HtmlBuilder<Msg>): Html =>
  IconSource.icon(
    props.name,
    {
      ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
      class: sizes[props.size ?? 'sm'],
    },
    h,
  )

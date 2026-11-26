import { Html } from '@effect/ui/html'

import {
  TypographyBehavior,
  type TypographyProps,
} from '../behaviors/typography'

const tailwind = {
  h1: 'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
  h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  p: 'leading-7 not-first:mt-6',
  blockquote: 'mt-6 border-s-2 ps-6 italic',
  'inline-code':
    'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
  lead: 'text-xl text-muted-foreground',
  large: 'text-lg font-semibold',
  small: 'text-sm leading-none font-medium',
  muted: 'text-sm text-muted-foreground',
}

export const Typography = <Msg, R = never>(
  h: Html.H<Msg>,
  { variant = 'p', className, ...options }: TypographyProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  TypographyBehavior(h, {
    variant,
    ...options,
    className: Html.classNames(styles[variant], className),
  })

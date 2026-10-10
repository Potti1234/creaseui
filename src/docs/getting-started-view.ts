import type { Html, HtmlBuilder } from 'foldkit/html'

import { view as gettingStartedView } from '@/docs/getting-started-content'

const styles = {
  layout:
    'mx-auto grid w-full max-w-[1500px] lg:grid-cols-[220px_minmax(0,1fr)_190px]',
  mobile: 'mx-5 mt-5 rounded-lg border bg-background lg:hidden',
  summary: 'cursor-pointer px-4 py-3 text-sm font-semibold',
  mobileNavOuter: 'max-h-[55vh] overflow-y-auto border-t p-2',
  mobileNav: 'grid grid-cols-2 gap-0.5 sm:grid-cols-3',
  sidebar:
    'hidden border-r px-5 py-10 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto',
  main: 'min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-14',
  content: 'mx-auto flex max-w-4xl flex-col gap-12',
  breadcrumb:
    'mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground',
  title: 'text-4xl font-semibold tracking-[-0.035em] text-balance',
  lead: 'mt-4 max-w-[70ch] text-base leading-7 text-muted-foreground',
  section: 'scroll-mt-24 space-y-4',
  heading: 'text-xl font-semibold tracking-tight',
  subheading: 'pt-2 text-base font-semibold tracking-tight',
  paragraph: 'max-w-[75ch] text-sm leading-7 text-muted-foreground',
  list: 'space-y-2 pl-5 text-sm leading-7 text-muted-foreground [&>li]:list-disc',
  code: 'max-w-full overflow-x-auto rounded-lg border bg-muted/35 p-4 font-mono text-[13px] leading-6',
  inlineCode: 'font-mono text-[13px] leading-6',
  link: 'text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground',
  navLink:
    'block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
  navActive: 'bg-muted font-medium text-foreground hover:bg-muted',
  navGroup: 'mb-6',
  navLabel: 'mb-3 px-2 text-sm font-semibold',
  navList: 'space-y-0.5',
  toc: 'hidden px-5 py-10 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto',
  tocLabel: 'mb-3 text-sm font-semibold',
  tocList: 'space-y-2 text-sm text-muted-foreground',
} as const

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  gettingStartedView(h, styles)

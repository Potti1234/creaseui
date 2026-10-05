// The StyleX build resolves this module to skin.stylex.ts.
export const skin = {
  header: 'sticky top-0 z-40 border-b bg-background/95 backdrop-blur',
  bar: 'mx-auto flex min-h-14 w-full max-w-[1400px] items-center gap-4 px-4 md:gap-6 md:px-8',
  brand: 'shrink-0 text-sm font-semibold',
  nav: 'hidden items-center gap-6 sm:flex',
  link: 'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
  active: 'text-sm font-medium text-foreground transition-colors',
  other:
    'ml-auto text-xs font-medium text-muted-foreground hover:text-foreground',
  theme:
    'inline-flex size-10 shrink-0 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring',
  mobile: 'relative sm:hidden',
  summary:
    'flex size-10 cursor-pointer list-none items-center justify-center rounded-md hover:bg-accent',
  menu: 'absolute top-11 right-0 z-50 grid min-w-44 gap-4 rounded-lg border bg-background p-4 shadow-sm',
  icon: 'size-4',
  notFound: 'mx-auto max-w-xl px-8 py-16 text-muted-foreground',
} as const

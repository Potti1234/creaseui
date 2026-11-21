import { createPreview } from './shared'

/* eslint-disable shadcn/no-arbitrary-values -- Wheel offsets continuously drive opacity and rotation; scrollbar hiding has no core utility. */
export const scrollPickerTailwindPreviewProgram = createPreview({
  shell:
    'flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-8 py-6 text-card-foreground shadow-sm',
  caption: 'text-xs font-medium tracking-widest text-muted-foreground',
  time: 'text-4xl font-semibold tabular-nums tracking-tight',
  wheels: 'flex gap-5',
  column: 'flex flex-col items-center gap-2',
  label: 'text-xs font-medium text-muted-foreground',
  list: 'h-45 w-24 overflow-y-auto overscroll-contain rounded-xl border border-border bg-muted/30 py-18 snap-y snap-mandatory [scrollbar-width:none] perspective-normal focus-within:ring-2 focus-within:ring-ring',
  option:
    'flex h-9 shrink-0 cursor-pointer items-center justify-center text-xl font-medium tabular-nums outline-none snap-center [opacity:calc(1_-_min(1,abs(var(--picker-offset,0))*.3))] [transform:rotateX(calc(var(--picker-offset,0)*-18deg))] aria-selected:bg-accent aria-selected:text-accent-foreground',
  hint: 'max-w-64 text-center text-xs text-muted-foreground',
})

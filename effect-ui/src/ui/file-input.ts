import type { Html } from '@effect/ui/html'
import { FileInputBehavior, type FileInputProps } from '../behaviors/file-input'

const tailwind = {
  root: 'grid min-w-0 gap-1.5 text-sm',
  label: 'font-medium',
  hiddenLabel: 'sr-only',
  description: 'text-muted-foreground',
  zone: 'flex min-w-0 flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2 data-[mode=dropzone]:min-h-24 data-[mode=dropzone]:justify-center data-[mode=dropzone]:border-dashed data-[mode=dropzone]:p-4 data-drag-over:border-primary data-drag-over:bg-accent data-disabled:opacity-50',
  trigger:
    'inline-flex min-h-8 items-center justify-center rounded-md border border-input bg-background px-3 font-medium outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50',
  hint: 'text-xs text-muted-foreground',
  names: 'min-w-0 wrap-break-word text-xs text-muted-foreground',
  status:
    'text-xs data-[type=error]:text-destructive data-[type=warning]:text-warning data-[type=success]:text-success',
}
export const FileInput = <Msg, R = never>(
  h: Html.H<Msg>,
  options: FileInputProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => FileInputBehavior(h, options, styles)

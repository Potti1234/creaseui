import {
  renderPointerKind,
  pointerKindProgram,
} from '@/docs/components/pages/pointer-kind/shared'

const classes = {
  panel: 'grid w-full max-w-sm gap-4',
  heading: 'text-sm font-medium',
  grid: 'grid gap-2',
  row: 'flex items-center justify-between gap-4',
  label: 'text-sm text-muted-foreground',
  value: 'rounded-md bg-muted px-2 py-1 text-xs font-mono',
  policy: 'border-t pt-4 text-sm font-medium',
  note: 'text-xs text-muted-foreground',
}

export const pointerKindTailwindPreviewProgram = pointerKindProgram(
  (index, model, h) =>
    renderPointerKind(index, model, message => message, classes, h),
)

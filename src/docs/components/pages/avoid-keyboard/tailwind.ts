import {
  renderAvoidKeyboard,
  avoidKeyboardProgram,
} from '@/docs/components/pages/avoid-keyboard/shared'
import * as Input from '@/ui/input'

const classes = {
  panel: 'grid w-full max-w-sm gap-4',
  heading: 'text-sm font-medium',
  note: 'text-xs text-muted-foreground',
  footer: 'pt-4',
  padded: 'pt-4 pb-4',
  bar: 'flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background p-3 text-sm',
  status: 'text-xs text-muted-foreground',
}

export const avoidKeyboardTailwindPreviewProgram = avoidKeyboardProgram(
  (index, model, h) =>
    renderAvoidKeyboard(
      index,
      model,
      message => message,
      classes,
      Input.input,
      h,
    ),
)

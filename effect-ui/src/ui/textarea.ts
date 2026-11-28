import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  TextareaBehavior,
  type TextareaBehaviorProps,
} from '../behaviors/textarea'

const tailwind = {
  field: 'grid gap-2',
  label: 'text-sm font-medium',
  description: 'text-sm text-muted-foreground',
  control:
    'min-h-16 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm',
}

export const Textarea = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    label,
    description,
    invalid,
    resize = 'vertical',
    className,
    element = h.textarea,
    ...options
  }: TextareaBehaviorProps<NoInfer<Msg>, R> & {
    readonly id: string
    readonly label?: View.Input<NoInfer<Msg>, R>
    readonly description?: View.Input<NoInfer<Msg>, R>
    readonly invalid?: boolean
    readonly resize?: 'none' | 'vertical' | 'horizontal' | 'both'
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) => {
  const descriptionId =
    description === undefined ? undefined : `${id}-description`
  const describedBy = [element.elementAttrs['aria-describedby'], descriptionId]
    .filter(Boolean)
    .join(' ')
  const control = TextareaBehavior(h, {
    ...options,
    element: element
      .class(styles.control, className, element.elementAttrs.class)
      .attrs({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid':
          invalid === undefined
            ? element.elementAttrs['aria-invalid']
            : String(invalid),
        'data-resize': resize,
      })
      .style({ resize }),
  })
  return label === undefined && description === undefined
    ? control
    : h.div
        .class(styles.field)
        .attrs({
          'data-slot': 'textarea-field',
          'data-state': invalid ? 'invalid' : 'valid',
        })
        .children(
          label === undefined
            ? undefined
            : h.label
                .class(styles.label)
                .attrs({ for: id, 'data-slot': 'textarea-label' })
                .children(label),
          control,
          description === undefined
            ? undefined
            : h.p
                .class(styles.description)
                .attrs({
                  id: descriptionId,
                  'data-slot': 'textarea-description',
                })
                .children(description),
        )
}

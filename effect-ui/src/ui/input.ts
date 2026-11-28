import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { InputBehavior } from '../behaviors/input'

const tailwind = {
  field: 'grid gap-2',
  label: 'text-sm leading-none font-medium',
  description: 'text-sm text-muted-foreground',
  control:
    'h-8 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 md:text-sm file:mr-2 file:border-0 file:bg-transparent file:text-sm file:font-medium',
}

export const Input = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    label,
    description,
    readOnly = false,
    invalid,
    className,
    element = h.input,
    ...options
  }: Parameters<typeof InputBehavior<Msg, R>>[1] & {
    readonly id: string
    readonly label?: View.Input<NoInfer<Msg>, R>
    readonly description?: View.Input<NoInfer<Msg>, R>
    readonly readOnly?: boolean
    readonly invalid?: boolean
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) => {
  const descriptionId =
    description === undefined ? undefined : `${id}-description`
  const describedBy = [element.elementAttrs['aria-describedby'], descriptionId]
    .filter(Boolean)
    .join(' ')
  const control = InputBehavior(h, {
    ...options,
    onUpdate: readOnly ? undefined : options.onUpdate,
    element: element.class(styles.control, className).attrs({
      id,
      'data-slot': 'input',
      'aria-describedby': describedBy || undefined,
      'aria-invalid': invalid ? 'true' : element.elementAttrs['aria-invalid'],
      readonly: readOnly ? '' : element.elementAttrs.readonly,
    }),
  })
  return label === undefined && description === undefined
    ? control
    : h.div
        .class(styles.field)
        .attr('data-slot', 'input-field')
        .children(
          label === undefined
            ? undefined
            : h.label.class(styles.label).attr('for', id).children(label),
          control,
          description === undefined
            ? undefined
            : h.p
                .class(styles.description)
                .attr('id', descriptionId)
                .children(description),
        )
}

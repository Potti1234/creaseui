import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  NativeSelectBehavior,
  type NativeSelectBehaviorProps,
} from '../behaviors/native-select'

const tailwind = {
  field: 'grid gap-2',
  label: 'text-sm font-medium',
  description: 'text-sm text-muted-foreground',
  wrapper: 'relative inline-flex min-w-0 items-center',
  control:
    'h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-background ps-2.5 pe-8 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive data-[size=sm]:h-8 md:text-sm',
  icon: 'pointer-events-none absolute end-2 size-4 text-muted-foreground',
}

export const NativeSelect = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    label,
    description,
    size = 'default',
    invalid,
    className,
    element = h.select,
    ...options
  }: NativeSelectBehaviorProps<NoInfer<Msg>, R> & {
    readonly id: string
    readonly label?: View.Input<NoInfer<Msg>, R>
    readonly description?: View.Input<NoInfer<Msg>, R>
    readonly size?: 'sm' | 'default'
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
  const control = h.span
    .class(styles.wrapper)
    .attr('data-slot', 'native-select-wrapper')
    .children(
      NativeSelectBehavior(h, {
        ...options,
        element: element
          .class(styles.control, className, element.elementAttrs.class)
          .attrs({
            id,
            'data-size': size,
            'aria-describedby': describedBy || undefined,
            'aria-invalid':
              invalid === undefined
                ? element.elementAttrs['aria-invalid']
                : String(invalid),
          }),
      }),
      h.span
        .class(styles.icon)
        .attrs({ 'data-slot': 'native-select-icon', 'aria-hidden': 'true' })
        .children(
          h
            .el('svg')
            .attrs({
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
            })
            .children(h.el('path').attr('d', 'm6 9 6 6 6-6')),
        ),
    )
  return label === undefined && description === undefined
    ? control
    : h.div
        .class(styles.field)
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

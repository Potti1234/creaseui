import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { FieldBehavior, type FieldParts } from '../behaviors/field'

type Options<Msg> = Parameters<typeof FieldBehavior<Msg>>[1]

const tailwind = {
  root: 'grid min-w-0 gap-2 data-[layout=horizontal]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] data-[layout=horizontal]:items-center md:data-[layout=responsive]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:data-[layout=responsive]:items-center',
  label: 'text-sm leading-snug font-medium data-disabled:opacity-50',
  description: 'col-span-full m-0 text-sm text-muted-foreground',
  error: 'col-span-full m-0 text-sm text-destructive',
}

export const Field = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    description,
    error,
    control,
    group = false,
    layout = 'vertical',
    className,
    props,
    key = props?.id,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly label: View.Input<NoInfer<Msg>, R>
    readonly description?: View.Input<NoInfer<Msg>, R>
    readonly error?: View.Input<NoInfer<Msg>, R>
    readonly control: (field: FieldParts) => View.Input<NoInfer<Msg>, R>
    readonly group?: boolean
    readonly layout?: 'vertical' | 'horizontal' | 'responsive'
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  FieldBehavior(h, {
    ...options,
    key,
    props: {
      ...props,
      described: description === undefined ? props?.described : true,
    },
    view: field => {
      const root = h.div
        .class(styles.root, className)
        .attrs({ 'data-slot': 'field', 'data-layout': layout })
      return field
        .root(group ? field.group(root) : root)
        .children(
          group
            ? field
                .legend(
                  h.span.class(styles.label).attr('data-slot', 'field-legend'),
                )
                .children(label)
            : field
                .label(
                  h.label.class(styles.label).attr('data-slot', 'field-label'),
                )
                .children(label),
          control(field),
          description === undefined
            ? undefined
            : field
                .description(
                  h.p
                    .class(styles.description)
                    .attr('data-slot', 'field-description'),
                )
                .children(description),
          error === undefined
            ? undefined
            : field
                .error(h.p.class(styles.error).attr('data-slot', 'field-error'))
                ?.children(error),
        )
    },
  })

import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { FieldsetBehavior } from '../behaviors/fieldset'

type Options<Msg> = Parameters<typeof FieldsetBehavior<Msg>>[1]

const tailwind = {
  root: 'm-0 grid min-w-0 gap-4 border-0 p-0',
  legend: 'mb-2 p-0 text-base font-medium data-disabled:opacity-50',
  description: 'm-0 text-sm text-muted-foreground',
}

export const Fieldset = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    key = id,
    legend,
    description,
    content,
    className,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly id: string
    readonly legend: View.Input<NoInfer<Msg>, R>
    readonly description?: View.Input<NoInfer<Msg>, R>
    readonly content:
      | View.Input<NoInfer<Msg>, R>
      | View.Children<NoInfer<Msg>, R>
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) => {
  const descriptionId =
    description === undefined ? undefined : `${id}-description`
  return FieldsetBehavior(h, {
    ...options,
    key,
    view: fieldset =>
      fieldset
        .root(
          h.fieldset.class(styles.root, className).attrs({
            id,
            'data-slot': 'field-set',
            'aria-describedby': descriptionId,
          }),
        )
        .children(
          fieldset
            .legend(
              h.legend.class(styles.legend).attr('data-slot', 'field-legend'),
            )
            .children(legend),
          description === undefined
            ? undefined
            : h.p
                .class(styles.description)
                .attr('id', descriptionId)
                .children(description),
          content,
        ),
  })
}

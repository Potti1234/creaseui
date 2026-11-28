import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { CheckboxBehavior } from '../behaviors/checkbox'
import { IconBehavior } from '../behaviors/icon'

type CheckboxOptions<Msg> = Parameters<typeof CheckboxBehavior<Msg>>[1]

const tailwind = {
  field: 'flex items-start gap-2',
  control:
    'grid size-4 shrink-0 place-items-center rounded-[4px] border border-input bg-transparent p-0 text-xs leading-none shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:bg-input/30 dark:data-checked:bg-primary dark:data-indeterminate:bg-primary',
  text: 'grid gap-1',
  label: 'text-sm leading-none font-medium select-none',
  description: 'text-sm text-muted-foreground',
}

export const Checkbox = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    label,
    description,
    ariaLabel,
    invalid,
    className,
    ...options
  }: Omit<CheckboxOptions<Msg>, 'view' | 'fallback'> & {
    readonly id: string
    readonly label?: View.Input<NoInfer<Msg>, R>
    readonly description?: View.Input<NoInfer<Msg>, R>
    readonly ariaLabel?: string
    readonly invalid?: boolean
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) => {
  const descriptionId =
    description === undefined ? undefined : `${id}-description`
  return CheckboxBehavior(h, {
    ...options,
    props: { uncheckedValue: '', ...options.props, id },
    view: checkbox =>
      h.div
        .class(styles.field)
        .attr('data-slot', 'checkbox-field')
        .children(
          checkbox
            .root(
              h.button.class(
                [styles.control, className].filter(Boolean).join(' '),
              ),
            )
            .attrs({
              'aria-label': ariaLabel,
              'aria-describedby': descriptionId,
              'aria-invalid': invalid ? 'true' : undefined,
              'data-slot': 'checkbox',
            })
            .children(
              checkbox.checked || checkbox.indeterminate
                ? checkbox
                    .indicator(
                      h.span.style({ display: 'grid', placeContent: 'center' }),
                    )
                    .children(
                      IconBehavior(h, {
                        name: checkbox.indeterminate ? 'minus' : 'check',
                        size: 'xs',
                      }),
                    )
                : undefined,
            ),
          label === undefined && description === undefined
            ? undefined
            : h.div
                .class(styles.text)
                .children(
                  label === undefined
                    ? undefined
                    : h.label
                        .class(styles.label)
                        .attr('for', id)
                        .children(label),
                  description === undefined
                    ? undefined
                    : h.div
                        .class(styles.description)
                        .attr('id', descriptionId)
                        .children(description),
                ),
        ),
  })
}

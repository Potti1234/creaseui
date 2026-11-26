import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { NumberInputBehavior } from '../behaviors/number-input'

type Options<Msg> = Parameters<typeof NumberInputBehavior<Msg>>[1]

const tailwind = {
  root: 'grid min-w-0 gap-1.5 text-sm data-disabled:opacity-50',
  label: 'font-medium',
  hiddenLabel: 'sr-only',
  group:
    'flex min-w-0 items-center rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 has-aria-invalid:border-destructive data-[size=sm]:h-7 data-[size=md]:h-8 data-[size=lg]:h-9',
  input: 'min-w-0 flex-1 bg-transparent px-2.5 tabular-nums outline-none',
  affix: 'shrink-0 px-1.5 text-muted-foreground',
  stepper:
    'grid h-full w-8 shrink-0 place-items-center rounded text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
  description: 'text-muted-foreground',
}

export const NumberInput = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    label,
    hideLabel = false,
    description,
    units,
    size = 'md',
    steppers = true,
    invalid = false,
    placeholder,
    onClear,
    className,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly id: string
    readonly label: View.Children<NoInfer<Msg>, R>
    readonly hideLabel?: boolean
    readonly description?: View.Children<NoInfer<Msg>, R>
    readonly units?: string
    readonly size?: 'sm' | 'md' | 'lg'
    readonly steppers?: boolean
    readonly invalid?: boolean
    readonly placeholder?: string
    readonly onClear?: NoInfer<Msg>
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  NumberInputBehavior(h, {
    ...options,
    view: field =>
      field
        .root(
          h.div.class(styles.root, className).attr('data-slot', 'number-input'),
        )
        .children(
          h.label
            .class(hideLabel ? styles.hiddenLabel : styles.label)
            .attr('for', id)
            .children(label),
          field
            .group(
              h.div.class(styles.group).attrs({
                'data-slot': 'number-input-group',
                'data-size': size,
              }),
            )
            .children(
              steppers
                ? field
                    .decrement({
                      element: h.button
                        .class(styles.stepper)
                        .attr('data-slot', 'number-input-decrement'),
                    })
                    .children('−')
                : undefined,
              field.input(
                h.input.class(styles.input).attrs({
                  id,
                  placeholder,
                  'data-slot': 'number-input-control',
                  'aria-describedby':
                    description === undefined ? undefined : `${id}-description`,
                  'aria-invalid': invalid ? 'true' : undefined,
                }),
              ),
              units === undefined
                ? undefined
                : h.span.class(styles.affix).children(units),
              onClear === undefined ||
                field.value === null ||
                field.disabled ||
                field.readOnly
                ? undefined
                : h.button
                    .class(styles.stepper)
                    .attrs({ type: 'button', 'aria-label': 'Clear value' })
                    .on('click', onClear)
                    .children('×'),
              steppers
                ? field
                    .increment({
                      element: h.button
                        .class(styles.stepper)
                        .attr('data-slot', 'number-input-increment'),
                    })
                    .children('+')
                : undefined,
            ),
          description === undefined
            ? undefined
            : h.div
                .class(styles.description)
                .attr('id', `${id}-description`)
                .children(description),
        ),
  })

import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { SwitchBehavior, type SwitchProps } from '../behaviors/switch'

const tailwind = {
  field: 'flex items-start gap-2',
  control:
    'inline-flex h-5 w-8 shrink-0 items-center rounded-full border border-transparent bg-input p-0 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary data-[size=sm]:h-4 data-[size=sm]:w-6 motion-reduce:transition-none',
  thumb:
    'pointer-events-none block size-4 rounded-full bg-background transition-[margin-inline-start] data-checked:ms-[14px] data-[size=sm]:size-3 data-[size=sm]:data-checked:ms-[10px] motion-reduce:transition-none',
  text: 'grid gap-1',
  label: 'text-sm leading-none font-medium select-none',
  description: 'text-sm text-muted-foreground',
}

export const Switch = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    id,
    label,
    description,
    ariaLabel,
    labelledBy,
    describedBy,
    invalid,
    direction,
    size = 'default',
    className,
    onToggle,
  }: {
    readonly props: SwitchProps
    readonly id: string
    readonly label?: View.Input<NoInfer<Msg>, R>
    readonly description?: View.Input<NoInfer<Msg>, R>
    readonly ariaLabel?: string
    readonly labelledBy?: string
    readonly describedBy?: string
    readonly invalid?: boolean
    readonly direction?: 'ltr' | 'rtl'
    readonly size?: 'default' | 'sm'
    readonly className?: string
    readonly onToggle?: (event: {
      readonly checked: boolean
    }) => NoInfer<Msg> | undefined
  },
  styles: typeof tailwind = tailwind,
) => {
  const descriptionId =
    description === undefined ? undefined : `${id}-description`
  return SwitchBehavior(h, {
    props: { uncheckedValue: '', ...props },
    onToggle,
    view: parts =>
      h.div
        .class(styles.field)
        .attrs({ 'data-slot': 'switch-field', dir: direction })
        .children(
          parts
            .root(
              h.button
                .class([styles.control, className].filter(Boolean).join(' '))
                .attrs({
                  id,
                  'aria-label': ariaLabel,
                  'aria-labelledby': labelledBy,
                  'aria-describedby':
                    [describedBy, descriptionId].filter(Boolean).join(' ') ||
                    undefined,
                  'aria-invalid': invalid ? 'true' : undefined,
                  'data-slot': 'switch',
                  'data-size': size,
                }),
            )
            .children(
              parts.thumb(
                h.span
                  .class(styles.thumb)
                  .attrs({ 'data-slot': 'switch-thumb', 'data-size': size }),
              ),
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

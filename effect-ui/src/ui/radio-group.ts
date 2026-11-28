import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  RadioGroupBehavior,
  type RadioGroupItem,
  type RadioGroupProps,
} from '../behaviors/radio-group'

type Options<Msg> = Parameters<typeof RadioGroupBehavior<Msg>>[1]

const tailwind = {
  group:
    'grid gap-3 data-[layout=horizontal]:flex data-[layout=horizontal]:flex-wrap',
  field: 'flex items-start gap-2',
  control:
    'grid size-4 shrink-0 place-items-center rounded-full border border-input bg-background p-0 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-primary',
  indicator: 'size-2 rounded-full bg-primary data-ending-style:hidden',
  text: 'grid gap-1',
  label: 'text-sm leading-none font-medium select-none',
  description: 'text-sm text-muted-foreground',
}

export const RadioGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    key = id,
    ariaLabel,
    items,
    props,
    layout = 'vertical',
    direction,
    className,
    ...options
  }: Omit<Options<Msg>, 'props' | 'view' | 'fallback'> & {
    readonly id: string
    readonly ariaLabel: string
    readonly props: Omit<RadioGroupProps, 'items'>
    readonly items: ReadonlyArray<
      RadioGroupItem & {
        readonly label: View.Input<NoInfer<Msg>, R>
        readonly description?: View.Input<NoInfer<Msg>, R>
        readonly invalid?: boolean
      }
    >
    readonly layout?: 'horizontal' | 'vertical'
    readonly direction?: 'ltr' | 'rtl'
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  RadioGroupBehavior(h, {
    ...options,
    key,
    props: {
      ...props,
      items: items.map(({ value, disabled, readOnly }) => ({
        value,
        disabled,
        readOnly,
      })),
    },
    view: group =>
      group
        .root(
          h.div.class(styles.group, className).attrs({
            id,
            dir: direction,
            'aria-label': ariaLabel,
            'data-slot': 'radio-group',
            'data-layout': layout,
          }),
        )
        .children(
          ...items.map(({ value, label, description, invalid }) => {
            const controlId = `${id}-option-${encodeURIComponent(value)}`
            const labelId = `${controlId}-label`
            const descriptionId =
              description === undefined ? undefined : `${controlId}-description`
            return h.div
              .key(value)
              .class(styles.field)
              .children(
                group
                  .radio({
                    value,
                    element: h.button.class(styles.control).attrs({
                      id: controlId,
                      'aria-labelledby': labelId,
                      'aria-describedby': descriptionId,
                      'data-slot': 'radio-group-item',
                    }),
                  })
                  .attr('aria-invalid', invalid ? 'true' : undefined)
                  .children(
                    group.indicator({
                      value,
                      element: h.span.class(styles.indicator),
                    }),
                  ),
                h.div
                  .class(styles.text)
                  .children(
                    h.label
                      .class(styles.label)
                      .attrs({ id: labelId, for: controlId })
                      .children(label),
                    description === undefined
                      ? undefined
                      : h.div
                          .class(styles.description)
                          .attr('id', descriptionId)
                          .children(description),
                  ),
              )
          }),
        ),
  })

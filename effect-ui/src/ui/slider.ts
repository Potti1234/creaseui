import type { Html } from '@effect/ui/html'

import { SliderBehavior } from '../behaviors/slider'

type Options<Msg> = Parameters<typeof SliderBehavior<Msg>>[1]

const tailwind = {
  root: 'grid min-w-0 gap-1.5 px-2 data-disabled:opacity-50',
  caption: 'flex justify-between gap-2 text-sm font-medium',
  value: 'text-muted-foreground tabular-nums',
  control:
    'relative flex h-8 w-full touch-none items-center select-none data-disabled:touch-auto data-readonly:touch-auto data-[orientation=vertical]:h-44 data-[orientation=vertical]:w-8 data-[orientation=vertical]:justify-center',
  track:
    'relative h-1.5 w-full overflow-hidden rounded-full bg-muted data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
  indicator:
    'absolute inset-y-0 left-(--slider-indicator-start) w-(--slider-indicator-size) bg-primary data-[orientation=vertical]:inset-x-0 data-[orientation=vertical]:top-auto data-[orientation=vertical]:bottom-(--slider-indicator-start) data-[orientation=vertical]:h-(--slider-indicator-size) data-[orientation=vertical]:w-full',
  thumb:
    'absolute top-1/2 left-(--slider-thumb-position) size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-background shadow-xs outline-none focus-visible:ring-4 focus-visible:ring-ring/50 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring/50 data-[orientation=vertical]:top-auto data-[orientation=vertical]:bottom-(--slider-thumb-position) data-[orientation=vertical]:left-1/2 data-[orientation=vertical]:translate-y-1/2',
}

export const Slider = <Msg>(
  h: Html.H<Msg>,
  {
    props,
    label,
    ariaLabel = label,
    thumbLabels,
    formatValue,
    showValue = false,
    readOnly = false,
    name,
    direction,
    className,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly label?: string
    readonly ariaLabel?: string
    readonly thumbLabels?: ReadonlyArray<string>
    readonly formatValue?: (value: number, index: number) => string
    readonly showValue?: boolean
    readonly readOnly?: boolean
    readonly name?: string
    readonly direction?: 'ltr' | 'rtl'
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) => {
  const displayOnly = readOnly && props.disabled !== true
  return SliderBehavior(h, {
    ...options,
    props: { ...props, disabled: readOnly || props.disabled === true },
    view: slider =>
      slider
        .root(
          h.div.class(styles.root, className).attrs({
            dir: direction,
            'data-slot': 'slider',
            'data-readonly': readOnly ? '' : undefined,
            'aria-label': ariaLabel,
          }),
        )
        .attr('data-disabled', props.disabled ? '' : undefined)
        .children(
          label === undefined && !showValue
            ? undefined
            : h.div
                .class(styles.caption)
                .children(
                  label === undefined ? undefined : h.span.children(label),
                  showValue
                    ? slider
                        .value(h.output.class(styles.value))
                        .children(
                          slider.values
                            .map(
                              (value, index) =>
                                formatValue?.(value, index) ?? String(value),
                            )
                            .join(' – '),
                        )
                    : undefined,
                ),
          slider
            .control(
              h.div.class(styles.control).attrs({
                'data-slot': 'slider-control',
                'data-readonly': readOnly ? '' : undefined,
              }),
            )
            .children(
              slider
                .track(
                  h.div.class(styles.track).attr('data-slot', 'slider-track'),
                )
                .children(
                  slider.indicator(
                    h.div
                      .class(styles.indicator)
                      .attr('data-slot', 'slider-range'),
                  ),
                ),
              ...slider.values.map((value, index) => {
                const named =
                  thumbLabels?.[index] ??
                  (slider.values.length === 1
                    ? (ariaLabel ?? 'Value')
                    : `${ariaLabel ?? 'Value'} ${index + 1}`)
                const valueText = formatValue?.(value, index)
                const thumb = h.div
                  .key(String(index))
                  .class(styles.thumb)
                  .attr('data-slot', 'slider-thumb')
                // A native range input ignores readonly. Let the kit lay out a disabled
                // input and expose its current value through a focusable thumb.
                return slider
                  .thumb({
                    index,
                    element: displayOnly
                      ? thumb.attrs({
                          role: 'slider',
                          tabindex: '0',
                          'aria-readonly': 'true',
                          'aria-label': named,
                          'aria-orientation': slider.orientation,
                          'aria-valuemin': String(props.min ?? 0),
                          'aria-valuemax': String(props.max ?? 100),
                          'aria-valuenow': String(value),
                          'aria-valuetext': valueText,
                        })
                      : thumb,
                    input: h.input.attrs({
                      name: readOnly ? undefined : name,
                      'aria-hidden': displayOnly ? 'true' : undefined,
                      'aria-label': displayOnly ? undefined : named,
                      'aria-valuetext': displayOnly ? undefined : valueText,
                    }),
                  })
                  .children(
                    displayOnly && name !== undefined
                      ? h.input
                          .attrs({ type: 'hidden', name })
                          .value(String(value))
                      : undefined,
                  )
              }),
            ),
        ),
  })
}

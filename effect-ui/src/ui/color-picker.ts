import type { Html } from '@effect/ui/html'
import { Option } from 'effect'

import {
  ColorPickerBehavior,
  colorFormats,
  colorToString,
  hsvToRgb,
  parseColorString,
} from '../behaviors/color-picker'
import { IconBehavior } from '../behaviors/icon'

type Options<Msg> = Parameters<typeof ColorPickerBehavior<Msg>>[1]
type Parts = Parameters<NonNullable<Options<never>['view']>>[0]
export type ColorPickerProps<Msg> = Omit<Options<Msg>, 'view' | 'fallback'> & {
  readonly id: string
  readonly label?: string
  readonly inline?: boolean
  readonly name?: string
  readonly form?: string
  readonly presets?: readonly {
    readonly label: string
    readonly value: string
  }[]
  readonly showAlpha?: boolean
  readonly showEyeDropper?: boolean
  readonly className?: string
}

const checker =
  'repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 0 0 / 8px 8px'
const hueGradient =
  'linear-gradient(to right, red, #ff0, #0f0, #0ff, #00f, #f0f, red)'
const tailwind = {
  root: 'relative inline-flex min-w-0',
  trigger:
    'flex min-h-9 items-center gap-2 rounded-md border border-input bg-background px-2.5 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
  triggerSwatch:
    'size-5 shrink-0 overflow-hidden rounded-sm border border-input',
  swatch: 'block size-full',
  panel:
    'grid w-72 max-w-[min(var(--available-width,100vw),calc(100vw-2rem))] max-h-(--available-height) gap-3 overflow-auto rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-md outline-none data-ending-style:invisible data-inline:shadow-none',
  area: 'relative h-44 w-full cursor-crosshair touch-none overflow-hidden rounded-md border border-input outline-none select-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:cursor-default aria-disabled:opacity-50',
  handle:
    'pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm',
  slider: 'grid min-w-0 gap-1',
  sliderLabel: 'text-xs text-muted-foreground',
  sliderControl: 'relative flex h-5 items-center touch-none',
  track: 'h-4 w-full rounded-full border border-input',
  thumb:
    'size-3.5 rounded-full border border-black/25 bg-white shadow-sm focus-within:ring-2 focus-within:ring-ring',
  inputs: 'flex min-w-0 items-center gap-2',
  input:
    'h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive',
  format:
    'h-8 rounded-md border border-input bg-background px-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
  sample:
    'grid size-8 shrink-0 place-items-center rounded-md border border-input bg-background outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
  presets: 'flex flex-wrap gap-1.5',
  preset:
    'size-6 overflow-hidden rounded-sm border border-input p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-ring',
  error: 'text-xs text-destructive',
}

export const ColorPicker = <Msg>(
  h: Html.H<Msg>,
  {
    id,
    label = 'Color',
    inline,
    name,
    form,
    presets = [],
    showAlpha = true,
    showEyeDropper = true,
    className,
    ...options
  }: ColorPickerProps<NoInfer<Msg>>,
  styles: typeof tailwind = tailwind,
) =>
  ColorPickerBehavior(h, {
    ...options,
    props: options.props ?? {},
    key: options.key ?? id,
    view: picker => {
      const swatch = (color: string) =>
        h.span.class(styles.swatch).style({ backgroundColor: color })
      const tint = `hsl(${picker.color.h} 100% 50%)`
      const rgb = hsvToRgb(picker.color)
      const opaque = colorToString({ ...rgb, a: 1 }, 'rgb')
      const ramp = (channel: Parts['hue'], label: string, background: string) =>
        channel
          .root(
            h.div
              .class(styles.slider)
              .attr('data-slot', 'color-picker-channel'),
          )
          .children(
            h.span.class(styles.sliderLabel).children(label),
            channel.control(h.div.class(styles.sliderControl)).children(
              channel.track(h.div.class(styles.track).style({ background })),
              channel.thumb({
                index: 0,
                element: h.div.class(styles.thumb),
                input: h.input.attr('aria-label', label),
              }),
            ),
          )
      const panel = h.div
        .class(styles.panel, inline ? className : undefined)
        .attrs({
          'data-slot': 'color-picker-content',
          'data-inline': inline ? '' : undefined,
          'data-disabled': picker.disabled ? '' : undefined,
        })
      const contents = [
        picker
          .area(
            h.div
              .class(styles.area)
              .attrs({
                'aria-label': 'Saturation and brightness',
                'data-slot': 'color-picker-area',
              })
              .style({
                background: `linear-gradient(0deg, black, transparent), linear-gradient(90deg, white, ${tint})`,
              }),
          )
          .children(
            h.span
              .class(styles.handle)
              .attr('aria-hidden', 'true')
              .style({
                left: `${picker.color.s}%`,
                top: `${100 - picker.color.v}%`,
                backgroundColor: opaque,
              }),
          ),
        ramp(picker.hue, 'Hue', hueGradient),
        showAlpha
          ? ramp(
              picker.alpha,
              'Opacity',
              `linear-gradient(90deg, transparent, ${opaque}), ${checker}`,
            )
          : undefined,
        h.div.class(styles.inputs).children(
          picker
            .format(
              h.select
                .class(styles.format)
                .attrs({
                  'aria-label': 'Color format',
                  'data-slot': 'color-picker-format',
                }),
            )
            .children(
              colorFormats.map(format =>
                h.option
                  .key(format)
                  .attrs({
                    value: format,
                    selected: format === picker.formatValue ? '' : undefined,
                  })
                  .children(format.toUpperCase()),
              ),
            ),
          picker.text(
            h.input.class(styles.input).attrs({
              id: `${id}-value`,
              'aria-label': 'Color value',
              'data-slot': 'color-picker-value',
              'aria-describedby': picker.error ? `${id}-error` : undefined,
            }),
          ),
          !showEyeDropper || !picker.sampler
            ? undefined
            : picker
                .sample(
                  h.button
                    .class(styles.sample)
                    .attr('aria-label', 'Pick color from screen'),
                )
                .children(IconBehavior(h, { name: 'pipette', size: 'sm' })),
        ),
        picker.error
          ? h.div
              .class(styles.error)
              .attrs({
                id: `${id}-error`,
                role: 'status',
              })
              .children('Enter a valid color.')
          : undefined,
        presets.length === 0
          ? undefined
          : h.div
              .class(styles.presets)
              .attrs({ role: 'group', 'aria-label': 'Color presets' })
              .children(
                presets.map(({ label, value }, index) => {
                  const color = Option.getOrUndefined(parseColorString(value))
                  if (color === undefined) return undefined
                  const normalized = colorToString(color, 'hex')
                  return picker
                    .preset(
                      h.button
                        .key(String(index))
                        .class(styles.preset)
                        .attrs({
                          'aria-label': label,
                          'aria-pressed': String(normalized === picker.hex),
                          'data-slot': 'color-picker-preset',
                        })
                        .style({ background: checker }),
                      value,
                    )
                    .children(swatch(normalized))
                }),
              ),
      ]
      return picker
        .root(
          h.div
            .class(styles.root, inline ? undefined : className)
            .attrs({ id, 'data-slot': 'color-picker' }),
        )
        .children(
          inline
            ? panel.children(contents)
            : picker.popup.trigger({
                element: h.button
                  .class(styles.trigger)
                  .attrs({
                    'data-slot': 'color-picker-trigger',
                    'aria-label': `${label}, ${picker.hex}`,
                  })
                  .children(
                    h.span
                      .class(styles.triggerSwatch)
                      .style({ background: checker })
                      .children(swatch(picker.swatch)),
                    picker.hex,
                  ),
                disabled: picker.disabled,
              }),
          inline
            ? undefined
            : picker.popup
                .portal(h.dialog.attr('aria-label', label))
                ?.children(
                  picker.popup
                    .positioner(h.div)
                    .children(picker.popup.popup(panel).children(contents)),
                ),
          name === undefined
            ? undefined
            : h.input
                .attrs({ type: 'hidden', name, form })
                .value(picker.hex)
                .disabled(picker.disabled),
        )
    },
  })

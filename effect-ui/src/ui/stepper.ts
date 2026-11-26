import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { StepperBehavior, stepProgress } from '../behaviors/stepper'
import { IconBehavior, type IconName } from '../behaviors/icon'

type Options<Msg> = Parameters<typeof StepperBehavior<Msg>>[1]
export type StepperStep<Msg, R = never> = {
  readonly key: string
  readonly label: string
  readonly description?: string
  readonly status?: 'accent' | 'success' | 'warning' | 'error'
  readonly disabled?: boolean
  readonly optional?: boolean
  readonly indicator?: 'auto' | 'number' | 'none' | View.Content<Msg, R>
  readonly endContent?: View.Input<Msg, R>
  readonly content?: View.Input<Msg, R>
}
export type StepperProps<Msg, R = never> = Omit<
  Options<Msg>,
  'props' | 'view' | 'fallback'
> & {
  readonly id: string
  readonly activeStep: number
  readonly steps: readonly StepperStep<Msg, R>[]
  readonly orientation?: 'horizontal' | 'vertical'
  readonly indicatorPosition?: 'separated' | 'on-track'
  readonly density?: 'compact' | 'balanced' | 'spacious'
  readonly buttons?: boolean
  readonly label?: string
  readonly minimumStepWidth?: number
  readonly collapsedVariant?:
    | 'withLabelAndControls'
    | 'withLabel'
    | 'hiddenLabel'
  readonly className?: string
}

const glyphs = {
  accent: undefined,
  success: 'check',
  warning: 'triangle-alert',
  error: 'circle-alert',
} satisfies Record<
  NonNullable<StepperStep<never>['status']>,
  IconName | undefined
>
const tailwind = {
  root: 'grid min-w-0 gap-2',
  list: 'm-0 flex min-w-0 list-none gap-2 p-0 data-[orientation=vertical]:flex-col',
  item: 'flex min-w-0 flex-1 flex-col gap-1 data-[orientation=vertical]:flex-row data-disabled:opacity-50',
  track:
    'relative h-1 w-full shrink-0 overflow-hidden rounded-full bg-border data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-1',
  onTrack:
    'relative flex min-h-4 min-w-4 items-center data-[orientation=vertical]:justify-center',
  trackMarker:
    'absolute start-0 top-1/2 -translate-y-1/2 rounded-full bg-background data-[orientation=vertical]:start-1/2 data-[orientation=vertical]:top-0 data-[orientation=vertical]:-translate-x-1/2 data-[orientation=vertical]:translate-y-0',
  fill: 'absolute inset-0 origin-left scale-x-0 rounded-[inherit] bg-primary transition-transform duration-(--step-duration) motion-reduce:transition-none rtl:origin-right data-filled:scale-x-100 data-[orientation=vertical]:origin-top data-[orientation=vertical]:scale-x-100 data-[orientation=vertical]:scale-y-0 data-[orientation=vertical]:data-filled:scale-y-100 data-[status=success]:bg-success data-[status=warning]:bg-warning data-[status=error]:bg-destructive',
  step: 'flex w-full min-w-0 items-center gap-2 rounded-md border-0 bg-transparent p-1 text-start text-sm text-foreground outline-none data-[density=balanced]:p-2 data-[density=spacious]:p-3 focus-visible:ring-2 focus-visible:ring-ring enabled:hover:bg-muted',
  indicator:
    'grid size-4 shrink-0 place-items-center rounded-full border border-input text-[10px] font-semibold data-[progress=completed]:border-primary data-[progress=completed]:bg-primary data-[progress=completed]:text-primary-foreground data-[progress=in-progress]:border-primary data-[progress=in-progress]:text-primary',
  text: 'min-w-0 flex-1',
  title: 'block truncate',
  description: 'block text-xs text-muted-foreground',
  content: 'min-w-0 px-2 pb-2 text-sm',
  compact: 'flex min-w-0 items-center justify-between gap-2 px-1 text-sm',
  control:
    'inline-grid size-6 shrink-0 place-items-center rounded border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
}

export const Stepper = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    activeStep,
    steps,
    orientation = 'horizontal',
    indicatorPosition = 'separated',
    density = 'balanced',
    buttons,
    label = 'Progress',
    minimumStepWidth,
    collapsedVariant = 'withLabelAndControls',
    className,
    ...options
  }: StepperProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  StepperBehavior(h, {
    ...options,
    key: options.key ?? id,
    props: {
      active: activeStep,
      count: steps.length,
      orientation,
      minimumStepWidth,
    },
    view: stepper => {
      const selected = steps[stepper.active]
      const relative = (delta: -1 | 1) => {
        let target = stepper.active + delta
        while (steps[target]?.disabled) target += delta
        const disabled = target < 0 || target >= steps.length
        return stepper
          .pick(
            h.button
              .class(styles.control)
              .attrs({
                'aria-label': delta < 0 ? 'Previous step' : 'Next step',
              })
              .disabled(disabled),
            target,
          )
          .children(
            IconBehavior(h, {
              name: delta < 0 ? 'chevron-left' : 'chevron-right',
              size: 'xs',
            }),
          )
      }
      return stepper
        .root(
          h.div.class(styles.root, className).attrs({
            id,
            'data-slot': 'stepper',
            'data-orientation': orientation,
            'data-indicator-position': indicatorPosition,
            'data-compact': stepper.compact ? '' : undefined,
          }),
        )
        .children(
          h.ol
            .class(styles.list)
            .attrs({
              'aria-label': label,
              'data-slot': 'stepper-list',
              'data-orientation': orientation,
              role: 'list',
            })
            .children(
              steps.map((step, index) => {
                const progress = stepProgress(index, stepper.active)
                const status = step.status ?? 'accent'
                const icon = glyphs[status]
                const indicator = step.indicator ?? 'auto'
                const mark =
                  indicator === 'none'
                    ? undefined
                    : typeof indicator !== 'string'
                      ? indicator
                      : h.span
                          .class(styles.indicator)
                          .attrs({
                            'aria-hidden': 'true',
                            'data-progress': progress,
                          })
                          .children(
                            indicator === 'number'
                              ? String(index + 1)
                              : icon !== undefined
                                ? IconBehavior(h, { name: icon, size: '3xs' })
                                : progress === 'completed'
                                  ? IconBehavior(h, {
                                      name: 'check',
                                      size: '3xs',
                                    })
                                  : String(index + 1),
                          )
                const attributes = {
                  'data-slot': 'stepper-label',
                  'data-density': density,
                }
                const words = [
                  indicatorPosition === 'separated' ? mark : undefined,
                  h.span
                    .class(styles.text)
                    .children(
                      h.span
                        .class(styles.title)
                        .children(
                          step.label,
                          step.optional ? ' (optional)' : undefined,
                        ),
                      step.description === undefined
                        ? undefined
                        : h.span
                            .class(styles.description)
                            .children(step.description),
                    ),
                ]
                const rail = h.div
                  .class(styles.track)
                  .attrs({
                    'aria-hidden': 'true',
                    'data-orientation': orientation,
                  })
                  .children(
                    h.span
                      .class(styles.fill)
                      .style({
                        '--step-duration':
                          Math.abs(stepper.active - stepper.previous) === 1
                            ? '300ms'
                            : '0ms',
                      })
                      .attrs({
                        'data-orientation': orientation,
                        'data-status': status,
                        'data-filled':
                          progress !== 'not-started' ? '' : undefined,
                      }),
                  )
                return h.li
                  .key(step.key)
                  .class(styles.item)
                  .attrs({
                    'data-slot': 'stepper-item',
                    'data-orientation': orientation,
                    'data-progress': progress,
                    'data-disabled': step.disabled ? '' : undefined,
                    'aria-current':
                      progress === 'in-progress' ? 'step' : undefined,
                    'aria-label': stepper.compact ? step.label : undefined,
                  })
                  .children(
                    indicatorPosition !== 'on-track' || stepper.compact
                      ? rail
                      : h.div
                          .class(styles.onTrack)
                          .attr('data-orientation', orientation)
                          .children(
                            rail,
                            mark === undefined
                              ? undefined
                              : h.span
                                  .class(styles.trackMarker)
                                  .attr('data-orientation', orientation)
                                  .children(mark),
                          ),
                    stepper.compact
                      ? undefined
                      : h.div.class(styles.text).children(
                          buttons
                            ? stepper
                                .pick(
                                  h.button
                                    .class(styles.step)
                                    .attrs(attributes)
                                    .disabled(step.disabled === true),
                                  index,
                                )
                                .children(words)
                            : h.div
                                .class(styles.step)
                                .attrs(attributes)
                                .children(words),
                          step.content === undefined
                            ? undefined
                            : h.div
                                .class(styles.content)
                                .attr('data-slot', 'stepper-content')
                                .children(step.content),
                          step.endContent,
                        ),
                  )
              }),
            ),
          !stepper.compact ||
            collapsedVariant === 'hiddenLabel' ||
            selected === undefined
            ? undefined
            : h.div
                .class(styles.compact)
                .attrs({
                  'data-slot': 'stepper-compact',
                  'aria-live': 'polite',
                })
                .children(
                  collapsedVariant === 'withLabelAndControls' && buttons
                    ? relative(-1)
                    : undefined,
                  h.span
                    .class(styles.title)
                    .children(
                      `Step ${stepper.active + 1} of ${steps.length}: ${selected.label}`,
                    ),
                  collapsedVariant === 'withLabelAndControls' && buttons
                    ? relative(1)
                    : undefined,
                ),
        )
    },
  })

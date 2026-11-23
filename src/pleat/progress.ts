import { Style, When, Global } from '@pleat/core'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens'
import { className } from './style'
import { tokens } from './tokens'
import { interactionTokens } from './interaction-tokens'
import { normalizeProgress, progressAttributes } from '@/lib/progress'

const indeterminateFrames = Global.keyframes('progress-indeterminate-frames', {
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(100%)' },
})

const styles = {
  root: Style.make({
    borderRadius: foundationTokens.radiusFull,
    overflow: 'hidden',
    backgroundColor: foundationTokens.primarySoft20,
    position: 'relative',
    height: '0.5rem',
    width: '100%',
  }),
  indicator: Style.make({
    flex: '1',
    backgroundColor: tokens.primary,
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'transform',
    height: '100%',
    width: '100%',
  }).pipe(
    Style.when(When.reducedMotion, {
      transitionDuration: interactionTokens.motionNone,
    }),
  ),
  indeterminate: Style.make({
    animationDuration: interactionTokens.motionLoopMedium,
    animationIterationCount: 'infinite',
    animationName: indeterminateFrames,
    animationTimingFunction: interactionTokens.easingStandard,
  }).pipe(Style.when(When.reducedMotion, { animationName: 'none' })),
}
export type ProgressProps = Readonly<{
  value: number | null
  max?: number
  ariaLabel?: string
  valueText?: string
  id?: string
  direction?: 'ltr' | 'rtl'
  layoutStyle?: ComponentLayoutStyle | undefined
}>
export const progress = <Msg>(
  props: ProgressProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const normalized = normalizeProgress(props.value, props.max)
  return h.div(
    [
      ...progressAttributes(
        { ...props, value: normalized.value, max: normalized.max },
        h,
      ),
      ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
      h.DataAttribute('state', normalized.state),
      h.DataAttribute('slot', 'progress'),
      h.Class(className(styles.root, props.layoutStyle)),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'progress-indicator'),
          h.Class(
            className(
              styles.indicator,
              normalized.value === null && styles.indeterminate,
            ),
          ),
          h.Style({
            transform:
              normalized.percentage === null
                ? 'translateX(-60%)'
                : `translateX(${(props.direction === 'rtl' ? 1 : -1) * (100 - normalized.percentage)}%)`,
          }),
        ],
        [],
      ),
    ],
  )
}

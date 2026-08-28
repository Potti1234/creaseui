import * as stylex from '@stylexjs/stylex'

/** Semantic interaction choices shared by components and demo compositions. */
export const interactionTokens = stylex.defineConsts({
  cursorAction: 'pointer',
  cursorDefault: 'default',
  cursorDisabled: 'not-allowed',
  cursorResizeHorizontal: 'col-resize',
  cursorResizeVertical: 'row-resize',
  cursorText: 'text',
  easingLinear: 'linear',
  easingStandard: 'ease-in-out',
  motionFast: '150ms',
  motionLoopFast: '1s',
  motionLoopMedium: '1.5s',
  motionLoopSlow: '2s',
  motionModerate: '200ms',
  motionNone: '0s',
  motionSlow: '300ms',
  pressTransform: 'scale(0.98)',
  pressTransformTactile: 'scale(0.96)',
} as const)


import * as stylex from '@stylexjs/stylex'

/** Semantic interaction choices shared by components and demo compositions. */
export const interactionTokens = stylex.defineConsts({
  cursorAction: 'pointer',
  cursorDefault: 'default',
  cursorDisabled: 'not-allowed',
  cursorResizeHorizontal: 'col-resize',
  cursorResizeVertical: 'row-resize',
  cursorText: 'text',
  easingDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easingLinear: 'linear',
  easingOut: 'ease-out',
  easingPulse: 'cubic-bezier(0.4, 0, 0.6, 1)',
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
  /* shadcn base drawer motion + swipe-handle cursor
     (bases/base/ui/drawer.tsx). */
  cursorGrab: 'grab',
  cursorGrabbing: 'grabbing',
  easingDrawerOverlay: 'cubic-bezier(0.32, 0.72, 0, 1)',
  easingDrawerPopup: 'cubic-bezier(0.32, 0.72, 0, 1)',
  easingDrawerContent: 'cubic-bezier(0.45, 1.005, 0, 1.005)',
  motionDrawer: '450ms',
  motionDrawerRelease: 'calc(var(--drawer-swipe-strength) * 400ms)',
} as const)

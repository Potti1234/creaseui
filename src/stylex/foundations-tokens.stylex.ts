import * as stylex from '@stylexjs/stylex'

export const foundationTokens = stylex.defineVars({
  muted: 'var(--muted)',
  popover: 'var(--popover)',
  popoverForeground: 'var(--popover-foreground)',
  destructiveSoft: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
  destructiveMuted: 'color-mix(in oklab, var(--destructive) 80%, transparent)',
  primarySoft: 'color-mix(in oklab, var(--primary) 10%, transparent)',
  foregroundMuted: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
  foregroundSoft: 'color-mix(in oklab, var(--foreground) 10%, transparent)',
  ringSoft: 'color-mix(in oklab, var(--ring) 50%, transparent)',
  destructiveRingSoft: 'color-mix(in oklab, var(--destructive) 20%, transparent)',
  inputDark: 'color-mix(in oklab, var(--input) 30%, transparent)',
  mutedSoft: 'color-mix(in oklab, var(--muted) 50%, transparent)',
  shadowXs: '0 1px 2px rgb(0 0 0 / 0.05)',
  shadowNone: 'none',
  checkboxRadius: '4px',
  radiusSm: 'calc(var(--radius) - 4px)',
  radiusMd: 'calc(var(--radius) - 2px)',
  radiusLg: 'var(--radius)',
  radiusXl: 'calc(var(--radius) + 4px)',
  radiusFull: '9999px',
  transparent: 'transparent',
})


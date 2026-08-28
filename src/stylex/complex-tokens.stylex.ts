import * as stylex from '@stylexjs/stylex'

/** Semantic tokens shared by the data-rich and navigation component families. */
export const complexTokens = stylex.defineVars({
  sidebar: 'var(--sidebar)',
  sidebarForeground: 'var(--sidebar-foreground)',
  sidebarPrimary: 'var(--sidebar-primary)',
  sidebarPrimaryForeground: 'var(--sidebar-primary-foreground)',
  sidebarAccent: 'var(--sidebar-accent)',
  sidebarAccentForeground: 'var(--sidebar-accent-foreground)',
  sidebarBorder: 'var(--sidebar-border)',
  sidebarRing: 'var(--sidebar-ring)',
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',
  mutedSurface: 'color-mix(in oklab, var(--muted) 50%, transparent)',
  accentSurface: 'color-mix(in oklab, var(--accent) 50%, transparent)',
  focusOutline: '1px solid var(--ring)',
  resizeShadow: '0 0 0 1px var(--ring)',
  smallRadius: '2px',
  overlaySurface: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  transparent: 'transparent',
})


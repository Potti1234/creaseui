import * as stylex from '@stylexjs/stylex'

export const controls = stylex.create({
  box: { boxSizing: 'border-box' },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    verticalAlign: 'middle',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 2px)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    outlineOffset: 2,
  },
  disabled: { opacity: 0.5, cursor: 'default', pointerEvents: 'none' },
})

export const buttonVariants = stylex.create({
  default: {
    color: 'var(--primary-foreground)',
    backgroundColor: {
      default: 'var(--primary)',
      ':hover': 'color-mix(in oklab, var(--primary) 80%, transparent)',
    },
  },
  outline: {
    color: 'var(--foreground)',
    borderColor: 'var(--border)',
    backgroundColor: { default: 'var(--background)', ':hover': 'var(--muted)' },
  },
  secondary: {
    color: 'var(--secondary-foreground)',
    backgroundColor: {
      default: 'var(--secondary)',
      ':hover': 'color-mix(in oklab, var(--secondary), var(--foreground) 5%)',
    },
  },
  ghost: {
    color: 'var(--foreground)',
    backgroundColor: { default: 'transparent', ':hover': 'var(--muted)' },
  },
  destructive: {
    color: 'var(--destructive)',
    backgroundColor: {
      default: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
      ':hover': 'color-mix(in oklab, var(--destructive) 20%, transparent)',
    },
  },
  link: {
    color: 'var(--primary)',
    backgroundColor: 'transparent',
    textDecorationLine: { default: 'none', ':hover': 'underline' },
    textUnderlineOffset: 4,
  },
})

export const buttonSizes = stylex.create({
  default: { height: 36, paddingInline: 10, gap: 6 },
  xs: { height: 24, paddingInline: 8, gap: 4, fontSize: '0.75rem' },
  sm: { height: 32, paddingInline: 10, gap: 4 },
  lg: { height: 40, paddingInline: 10, gap: 6 },
  icon: { height: 36, width: 36, padding: 0 },
  'icon-xs': { height: 24, width: 24, padding: 0 },
  'icon-sm': { height: 32, width: 32, padding: 0 },
  'icon-lg': { height: 40, width: 40, padding: 0 },
})

export const dialog = stylex.create({
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / 50%)',
  },
  viewport: {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    overflowY: 'auto',
    padding: 16,
  },
  popup: {
    position: 'relative',
    display: 'grid',
    width: '100%',
    maxWidth: '32rem',
    gap: 16,
    padding: 24,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--foreground)',
    backgroundColor: 'var(--background)',
    boxShadow: '0 8px 24px rgb(0 0 0 / 14%)',
  },
  title: {
    margin: 0,
    paddingInlineEnd: 56,
    fontSize: '1.125rem',
    lineHeight: 1,
    fontWeight: 600,
  },
  description: {
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  },
  close: {
    position: 'absolute',
    insetBlockStart: 16,
    insetInlineEnd: 16,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: {
      default: 'var(--muted-foreground)',
      ':hover': 'var(--foreground)',
    },
    font: 'inherit',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
})

export const combobox = stylex.create({
  group: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    height: 36,
    paddingInline: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: 'var(--input)', ':focus-within': 'var(--ring)' },
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
  },
  input: {
    flexGrow: 1,
    minWidth: 0,
    padding: 0,
    borderWidth: 0,
    outlineStyle: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.875rem',
  },
  trigger: {
    display: 'grid',
    placeItems: 'center',
    marginInlineStart: 4,
    width: 24,
    height: 24,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: {
      default: 'var(--muted-foreground)',
      ':hover': 'var(--foreground)',
    },
    cursor: 'pointer',
  },
  positioner: {
    width: 'var(--anchor-width)',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  popup: {
    marginBlockStart: 4,
    maxHeight: 'var(--available-height)',
    overflow: 'auto',
    padding: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--popover-foreground)',
    backgroundColor: 'var(--popover)',
    boxShadow: '0 4px 12px rgb(0 0 0 / 12%)',
  },
  empty: {
    display: { default: 'block', ':empty': 'none' },
    padding: '6px 8px',
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    borderRadius: 'calc(var(--radius) - 4px)',
    fontSize: '0.875rem',
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
    backgroundColor: {
      default: 'transparent',
      ':is([data-highlighted])': 'var(--accent)',
    },
    color: {
      default: 'inherit',
      ':is([data-highlighted])': 'var(--accent-foreground)',
    },
  },
})

export const select = stylex.create({
  label: { fontSize: '0.875rem', fontWeight: 500 },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: 'fit-content',
    maxWidth: '100%',
    height: 32,
    paddingInline: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'var(--input)',
      ':focus-visible': 'var(--ring)',
      ':is([aria-invalid=true])': 'var(--destructive)',
      ':is([data-variant=ghost]):not(:focus-visible)': 'transparent',
    },
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: {
      default: 'var(--background)',
      ':is([data-variant=ghost])': 'transparent',
      ':is([data-variant=ghost]):hover': 'var(--muted)',
    },
    color: {
      default: 'var(--foreground)',
      ':is([data-placeholder])': 'var(--muted-foreground)',
    },
    boxShadow: {
      default: '0 1px 2px rgb(0 0 0 / 5%)',
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
      ':is([data-variant=ghost]):not(:focus-visible)': 'none',
    },
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    outlineStyle: 'none',
    opacity: { default: 1, ':disabled': 0.5 },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
  },
  value: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  icon: { display: 'flex', flexShrink: 0, color: 'var(--muted-foreground)' },
  backdrop: {
    position: 'fixed',
    inset: 0,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  positioner: {
    width: 'max-content',
    minWidth: 'var(--anchor-width)',
    maxWidth: 'min(var(--available-width), calc(100vw - 1rem))',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  popup: {
    maxHeight: 'var(--available-height)',
    overflow: 'auto',
    padding: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    boxShadow: '0 4px 12px rgb(0 0 0 / 12%)',
    outlineStyle: 'none',
    opacity: {
      default: 1,
      ':is([data-starting-style],[data-ending-style])': 0,
    },
    transitionProperty: 'opacity',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 'calc(var(--radius) - 4px)',
    fontSize: '0.875rem',
    outlineStyle: 'none',
    cursor: 'default',
    userSelect: 'none',
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
    backgroundColor: {
      default: 'transparent',
      ':is([data-highlighted])': 'var(--accent)',
    },
    color: {
      default: 'inherit',
      ':is([data-highlighted])': 'var(--accent-foreground)',
    },
  },
  groupLabel: {
    padding: '6px 8px',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  },
  separator: { marginBlock: 4, height: 1, backgroundColor: 'var(--border)' },
})

export const choiceField = stylex.create({
  field: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  text: { display: 'grid', gap: 4 },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1,
    userSelect: 'none',
  },
  description: { fontSize: '0.875rem', color: 'var(--muted-foreground)' },
})

export const checkbox = stylex.create({
  control: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: 16,
    height: 16,
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 'calc(var(--radius) - 4px)',
    borderColor: {
      default: 'var(--input)',
      ':is([data-checked],[data-indeterminate])': 'var(--primary)',
      ':focus-visible': 'var(--ring)',
      ':is([aria-invalid=true])': 'var(--destructive)',
    },
    backgroundColor: {
      default: 'var(--background)',
      ':is([data-checked],[data-indeterminate])': 'var(--primary)',
    },
    color: {
      default: 'var(--foreground)',
      ':is([data-checked],[data-indeterminate])': 'var(--primary-foreground)',
    },
    fontSize: '0.75rem',
    lineHeight: 1,
    outlineStyle: 'none',
    boxShadow: {
      default: '0 1px 2px rgb(0 0 0 / 5%)',
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    opacity: { default: 1, ':disabled': 0.5 },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
  },
})

export const switchControl = stylex.create({
  control: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    width: { default: 32, ':is([data-size=sm])': 24 },
    height: { default: 20, ':is([data-size=sm])': 16 },
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 999,
    borderColor: {
      default: 'transparent',
      ':focus-visible': 'var(--ring)',
      ':is([aria-invalid=true])': 'var(--destructive)',
    },
    backgroundColor: {
      default: 'var(--input)',
      ':is([data-checked])': 'var(--primary)',
    },
    outlineStyle: 'none',
    boxShadow: {
      default: 'none',
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    opacity: { default: 1, ':disabled': 0.5 },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    transitionProperty: 'background-color',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
  thumb: {
    display: 'block',
    pointerEvents: 'none',
    width: { default: 16, ':is([data-size=sm])': 12 },
    height: { default: 16, ':is([data-size=sm])': 12 },
    marginInlineStart: {
      default: 0,
      ':is([data-checked])': 14,
      ':is([data-checked][data-size=sm])': 10,
    },
    borderRadius: 999,
    backgroundColor: 'var(--background)',
    transitionProperty: 'margin-inline-start',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
})

export const popover = stylex.create({
  popup: {
    display: 'grid',
    gap: 8,
    width: 'max-content',
    maxWidth: 'min(var(--available-width, 100vw), calc(100vw - 2rem))',
    maxHeight: 'var(--available-height)',
    overflow: 'auto',
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    boxShadow: '0 4px 12px rgb(0 0 0 / 12%)',
    outlineStyle: 'none',
    fontSize: '0.875rem',
    transformOrigin: 'var(--transform-origin)',
    scale: {
      default: 1,
      ':is([data-starting-style],[data-ending-style])': 0.95,
    },
    opacity: {
      default: 1,
      ':is([data-starting-style],[data-ending-style])': 0,
    },
    transitionProperty: 'opacity, scale',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
  title: { margin: 0, fontSize: '0.875rem', fontWeight: 600, lineHeight: 1 },
  description: { margin: 0, color: 'var(--muted-foreground)' },
})

export const tabs = stylex.create({
  root: {
    display: 'flex',
    flexDirection: {
      default: 'row',
      ':is([data-orientation=horizontal])': 'column',
    },
    minWidth: 0,
    gap: 12,
  },
  list: {
    display: 'inline-flex',
    flexDirection: {
      default: 'row',
      ':is([data-orientation=vertical])': 'column',
    },
    flexShrink: 0,
    alignSelf: 'flex-start',
    width: 'fit-content',
    maxWidth: '100%',
    overflowX: 'auto',
    gap: 4,
    padding: 4,
    borderRadius: { default: 'var(--radius)', ':is([data-variant=line])': '0' },
    backgroundColor: {
      default: 'var(--muted)',
      ':is([data-variant=line])': 'transparent',
    },
  },
  tab: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 32,
    padding: '4px 8px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: 'transparent', ':focus-visible': 'var(--ring)' },
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: {
      default: 'transparent',
      ':is([data-active]):not([data-variant=line])': 'var(--background)',
    },
    color: {
      default: 'var(--muted-foreground)',
      ':hover': 'var(--foreground)',
      ':is([data-active])': 'var(--foreground)',
    },
    boxShadow: {
      default: 'none',
      ':is([data-active]):not([data-variant=line])':
        '0 1px 2px rgb(0 0 0 / 8%)',
    },
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    textDecorationLine: {
      default: 'none',
      ':is([data-variant=line][data-active])': 'underline',
    },
    textDecorationThickness: 2,
    textUnderlineOffset: 4,
    outlineStyle: 'none',
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
    cursor: { default: 'pointer', ':is([data-disabled])': 'not-allowed' },
  },
  labelHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
  panel: {
    minWidth: 0,
    flexGrow: 1,
    outlineStyle: 'none',
    boxShadow: { default: 'none', ':focus-visible': '0 0 0 2px var(--ring)' },
  },
})

export const accordion = stylex.create({
  item: {
    borderBottomWidth: { default: 1, ':last-child': 0 },
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border)',
  },
  header: { display: 'flex', margin: 0 },
  trigger: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    flexGrow: 1,
    minHeight: 40,
    padding: '10px 0',
    borderWidth: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    textAlign: 'start',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    textDecorationLine: { default: 'none', ':hover': 'underline' },
    outlineStyle: 'none',
    boxShadow: {
      default: 'none',
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    opacity: { default: 1, ':disabled': 0.5 },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
  },
  icon: {
    marginBlockStart: 2,
    flexShrink: 0,
    color: 'var(--muted-foreground)',
    transform: { default: 'none', ':is([data-open])': 'rotate(180deg)' },
    transitionProperty: 'transform',
    transitionDuration: {
      default: '200ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
  panel: {
    fontSize: '0.875rem',
    height: {
      default: 'var(--accordion-panel-height, auto)',
      ':is([data-starting-style],[data-ending-style])': 0,
    },
    overflow: {
      default: 'visible',
      ':is([data-starting-style],[data-ending-style])': 'hidden',
    },
    transitionProperty: 'height',
    transitionDuration: {
      default: '200ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
  content: { paddingBlockEnd: 10 },
})

export const collapsible = stylex.create({
  panel: {
    display: { default: null, ':is([data-css-hidden])': 'none' },
    height: {
      default: 'var(--collapsible-panel-height, auto)',
      ':is([data-starting-style],[data-ending-style])': 0,
    },
    overflow: {
      default: 'visible',
      ':is([data-starting-style],[data-ending-style])': 'hidden',
    },
    transitionProperty: 'height',
    transitionDuration: {
      default: '200ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
})

const progressPulse = stylex.keyframes({
  '50%': { opacity: 0.5 },
})

export const progress = stylex.create({
  root: { display: 'grid', gap: 6 },
  caption: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: '0.875rem',
  },
  value: {
    color: 'var(--muted-foreground)',
    fontVariantNumeric: 'tabular-nums',
  },
  track: {
    width: '100%',
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'color-mix(in oklab, var(--primary) 20%, transparent)',
  },
  indicator: {
    width: { default: '0%', ':is([data-indeterminate])': '40%' },
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'var(--primary)',
    transitionProperty: 'width',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
    animationName: {
      default: 'none',
      '@media (prefers-reduced-motion: no-preference)': {
        default: 'none',
        ':is([data-indeterminate])': progressPulse,
      },
    },
    animationDuration: '2s',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    animationIterationCount: 'infinite',
  },
})

export const separator = stylex.create({
  line: {
    flexShrink: 0,
    backgroundColor: 'var(--border)',
    width: { default: '100%', ':is([data-orientation=vertical])': 1 },
    height: { default: 1, ':is([data-orientation=vertical])': '100%' },
  },
})

export const toggle = stylex.create({
  control: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: {
      default: 36,
      ':is([data-size=sm])': 32,
      ':is([data-size=lg])': 40,
    },
    minWidth: {
      default: 36,
      ':is([data-size=sm])': 32,
      ':is([data-size=lg])': 40,
    },
    paddingInline: {
      default: 8,
      ':is([data-size=sm])': 6,
      ':is([data-size=lg])': 10,
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'transparent',
      ':is([data-variant=outline])': 'var(--input)',
    },
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--muted)',
      ':is([data-pressed])': 'var(--accent)',
    },
    color: {
      default: 'var(--foreground)',
      ':is([data-pressed])': 'var(--accent-foreground)',
    },
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    outlineStyle: 'none',
    boxShadow: {
      default: 'none',
      ':is([data-variant=outline])': '0 1px 2px rgb(0 0 0 / 5%)',
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    opacity: { default: 1, ':disabled': 0.5 },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    transitionProperty: 'color, background-color, box-shadow',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
})

export const slider = stylex.create({
  root: {
    display: 'grid',
    minWidth: 0,
    gap: 6,
    paddingInline: 8,
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
  },
  caption: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  value: {
    color: 'var(--muted-foreground)',
    fontVariantNumeric: 'tabular-nums',
  },
  control: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: {
      default: 'flex-start',
      ':is([data-orientation=vertical])': 'center',
    },
    height: { default: 32, ':is([data-orientation=vertical])': 176 },
    width: { default: '100%', ':is([data-orientation=vertical])': 32 },
    touchAction: {
      default: 'none',
      ':is([data-readonly],[data-disabled])': 'auto',
    },
    userSelect: 'none',
  },
  track: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'var(--muted)',
    height: { default: 6, ':is([data-orientation=vertical])': '100%' },
    width: { default: '100%', ':is([data-orientation=vertical])': 6 },
  },
  indicator: {
    position: 'absolute',
    backgroundColor: 'var(--primary)',
    top: { default: 0, ':is([data-orientation=vertical])': 'auto' },
    bottom: {
      default: 0,
      ':is([data-orientation=vertical])': 'var(--slider-indicator-start)',
    },
    left: {
      default: 'var(--slider-indicator-start)',
      ':is([data-orientation=vertical])': 0,
    },
    width: {
      default: 'var(--slider-indicator-size)',
      ':is([data-orientation=vertical])': '100%',
    },
    height: {
      default: '100%',
      ':is([data-orientation=vertical])': 'var(--slider-indicator-size)',
    },
  },
  thumb: {
    position: 'absolute',
    top: { default: '50%', ':is([data-orientation=vertical])': 'auto' },
    bottom: {
      default: 'auto',
      ':is([data-orientation=vertical])': 'var(--slider-thumb-position)',
    },
    left: {
      default: 'var(--slider-thumb-position)',
      ':is([data-orientation=vertical])': '50%',
    },
    transform: {
      default: 'translate(-50%, -50%)',
      ':is([data-orientation=vertical])': 'translate(-50%, 50%)',
    },
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--primary)',
    backgroundColor: 'var(--background)',
    outlineStyle: 'none',
    boxShadow: {
      default: '0 1px 2px rgb(0 0 0 / 8%)',
      ':is(:focus-visible,:has(:focus-visible))':
        '0 0 0 4px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
  },
})

export const radioGroup = stylex.create({
  group: {
    display: { default: 'grid', ':is([data-layout=horizontal])': 'flex' },
    flexWrap: 'wrap',
    gap: 12,
  },
  control: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: 16,
    height: 16,
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 999,
    outlineStyle: 'none',
    borderColor: {
      default: 'var(--input)',
      ':is([data-checked])': 'var(--primary)',
      ':focus-visible': 'var(--ring)',
      ':is([aria-invalid=true])': 'var(--destructive)',
    },
    backgroundColor: 'var(--background)',
    boxShadow: {
      default: '0 1px 2px rgb(0 0 0 / 5%)',
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    opacity: { default: 1, ':disabled': 0.5 },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
  },
  indicator: {
    display: { default: 'block', ':is([data-ending-style])': 'none' },
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'var(--primary)',
  },
})

export const input = stylex.create({
  field: { display: 'grid', gap: 8 },
  label: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1 },
  description: { fontSize: '0.875rem', color: 'var(--muted-foreground)' },
  control: {
    height: 32,
    width: '100%',
    minWidth: 0,
    padding: '4px 10px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderColor: {
      default: 'var(--input)',
      ':focus-visible': 'var(--ring)',
      ':is([aria-invalid=true])': 'var(--destructive)',
    },
    backgroundColor: 'var(--background)',
    color: {
      default: 'var(--foreground)',
      '::placeholder': 'var(--muted-foreground)',
    },
    fontFamily: 'inherit',
    fontSize: { default: '1rem', '@media (min-width: 768px)': '0.875rem' },
    outlineStyle: 'none',
    boxShadow: {
      default: '0 1px 2px rgb(0 0 0 / 5%)',
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    opacity: { default: 1, ':disabled': 0.5 },
    cursor: { default: 'text', ':disabled': 'not-allowed' },
  },
})

export const field = stylex.create({
  root: {
    display: 'grid',
    minWidth: 0,
    gap: 8,
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      ':is([data-layout=horizontal])': 'minmax(0, 1fr) minmax(0, 2fr)',
      '@media (min-width: 768px)': {
        default: null,
        ':is([data-layout=responsive])': 'minmax(0, 1fr) minmax(0, 2fr)',
      },
    },
    alignItems: {
      default: 'stretch',
      ':is([data-layout=horizontal])': 'center',
      '@media (min-width: 768px)': {
        default: null,
        ':is([data-layout=responsive])': 'center',
      },
    },
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1,
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
  },
  description: {
    gridColumn: '1 / -1',
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  },
  error: {
    gridColumn: '1 / -1',
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--destructive)',
  },
})

export const fieldset = stylex.create({
  root: {
    display: 'grid',
    minWidth: 0,
    gap: 16,
    margin: 0,
    padding: 0,
    borderWidth: 0,
  },
  legend: {
    marginBlockEnd: 8,
    padding: 0,
    fontSize: '1rem',
    fontWeight: 500,
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
  },
  description: {
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  },
})

export const tooltip = stylex.create({
  root: { display: 'inline-block' },
  positioner: {
    width: 'max-content',
    margin: 0,
    borderWidth: 0,
    padding: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
    visibility: { default: 'visible', ':is([data-anchor-hidden])': 'hidden' },
  },
  popup: {
    position: 'relative',
    maxWidth: 'min(18rem, calc(100vw - 1rem))',
    padding: '6px 12px',
    borderRadius: 'calc(var(--radius) - 2px)',
    transformOrigin: 'var(--transform-origin)',
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    fontSize: '0.75rem',
    textWrap: 'balance',
  },
  arrow: {
    width: 8,
    height: 8,
    borderRadius: 2,
    transform: 'rotate(45deg)',
    backgroundColor: 'var(--primary)',
    top: { default: 'auto', ':is([data-side=bottom])': -4 },
    right: { default: 'auto', ':is([data-side=left])': -4 },
    bottom: { default: 'auto', ':is([data-side=top])': -4 },
    left: { default: 'auto', ':is([data-side=right])': -4 },
  },
})

export const calendar = stylex.create({
  root: {
    width: 'fit-content',
    padding: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--foreground)',
    backgroundColor: 'var(--background)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBlockEnd: 8,
  },
  navigation: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'inherit',
    backgroundColor: { default: 'var(--background)', ':hover': 'var(--muted)' },
    cursor: 'pointer',
  },
  month: { margin: 0, fontSize: '0.875rem', fontWeight: 500 },
  table: { borderCollapse: 'collapse' },
  weekday: {
    height: 32,
    fontSize: '0.75rem',
    fontWeight: 400,
    color: 'var(--muted-foreground)',
  },
  cell: { padding: 0, textAlign: 'center' },
  day: {
    width: 36,
    height: 36,
    padding: 0,
    borderWidth: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontVariantNumeric: 'tabular-nums',
    color: {
      default: 'inherit',
      ':is([data-outside])': 'var(--muted-foreground)',
      ':is([data-selected])': 'var(--primary-foreground)',
    },
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--muted)',
      ':is([data-selected])': 'var(--primary)',
    },
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
  },
})

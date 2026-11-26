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
  groupLabel: {
    paddingInline: 8,
    paddingBlock: 6,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  },
  chips: {
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    backgroundColor: 'var(--muted)',
    paddingInline: 6,
    paddingBlock: 2,
    fontSize: '0.75rem',
  },
  chipRemove: {
    display: 'grid',
    placeItems: 'center',
    width: 20,
    height: 20,
    borderRadius: 4,
    outlineOffset: 1,
    backgroundColor: { default: 'transparent', ':hover': 'var(--background)' },
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    minHeight: 36,
    paddingBlock: 2,
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

const foundationSpin = stylex.keyframes({ to: { transform: 'rotate(360deg)' } })

export const aspectRatio = stylex.create({
  root: {
    position: 'relative',
    width: '100%',
  },
})

export const blockquote = stylex.create({
  root: {
    margin: 0,
    borderInlineStartWidth: 2,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'var(--border)',
    paddingInlineStart: 16,
    overflowWrap: 'break-word',
    color: 'var(--muted-foreground)',
  },
  cite: {
    display: 'block',
    marginBlockStart: 8,
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
    fontStyle: 'normal',
  },
})

export const badge = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    width: 'fit-content',
    flexShrink: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'transparent',
      ':is([data-variant=outline])': 'var(--border)',
    },
    borderRadius: 999,
    backgroundColor: {
      default: 'var(--primary)',
      ':is([data-variant=secondary])': 'var(--secondary)',
      ':is([data-variant=destructive])':
        'color-mix(in oklab, var(--destructive) 10%, transparent)',
      ':is([data-variant=outline])': 'transparent',
      ':is([data-variant=ghost])': 'transparent',
      ':is([data-variant=ghost]):hover': 'var(--muted)',
      ':is([data-variant=link])': 'transparent',
    },
    color: {
      default: 'var(--primary-foreground)',
      ':is([data-variant=secondary])': 'var(--secondary-foreground)',
      ':is([data-variant=destructive])': 'var(--destructive)',
      ':is([data-variant=outline])': 'var(--foreground)',
      ':is([data-variant=ghost])': 'var(--foreground)',
      ':is([data-variant=link])': 'var(--primary)',
    },
    paddingInline: 8,
    fontSize: '0.75rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    outlineStyle: 'none',
    boxShadow: {
      default: null,
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    textDecorationLine: {
      default: null,
      ':is([data-variant=link]):hover': 'underline',
    },
  },
})

export const kbd = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    minWidth: 20,
    height: 20,
    paddingInline: 4,
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) - 4px)',
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 500,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  group: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
})

export const label = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.875rem',
    lineHeight: 1,
    fontWeight: 500,
    userSelect: 'none',
    opacity: {
      default: null,
      ':is([data-disabled=true])': 0.5,
    },
    cursor: {
      default: null,
      ':is([data-disabled=true])': 'not-allowed',
    },
  },
})

export const visuallyHidden = stylex.create({
  root: {
    position: 'absolute',
    top: 0,
    insetInlineStart: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
    pointerEvents: 'none',
    userSelect: 'none',
  },
})

export const statusDot = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: {
      default: 'var(--success)',
      ':is([data-variant=warning])': 'var(--warning)',
      ':is([data-variant=error])': 'var(--destructive)',
      ':is([data-variant=accent])': 'var(--primary)',
      ':is([data-variant=neutral])': 'var(--muted-foreground)',
    },
    color: {
      default: 'oklch(0.985 0 0)',
      ':is([data-variant=warning])': 'oklch(0.205 0 0)',
      ':is([data-variant=accent])': 'var(--primary-foreground)',
      ':is([data-variant=neutral])': 'var(--background)',
    },
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    animationName: {
      default: null,
      ':is([data-pulsing])': progressPulse,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
  },
})

export const skeleton = stylex.create({
  root: {
    borderRadius: {
      default: 'calc(var(--radius) - 2px)',
      ':is([data-shape=text])': 'calc(var(--radius) - 4px)',
      ':is([data-shape=circle])': 999,
    },
    backgroundColor: 'var(--accent)',
    animationName: {
      default: progressPulse,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    height: {
      default: null,
      ':is([data-size=sm])': 12,
      ':is([data-size=md])': 16,
      ':is([data-size=lg])': 48,
    },
    width: {
      default: null,
      ':is([data-size=sm])': 96,
      ':is([data-size=md])': 128,
      ':is([data-size=lg])': 48,
    },
  },
})

export const spinner = stylex.create({
  root: {
    display: 'inline-block',
    width: {
      default: 16,
      ':is([data-size=sm])': 12,
      ':is([data-size=lg])': 24,
      ':is([data-size=xl])': 32,
    },
    height: {
      default: 16,
      ':is([data-size=sm])': 12,
      ':is([data-size=lg])': 24,
      ':is([data-size=xl])': 32,
    },
    flexShrink: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderTopColor: 'transparent',
    animationName: {
      default: foundationSpin,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    color: {
      default: null,
      ':is([data-tone=muted])': 'var(--muted-foreground)',
      ':is([data-tone=primary])': 'var(--primary)',
    },
  },
})

export const toggleGroup = stylex.create({
  root: {
    display: 'inline-flex',
    width: 'fit-content',
    alignItems: {
      default: 'center',
      ':is([data-orientation="vertical"])': 'stretch',
    },
    flexDirection: {
      default: null,
      ':is([data-orientation="vertical"])': 'column',
    },
    flexWrap: {
      default: null,
      ':is([data-arrangement="wrapped"])': 'wrap',
    },
    gap: {
      default: null,
      ':is([data-arrangement="wrapped"])': 4,
    },
  },
  item: {
    height: {
      default: 36,
      ':is([data-size="sm"])': 32,
      ':is([data-size="default"])': 36,
      ':is([data-size="lg"])': 40,
    },
    borderRadius: 0,
    paddingInline: 12,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: {
      default: null,
      ':hover': 'var(--muted)',
      ':is([data-pressed])': 'var(--accent)',
    },
    outline: {
      default: null,
      ':focus-visible': '2px solid var(--ring)',
    },
    outlineOffset: {
      default: null,
      ':focus-visible': 2,
    },
    zIndex: {
      default: null,
      ':focus-visible': 10,
    },
    opacity: {
      default: null,
      ':disabled': 0.5,
    },
    color: {
      default: null,
      ':is([data-pressed])': 'var(--accent-foreground)',
    },
  },
  outline: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
  },
  separated: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  horizontal: {
    borderStartStartRadius: {
      default: null,
      ':first-child': 'calc(var(--radius) - 2px)',
    },
    borderEndStartRadius: {
      default: null,
      ':first-child': 'calc(var(--radius) - 2px)',
    },
    borderStartEndRadius: {
      default: null,
      ':last-child': 'calc(var(--radius) - 2px)',
    },
    borderEndEndRadius: {
      default: null,
      ':last-child': 'calc(var(--radius) - 2px)',
    },
    borderInlineStartWidth: {
      default: null,
      ':not(:first-child)[data-variant="outline"]': 0,
    },
  },
  vertical: {
    borderStartStartRadius: {
      default: null,
      ':first-child': 'calc(var(--radius) - 2px)',
    },
    borderStartEndRadius: {
      default: null,
      ':first-child': 'calc(var(--radius) - 2px)',
    },
    borderEndStartRadius: {
      default: null,
      ':last-child': 'calc(var(--radius) - 2px)',
    },
    borderEndEndRadius: {
      default: null,
      ':last-child': 'calc(var(--radius) - 2px)',
    },
    borderTopWidth: {
      default: null,
      ':not(:first-child)[data-variant="outline"]': 0,
    },
  },
})

export const inputOtp = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  slot: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'var(--input)',
      ':focus': 'var(--ring)',
      ':is([aria-invalid="true"])': 'var(--destructive)',
    },
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    width: 36,
    height: 36,
    textAlign: 'center',
    fontSize: '0.875rem',
    fontVariantNumeric: 'tabular-nums',
    outline: 'none',
    boxShadow: {
      default: null,
      ':focus': '0 0 0 3px color-mix(in oklab, var(--ring) 35%, transparent)',
    },
    opacity: {
      default: null,
      ':disabled': 0.5,
    },
  },
})

export const numberInput = stylex.create({
  root: {
    display: 'grid',
    minWidth: 0,
    gap: 6,
    fontSize: '0.875rem',
    opacity: {
      default: null,
      ':is([data-disabled])': 0.5,
    },
  },
  label: {
    fontWeight: 500,
  },
  hiddenLabel: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  group: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'var(--input)',
      ':focus-within': 'var(--ring)',
      ':has([aria-invalid="true"])': 'var(--destructive)',
    },
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    height: {
      default: null,
      ':is([data-size="sm"])': 28,
      ':is([data-size="md"])': 32,
      ':is([data-size="lg"])': 36,
    },
    boxShadow: {
      default: null,
      ':focus-within':
        '0 0 0 3px color-mix(in oklab, var(--ring) 35%, transparent)',
    },
  },
  input: {
    minWidth: 0,
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingInline: 10,
    fontVariantNumeric: 'tabular-nums',
    outline: 'none',
  },
  affix: {
    flexShrink: 0,
    paddingInline: 6,
    color: 'var(--muted-foreground)',
  },
  stepper: {
    height: '100%',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 0,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    width: 32,
    flexShrink: 0,
    color: 'var(--muted-foreground)',
    backgroundColor: {
      default: null,
      ':hover': 'var(--muted)',
    },
    outline: {
      default: null,
      ':focus-visible': '2px solid var(--ring)',
    },
    outlineOffset: {
      default: null,
      ':focus-visible': 2,
    },
    opacity: {
      default: null,
      ':disabled': 0.5,
    },
  },
  description: {
    color: 'var(--muted-foreground)',
  },
})

export const avatar = stylex.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    width: {
      default: 32,
      ':is([data-size="sm"])': 24,
      ':is([data-size="lg"])': 40,
    },
    height: {
      default: 32,
      ':is([data-size="sm"])': 24,
      ':is([data-size="lg"])': 40,
    },
    flexShrink: 0,
    userSelect: 'none',
    borderRadius: 999,
  },
  image: {
    aspectRatio: '1',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    objectFit: 'cover',
  },
  fallback: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    backgroundColor: {
      default: 'var(--muted)',
      ':is([data-tone="accent"])':
        'color-mix(in oklab, var(--primary) 15%, transparent)',
    },
    color: {
      default: 'var(--foreground)',
      ':is([data-tone="accent"])': 'var(--primary)',
    },
    fontSize: {
      default: '0.875rem',
      ':is([data-size="sm"])': '0.75rem',
    },
    fontWeight: {
      default: null,
      ':is([data-tone="accent"])': 500,
    },
  },
  badge: {
    position: 'absolute',
    insetInlineEnd: 0,
    bottom: 0,
    zIndex: 10,
    display: 'grid',
    placeItems: 'center',
    width: {
      default: 10,
      ':is([data-size="sm"])': 8,
      ':is([data-size="lg"])': 12,
    },
    height: {
      default: 10,
      ':is([data-size="sm"])': 8,
      ':is([data-size="lg"])': 12,
    },
    borderRadius: 999,
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    boxShadow: '0 0 0 2px var(--background)',
  },
})

export const alertDialog = stylex.create({
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / 50%)',
    transition: {
      default: 'opacity 200ms',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    opacity: {
      default: null,
      ':is([data-starting-style])': 0,
      ':is([data-ending-style])': 0,
    },
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
    gap: 16,
    width: '100%',
    maxWidth: {
      default: '32rem',
      ':is([data-size="sm"])': '20rem',
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    padding: 24,
    boxShadow: '0 10px 30px rgb(0 0 0 / 20%)',
    outline: 'none',
    transition: {
      default: 'opacity 200ms, scale 200ms',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    opacity: {
      default: null,
      ':is([data-starting-style])': 0,
      ':is([data-ending-style])': 0,
    },
    scale: {
      default: null,
      ':is([data-starting-style])': 0.95,
      ':is([data-ending-style])': 0.95,
    },
  },
  header: {
    display: 'grid',
    gap: 6,
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 600,
    margin: 0,
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  },
  media: {
    display: 'grid',
    placeItems: 'center',
    width: 64,
    height: 64,
    marginBottom: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: {
      default: 'var(--muted)',
      ':is([data-tone="destructive"])':
        'color-mix(in oklab, var(--destructive) 10%, transparent)',
    },
    color: {
      default: null,
      ':is([data-tone="destructive"])': 'var(--destructive)',
    },
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancel: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: {
      default: 'var(--background)',
      ':hover': 'var(--muted)',
    },
    height: 36,
    paddingInline: 12,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    outline: {
      default: null,
      ':focus-visible': '2px solid var(--ring)',
    },
    outlineOffset: {
      default: null,
      ':focus-visible': 2,
    },
    opacity: {
      default: null,
      ':disabled': 0.5,
    },
  },
  action: {
    height: 36,
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 12,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: {
      default: 'var(--primary)',
      ':is([data-tone="destructive"])': 'var(--destructive)',
    },
    color: {
      default: 'var(--primary-foreground)',
      ':is([data-tone="destructive"])': 'white',
    },
    opacity: {
      default: null,
      ':hover': 0.9,
      ':disabled': 0.5,
    },
    outline: {
      default: null,
      ':focus-visible': '2px solid var(--ring)',
    },
    outlineOffset: {
      default: null,
      ':focus-visible': 2,
    },
  },
})

export const textarea = stylex.create({
  field: {
    display: 'grid',
    gap: 8,
  },
  label: {
    fontWeight: 500,
    fontSize: '0.875rem',
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  },
  control: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'var(--input)',
      ':focus-visible': 'var(--ring)',
      ':is([aria-invalid="true"])': 'var(--destructive)',
    },
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    width: '100%',
    minWidth: 0,
    color: 'var(--foreground)',
    fontSize: {
      default: '1rem',
      '@media (min-width: 48rem)': '0.875rem',
    },
    outline: 'none',
    minHeight: 64,
    paddingInline: 10,
    paddingBlock: 8,
    boxShadow: {
      default: null,
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    opacity: {
      default: null,
      ':disabled': 0.5,
    },
    cursor: {
      default: null,
      ':disabled': 'not-allowed',
    },
  },
})

export const nativeSelect = stylex.create({
  field: {
    display: 'grid',
    gap: 8,
  },
  label: {
    fontWeight: 500,
    fontSize: '0.875rem',
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  },
  control: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'var(--input)',
      ':focus-visible': 'var(--ring)',
      ':is([aria-invalid="true"])': 'var(--destructive)',
    },
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    width: '100%',
    minWidth: 0,
    color: 'var(--foreground)',
    fontSize: {
      default: '1rem',
      '@media (min-width: 48rem)': '0.875rem',
    },
    outline: 'none',
    height: {
      default: 36,
      ':is([data-size="sm"])': 32,
    },
    appearance: 'none',
    paddingInlineStart: 10,
    paddingInlineEnd: 32,
    boxShadow: {
      default: null,
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
    opacity: {
      default: null,
      ':disabled': 0.5,
    },
    cursor: {
      default: null,
      ':disabled': 'not-allowed',
    },
  },
  wrapper: {
    display: 'inline-flex',
    position: 'relative',
    minWidth: 0,
    alignItems: 'center',
  },
  icon: {
    pointerEvents: 'none',
    display: 'grid',
    placeItems: 'center',
    position: 'absolute',
    insetInlineEnd: 8,
    width: 16,
    height: 16,
    color: 'var(--muted-foreground)',
  },
})

export const form = stylex.create({
  root: {
    display: 'grid',
    gap: 24,
  },
  summary: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--destructive) 40%, transparent)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'color-mix(in oklab, var(--destructive) 5%, transparent)',
    padding: 16,
    fontSize: '0.875rem',
  },
  title: {
    fontWeight: 500,
    color: 'var(--foreground)',
    margin: 0,
  },
  list: {
    marginBlock: '8px 0',
    paddingInlineStart: 20,
    listStyleType: 'disc',
  },
  link: {
    color: 'var(--foreground)',
    textDecorationLine: 'underline',
    textUnderlineOffset: 4,
  },
})

export const card = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--card-spacing, 1.5rem)',
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'calc(var(--radius) + 2px)',
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
    paddingBlock: 'var(--card-spacing, 1.5rem)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    boxShadow: '0 1px 2px rgb(0 0 0 / 5%)',
    paddingBlockStart: {
      default: null,
      ':is([data-density="flush"])': 0,
      ':has(>img:first-child)': 0,
    },
  },
  header: {
    display: 'grid',
    gridAutoRows: 'min-content',
    alignItems: 'start',
    gap: 4,
    paddingInline: 'var(--card-spacing, 1.5rem)',
    containerName: 'card-header',
    containerType: 'inline-size',
    gridTemplateColumns: {
      default: null,
      ':has([data-slot="card-action"])': '1fr auto',
    },
    gridTemplateRows: {
      default: null,
      ':has([data-slot="card-description"])': 'auto auto',
    },
  },
  title: {
    margin: 0,
    fontSize: 'var(--card-title-size, 1rem)',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  },
  action: {
    gridColumnStart: '2',
    gridRowStart: '1',
    gridRowEnd: 'span 2',
    alignSelf: 'start',
    justifySelf: 'end',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingInline: 'var(--card-spacing, 1.5rem)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--card-spacing, 1.5rem)',
  },
})

export const alert = stylex.create({
  root: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      ':is([data-icon])': '1rem 1fr',
    },
    alignItems: 'start',
    columnGap: 12,
    rowGap: 2,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--card)',
    color: {
      default: 'var(--primary)',
      ':is([data-severity="success"])': 'var(--success)',
      ':is([data-severity="warning"])': 'var(--warning)',
      ':is([data-severity="error"])': 'var(--destructive)',
    },
    paddingBlock: 12,
    paddingInline: 16,
    fontSize: '0.875rem',
  },
  icon: {
    gridColumnStart: '1',
    gridRowEnd: 'span 2',
  },
  title: {
    gridColumnStart: '-2',
    minHeight: 16,
    fontWeight: 500,
    letterSpacing: '-0.025em',
  },
  description: {
    gridColumnStart: '-2',
    display: 'grid',
    justifyItems: 'start',
    gap: 4,
    color: 'var(--muted-foreground)',
  },
})

export const empty = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    flexGrow: 1,
    minWidth: 0,
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: 0,
    padding: {
      default: 24,
      '@media (min-width: 48rem)': 48,
    },
    textAlign: 'center',
    textWrap: 'balance',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    maxWidth: '24rem',
    textAlign: 'center',
  },
  media: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 8,
    width: {
      default: null,
      ':is([data-variant="icon"])': 40,
    },
    height: {
      default: null,
      ':is([data-variant="icon"])': 40,
    },
    borderRadius: {
      default: null,
      ':is([data-variant="icon"])': 'var(--radius)',
    },
    backgroundColor: {
      default: null,
      ':is([data-variant="icon"])': 'var(--muted)',
    },
    color: {
      default: null,
      ':is([data-variant="icon"])': 'var(--foreground)',
    },
  },
  title: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 500,
    letterSpacing: '-0.025em',
  },
  description: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 1.625,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: '24rem',
    minWidth: 0,
    fontSize: '0.875rem',
    textWrap: 'balance',
  },
})

export const table = stylex.create({
  container: {
    position: 'relative',
    width: '100%',
    overflowX: 'auto',
  },
  root: {
    width: '100%',
    captionSide: 'bottom',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  header: {},
  body: {},
  footer: {
    borderTop: '1px solid var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    fontWeight: 500,
  },
  row: {
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 150ms',
    backgroundColor: {
      default: null,
      ':hover': 'color-mix(in oklab, var(--muted) 50%, transparent)',
      ':is([data-selected])': 'var(--muted)',
    },
  },
  head: {
    height: 40,
    paddingInline: 8,
    textAlign: 'start',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    color: 'var(--foreground)',
  },
  cell: {
    padding: 8,
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  },
  caption: {
    marginTop: 16,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  },
})

export const code = stylex.create({
  root: {
    borderRadius: 4,
    backgroundColor: 'var(--muted)',
    paddingInline: 4,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: {
      default: '0.875rem',
      ':is([data-size="inherit"])': 'inherit',
    },
    lineHeight: 'inherit',
    overflowWrap: 'break-word',
    color: {
      default: 'var(--foreground)',
      ':is([data-color="secondary"])': 'var(--muted-foreground)',
      ':is([data-color="inherit"])': 'inherit',
    },
  },
})

export const typography = stylex.create({
  h1: {
    scrollMargin: 80,
    letterSpacing: '-0.025em',
    fontWeight: 800,
    fontSize: '2.25rem',
    textAlign: 'center',
    textWrap: 'balance',
  },
  h2: {
    scrollMargin: 80,
    letterSpacing: '-0.025em',
    fontWeight: 600,
    fontSize: '1.875rem',
    borderBottom: '1px solid var(--border)',
    paddingBottom: 8,
    marginTop: {
      default: null,
      ':first-child': 0,
    },
  },
  h3: {
    scrollMargin: 80,
    letterSpacing: '-0.025em',
    fontWeight: 600,
    fontSize: '1.5rem',
  },
  h4: {
    scrollMargin: 80,
    letterSpacing: '-0.025em',
    fontWeight: 600,
    fontSize: '1.25rem',
  },
  p: {
    lineHeight: '1.75rem',
    marginTop: {
      default: null,
      ':not(:first-child)': 24,
    },
  },
  blockquote: {
    marginInline: 0,
    marginTop: 24,
    borderInlineStart: '2px solid var(--border)',
    paddingInlineStart: 24,
    fontStyle: 'italic',
  },
  'inline-code': {
    position: 'relative',
    borderRadius: 4,
    backgroundColor: 'var(--muted)',
    paddingInline: '0.3rem',
    paddingBlock: '0.2rem',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  lead: {
    fontSize: '1.25rem',
    color: 'var(--muted-foreground)',
  },
  large: {
    fontSize: '1.125rem',
    fontWeight: 600,
  },
  small: {
    fontSize: '0.875rem',
    lineHeight: 1,
    fontWeight: 500,
  },
  muted: {
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  },
})

export const scrollArea = stylex.create({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    borderRadius: 'inherit',
  },
  viewport: {
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
    outline: 'none',
    boxShadow: {
      default: null,
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
  },
  content: {
    minHeight: '100%',
  },
  scrollbar: {
    display: 'grid',
    padding: 1,
    zIndex: 10,
    width: {
      default: null,
      ':is([data-orientation="vertical"])': 8,
    },
    height: {
      default: null,
      ':is([data-orientation="horizontal"])': 8,
    },
  },
  thumb: {
    borderRadius: 999,
    backgroundColor: 'var(--border)',
  },
  corner: {
    backgroundColor: 'var(--background)',
  },
})

export const toolbar = stylex.create({
  root: {
    display: {
      default: 'flex',
      ':is([data-centered])': 'grid',
    },
    alignItems: {
      default: 'center',
      ':is([data-orientation="vertical"])': 'stretch',
    },
    flexWrap: 'wrap',
    minWidth: 0,
    paddingInline: 16,
    minHeight: {
      default: 36,
      ':is([data-size="sm"])': 32,
      ':is([data-size="lg"])': 40,
    },
    backgroundColor: {
      default: null,
      ':is([data-variant="muted"])': 'var(--muted)',
      ':is([data-variant="surface"])': 'var(--card)',
    },
    color: {
      default: null,
      ':is([data-variant="surface"])': 'var(--card-foreground)',
    },
    flexDirection: {
      default: null,
      ':is([data-orientation="vertical"])': 'column',
    },
    gridTemplateColumns: {
      default: null,
      ':is([data-centered])': 'minmax(0, 1fr) auto minmax(0, 1fr)',
      ':is([data-centered][data-orientation="vertical"])': '1fr',
    },
  },
  slot: {
    display: 'flex',
    minWidth: 0,
    alignItems: {
      default: 'center',
      ':is([data-orientation="vertical"])': 'stretch',
    },
    gap: 'var(--toolbar-gap)',
    flexDirection: {
      default: null,
      ':is([data-orientation="vertical"])': 'column',
    },
  },
  start: {
    marginInlineStart: {
      default: null,
      ':has(>[data-crease-edge-comp]:first-child)': -8,
    },
  },
  center: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  end: {
    justifyContent: 'end',
    marginInlineStart: 'auto',
    marginInlineEnd: {
      default: null,
      ':has(>[data-crease-edge-comp]:last-child)': -8,
    },
  },
})

export const breadcrumb = stylex.create({
  root: {
    minWidth: 0,
  },
  list: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: {
      default: 6,
      '@media (min-width: 40rem)': 10,
    },
    fontSize: '0.875rem',
    overflowWrap: 'break-word',
    color: 'var(--muted-foreground)',
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  link: {
    color: {
      default: 'inherit',
      ':hover': 'var(--foreground)',
    },
    textDecoration: 'none',
    transition: 'color 150ms',
  },
  page: {
    fontWeight: 400,
    color: 'var(--foreground)',
  },
  separator: {
    userSelect: 'none',
  },
  ellipsis: {
    display: 'inline-grid',
    width: 36,
    height: 36,
    placeItems: 'center',
  },
})

export const avatarGroup = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  member: {
    position: 'relative',
    display: 'inline-flex',
    borderRadius: 'var(--avatar-group-radius)',
    backgroundColor: 'var(--background)',
    boxShadow: '0 0 0 2px var(--background)',
  },
  overflow: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'var(--background)',
    backgroundColor: 'var(--muted)',
    paddingInline: 8,
    fontWeight: 500,
    color: 'var(--muted-foreground)',
    userSelect: 'none',
    outline: {
      default: null,
      ':focus-visible': '2px solid var(--ring)',
    },
    outlineOffset: {
      default: null,
      ':focus-visible': 2,
    },
  },
  status: {
    position: 'absolute',
    insetInlineEnd: 0,
    bottom: 0,
    zIndex: 10,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    borderStyle: 'solid',
    borderColor: 'var(--background)',
    backgroundColor: {
      default: 'var(--success)',
      ':is([data-variant="neutral"])': 'var(--background)',
      ':is([data-variant="error"])': 'var(--destructive)',
    },
    color: {
      default: 'var(--background)',
      ':is([data-variant="neutral"])': 'var(--muted-foreground)',
    },
  },
  glyph: {
    borderRadius: 999,
    borderWidth: {
      default: null,
      ':is([data-variant="neutral"])': 1,
    },
    borderStyle: {
      default: null,
      ':is([data-variant="neutral"])': 'solid',
    },
    borderColor: {
      default: null,
      ':is([data-variant="neutral"])': 'currentColor',
    },
    backgroundColor: {
      default: null,
      ':is([data-variant="error"])': 'currentColor',
    },
  },
})

export const menu = stylex.create({
  contextTrigger: {
    position: 'relative',
    display: 'flex',
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'var(--border)',
    borderRadius: 'calc(var(--radius) - 2px)',
    outline: 'none',
    padding: 16,
    boxShadow: {
      default: null,
      ':focus-visible':
        '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
  },
  positioner: {
    zIndex: 50,
    overflow: 'visible',
    borderWidth: 0,
    outline: 'none',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  },
  popup: {
    maxHeight: 'var(--available-height)',
    minWidth: 144,
    overflow: 'auto',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--popover)',
    padding: 4,
    color: 'var(--popover-foreground)',
    boxShadow: '0 8px 24px rgb(0 0 0 / 12%)',
    outline: 'none',
  },
  item: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 4,
    cursor: 'default',
    outline: 'none',
    paddingInline: 8,
    paddingBlock: 6,
    fontSize: '0.875rem',
    textDecoration: 'none',
    color: {
      default: 'inherit',
      ':is([data-highlighted])': 'var(--accent-foreground)',
      ':is([data-tone="destructive"])': 'var(--destructive)',
    },
    userSelect: 'none',
    backgroundColor: {
      default: null,
      ':is([data-highlighted])': 'var(--accent)',
    },
    opacity: {
      default: null,
      ':is([data-disabled])': 0.5,
    },
    paddingInlineStart: {
      default: null,
      ':is([data-inset])': 28,
    },
  },
  group: {},
  groupLabel: {
    paddingInline: 8,
    paddingBlock: 6,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  },
  separator: {
    marginInline: -4,
    marginBlock: 4,
    height: 1,
    backgroundColor: 'var(--border)',
  },
  indicator: {
    width: 16,
    flexShrink: 0,
    textAlign: 'center',
  },
  shortcut: {
    marginInlineStart: 'auto',
    paddingInlineStart: 16,
    fontSize: '0.75rem',
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
  monthPicker: {
    marginBlock: '4px 8px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 4,
    backgroundColor: 'var(--background)',
    color: 'inherit',
    padding: '4px 8px',
    fontSize: '0.875rem',
  },
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
      ':is([data-outside-month])': 'var(--muted-foreground)',
      ':is([data-selected],[data-range-start],[data-range-end])':
        'var(--primary-foreground)',
      ':is([data-in-range]):not([data-range-start],[data-range-end])':
        'var(--accent-foreground)',
    },
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--muted)',
      ':is([data-selected],[data-range-start],[data-range-end])':
        'var(--primary)',
      ':is([data-in-range]):not([data-range-start],[data-range-end])':
        'var(--accent)',
    },
    opacity: { default: 1, ':is([data-disabled],[data-unavailable])': 0.5 },
  },
})

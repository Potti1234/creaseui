import { Global, Style, When } from '@pleat/core'
export const controls = {
  box: Style.make({ boxSizing: 'border-box' }),
  button: Style.make({
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
  }),
  disabled: Style.make({
    opacity: 0.5,
    cursor: 'default',
    pointerEvents: 'none',
  }),
}

export const buttonVariants = {
  default: Style.make({
    color: 'var(--primary-foreground)',
    backgroundColor: 'var(--primary)',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'color-mix(in oklab, var(--primary) 80%, transparent)',
    }),
  ),
  outline: Style.make({
    color: 'var(--foreground)',
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
  }).pipe(Style.when(When.hover, { backgroundColor: 'var(--muted)' })),
  secondary: Style.make({
    color: 'var(--secondary-foreground)',
    backgroundColor: 'var(--secondary)',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor:
        'color-mix(in oklab, var(--secondary), var(--foreground) 5%)',
    }),
  ),
  ghost: Style.make({
    color: 'var(--foreground)',
    backgroundColor: 'transparent',
  }).pipe(Style.when(When.hover, { backgroundColor: 'var(--muted)' })),
  destructive: Style.make({
    color: 'var(--destructive)',
    backgroundColor: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor:
        'color-mix(in oklab, var(--destructive) 20%, transparent)',
    }),
  ),
  link: Style.make({
    color: 'var(--primary)',
    backgroundColor: 'transparent',
    textDecorationLine: 'none',
    textUnderlineOffset: 4,
  }).pipe(Style.when(When.hover, { textDecorationLine: 'underline' })),
}

export const buttonSizes = {
  default: Style.make({ height: 36, paddingInline: 10, gap: 6 }),
  xs: Style.make({ height: 24, paddingInline: 8, gap: 4, fontSize: '0.75rem' }),
  sm: Style.make({ height: 32, paddingInline: 10, gap: 4 }),
  lg: Style.make({ height: 40, paddingInline: 10, gap: 6 }),
  icon: Style.make({ height: 36, width: 36, padding: 0 }),
  'icon-xs': Style.make({ height: 24, width: 24, padding: 0 }),
  'icon-sm': Style.make({ height: 32, width: 32, padding: 0 }),
  'icon-lg': Style.make({ height: 40, width: 40, padding: 0 }),
}

export const dialog = {
  backdrop: Style.make({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / 50%)',
  }),
  viewport: Style.make({
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    overflowY: 'auto',
    padding: 16,
  }),
  popup: Style.make({
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
  }),
  title: Style.make({
    margin: 0,
    paddingInlineEnd: 56,
    fontSize: '1.125rem',
    lineHeight: 1,
    fontWeight: 600,
  }),
  description: Style.make({
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  close: Style.make({
    position: 'absolute',
    insetBlockStart: 16,
    insetInlineEnd: 16,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    font: 'inherit',
    fontSize: '0.875rem',
    cursor: 'pointer',
  }).pipe(Style.when(When.hover, { color: 'var(--foreground)' })),
}

export const combobox = {
  groupLabel: Style.make({
    paddingInline: 8,
    paddingBlock: 6,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  }),
  chips: Style.make({
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
  }),
  chip: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    backgroundColor: 'var(--muted)',
    paddingInline: 6,
    paddingBlock: 2,
    fontSize: '0.75rem',
  }),
  chipRemove: Style.make({
    display: 'grid',
    placeItems: 'center',
    width: 20,
    height: 20,
    borderRadius: 4,
    outlineOffset: 1,
  }).pipe(Style.when(When.hover, { backgroundColor: 'var(--background)' })),
  group: Style.make({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    minHeight: 36,
    paddingBlock: 2,
    paddingInline: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    opacity: 1,
  }).pipe(
    Style.when(When.focusWithin, { borderColor: 'var(--ring)' }),
    Style.when(When.data('disabled'), { opacity: 0.5 }),
  ),
  input: Style.make({
    flexGrow: 1,
    minWidth: 0,
    padding: 0,
    borderWidth: 0,
    outlineStyle: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.875rem',
  }),
  trigger: Style.make({
    display: 'grid',
    placeItems: 'center',
    marginInlineStart: 4,
    width: 24,
    height: 24,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
  }).pipe(Style.when(When.hover, { color: 'var(--foreground)' })),
  positioner: Style.make({
    width: 'var(--anchor-width)',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
  }),
  popup: Style.make({
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
  }),
  empty: Style.make({
    display: 'block',
    padding: '6px 8px',
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }).pipe(Style.when(When.empty, { display: 'none' })),
  item: Style.make({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    borderRadius: 'calc(var(--radius) - 4px)',
    fontSize: '0.875rem',
    opacity: 1,
    backgroundColor: 'transparent',
    color: 'inherit',
  }).pipe(
    Style.when(When.data('disabled'), { opacity: 0.5 }),
    Style.when(When.data('highlighted'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    }),
  ),
}

const reducedMotion = When.media('(prefers-reduced-motion: reduce)')

export const choiceField = {
  field: Style.make({ display: 'flex', alignItems: 'flex-start', gap: 8 }),
  text: Style.make({ display: 'grid', gap: 4 }),
  label: Style.make({
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1,
    userSelect: 'none',
  }),
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
}

const choiceFocus = {
  borderColor: 'var(--ring)',
  boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
}

export const checkbox = {
  control: Style.make({
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: 16,
    height: 16,
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 'calc(var(--radius) - 4px)',
    borderColor: 'var(--input)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '0.75rem',
    lineHeight: 1,
    outlineStyle: 'none',
    boxShadow: '0 1px 2px rgb(0 0 0 / 5%)',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.checked, {
      borderColor: 'var(--primary)',
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    }),
    Style.when(When.indeterminate, {
      borderColor: 'var(--primary)',
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    }),
    Style.when(When.focusVisible, choiceFocus),
    Style.when(When.invalid, { borderColor: 'var(--destructive)' }),
    Style.when(When.disabled, { opacity: 0.5, cursor: 'not-allowed' }),
  ),
}

const smallChoice = When.data('size', 'sm')

export const switchControl = {
  control: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    width: 32,
    height: 20,
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 999,
    borderColor: 'transparent',
    backgroundColor: 'var(--input)',
    outlineStyle: 'none',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
  }).pipe(
    Style.when(smallChoice, { width: 24, height: 16 }),
    Style.when(When.data('checked'), { backgroundColor: 'var(--primary)' }),
    Style.when(When.focusVisible, choiceFocus),
    Style.when(When.invalid, { borderColor: 'var(--destructive)' }),
    Style.when(When.disabled, { opacity: 0.5, cursor: 'not-allowed' }),
    Style.when(reducedMotion, { transitionDuration: '0ms' }),
  ),
  thumb: Style.make({
    display: 'block',
    pointerEvents: 'none',
    width: 16,
    height: 16,
    marginInlineStart: 0,
    borderRadius: 999,
    backgroundColor: 'var(--background)',
    transitionProperty: 'margin-inline-start',
    transitionDuration: '150ms',
  }).pipe(
    Style.when(smallChoice, { width: 12, height: 12 }),
    Style.when(When.data('checked'), { marginInlineStart: 14 }),
    Style.when(When.all(When.data('checked'), smallChoice), {
      marginInlineStart: 10,
    }),
    Style.when(reducedMotion, { transitionDuration: '0ms' }),
  ),
}

export const select = {
  label: Style.make({ fontSize: '0.875rem', fontWeight: 500 }),
  trigger: Style.make({
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
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    boxShadow: '0 1px 2px rgb(0 0 0 / 5%)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    outlineStyle: 'none',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.invalid, { borderColor: 'var(--destructive)' }),
    Style.when(When.disabled, { opacity: 0.5, cursor: 'not-allowed' }),
    Style.when(When.data('placeholder'), { color: 'var(--muted-foreground)' }),
    Style.when(When.data('variant', 'ghost'), {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    }),
    Style.when(When.all(When.data('variant', 'ghost'), When.hover), {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.all(When.data('variant', 'ghost'), When.focusVisible), {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
  ),
  value: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  icon: Style.make({
    display: 'flex',
    flexShrink: 0,
    color: 'var(--muted-foreground)',
  }),
  backdrop: Style.make({
    position: 'fixed',
    inset: 0,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  }),
  positioner: Style.make({
    width: 'max-content',
    minWidth: 'var(--anchor-width)',
    maxWidth: 'min(var(--available-width), calc(100vw - 1rem))',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
  }),
  popup: Style.make({
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
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
  }).pipe(
    Style.when(When.data('starting-style'), { opacity: 0 }),
    Style.when(When.data('ending-style'), { opacity: 0 }),
    Style.when(reducedMotion, { transitionDuration: '0ms' }),
  ),
  item: Style.make({
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
  }).pipe(
    Style.when(When.data('disabled'), { opacity: 0.5 }),
    Style.when(When.data('highlighted'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    }),
  ),
  groupLabel: Style.make({
    padding: '6px 8px',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
  separator: Style.make({
    marginBlock: 4,
    height: 1,
    backgroundColor: 'var(--border)',
  }),
}

export const popover = {
  popup: Style.make({
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
    transitionProperty: 'opacity, scale',
    transitionDuration: '150ms',
  }).pipe(
    Style.when(When.data('starting-style'), { opacity: 0, scale: 0.95 }),
    Style.when(When.data('ending-style'), { opacity: 0, scale: 0.95 }),
    Style.when(reducedMotion, { transitionDuration: '0ms' }),
  ),
  title: Style.make({
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1,
  }),
  description: Style.make({ margin: 0, color: 'var(--muted-foreground)' }),
}

const verticalTabs = When.data('orientation', 'vertical')
const lineTabs = When.data('variant', 'line')
const activeTab = When.data('active')

export const tabs = {
  root: Style.make({ display: 'flex', minWidth: 0, gap: 12 }).pipe(
    Style.when(When.data('orientation', 'horizontal'), {
      flexDirection: 'column',
    }),
  ),
  list: Style.make({
    display: 'inline-flex',
    flexShrink: 0,
    alignSelf: 'flex-start',
    width: 'fit-content',
    maxWidth: '100%',
    overflowX: 'auto',
    gap: 4,
    padding: 4,
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--muted)',
  }).pipe(
    Style.when(verticalTabs, { flexDirection: 'column' }),
    Style.when(lineTabs, { borderRadius: 0, backgroundColor: 'transparent' }),
  ),
  tab: Style.make({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 32,
    padding: '4px 8px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    outlineStyle: 'none',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, { color: 'var(--foreground)' }),
    Style.when(When.focusVisible, { borderColor: 'var(--ring)' }),
    Style.when(activeTab, {
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      boxShadow: '0 1px 2px rgb(0 0 0 / 8%)',
    }),
    Style.when(When.all(lineTabs, activeTab), {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      textDecorationLine: 'underline',
      textDecorationThickness: 2,
      textUnderlineOffset: 4,
    }),
    Style.when(When.disabled, { opacity: 0.5, cursor: 'not-allowed' }),
  ),
  labelHidden: Style.make({
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  }),
  panel: Style.make({ minWidth: 0, flexGrow: 1, outlineStyle: 'none' }).pipe(
    Style.when(When.focusVisible, { boxShadow: '0 0 0 2px var(--ring)' }),
  ),
}

export const accordion = {
  item: Style.make({
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border)',
  }).pipe(Style.when(When.lastChild, { borderBottomWidth: 0 })),
  header: Style.make({ display: 'flex', margin: 0 }),
  trigger: Style.make({
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
    outlineStyle: 'none',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, { textDecorationLine: 'underline' }),
    Style.when(When.focusVisible, { boxShadow: choiceFocus.boxShadow }),
    Style.when(When.disabled, { opacity: 0.5, cursor: 'not-allowed' }),
  ),
  icon: Style.make({
    marginBlockStart: 2,
    flexShrink: 0,
    color: 'var(--muted-foreground)',
    transitionProperty: 'transform',
    transitionDuration: '200ms',
  }).pipe(
    Style.when(When.data('open'), { transform: 'rotate(180deg)' }),
    Style.when(reducedMotion, { transitionDuration: '0ms' }),
  ),
  panel: Style.make({
    fontSize: '0.875rem',
    height: 'var(--accordion-panel-height, auto)',
    transitionProperty: 'height',
    transitionDuration: '200ms',
  }).pipe(
    Style.when(When.data('starting-style'), { height: 0, overflow: 'hidden' }),
    Style.when(When.data('ending-style'), { height: 0, overflow: 'hidden' }),
    Style.when(reducedMotion, { transitionDuration: '0ms' }),
  ),
  content: Style.make({ paddingBlockEnd: 10 }),
}

export const collapsible = {
  panel: Style.make({
    height: 'var(--collapsible-panel-height, auto)',
    transitionProperty: 'height',
    transitionDuration: '200ms',
  }).pipe(
    Style.when(When.data('css-hidden'), { display: 'none' }),
    Style.when(When.data('starting-style'), { height: 0, overflow: 'hidden' }),
    Style.when(When.data('ending-style'), { height: 0, overflow: 'hidden' }),
    Style.when(reducedMotion, { transitionDuration: '0ms' }),
  ),
}

const progressPulse = Global.keyframes('effect-progress-pulse', {
  '50%': { opacity: 0.5 },
})

export const progress = {
  root: Style.make({ display: 'grid', gap: 6 }),
  caption: Style.make({
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: '0.875rem',
  }),
  value: Style.make({
    color: 'var(--muted-foreground)',
    fontVariantNumeric: 'tabular-nums',
  }),
  track: Style.make({
    width: '100%',
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'color-mix(in oklab, var(--primary) 20%, transparent)',
  }),
  indicator: Style.make({
    width: '0%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'var(--primary)',
    transitionProperty: 'width',
    transitionDuration: '150ms',
  }).pipe(
    Style.when(When.data('indeterminate'), { width: '40%' }),
    Style.when(
      When.all(
        When.data('indeterminate'),
        When.media('(prefers-reduced-motion: no-preference)'),
      ),
      {
        animationName: progressPulse,
        animationDuration: '2s',
        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
        animationIterationCount: 'infinite',
      },
    ),
    Style.when(reducedMotion, { transitionDuration: '0ms' }),
  ),
}

export const separator = {
  line: Style.make({
    flexShrink: 0,
    backgroundColor: 'var(--border)',
    width: '100%',
    height: 1,
  }).pipe(
    Style.when(When.data('orientation', 'vertical'), {
      width: 1,
      height: '100%',
    }),
  ),
}

export const toggle = {
  control: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 36,
    minWidth: 36,
    paddingInline: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    outlineStyle: 'none',
    cursor: 'pointer',
    transitionProperty: 'color, background-color, box-shadow',
    transitionDuration: '150ms',
  }).pipe(
    Style.when(When.data('size', 'sm'), {
      height: 32,
      minWidth: 32,
      paddingInline: 6,
    }),
    Style.when(When.data('size', 'lg'), {
      height: 40,
      minWidth: 40,
      paddingInline: 10,
    }),
    Style.when(When.data('variant', 'outline'), {
      borderColor: 'var(--input)',
      boxShadow: '0 1px 2px rgb(0 0 0 / 5%)',
    }),
    Style.when(When.hover, { backgroundColor: 'var(--muted)' }),
    Style.when(When.data('pressed'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    }),
    Style.when(When.focusVisible, { boxShadow: choiceFocus.boxShadow }),
    Style.when(When.disabled, { opacity: 0.5, cursor: 'not-allowed' }),
    Style.when(reducedMotion, { transitionDuration: '0ms' }),
  ),
}

const verticalSlider = When.data('orientation', 'vertical')
const sliderFocus = {
  boxShadow: '0 0 0 4px color-mix(in oklab, var(--ring) 50%, transparent)',
}

export const slider = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 6,
    paddingInline: 8,
  }).pipe(Style.when(When.data('disabled'), { opacity: 0.5 })),
  caption: Style.make({
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
  }),
  value: Style.make({
    color: 'var(--muted-foreground)',
    fontVariantNumeric: 'tabular-nums',
  }),
  control: Style.make({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 32,
    width: '100%',
    touchAction: 'none',
    userSelect: 'none',
  }).pipe(
    Style.when(verticalSlider, {
      justifyContent: 'center',
      height: 176,
      width: 32,
    }),
    Style.when(When.data('disabled'), { touchAction: 'auto' }),
    Style.when(When.data('readonly'), { touchAction: 'auto' }),
  ),
  track: Style.make({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'var(--muted)',
    height: 6,
    width: '100%',
  }).pipe(Style.when(verticalSlider, { height: '100%', width: 6 })),
  indicator: Style.make({
    position: 'absolute',
    backgroundColor: 'var(--primary)',
    top: 0,
    bottom: 0,
    left: 'var(--slider-indicator-start)',
    width: 'var(--slider-indicator-size)',
    height: '100%',
  }).pipe(
    Style.when(verticalSlider, {
      top: 'auto',
      bottom: 'var(--slider-indicator-start)',
      left: 0,
      width: '100%',
      height: 'var(--slider-indicator-size)',
    }),
  ),
  thumb: Style.make({
    position: 'absolute',
    top: '50%',
    left: 'var(--slider-thumb-position)',
    transform: 'translate(-50%, -50%)',
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--primary)',
    backgroundColor: 'var(--background)',
    outlineStyle: 'none',
    boxShadow: '0 1px 2px rgb(0 0 0 / 8%)',
  }).pipe(
    Style.when(verticalSlider, {
      top: 'auto',
      bottom: 'var(--slider-thumb-position)',
      left: '50%',
      transform: 'translate(-50%, 50%)',
    }),
    Style.when(When.focusVisible, sliderFocus),
    Style.when(When.has(When.focusVisible), sliderFocus),
  ),
}

export const radioGroup = {
  group: Style.make({ display: 'grid', gap: 12 }).pipe(
    Style.when(When.data('layout', 'horizontal'), {
      display: 'flex',
      flexWrap: 'wrap',
    }),
  ),
  control: Style.make({
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: 16,
    height: 16,
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 999,
    borderColor: 'var(--input)',
    backgroundColor: 'var(--background)',
    outlineStyle: 'none',
    boxShadow: '0 1px 2px rgb(0 0 0 / 5%)',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.checked, { borderColor: 'var(--primary)' }),
    Style.when(When.focusVisible, choiceFocus),
    Style.when(When.invalid, { borderColor: 'var(--destructive)' }),
    Style.when(When.disabled, { opacity: 0.5, cursor: 'not-allowed' }),
  ),
  indicator: Style.make({
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'var(--primary)',
  }).pipe(Style.when(When.data('ending-style'), { display: 'none' })),
}

export const input = {
  field: Style.make({ display: 'grid', gap: 8 }),
  label: Style.make({ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1 }),
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  control: Style.make({
    height: 32,
    width: '100%',
    minWidth: 0,
    padding: '4px 10px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderColor: 'var(--input)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontFamily: 'inherit',
    fontSize: '1rem',
    outlineStyle: 'none',
    boxShadow: '0 1px 2px rgb(0 0 0 / 5%)',
    cursor: 'text',
  }).pipe(
    Style.when(When.pseudoElement('::placeholder'), {
      color: 'var(--muted-foreground)',
    }),
    Style.when(When.media('(min-width: 768px)'), { fontSize: '0.875rem' }),
    Style.when(When.focusVisible, choiceFocus),
    Style.when(When.invalid, { borderColor: 'var(--destructive)' }),
    Style.when(When.disabled, { opacity: 0.5, cursor: 'not-allowed' }),
  ),
}

const horizontalField = {
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
  alignItems: 'center',
} as const

export const field = {
  root: Style.make({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    minWidth: 0,
    gap: 8,
  }).pipe(
    Style.when(When.data('layout', 'horizontal'), horizontalField),
    Style.when(
      When.all(
        When.data('layout', 'responsive'),
        When.media('(min-width: 768px)'),
      ),
      horizontalField,
    ),
  ),
  label: Style.make({
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1,
  }).pipe(Style.when(When.data('disabled'), { opacity: 0.5 })),
  description: Style.make({
    gridColumn: '1 / -1',
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  error: Style.make({
    gridColumn: '1 / -1',
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--destructive)',
  }),
}

export const fieldset = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 16,
    margin: 0,
    padding: 0,
    borderWidth: 0,
  }),
  legend: Style.make({
    marginBlockEnd: 8,
    padding: 0,
    fontSize: '1rem',
    fontWeight: 500,
  }).pipe(Style.when(When.data('disabled'), { opacity: 0.5 })),
  description: Style.make({
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
}

const foundationSpin = Global.keyframes('effect-spinner', {
  to: { transform: 'rotate(360deg)' },
})

export const aspectRatio = {
  root: Style.make({
    position: 'relative',
    width: '100%',
  }),
}

export const blockquote = {
  root: Style.make({
    margin: 0,
    borderInlineStartWidth: 2,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'var(--border)',
    paddingInlineStart: 16,
    overflowWrap: 'break-word',
    color: 'var(--muted-foreground)',
  }),
  cite: Style.make({
    display: 'block',
    marginBlockStart: 8,
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
    fontStyle: 'normal',
  }),
}

export const badge = {
  root: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    width: 'fit-content',
    flexShrink: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 999,
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    paddingInline: 8,
    fontSize: '0.75rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    outlineStyle: 'none',
  }).pipe(
    Style.when(When.focusVisible, {
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.data('variant', 'secondary'), {
      backgroundColor: 'var(--secondary)',
      color: 'var(--secondary-foreground)',
    }),
    Style.when(When.data('variant', 'destructive'), {
      backgroundColor:
        'color-mix(in oklab, var(--destructive) 10%, transparent)',
      color: 'var(--destructive)',
    }),
    Style.when(When.data('variant', 'outline'), {
      borderColor: 'var(--border)',
      backgroundColor: 'transparent',
      color: 'var(--foreground)',
    }),
    Style.when(When.data('variant', 'ghost'), {
      backgroundColor: 'transparent',
      color: 'var(--foreground)',
    }),
    Style.when(When.all(When.data('variant', 'ghost'), When.hover), {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.data('variant', 'link'), {
      backgroundColor: 'transparent',
      color: 'var(--primary)',
    }),
    Style.when(When.all(When.data('variant', 'link'), When.hover), {
      textDecorationLine: 'underline',
    }),
  ),
}

export const kbd = {
  root: Style.make({
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
  }),
  group: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  }),
}

export const label = {
  root: Style.make({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.875rem',
    lineHeight: 1,
    fontWeight: 500,
    userSelect: 'none',
  }).pipe(
    Style.when(When.data('disabled', 'true'), {
      opacity: 0.5,
      cursor: 'not-allowed',
    }),
  ),
}

export const visuallyHidden = {
  root: Style.make({
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
  }),
}

export const statusDot = {
  root: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: 'var(--success)',
    color: 'oklch(0.985 0 0)',
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
  }).pipe(
    Style.when(When.data('variant', 'warning'), {
      backgroundColor: 'var(--warning)',
      color: 'oklch(0.205 0 0)',
    }),
    Style.when(When.data('variant', 'error'), {
      backgroundColor: 'var(--destructive)',
    }),
    Style.when(When.data('variant', 'accent'), {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    }),
    Style.when(When.data('variant', 'neutral'), {
      backgroundColor: 'var(--muted-foreground)',
      color: 'var(--background)',
    }),
    Style.when(When.data('pulsing'), {
      animationName: progressPulse,
    }),
    Style.when(reducedMotion, {
      animationName: 'none',
    }),
  ),
}

export const skeleton = {
  root: Style.make({
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--accent)',
    animationName: progressPulse,
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
  }).pipe(
    Style.when(When.data('shape', 'text'), {
      borderRadius: 'calc(var(--radius) - 4px)',
    }),
    Style.when(When.data('shape', 'circle'), {
      borderRadius: 999,
    }),
    Style.when(When.data('size', 'sm'), {
      height: 12,
      width: 96,
    }),
    Style.when(When.data('size', 'md'), {
      height: 16,
      width: 128,
    }),
    Style.when(When.data('size', 'lg'), {
      height: 48,
      width: 48,
    }),
    Style.when(reducedMotion, {
      animationName: 'none',
    }),
  ),
}

export const spinner = {
  root: Style.make({
    display: 'inline-block',
    width: 16,
    height: 16,
    flexShrink: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderTopColor: 'transparent',
    animationName: foundationSpin,
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  }).pipe(
    Style.when(When.data('size', 'sm'), {
      height: 12,
      width: 12,
    }),
    Style.when(When.data('size', 'lg'), {
      height: 24,
      width: 24,
    }),
    Style.when(When.data('size', 'xl'), {
      height: 32,
      width: 32,
    }),
    Style.when(When.data('tone', 'muted'), {
      color: 'var(--muted-foreground)',
    }),
    Style.when(When.data('tone', 'primary'), {
      color: 'var(--primary)',
    }),
    Style.when(reducedMotion, {
      animationName: 'none',
    }),
  ),
}

export const toggleGroup = {
  root: Style.make({
    display: 'inline-flex',
    width: 'fit-content',
    alignItems: 'center',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation="vertical"])'), {
      flexDirection: 'column',
      alignItems: 'stretch',
    }),
    Style.when(When.pseudo(':is([data-arrangement="wrapped"])'), {
      flexWrap: 'wrap',
      gap: 4,
    }),
  ),
  item: Style.make({
    height: 36,
    borderRadius: 0,
    paddingInline: 12,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      height: 32,
    }),
    Style.when(When.pseudo(':is([data-size="default"])'), {
      height: 36,
    }),
    Style.when(When.pseudo(':is([data-size="lg"])'), {
      height: 40,
    }),
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
      zIndex: 10,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([data-pressed])'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    }),
  ),
  outline: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
  }),
  separated: Style.make({
    borderRadius: 'calc(var(--radius) - 2px)',
  }),
  horizontal: Style.make({}).pipe(
    Style.when(When.firstChild, {
      borderStartStartRadius: 'calc(var(--radius) - 2px)',
      borderEndStartRadius: 'calc(var(--radius) - 2px)',
    }),
    Style.when(When.lastChild, {
      borderStartEndRadius: 'calc(var(--radius) - 2px)',
      borderEndEndRadius: 'calc(var(--radius) - 2px)',
    }),
    Style.when(
      When.all(When.not(When.firstChild), When.data('variant', 'outline')),
      {
        borderInlineStartWidth: 0,
      },
    ),
  ),
  vertical: Style.make({}).pipe(
    Style.when(When.firstChild, {
      borderStartStartRadius: 'calc(var(--radius) - 2px)',
      borderStartEndRadius: 'calc(var(--radius) - 2px)',
    }),
    Style.when(When.lastChild, {
      borderEndStartRadius: 'calc(var(--radius) - 2px)',
      borderEndEndRadius: 'calc(var(--radius) - 2px)',
    }),
    Style.when(
      When.all(When.not(When.firstChild), When.data('variant', 'outline')),
      {
        borderTopWidth: 0,
      },
    ),
  ),
}

export const inputOtp = {
  root: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
  }),
  group: Style.make({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }),
  slot: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    width: 36,
    height: 36,
    textAlign: 'center',
    fontSize: '0.875rem',
    fontVariantNumeric: 'tabular-nums',
    outline: 'none',
  }).pipe(
    Style.when(When.focus, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 35%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([aria-invalid="true"])'), {
      borderColor: 'var(--destructive)',
    }),
  ),
}

export const numberInput = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 6,
    fontSize: '0.875rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  label: Style.make({
    fontWeight: 500,
  }),
  hiddenLabel: Style.make({
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
  group: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      height: 28,
    }),
    Style.when(When.pseudo(':is([data-size="md"])'), {
      height: 32,
    }),
    Style.when(When.pseudo(':is([data-size="lg"])'), {
      height: 36,
    }),
    Style.when(When.focusWithin, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 35%, transparent)',
    }),
    Style.when(When.pseudo(':has([aria-invalid="true"])'), {
      borderColor: 'var(--destructive)',
    }),
  ),
  input: Style.make({
    minWidth: 0,
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingInline: 10,
    fontVariantNumeric: 'tabular-nums',
    outline: 'none',
  }),
  affix: Style.make({
    flexShrink: 0,
    paddingInline: 6,
    color: 'var(--muted-foreground)',
  }),
  stepper: Style.make({
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
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  description: Style.make({
    color: 'var(--muted-foreground)',
  }),
}

export const avatar = {
  root: Style.make({
    position: 'relative',
    display: 'inline-flex',
    width: 32,
    height: 32,
    flexShrink: 0,
    userSelect: 'none',
    borderRadius: 999,
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      width: 24,
      height: 24,
    }),
    Style.when(When.pseudo(':is([data-size="lg"])'), {
      width: 40,
      height: 40,
    }),
  ),
  image: Style.make({
    aspectRatio: '1',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    objectFit: 'cover',
  }),
  fallback: Style.make({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    backgroundColor: 'var(--muted)',
    color: 'var(--foreground)',
    fontSize: '0.875rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      fontSize: '0.75rem',
    }),
    Style.when(When.pseudo(':is([data-tone="accent"])'), {
      backgroundColor: 'color-mix(in oklab, var(--primary) 15%, transparent)',
      color: 'var(--primary)',
      fontWeight: 500,
    }),
  ),
  badge: Style.make({
    position: 'absolute',
    insetInlineEnd: 0,
    bottom: 0,
    zIndex: 10,
    display: 'grid',
    placeItems: 'center',
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    boxShadow: '0 0 0 2px var(--background)',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      width: 8,
      height: 8,
    }),
    Style.when(When.pseudo(':is([data-size="lg"])'), {
      width: 12,
      height: 12,
    }),
  ),
}

export const alertDialog = {
  backdrop: Style.make({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / 50%)',
    transition: 'opacity 200ms',
  }).pipe(
    Style.when(When.pseudo(':is([data-starting-style], [data-ending-style])'), {
      opacity: 0,
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transition: 'none',
    }),
  ),
  viewport: Style.make({
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    overflowY: 'auto',
    padding: 16,
  }),
  popup: Style.make({
    position: 'relative',
    display: 'grid',
    gap: 16,
    width: '100%',
    maxWidth: '32rem',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    padding: 24,
    boxShadow: '0 10px 30px rgb(0 0 0 / 20%)',
    outline: 'none',
    transition: 'opacity 200ms, scale 200ms',
  }).pipe(
    Style.when(When.pseudo(':is([data-starting-style], [data-ending-style])'), {
      opacity: 0,
      scale: 0.95,
    }),
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      maxWidth: '20rem',
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transition: 'none',
    }),
  ),
  header: Style.make({
    display: 'grid',
    gap: 6,
  }),
  title: Style.make({
    fontSize: '1.125rem',
    fontWeight: 600,
    margin: 0,
  }),
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  }),
  media: Style.make({
    display: 'grid',
    placeItems: 'center',
    width: 64,
    height: 64,
    marginBottom: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--muted)',
  }).pipe(
    Style.when(When.pseudo(':is([data-tone="destructive"])'), {
      backgroundColor:
        'color-mix(in oklab, var(--destructive) 10%, transparent)',
      color: 'var(--destructive)',
    }),
  ),
  footer: Style.make({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  }),
  cancel: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    height: 36,
    paddingInline: 12,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  action: Style.make({
    height: 36,
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 12,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
  }).pipe(
    Style.when(When.hover, {
      opacity: 0.9,
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([data-tone="destructive"])'), {
      backgroundColor: 'var(--destructive)',
      color: 'white',
    }),
  ),
}

export const textarea = {
  field: Style.make({
    display: 'grid',
    gap: 8,
  }),
  label: Style.make({
    fontWeight: 500,
    fontSize: '0.875rem',
  }),
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  }),
  control: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    width: '100%',
    minWidth: 0,
    color: 'var(--foreground)',
    fontSize: '1rem',
    outline: 'none',
    minHeight: 64,
    paddingInline: 10,
    paddingBlock: 8,
  }).pipe(
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
      cursor: 'not-allowed',
    }),
    Style.when(When.pseudo(':is([aria-invalid="true"])'), {
      borderColor: 'var(--destructive)',
    }),
    Style.when(When.media('(min-width: 48rem)'), {
      fontSize: '0.875rem',
    }),
  ),
}

export const nativeSelect = {
  field: Style.make({
    display: 'grid',
    gap: 8,
  }),
  label: Style.make({
    fontWeight: 500,
    fontSize: '0.875rem',
  }),
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  }),
  control: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    width: '100%',
    minWidth: 0,
    color: 'var(--foreground)',
    fontSize: '1rem',
    outline: 'none',
    height: 36,
    appearance: 'none',
    paddingInlineStart: 10,
    paddingInlineEnd: 32,
  }).pipe(
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
      cursor: 'not-allowed',
    }),
    Style.when(When.pseudo(':is([aria-invalid="true"])'), {
      borderColor: 'var(--destructive)',
    }),
    Style.when(When.media('(min-width: 48rem)'), {
      fontSize: '0.875rem',
    }),
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      height: 32,
    }),
  ),
  wrapper: Style.make({
    display: 'inline-flex',
    position: 'relative',
    minWidth: 0,
    alignItems: 'center',
  }),
  icon: Style.make({
    pointerEvents: 'none',
    display: 'grid',
    placeItems: 'center',
    position: 'absolute',
    insetInlineEnd: 8,
    width: 16,
    height: 16,
    color: 'var(--muted-foreground)',
  }),
}

export const form = {
  root: Style.make({
    display: 'grid',
    gap: 24,
  }),
  summary: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--destructive) 40%, transparent)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'color-mix(in oklab, var(--destructive) 5%, transparent)',
    padding: 16,
    fontSize: '0.875rem',
  }),
  title: Style.make({
    fontWeight: 500,
    color: 'var(--foreground)',
    margin: 0,
  }),
  list: Style.make({
    marginBlock: '8px 0',
    paddingInlineStart: 20,
    listStyleType: 'disc',
  }),
  link: Style.make({
    color: 'var(--foreground)',
    textDecorationLine: 'underline',
    textUnderlineOffset: 4,
  }),
}

export const card = {
  root: Style.make({
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
  }).pipe(
    Style.when(When.pseudo(':is([data-density="flush"])'), {
      paddingBlockStart: 0,
    }),
    Style.when(When.pseudo(':has(>img:first-child)'), {
      paddingBlockStart: 0,
    }),
  ),
  header: Style.make({
    display: 'grid',
    gridAutoRows: 'min-content',
    alignItems: 'start',
    gap: 4,
    paddingInline: 'var(--card-spacing, 1.5rem)',
    containerName: 'card-header',
    containerType: 'inline-size',
  }).pipe(
    Style.when(When.pseudo(':has([data-slot="card-action"])'), {
      gridTemplateColumns: '1fr auto',
    }),
    Style.when(When.pseudo(':has([data-slot="card-description"])'), {
      gridTemplateRows: 'auto auto',
    }),
  ),
  title: Style.make({
    margin: 0,
    fontSize: 'var(--card-title-size, 1rem)',
    lineHeight: 1.5,
    fontWeight: 500,
  }),
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  action: Style.make({
    gridColumnStart: '2',
    gridRowStart: '1',
    gridRowEnd: 'span 2',
    alignSelf: 'start',
    justifySelf: 'end',
  }),
  content: Style.make({
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingInline: 'var(--card-spacing, 1.5rem)',
  }),
  footer: Style.make({
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--card-spacing, 1.5rem)',
  }),
}

export const alert = {
  root: Style.make({
    display: 'grid',
    gridTemplateColumns: '1fr',
    alignItems: 'start',
    columnGap: 12,
    rowGap: 2,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--card)',
    color: 'var(--primary)',
    paddingBlock: 12,
    paddingInline: 16,
    fontSize: '0.875rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-icon])'), {
      gridTemplateColumns: '1rem 1fr',
    }),
    Style.when(When.pseudo(':is([data-severity="success"])'), {
      color: 'var(--success)',
    }),
    Style.when(When.pseudo(':is([data-severity="warning"])'), {
      color: 'var(--warning)',
    }),
    Style.when(When.pseudo(':is([data-severity="error"])'), {
      color: 'var(--destructive)',
    }),
  ),
  icon: Style.make({
    gridColumnStart: '1',
    gridRowEnd: 'span 2',
  }),
  title: Style.make({
    gridColumnStart: '-2',
    minHeight: 16,
    fontWeight: 500,
    letterSpacing: '-0.025em',
  }),
  description: Style.make({
    gridColumnStart: '-2',
    display: 'grid',
    justifyItems: 'start',
    gap: 4,
    color: 'var(--muted-foreground)',
  }),
}

export const empty = {
  root: Style.make({
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
    padding: 24,
    textAlign: 'center',
    textWrap: 'balance',
  }).pipe(
    Style.when(When.media('(min-width: 48rem)'), {
      padding: 48,
    }),
  ),
  header: Style.make({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    maxWidth: '24rem',
    textAlign: 'center',
  }),
  media: Style.make({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-variant="icon"])'), {
      width: 40,
      height: 40,
      borderRadius: 'var(--radius)',
      backgroundColor: 'var(--muted)',
      color: 'var(--foreground)',
    }),
  ),
  title: Style.make({
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 500,
    letterSpacing: '-0.025em',
  }),
  description: Style.make({
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 1.625,
  }),
  content: Style.make({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: '24rem',
    minWidth: 0,
    fontSize: '0.875rem',
    textWrap: 'balance',
  }),
}

export const table = {
  container: Style.make({
    position: 'relative',
    width: '100%',
    overflowX: 'auto',
  }),
  root: Style.make({
    width: '100%',
    captionSide: 'bottom',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  }),
  header: Style.make({}),
  body: Style.make({}),
  footer: Style.make({
    borderTop: '1px solid var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    fontWeight: 500,
  }),
  row: Style.make({
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 150ms',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    }),
    Style.when(When.pseudo(':is([data-selected])'), {
      backgroundColor: 'var(--muted)',
    }),
  ),
  head: Style.make({
    height: 40,
    paddingInline: 8,
    textAlign: 'start',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    color: 'var(--foreground)',
  }),
  cell: Style.make({
    padding: 8,
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }),
  caption: Style.make({
    marginTop: 16,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
}

export const code = {
  root: Style.make({
    borderRadius: 4,
    backgroundColor: 'var(--muted)',
    paddingInline: 4,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.875rem',
    lineHeight: 'inherit',
    overflowWrap: 'break-word',
    color: 'var(--foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-color="secondary"])'), {
      color: 'var(--muted-foreground)',
    }),
    Style.when(When.pseudo(':is([data-color="inherit"])'), {
      color: 'inherit',
    }),
    Style.when(When.pseudo(':is([data-size="inherit"])'), {
      fontSize: 'inherit',
    }),
  ),
}

export const typography = {
  h1: Style.make({
    scrollMargin: 80,
    letterSpacing: '-0.025em',
    fontWeight: 800,
    fontSize: '2.25rem',
    textAlign: 'center',
    textWrap: 'balance',
  }),
  h2: Style.make({
    scrollMargin: 80,
    letterSpacing: '-0.025em',
    fontWeight: 600,
    fontSize: '1.875rem',
    borderBottom: '1px solid var(--border)',
    paddingBottom: 8,
  }).pipe(
    Style.when(When.pseudo(':first-child'), {
      marginTop: 0,
    }),
  ),
  h3: Style.make({
    scrollMargin: 80,
    letterSpacing: '-0.025em',
    fontWeight: 600,
    fontSize: '1.5rem',
  }),
  h4: Style.make({
    scrollMargin: 80,
    letterSpacing: '-0.025em',
    fontWeight: 600,
    fontSize: '1.25rem',
  }),
  p: Style.make({
    lineHeight: '1.75rem',
  }).pipe(
    Style.when(When.pseudo(':not(:first-child)'), {
      marginTop: 24,
    }),
  ),
  blockquote: Style.make({
    marginInline: 0,
    marginTop: 24,
    borderInlineStart: '2px solid var(--border)',
    paddingInlineStart: 24,
    fontStyle: 'italic',
  }),
  'inline-code': Style.make({
    position: 'relative',
    borderRadius: 4,
    backgroundColor: 'var(--muted)',
    paddingInline: '0.3rem',
    paddingBlock: '0.2rem',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.875rem',
    fontWeight: 600,
  }),
  lead: Style.make({
    fontSize: '1.25rem',
    color: 'var(--muted-foreground)',
  }),
  large: Style.make({
    fontSize: '1.125rem',
    fontWeight: 600,
  }),
  small: Style.make({
    fontSize: '0.875rem',
    lineHeight: 1,
    fontWeight: 500,
  }),
  muted: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
}

export const tooltip = {
  root: Style.make({ display: 'inline-block' }),
  positioner: Style.make({
    width: 'max-content',
    margin: 0,
    borderWidth: 0,
    padding: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
  }).pipe(Style.when(When.data('anchor-hidden'), { visibility: 'hidden' })),
  popup: Style.make({
    position: 'relative',
    maxWidth: 'min(18rem, calc(100vw - 1rem))',
    padding: '6px 12px',
    borderRadius: 'calc(var(--radius) - 2px)',
    transformOrigin: 'var(--transform-origin)',
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    fontSize: '0.75rem',
    textWrap: 'balance',
  }),
  arrow: Style.make({
    width: 8,
    height: 8,
    borderRadius: 2,
    transform: 'rotate(45deg)',
    backgroundColor: 'var(--primary)',
  }).pipe(
    Style.when(When.data('side', 'top'), { bottom: -4 }),
    Style.when(When.data('side', 'right'), { left: -4 }),
    Style.when(When.data('side', 'bottom'), { top: -4 }),
    Style.when(When.data('side', 'left'), { right: -4 }),
  ),
}

export const calendar = {
  root: Style.make({
    width: 'fit-content',
    padding: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--foreground)',
    backgroundColor: 'var(--background)',
  }),
  header: Style.make({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBlockEnd: 8,
  }),
  navigation: Style.make({
    width: 36,
    height: 36,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'inherit',
    backgroundColor: 'var(--background)',
    cursor: 'pointer',
  }).pipe(Style.when(When.hover, { backgroundColor: 'var(--muted)' })),
  month: Style.make({ margin: 0, fontSize: '0.875rem', fontWeight: 500 }),
  monthPicker: Style.make({
    marginBlock: '4px 8px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 4,
    backgroundColor: 'var(--background)',
    color: 'inherit',
    padding: '4px 8px',
    fontSize: '0.875rem',
  }),
  table: Style.make({ borderCollapse: 'collapse' }),
  weekday: Style.make({
    height: 32,
    fontSize: '0.75rem',
    fontWeight: 400,
    color: 'var(--muted-foreground)',
  }),
  cell: Style.make({ padding: 0, textAlign: 'center' }),
  day: Style.make({
    width: 36,
    height: 36,
    padding: 0,
    borderWidth: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontVariantNumeric: 'tabular-nums',
    color: 'inherit',
    backgroundColor: 'transparent',
    opacity: 1,
  }).pipe(
    Style.when(When.data('outside-month'), {
      color: 'var(--muted-foreground)',
    }),
    Style.when(
      When.pseudo(':is([data-selected],[data-range-start],[data-range-end])'),
      {
        color: 'var(--primary-foreground)',
        backgroundColor: 'var(--primary)',
      },
    ),
    Style.when(
      When.all(
        When.data('in-range'),
        When.not(When.data('range-start')),
        When.not(When.data('range-end')),
      ),
      {
        borderRadius: 0,
        color: 'var(--accent-foreground)',
        backgroundColor: 'var(--accent)',
      },
    ),
    Style.when(When.hover, { backgroundColor: 'var(--muted)' }),
    Style.when(When.pseudo(':is([data-disabled],[data-unavailable])'), {
      opacity: 0.5,
    }),
  ),
}

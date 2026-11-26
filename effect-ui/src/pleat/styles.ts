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
    borderRadius: 4,
    borderColor: 'var(--input)',
    backgroundColor: 'transparent',
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

export const scrollArea = {
  root: Style.make({
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    borderRadius: 'inherit',
  }),
  viewport: Style.make({
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
    outline: 'none',
  }).pipe(
    Style.when(When.focusVisible, {
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
  ),
  content: Style.make({
    minHeight: '100%',
  }),
  scrollbar: Style.make({
    display: 'grid',
    padding: 1,
    zIndex: 10,
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation="vertical"])'), {
      width: 8,
    }),
    Style.when(When.pseudo(':is([data-orientation="horizontal"])'), {
      height: 8,
    }),
  ),
  thumb: Style.make({
    borderRadius: 999,
    backgroundColor: 'var(--border)',
  }),
  corner: Style.make({
    backgroundColor: 'var(--background)',
  }),
}

export const toolbar = {
  root: Style.make({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    minWidth: 0,
    paddingInline: 16,
    minHeight: 36,
  }).pipe(
    Style.when(When.pseudo(':is([data-variant="muted"])'), {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.pseudo(':is([data-variant="surface"])'), {
      backgroundColor: 'var(--card)',
      color: 'var(--card-foreground)',
    }),
    Style.when(When.pseudo(':is([data-orientation="vertical"])'), {
      flexDirection: 'column',
      alignItems: 'stretch',
    }),
    Style.when(When.pseudo(':is([data-centered])'), {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
    }),
    Style.when(
      When.pseudo(':is([data-centered][data-orientation="vertical"])'),
      {
        gridTemplateColumns: '1fr',
      },
    ),
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      minHeight: 32,
    }),
    Style.when(When.pseudo(':is([data-size="lg"])'), {
      minHeight: 40,
    }),
  ),
  slot: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 'var(--toolbar-gap)',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation="vertical"])'), {
      flexDirection: 'column',
      alignItems: 'stretch',
    }),
  ),
  start: Style.make({}).pipe(
    Style.when(When.pseudo(':has(>[data-crease-edge-comp]:first-child)'), {
      marginInlineStart: -8,
    }),
  ),
  center: Style.make({
    justifyContent: 'center',
    overflow: 'hidden',
  }),
  end: Style.make({
    justifyContent: 'end',
    marginInlineStart: 'auto',
  }).pipe(
    Style.when(When.pseudo(':has(>[data-crease-edge-comp]:last-child)'), {
      marginInlineEnd: -8,
    }),
  ),
}

export const breadcrumb = {
  root: Style.make({
    minWidth: 0,
  }),
  list: Style.make({
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.875rem',
    overflowWrap: 'break-word',
    color: 'var(--muted-foreground)',
  }).pipe(
    Style.when(When.media('(min-width: 40rem)'), {
      gap: 10,
    }),
  ),
  item: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }),
  link: Style.make({
    color: 'inherit',
    textDecoration: 'none',
    transition: 'color 150ms',
  }).pipe(
    Style.when(When.hover, {
      color: 'var(--foreground)',
    }),
  ),
  page: Style.make({
    fontWeight: 400,
    color: 'var(--foreground)',
  }),
  separator: Style.make({
    userSelect: 'none',
  }),
  ellipsis: Style.make({
    display: 'inline-grid',
    width: 36,
    height: 36,
    placeItems: 'center',
  }),
}

export const avatarGroup = {
  root: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
  }),
  member: Style.make({
    position: 'relative',
    display: 'inline-flex',
    borderRadius: 'var(--avatar-group-radius)',
    backgroundColor: 'var(--background)',
    boxShadow: '0 0 0 2px var(--background)',
  }),
  overflow: Style.make({
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
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  status: Style.make({
    position: 'absolute',
    insetInlineEnd: 0,
    bottom: 0,
    zIndex: 10,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    borderStyle: 'solid',
    borderColor: 'var(--background)',
    backgroundColor: 'var(--success)',
    color: 'var(--background)',
  }).pipe(
    Style.when(When.pseudo(':is([data-variant="neutral"])'), {
      backgroundColor: 'var(--background)',
      color: 'var(--muted-foreground)',
    }),
    Style.when(When.pseudo(':is([data-variant="error"])'), {
      backgroundColor: 'var(--destructive)',
    }),
  ),
  glyph: Style.make({
    borderRadius: 999,
  }).pipe(
    Style.when(When.pseudo(':is([data-variant="neutral"])'), {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'currentColor',
    }),
    Style.when(When.pseudo(':is([data-variant="error"])'), {
      backgroundColor: 'currentColor',
    }),
  ),
}

export const menu = {
  contextTrigger: Style.make({
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
  }).pipe(
    Style.when(When.focusVisible, {
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
  ),
  backdrop: Style.make({
    position: 'fixed',
    inset: 0,
  }),
  positioner: Style.make({
    zIndex: 50,
    overflow: 'visible',
    borderWidth: 0,
    outline: 'none',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  }),
  popup: Style.make({
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
  }),
  item: Style.make({
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
    color: 'inherit',
    userSelect: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-highlighted])'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    }),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([data-inset])'), {
      paddingInlineStart: 28,
    }),
    Style.when(When.pseudo(':is([data-tone="destructive"])'), {
      color: 'var(--destructive)',
    }),
  ),
  group: Style.make({}),
  groupLabel: Style.make({
    paddingInline: 8,
    paddingBlock: 6,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  }),
  separator: Style.make({
    marginInline: -4,
    marginBlock: 4,
    height: 1,
    backgroundColor: 'var(--border)',
  }),
  indicator: Style.make({
    width: 16,
    flexShrink: 0,
    textAlign: 'center',
  }),
  shortcut: Style.make({
    marginInlineStart: 'auto',
    paddingInlineStart: 16,
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
}

export const drawer = {
  backdrop: Style.make({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / 50%)',
    opacity: 'calc(1 - var(--drawer-swipe-progress, 0))',
    transition: 'opacity 200ms',
  }).pipe(
    Style.when(When.pseudo(':is([data-starting-style],[data-ending-style])'), {
      opacity: 0,
    }),
    Style.when(When.pseudo(':is([data-swiping])'), {
      transition: 'none',
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transition: 'none',
    }),
  ),
  viewport: Style.make({
    position: 'fixed',
    inset: 0,
    display: 'flex',
    paddingBottom: 'var(--drawer-keyboard-inset, 0px)',
  }).pipe(
    Style.when(When.pseudo(':is([data-side="top"])'), {
      alignItems: 'start',
    }),
    Style.when(When.pseudo(':is([data-side="bottom"])'), {
      alignItems: 'end',
    }),
    Style.when(When.pseudo(':is([data-side="left"])'), {
      justifyContent: 'start',
    }),
    Style.when(When.pseudo(':is([data-side="right"])'), {
      justifyContent: 'end',
    }),
  ),
  popup: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    position: 'relative',
    display: 'grid',
    gap: 16,
    minHeight: 0,
    maxHeight: '100dvh',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    padding: 20,
    boxShadow: '0 10px 30px rgb(0 0 0 / 20%)',
    outline: 'none',
    translate: 'var(--crease-drawer-translate)',
    transitionProperty: 'translate',
    transitionDuration: 'calc(var(--drawer-swipe-strength, 1) * 320ms)',
  }).pipe(
    Style.when(When.pseudo(':is([data-starting-style],[data-ending-style])'), {
      translate: 'var(--crease-drawer-exit)',
    }),
    Style.when(When.pseudo(':is([data-swiping])'), {
      transition: 'none',
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transition: 'none',
    }),
    Style.when(When.pseudo(':is([data-side="top"])'), {
      borderBottomLeftRadius: 'var(--radius)',
      borderBottomRightRadius: 'var(--radius)',
    }),
    Style.when(When.pseudo(':is([data-side="bottom"])'), {
      borderTopLeftRadius: 'var(--radius)',
      borderTopRightRadius: 'var(--radius)',
    }),
    Style.when(When.pseudo(':is([data-side="left"],[data-side="right"])'), {
      height: '100%',
      maxWidth: '24rem',
    }),
  ),
  handle: Style.make({
    height: 6,
    width: 48,
    marginInline: 'auto',
    borderRadius: 999,
    backgroundColor:
      'color-mix(in oklab, var(--muted-foreground) 45%, transparent)',
  }),
  header: Style.make({
    display: 'grid',
    gap: 6,
  }),
  title: Style.make({
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
  }),
  description: Style.make({
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  content: Style.make({
    minHeight: 0,
    overflow: 'auto',
    overscrollBehavior: 'contain',
  }),
  footer: Style.make({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'end',
    gap: 8,
  }),
  close: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    paddingInline: 12,
    height: 32,
    fontSize: '0.875rem',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
}

export const circularProgress = {
  root: Style.make({
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  }).pipe(
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.6,
    }),
  ),
  ring: Style.make({
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
  }),
  svg: Style.make({
    display: 'block',
    rotate: '-90deg',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  }).pipe(
    Style.when(When.pseudo(':is([data-indeterminate])'), {
      animationName: foundationSpin,
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      animationName: 'none',
    }),
  ),
  fill: Style.make({
    transition: 'stroke-dasharray 150ms',
  }).pipe(
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transition: 'none',
    }),
  ),
  caption: Style.make({
    fontSize: '0.875rem',
  }),
  value: Style.make({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: '0.75rem',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  }),
}

export const stat = {
  root: Style.make({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    minWidth: 0,
    gap: 4,
  }),
  label: Style.make({
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  }),
  line: Style.make({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    minWidth: 0,
    gap: 8,
  }),
  value: Style.make({
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: 'var(--foreground)',
    fontVariantNumeric: 'tabular-nums',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      fontSize: '1.25rem',
    }),
    Style.when(When.pseudo(':is([data-size="lg"])'), {
      fontSize: '1.875rem',
    }),
  ),
  delta: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-sentiment="positive"])'), {
      color: 'var(--success)',
    }),
    Style.when(When.pseudo(':is([data-sentiment="negative"])'), {
      color: 'var(--destructive)',
    }),
  ),
  description: Style.make({
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
    color: 'var(--muted-foreground)',
  }),
  media: Style.make({
    marginTop: 4,
    width: '100%',
  }),
}

export const bubble = {
  root: Style.make({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: 'fit-content',
    maxWidth: '80%',
    minWidth: 0,
    gap: 4,
  }).pipe(
    Style.when(When.pseudo(':is([data-align="end"])'), {
      alignSelf: 'end',
    }),
    Style.when(When.pseudo(':is([data-variant="ghost"])'), {
      maxWidth: '100%',
    }),
  ),
  group: Style.make({
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    gap: 8,
  }),
  content: Style.make({
    width: 'fit-content',
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 'calc(var(--radius) + 2px)',
    paddingInline: 12,
    paddingBlock: 8,
    textAlign: 'start',
    fontSize: '0.875rem',
    lineHeight: 1.625,
    overflowWrap: 'break-word',
    color: 'var(--foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-variant="default"])'), {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    }),
    Style.when(When.pseudo(':is([data-variant="secondary"])'), {
      backgroundColor: 'var(--secondary)',
      color: 'var(--secondary-foreground)',
    }),
    Style.when(When.pseudo(':is([data-variant="muted"])'), {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.pseudo(':is([data-variant="tinted"])'), {
      backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
    }),
    Style.when(When.pseudo(':is([data-variant="outline"])'), {
      borderColor: 'var(--border)',
      backgroundColor: 'var(--background)',
    }),
    Style.when(When.pseudo(':is([data-variant="ghost"])'), {
      borderRadius: 0,
      padding: 0,
      borderWidth: 0,
      backgroundColor: 'transparent',
    }),
    Style.when(When.pseudo(':is([data-variant="destructive"])'), {
      backgroundColor:
        'color-mix(in oklab, var(--destructive) 10%, transparent)',
      color: 'var(--destructive)',
    }),
  ),
  reactions: Style.make({
    position: 'absolute',
    zIndex: 10,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'var(--muted)',
    paddingInline: 6,
    paddingBlock: 2,
    fontSize: '0.875rem',
    boxShadow: '0 0 0 3px var(--card)',
  }).pipe(
    Style.when(When.pseudo(':is([data-align="start"])'), {
      insetInlineStart: 4,
    }),
    Style.when(When.pseudo(':is([data-align="end"])'), {
      insetInlineEnd: 4,
    }),
    Style.when(When.pseudo(':is([data-side="top"])'), {
      top: 0,
      translate: '0 -50%',
    }),
    Style.when(When.pseudo(':is([data-side="bottom"])'), {
      bottom: 0,
      translate: '0 50%',
    }),
  ),
}

export const token = {
  root: Style.make({
    display: 'inline-flex',
    maxWidth: '100%',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    paddingInline: 8,
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  }).pipe(
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  action: Style.make({
    display: 'inline-flex',
    minWidth: 0,
    flexGrow: 1,
    alignItems: 'center',
    gap: 4,
    color: 'inherit',
    textDecoration: 'none',
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
  }).pipe(
    Style.when(When.pseudo(':is(a,button)'), {
      cursor: 'pointer',
    }),
    Style.when(When.all(When.pseudo(':is(a,button)'), When.hover), {
      filter: 'brightness(0.9)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  label: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  remove: Style.make({
    display: 'inline-flex',
    width: 16,
    height: 16,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    padding: 0,
    borderWidth: 0,
    marginInlineEnd: -4,
    color: 'currentColor',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'rgb(0 0 0 / 10%)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
  ),
}

export const mapStyles = {
  root: Style.make({
    position: 'relative',
    height: 420,
    minHeight: 256,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'var(--muted)',
    color: 'var(--foreground)',
  }),
  canvas: Style.make({
    position: 'absolute',
    inset: 0,
  }),
  status: Style.make({
    position: 'absolute',
    inset: 0,
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: 'color-mix(in oklab, var(--background) 95%, transparent)',
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
  }).pipe(
    Style.when(When.pseudo(':is([hidden])'), {
      display: 'none',
    }),
  ),
  controlGroup: Style.make({
    position: 'absolute',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    boxShadow: '0 4px 10px rgb(0 0 0 / 16%)',
  }),
  control: Style.make({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
    paddingInline: 8,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    fontSize: '1.125rem',
    fontWeight: 500,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: -2,
    }),
    Style.when(When.pseudo(':is([hidden])'), {
      display: 'none',
    }),
  ),
  marker: Style.make({
    position: 'absolute',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
    translate: '-50% -50%',
    touchAction: 'none',
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
      borderRadius: 999,
    }),
  ),
  markerContent: Style.make({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    boxShadow: '0 0 0 2px var(--background)',
    fontSize: '0.875rem',
  }),
  label: Style.make({
    borderRadius: 'calc(var(--radius) - 2px)',
    position: 'absolute',
    top: '100%',
    marginTop: 4,
    whiteSpace: 'nowrap',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    paddingInline: 8,
    paddingBlock: 4,
    boxShadow: '0 1px 3px rgb(0 0 0 / 15%)',
    fontSize: '0.75rem',
    fontWeight: 500,
  }),
  tooltip: Style.make({
    borderRadius: 'calc(var(--radius) - 2px)',
    position: 'absolute',
    bottom: '100%',
    marginBottom: 4,
    whiteSpace: 'nowrap',
    display: 'none',
    pointerEvents: 'none',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    paddingInline: 8,
    paddingBlock: 4,
    boxShadow: '0 4px 8px rgb(0 0 0 / 10%)',
    fontSize: '0.75rem',
  }).pipe(
    Style.when(
      When.pseudo(
        ':is([data-slot=map-marker]:hover > *,[data-slot=map-marker]:focus-visible > *)',
      ),
      {
        display: 'block',
      },
    ),
  ),
  popup: Style.make({
    position: 'absolute',
    zIndex: 20,
    width: 240,
    maxWidth: 'calc(100% - 2rem)',
    translate: '-50% calc(-100% - 20px)',
    borderRadius: 'var(--radius)',
    padding: 16,
    paddingInlineEnd: 40,
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    boxShadow: '0 10px 26px rgb(0 0 0 / 18%)',
    fontSize: '0.875rem',
  }),
  close: Style.make({
    position: 'absolute',
    top: 0,
    insetInlineEnd: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
    color: 'var(--muted-foreground)',
    fontSize: '1.125rem',
    backgroundColor: 'transparent',
    borderWidth: 0,
  }).pipe(
    Style.when(When.hover, {
      color: 'var(--foreground)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
    }),
  ),
}

export const dateInput = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 6,
    fontSize: '0.875rem',
  }),
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
  row: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
  }),
  control: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    width: '100%',
    height: 32,
    minWidth: 0,
    paddingInline: 10,
    fontSize: '1rem',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      height: 28,
    }),
    Style.when(When.pseudo(':is([data-size="lg"])'), {
      height: 36,
    }),
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([aria-invalid="true"])'), {
      borderColor: 'var(--destructive)',
    }),
    Style.when(When.media('(min-width: 48rem)'), {
      fontSize: '0.875rem',
    }),
  ),
  clear: Style.make({
    display: 'grid',
    width: 32,
    height: 32,
    placeItems: 'center',
    flexShrink: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
  ),
  description: Style.make({
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
}

export const timeInput = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 6,
    fontSize: '0.875rem',
  }),
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
  row: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  }),
  control: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    width: '100%',
    height: 32,
    minWidth: 0,
    paddingInline: 10,
    fontSize: '1rem',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      height: 28,
    }),
    Style.when(When.pseudo(':is([data-size="lg"])'), {
      height: 36,
    }),
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([aria-invalid="true"])'), {
      borderColor: 'var(--destructive)',
    }),
    Style.when(When.media('(min-width: 48rem)'), {
      fontSize: '0.875rem',
    }),
  ),
  clear: Style.make({
    display: 'grid',
    width: 32,
    height: 32,
    placeItems: 'center',
    flexShrink: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
  ),
  description: Style.make({
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  segment: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    height: 32,
    minWidth: 0,
    paddingInline: 8,
    fontSize: '0.875rem',
    outline: 'none',
  }).pipe(
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
}

export const dateTimeInput = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 8,
    fontSize: '0.875rem',
  }),
  label: Style.make({
    fontWeight: 500,
  }),
  row: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 8,
  }).pipe(
    Style.when(When.media('(min-width: 40rem)'), {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    }),
  ),
  description: Style.make({
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
}

export const datePicker = {
  root: Style.make({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    width: 'fit-content',
    maxWidth: '100%',
  }),
  trigger: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'start',
    minHeight: 36,
    minWidth: 128,
    paddingInline: 12,
    textAlign: 'start',
    fontSize: '0.875rem',
    outline: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([aria-invalid="true"])'), {
      borderColor: 'var(--destructive)',
    }),
  ),
  panel: Style.make({
    display: 'grid',
    justifyItems: 'start',
    maxHeight: 'var(--available-height)',
    maxWidth: 'var(--available-width)',
    overflow: 'auto',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    boxShadow: '0 8px 24px rgb(0 0 0 / 12%)',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
  clear: Style.make({
    display: 'grid',
    width: 32,
    height: 32,
    placeItems: 'center',
    flexShrink: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
  ),
  query: Style.make({
    display: 'grid',
    gap: 4,
    width: '100%',
    paddingInline: 12,
    paddingBlock: 8,
    fontSize: '0.875rem',
  }),
  queryInput: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    width: '100%',
    height: 32,
    minWidth: 0,
    paddingInline: 10,
    fontSize: '1rem',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      height: 28,
    }),
    Style.when(When.pseudo(':is([data-size="lg"])'), {
      height: 36,
    }),
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([aria-invalid="true"])'), {
      borderColor: 'var(--destructive)',
    }),
    Style.when(When.media('(min-width: 48rem)'), {
      fontSize: '0.875rem',
    }),
  ),
  queryError: Style.make({
    fontSize: '0.75rem',
    color: 'var(--destructive)',
  }),
}

export const dateRangeInput = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 6,
    fontSize: '0.875rem',
  }),
  label: Style.make({
    fontWeight: 500,
  }),
  description: Style.make({
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  row: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
  }),
  trigger: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'start',
    minHeight: 36,
    minWidth: 0,
    paddingInline: 12,
    textAlign: 'start',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([aria-invalid="true"])'), {
      borderColor: 'var(--destructive)',
    }),
  ),
  panel: Style.make({
    display: 'grid',
    justifyItems: 'start',
    maxHeight: 'var(--available-height)',
    maxWidth: 'var(--available-width)',
    overflow: 'auto',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    boxShadow: '0 8px 24px rgb(0 0 0 / 12%)',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
  clear: Style.make({
    display: 'grid',
    width: 32,
    height: 32,
    placeItems: 'center',
    flexShrink: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
  ),
  presets: Style.make({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    padding: 8,
  }),
  preset: Style.make({
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: 'transparent',
    paddingInline: 8,
    paddingBlock: 4,
    fontSize: '0.875rem',
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
    }),
  ),
}

export const icon = {
  root: Style.make({
    display: 'inline-block',
    flexShrink: 0,
    verticalAlign: 'middle',
  }).pipe(
    Style.when(When.pseudo(':is([data-rotation])'), {
      transition: 'transform 150ms',
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transition: 'none',
    }),
  ),
}

export const fieldStatus = {
  root: Style.make({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 4,
    paddingInline: 8,
    paddingBlockEnd: 8,
    fontSize: '0.75rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-variant="attached"])'), {
      pointerEvents: 'none',
      marginBlockStart: -6,
      borderBottomLeftRadius: 'var(--radius)',
      borderBottomRightRadius: 'var(--radius)',
      paddingBlockStart: 14,
    }),
    Style.when(When.pseudo(':is([data-variant="detached"])'), {
      marginBlockStart: 4,
      borderRadius: 'var(--radius)',
      paddingBlockStart: 8,
    }),
    Style.when(When.pseudo(':is([data-type="warning"])'), {
      color: 'var(--warning)',
      backgroundColor: 'color-mix(in oklab, var(--warning) 20%, transparent)',
    }),
    Style.when(When.pseudo(':is([data-type="error"])'), {
      color: 'var(--destructive)',
      backgroundColor:
        'color-mix(in oklab, var(--destructive) 20%, transparent)',
    }),
    Style.when(When.pseudo(':is([data-type="success"])'), {
      color: 'var(--success)',
      backgroundColor: 'color-mix(in oklab, var(--success) 20%, transparent)',
    }),
  ),
  icon: Style.make({
    display: 'inline-flex',
    height: 16,
    flexShrink: 0,
    alignItems: 'center',
  }),
}

export const indicator = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    display: 'inline-grid',
    width: 16,
    height: 16,
    flexShrink: 0,
    placeItems: 'center',
    borderRadius: 4,
    color: 'var(--primary)',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      width: 14,
      height: 14,
    }),
    Style.when(When.pseudo(':is([data-kind="radio"])'), {
      borderRadius: '50%',
    }),
    Style.when(When.pseudo(':is([data-kind="check"])'), {
      borderColor: 'transparent',
    }),
    Style.when(
      When.pseudo(
        ':is([data-kind=checkbox][data-checked=checked],[data-kind=checkbox][data-checked=indeterminate],[data-kind=radio][data-checked=checked])',
      ),
      {
        borderColor: 'var(--primary)',
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
      },
    ),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  dot: Style.make({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      width: 6,
      height: 6,
    }),
  ),
}

export const inputGroup = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    display: 'grid',
    minWidth: 0,
    backgroundColor: 'var(--background)',
    borderRadius: 'calc(var(--radius) - 2px)',
    boxShadow: '0 1px 2px rgb(0 0 0 / 5%)',
  }).pipe(
    Style.when(When.pseudo(':focus-within'), {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.pseudo(':has([aria-invalid=true])'), {
      borderColor: 'var(--destructive)',
    }),
    Style.when(When.pseudo(':is([data-radius="xl"])'), {
      borderRadius: 16,
    }),
    Style.when(When.pseudo(':is([data-radius="full"])'), {
      borderRadius: 999,
    }),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([data-invalid])'), {
      borderColor: 'var(--destructive)',
    }),
  ),
  row: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  }),
  addon: Style.make({
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    paddingBlock: 6,
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    fontWeight: 500,
    userSelect: 'none',
  }),
  control: Style.make({
    minHeight: 32,
    minWidth: 0,
    flexGrow: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingInline: 10,
    paddingBlock: 4,
    fontSize: '1rem',
    outline: 'none',
  }).pipe(
    Style.when(When.media('(min-width: 768px)'), {
      fontSize: '0.875rem',
    }),
  ),
  text: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  button: Style.make({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 8,
    fontSize: '0.875rem',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderWidth: 0,
    backgroundColor: 'transparent',
  }).pipe(
    Style.when(When.pseudo(':is([data-size="xs"])'), {
      height: 24,
    }),
    Style.when(When.pseudo(':is([data-size="sm"])'), {
      height: 32,
    }),
    Style.when(When.pseudo(':is([data-size="icon-xs"])'), {
      width: 24,
      height: 24,
    }),
    Style.when(When.pseudo(':is([data-size="icon-sm"])'), {
      width: 32,
      height: 32,
    }),
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
  ),
}

export const buttonGroup = {
  root: Style.make({
    display: 'flex',
    width: 'fit-content',
    minWidth: 0,
    alignItems: 'stretch',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation="vertical"])'), {
      flexDirection: 'column',
    }),
    Style.when(When.pseudo(':has(>[data-slot=button-group])'), {
      gap: 8,
    }),
  ),
  separator: Style.make({
    position: 'relative',
    flexShrink: 0,
    alignSelf: 'stretch',
    backgroundColor: 'var(--input)',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation="horizontal"])'), {
      height: 1,
    }),
    Style.when(When.pseudo(':is([data-orientation="vertical"])'), {
      width: 1,
    }),
  ),
  text: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--muted)',
    paddingInline: 16,
    fontSize: '0.875rem',
    fontWeight: 500,
  }),
}

export const link = {
  root: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    font: 'inherit',
    color: 'inherit',
    textDecoration: 'none',
    textAlign: 'start',
  }).pipe(
    Style.when(When.pseudo(':is([data-underline])'), {
      textDecoration: 'underline',
    }),
    Style.when(When.hover, {
      textDecoration: 'underline',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      pointerEvents: 'none',
      opacity: 0.5,
    }),
  ),
  newTabLabel: Style.make({
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  }),
}

export const pagination = {
  root: Style.make({
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
  }),
  content: Style.make({
    display: 'flex',
    flexWrap: 'wrap',
    margin: 0,
    listStyle: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 0,
  }),
  link: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    display: 'inline-flex',
    minHeight: 36,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'transparent',
    paddingInline: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
    textDecoration: 'none',
    color: 'var(--foreground)',
    outline: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([aria-current=page])'), {
      borderColor: 'var(--input)',
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      pointerEvents: 'none',
      opacity: 0.5,
    }),
  ),
  ellipsis: Style.make({
    display: 'inline-grid',
    minHeight: 36,
    minWidth: 36,
    placeItems: 'center',
  }),
}

export const thumbnail = {
  root: Style.make({
    position: 'relative',
    isolation: 'isolate',
    display: 'inline-flex',
    width: 64,
    flexShrink: 0,
    flexDirection: 'column',
  }).pipe(
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  media: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    position: 'relative',
    aspectRatio: '1',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--muted)',
  }).pipe(
    Style.when(When.pseudo(':is([data-loading])'), {
      backgroundColor: 'var(--accent)',
    }),
  ),
  img: Style.make({
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),
  open: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
    textAlign: 'start',
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: -2,
    }),
  ),
  remove: Style.make({
    borderWidth: 0,
    backgroundColor: 'rgb(0 0 0 / 40%)',
    padding: 0,
    cursor: 'pointer',
    position: 'absolute',
    insetInlineEnd: 4,
    insetBlockStart: 4,
    zIndex: 1,
    display: 'inline-grid',
    width: 20,
    height: 20,
    placeItems: 'center',
    borderRadius: 4,
    color: 'white',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'rgb(0 0 0 / 60%)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  overlay: Style.make({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 'inherit',
    backgroundColor: 'rgb(0 0 0 / 40%)',
    color: 'white',
  }),
  placeholder: Style.make({
    display: 'grid',
    width: '100%',
    height: '100%',
    placeItems: 'center',
    color: 'var(--muted-foreground)',
  }),
  spinner: Style.make({
    display: 'inline-flex',
  }),
}

export const hoverCard = {
  root: Style.make({
    display: 'inline-flex',
    position: 'relative',
  }),
  panel: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    width: 256,
    maxWidth: 'min(var(--available-width), calc(100vw - 2rem))',
    maxHeight: 'var(--available-height)',
    overflow: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
    padding: 16,
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    fontSize: '0.875rem',
    boxShadow: '0 8px 24px rgb(0 0 0 / 14%)',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
}

export const infoTip = {
  root: Style.make({
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    verticalAlign: 'middle',
  }),
  trigger: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 2,
    cursor: 'pointer',
    display: 'inline-grid',
    placeItems: 'center',
    borderRadius: '50%',
    color: 'var(--muted-foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-size=xsm])'), {
      fontSize: 12,
    }),
    Style.when(When.pseudo(':is([data-size=sm])'), {
      fontSize: 14,
    }),
    Style.when(When.pseudo(':is([data-size=md])'), {
      fontSize: 16,
    }),
    Style.when(When.pseudo(':is([data-size=lg])'), {
      fontSize: 18,
    }),
    Style.when(When.hover, {
      color: 'var(--foreground)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  panel: Style.make({
    position: 'relative',
    maxWidth: 'min(18rem, calc(100vw - 1rem))',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    paddingInline: 12,
    paddingBlock: 6,
    fontSize: '0.75rem',
    textWrap: 'balance',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
  arrow: Style.make({
    width: 8,
    height: 8,
    transform: 'rotate(45deg)',
    borderRadius: 2,
    backgroundColor: 'var(--primary)',
  }).pipe(
    Style.when(When.pseudo(':is([data-side=top])'), {
      bottom: -4,
    }),
    Style.when(When.pseudo(':is([data-side=bottom])'), {
      top: -4,
    }),
    Style.when(When.pseudo(':is([data-side=left])'), {
      right: -4,
    }),
    Style.when(When.pseudo(':is([data-side=right])'), {
      left: -4,
    }),
  ),
}

export const item = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    boxSizing: 'border-box',
    borderRadius: 'calc(var(--radius) - 2px)',
    fontSize: '0.875rem',
    textDecoration: 'none',
    color: 'var(--foreground)',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-variant=outline])'), {
      borderColor: 'var(--border)',
    }),
    Style.when(When.pseudo(':is([data-variant=muted])'), {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.pseudo(':is([data-size=default])'), {
      padding: 12,
      gap: 12,
    }),
    Style.when(When.pseudo(':is([data-size=sm])'), {
      paddingInline: 12,
      paddingBlock: 10,
      gap: 10,
    }),
    Style.when(When.pseudo(':is([data-size=xs])'), {
      paddingInline: 10,
      paddingBlock: 8,
      gap: 8,
    }),
    Style.when(When.pseudo(':is([data-element=a]:hover)'), {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  media: Style.make({
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-variant=icon])'), {
      width: 32,
      height: 32,
      borderRadius: 4,
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.pseudo(':is([data-variant=image])'), {
      width: 40,
      height: 40,
      overflow: 'hidden',
      borderRadius: 4,
    }),
  ),
  content: Style.make({
    display: 'flex',
    flexGrow: 1,
    minWidth: 0,
    flexDirection: 'column',
    gap: 4,
  }),
  title: Style.make({
    display: 'flex',
    width: 'fit-content',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.875rem',
    lineHeight: 1.35,
    fontWeight: 500,
  }),
  description: Style.make({
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textWrap: 'balance',
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  actions: Style.make({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }),
  header: Style.make({
    display: 'flex',
    flexBasis: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  }),
  footer: Style.make({
    display: 'flex',
    flexBasis: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  }),
  group: Style.make({
    display: 'flex',
    flexDirection: 'column',
  }),
  listItem: Style.make({
    display: 'contents',
  }),
  separator: Style.make({
    height: 1,
    width: '100%',
    flexShrink: 0,
    backgroundColor: 'var(--border)',
  }),
}

export const list = {
  root: Style.make({
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
  }),
  header: Style.make({
    marginBlockEnd: 8,
  }),
  list: Style.make({
    margin: 0,
  }),
  item: Style.make({
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 8,
  }).pipe(
    Style.when(When.pseudo(':is([aria-current=true])'), {
      backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([data-dividers])'), {
      borderBottom: '1px solid var(--border)',
      borderRadius: 0,
    }),
    Style.when(When.pseudo(':is([data-dividers]:last-child)'), {
      borderBottomWidth: 0,
    }),
    Style.when(When.pseudo(':is([data-density=compact])'), {
      paddingBlock: 4,
    }),
    Style.when(When.pseudo(':is([data-density=balanced])'), {
      paddingBlock: 8,
    }),
    Style.when(When.pseudo(':is([data-density=spacious])'), {
      paddingBlock: 12,
      paddingInline: 12,
    }),
    Style.when(When.pseudo(':is([data-edge-compensation=inline])'), {
      marginInlineStart:
        'calc(-1 * min(0.5rem, var(--container-padding-inline-start, 0px)))',
      marginInlineEnd:
        'calc(-1 * min(0.5rem, var(--container-padding-inline-end, 0px)))',
    }),
  ),
  row: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 8,
  }),
  control: Style.make({
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: 'inherit',
    display: 'flex',
    minWidth: 0,
    flexGrow: 1,
    flexDirection: 'column',
    borderRadius: 4,
    padding: 0,
    textAlign: 'start',
    fontSize: '0.875rem',
    textDecoration: 'none',
    outline: 'none',
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  description: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
  side: Style.make({
    display: 'inline-flex',
    flexShrink: 0,
  }),
}

export const marker = {
  root: Style.make({
    display: 'flex',
    minHeight: 16,
    width: '100%',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    textAlign: 'start',
  }).pipe(
    Style.when(When.pseudo(':is([data-variant=border])'), {
      borderBottom: '1px solid var(--border)',
      paddingBlockEnd: 8,
    }),
  ),
  icon: Style.make({
    width: 16,
    height: 16,
    flexShrink: 0,
  }),
  content: Style.make({
    display: 'inline-flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 8,
    overflowWrap: 'break-word',
  }).pipe(
    Style.when(When.pseudo(':is([data-variant=separator])'), {
      textAlign: 'center',
    }),
    Style.when(When.pseudo(':is([data-shimmer])'), {
      animationName: progressPulse,
      animationDuration: '2s',
      animationIterationCount: 'infinite',
    }),
    Style.when(reducedMotion, { animationName: 'none' }),
  ),
  line: Style.make({
    height: 1,
    minWidth: 0,
    flexGrow: 1,
    backgroundColor: 'var(--border)',
  }),
}

export const metadataList = {
  root: Style.make({
    display: 'flex',
    flexDirection: 'column',
  }),
  title: Style.make({
    marginBlockEnd: 12,
  }),
  list: Style.make({
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr)',
    margin: 0,
    padding: 0,
    alignItems: 'baseline',
    columnGap: 16,
    rowGap: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-layout=horizontal])'), {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 16,
    }),
    Style.when(When.pseudo(':is([data-layout=grid-multi])'), {
      gridTemplateColumns: 'repeat(auto-fill,minmax(min(17.5rem,100%),1fr))',
    }),
  ),
  item: Style.make({
    display: 'contents',
  }).pipe(
    Style.when(When.pseudo(':is([data-stacked])'), {
      display: 'flex',
      minWidth: 0,
      flexDirection: 'column',
      gap: 2,
    }),
  ),
  term: Style.make({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: 0,
    fontWeight: 500,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  definition: Style.make({
    margin: 0,
    minWidth: 0,
    overflowWrap: 'break-word',
    fontSize: '0.875rem',
  }),
  icon: Style.make({
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
  }),
  toggle: Style.make({
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: 'var(--primary)',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    paddingInline: 0,
    paddingBlock: 8,
    textAlign: 'start',
    fontSize: '0.875rem',
    fontWeight: 500,
    borderRadius: 4,
  }).pipe(
    Style.when(When.hover, {
      textDecoration: 'underline',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
}

export const fileInput = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 6,
    fontSize: '0.875rem',
  }),
  label: Style.make({
    fontWeight: 500,
  }),
  hiddenLabel: Style.make({
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  }),
  description: Style.make({
    color: 'var(--muted-foreground)',
  }),
  zone: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'flex',
    minWidth: 0,
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    padding: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-mode=dropzone])'), {
      minHeight: 96,
      justifyContent: 'center',
      borderStyle: 'dashed',
      padding: 16,
    }),
    Style.when(When.pseudo(':is([data-drag-over])'), {
      borderColor: 'var(--primary)',
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  trigger: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'inline-flex',
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    paddingInline: 12,
    fontWeight: 500,
    outline: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  hint: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
  names: Style.make({
    minWidth: 0,
    overflowWrap: 'break-word',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
  status: Style.make({
    fontSize: '0.75rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-type=error])'), {
      color: 'var(--destructive)',
    }),
    Style.when(When.pseudo(':is([data-type=warning])'), {
      color: 'var(--warning)',
    }),
    Style.when(When.pseudo(':is([data-type=success])'), {
      color: 'var(--success)',
    }),
  ),
}

export const toast = {
  viewport: Style.make({}),
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    fontSize: '0.875rem',
    boxShadow: '0 4px 12px rgb(0 0 0 / 12%)',
    outline: 'none',
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  content: Style.make({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
  }),
  text: Style.make({
    minWidth: 0,
    flexGrow: 1,
  }),
  title: Style.make({
    display: 'block',
    fontWeight: 500,
  }),
  description: Style.make({
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }),
  icon: Style.make({
    marginBlockStart: 2,
    flexShrink: 0,
    color: 'var(--primary)',
  }).pipe(
    Style.when(When.pseudo(':is([data-type=error])'), {
      color: 'var(--destructive)',
    }),
    Style.when(When.pseudo(':is([data-type=warning])'), {
      color: 'var(--warning)',
    }),
    Style.when(When.pseudo(':is([data-type=success])'), {
      color: 'var(--success)',
    }),
  ),
  button: Style.make({
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: 'inherit',
    display: 'inline-flex',
    minHeight: 24,
    flexShrink: 0,
    alignItems: 'center',
    paddingInline: 4,
    fontSize: '0.75rem',
    borderRadius: 4,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
}

export const actionBar = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    position: 'fixed',
    zIndex: 50,
    display: 'flex',
    maxWidth: 'calc(100vw - 2rem)',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
    paddingBlock: 6,
    paddingInline: 8,
    fontSize: '0.875rem',
    boxShadow: '0 8px 16px rgb(0 0 0 / 14%)',
    outline: 'none',
  }),
  selection: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    paddingInline: 8,
    paddingBlock: 4,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  }),
  group: Style.make({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    outline: 'none',
  }),
  item: Style.make({
    borderWidth: 0,
    backgroundColor: 'var(--secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--secondary-foreground)',
    minHeight: 32,
    paddingInline: 8,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([data-variant=destructive])'), {
      color: 'var(--destructive)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  close: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    display: 'inline-grid',
    alignItems: 'center',
    fontSize: '0.875rem',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--muted-foreground)',
    width: 32,
    height: 32,
    placeItems: 'center',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  separator: Style.make({
    height: 24,
    width: 1,
    backgroundColor: 'var(--border)',
  }),
}

export const menubar = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'flex',
    width: 'fit-content',
    alignItems: 'center',
    gap: 2,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    padding: 4,
    fontSize: '0.875rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      flexDirection: 'column',
      alignItems: 'stretch',
    }),
  ),
  trigger: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--foreground)',
    gap: 8,
    paddingInline: 8,
    paddingBlock: 4,
    fontWeight: 500,
    userSelect: 'none',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-popup-open])'), {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      opacity: 0.5,
    }),
  ),
}

export const navigationMenu = {
  root: Style.make({
    position: 'relative',
    minWidth: 0,
    maxWidth: '100%',
  }).pipe(
    Style.when(When.pseudo(':is([data-layout=scroll])'), {
      overflowX: 'auto',
    }),
    Style.when(When.media('(max-width: 767px)'), {
      overflowX: 'auto',
    }),
  ),
  list: Style.make({
    margin: 0,
    display: 'flex',
    listStyle: 'none',
    alignItems: 'center',
    gap: 4,
    padding: 0,
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      flexDirection: 'column',
      alignItems: 'stretch',
    }),
    Style.when(When.pseudo(':is([data-layout=scroll])'), {
      width: 'max-content',
    }),
    Style.when(When.pseudo(':is([data-layout=responsive])'), {
      flexWrap: 'wrap',
    }),
  ),
  item: Style.make({
    flexShrink: 0,
  }),
  link: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--foreground)',
    gap: 4,
    paddingInline: 12,
    paddingBlock: 8,
    textAlign: 'start',
    fontWeight: 500,
    textDecoration: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([data-active])'), {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.pseudo(':is([data-open])'), {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      opacity: 0.5,
    }),
  ),
  panel: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'grid',
    minWidth: 144,
    gap: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    padding: 8,
    boxShadow: '0 4px 12px rgb(0 0 0 / 12%)',
  }).pipe(
    Style.when(When.pseudo(':is([hidden])'), {
      display: 'none',
    }),
  ),
}

export const topNav = {
  root: Style.make({
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)',
    position: 'relative',
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: 8,
    padding: 8,
    color: 'var(--foreground)',
  }).pipe(
    Style.when(When.media('(max-width: 639px)'), {
      display: 'flex',
      flexWrap: 'wrap',
    }),
  ),
  start: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 16,
  }).pipe(
    Style.when(When.media('(max-width: 639px)'), {
      display: 'contents',
    }),
  ),
  center: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }).pipe(
    Style.when(When.media('(max-width: 639px)'), {
      order: 2,
      width: '100%',
      flexWrap: 'wrap',
    }),
  ),
  end: Style.make({
    display: 'flex',
    marginInlineStart: 'auto',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  }),
  brand: Style.make({
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: 8,
  }),
  headings: Style.make({
    display: 'grid',
    minWidth: 0,
    textAlign: 'start',
  }),
  heading: Style.make({
    fontSize: '1rem',
    lineHeight: 1.2,
    fontWeight: 600,
    color: 'var(--foreground)',
    textDecoration: 'none',
  }).pipe(
    Style.when(When.hover, {
      textDecoration: 'underline',
    }),
  ),
  subtitle: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    textDecoration: 'none',
  }),
  list: Style.make({
    margin: 0,
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    alignItems: 'center',
    gap: 4,
    padding: 0,
  }).pipe(
    Style.when(When.media('(max-width: 639px)'), {
      order: 1,
    }),
  ),
  link: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--muted-foreground)',
    minHeight: 32,
    gap: 4,
    paddingInline: 12,
    textAlign: 'start',
    fontWeight: 500,
    textDecoration: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
      color: 'var(--foreground)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([data-active])'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--foreground)',
    }),
    Style.when(When.pseudo(':is([aria-expanded=true])'), {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      opacity: 0.5,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  mega: Style.make({
    display: 'grid',
    minWidth: 'min(21rem, calc(100vw - 4rem))',
    gap: 12,
  }),
  megaItem: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '0.875rem',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--foreground)',
    gap: 8,
    padding: 8,
    textAlign: 'start',
    textDecoration: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      opacity: 0.5,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  megaText: Style.make({
    display: 'grid',
    gap: 2,
  }),
  featured: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--muted)',
    padding: 12,
    fontSize: '0.875rem',
  }),
  image: Style.make({
    aspectRatio: '16/9',
    width: '100%',
    borderRadius: 4,
    objectFit: 'cover',
  }),
}

export const message = {
  root: Style.make({
    display: 'flex',
    position: 'relative',
    width: '100%',
    minWidth: 0,
    gap: 8,
    fontSize: '0.875rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-align=end])'), {
      flexDirection: 'row-reverse',
    }),
  ),
  group: Style.make({
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    gap: 8,
  }),
  avatar: Style.make({
    display: 'flex',
    width: 'fit-content',
    minWidth: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'var(--muted)',
  }),
  content: Style.make({
    display: 'flex',
    width: '100%',
    minWidth: 0,
    flexDirection: 'column',
    gap: 10,
    overflowWrap: 'break-word',
  }).pipe(
    Style.when(When.pseudo(':is([data-align=end])'), {
      alignItems: 'flex-end',
    }),
  ),
  header: Style.make({
    display: 'flex',
    maxWidth: '100%',
    minWidth: 0,
    alignItems: 'center',
    paddingInline: 12,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  }),
  author: Style.make({
    display: 'flex',
    maxWidth: '100%',
    minWidth: 0,
    alignItems: 'center',
    paddingInline: 12,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  }),
  footer: Style.make({
    display: 'flex',
    maxWidth: '100%',
    minWidth: 0,
    alignItems: 'center',
    paddingInline: 12,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-align=end])'), {
      justifyContent: 'flex-end',
    }),
  ),
  metadata: Style.make({
    display: 'flex',
    maxWidth: '100%',
    minWidth: 0,
    alignItems: 'center',
    paddingInline: 12,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  }),
  actions: Style.make({
    display: 'flex',
    maxWidth: '100%',
    minWidth: 0,
    alignItems: 'center',
    paddingInline: 12,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--foreground)',
    gap: 8,
  }),
}

export const chatReasoning = {
  root: Style.make({
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    marginBlockStart: 8,
  }),
  trigger: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 4,
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    display: 'flex',
    minHeight: 24,
    minWidth: 0,
    alignItems: 'center',
    gap: 6,
    paddingBlock: 2,
    paddingInline: 4,
    textAlign: 'start',
    fontSize: '0.75rem',
    outline: 'none',
    userSelect: 'none',
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  label: Style.make({
    flexShrink: 0,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    animationDuration: '2s',
    animationIterationCount: 'infinite',
  }).pipe(
    Style.when(When.pseudo(':is([data-streaming])'), {
      animationName: progressPulse,
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      animationName: 'none',
    }),
  ),
  duration: Style.make({
    flexShrink: 0,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  }),
  preview: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  panel: Style.make({
    marginBlockStart: 6,
    borderInlineStart: '2px solid var(--border)',
    paddingInlineStart: 12,
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([hidden])'), {
      display: 'none',
    }),
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
}

export const messageScroller = {
  root: Style.make({
    position: 'relative',
    display: 'flex',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    flexDirection: 'column',
    overflow: 'hidden',
  }),
  scrollArea: Style.make({
    minHeight: 0,
    flexGrow: 1,
    flexBasis: 0,
  }),
  viewport: Style.make({
    height: '100%',
    minWidth: 0,
    overscrollBehavior: 'contain',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-pending])'), {
      visibility: 'hidden',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: -2,
    }),
  ),
  content: Style.make({
    display: 'flex',
    minHeight: '100%',
    minWidth: 0,
    flexDirection: 'column',
    gap: 16,
  }),
  button: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    paddingInline: 8,
    paddingBlock: 4,
    fontSize: '0.75rem',
    boxShadow: '0 1px 3px rgb(0 0 0 / 11%)',
  }).pipe(
    Style.when(When.pseudo(':is([data-scroll-edge=start])'), {
      top: 8,
    }),
    Style.when(When.pseudo(':is([data-scroll-edge=end])'), {
      bottom: 8,
    }),
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
}

export const logStream = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-variant=terminal])'), {
      borderColor: '#292929',
      backgroundColor: '#101010',
      color: '#ededed',
    }),
  ),
  row: Style.make({
    display: 'grid',
    width: '100%',
    minWidth: 0,
    alignItems: 'baseline',
    gap: 8,
    borderWidth: 0,
    borderBottom:
      '1px solid color-mix(in oklab, currentColor 10%, transparent)',
    backgroundColor: 'transparent',
    paddingInline: 8,
    paddingBlock: 4,
    textAlign: 'start',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.75rem',
    color: 'inherit',
  }),
  expander: Style.make({
    cursor: 'pointer',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'color-mix(in oklab, currentColor 5%, transparent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: -2,
    }),
  ),
  timestamp: Style.make({
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.7,
  }),
  level: Style.make({
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }).pipe(
    Style.when(When.pseudo(':is([data-level=warn])'), {
      color: 'var(--warning)',
    }),
    Style.when(When.pseudo(':is([data-level=error])'), {
      color: 'var(--destructive)',
    }),
    Style.when(When.pseudo(':is([data-level=debug])'), {
      opacity: 0.6,
    }),
  ),
  source: Style.make({
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    opacity: 0.7,
  }),
  message: Style.make({
    minWidth: 0,
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  }),
  details: Style.make({
    margin: 0,
    paddingInline: 8,
    paddingBlock: 4,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    opacity: 0.85,
    fontSize: '0.75rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
}

export const attachment = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    position: 'relative',
    display: 'flex',
    width: 'fit-content',
    maxWidth: '100%',
    minWidth: 0,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
    padding: 8,
    fontSize: '0.875rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-state=error])'), {
      borderColor: 'color-mix(in oklab, var(--destructive) 30%, transparent)',
    }),
    Style.when(When.pseudo(':is([data-state=idle])'), {
      borderStyle: 'dashed',
    }),
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      width: 120,
      flexDirection: 'column',
    }),
    Style.when(When.pseudo(':is([data-size=sm])'), {
      padding: 6,
      fontSize: '0.75rem',
    }),
    Style.when(When.pseudo(':is([data-size=xs])'), {
      gap: 6,
      padding: 4,
      fontSize: '0.75rem',
      borderRadius: 8,
    }),
  ),
  group: Style.make({
    display: 'flex',
    minWidth: 0,
    scrollSnapType: 'x mandatory',
    gap: 12,
    overflowX: 'auto',
    overscrollBehaviorX: 'contain',
    paddingBlock: 4,
  }),
  media: Style.make({
    position: 'relative',
    display: 'flex',
    aspectRatio: '1',
    width: 40,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: 'var(--muted)',
  }).pipe(
    Style.when(When.pseudo(':is([data-size=sm])'), {
      width: 32,
    }),
    Style.when(When.pseudo(':is([data-size=xs])'), {
      width: 28,
    }),
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      width: '100%',
    }),
    Style.when(When.pseudo(':is([data-state=error])'), {
      color: 'var(--destructive)',
    }),
    Style.when(
      When.pseudo(':is([data-variant=image]:not([data-state=done]))'),
      {
        opacity: 0.6,
      },
    ),
  ),
  content: Style.make({
    minWidth: 0,
    maxWidth: '100%',
    flexGrow: 1,
    lineHeight: 1.25,
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      width: '100%',
      paddingInline: 4,
    }),
  ),
  actions: Style.make({
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      position: 'absolute',
      insetInlineEnd: 12,
      insetBlockStart: 12,
      gap: 4,
    }),
  ),
  action: Style.make({
    borderWidth: 0,
    backgroundColor: 'var(--background)',
    borderRadius: 4,
    color: 'var(--foreground)',
    cursor: 'pointer',
    display: 'grid',
    width: 24,
    height: 24,
    placeItems: 'center',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  title: Style.make({
    display: 'block',
    minWidth: 0,
    maxWidth: '100%',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  description: Style.make({
    display: 'block',
    marginBlockStart: 2,
    minWidth: 0,
    maxWidth: '100%',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }).pipe(
    Style.when(When.pseudo(':is([data-state=error])'), {
      color: 'var(--destructive)',
    }),
  ),
  trigger: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'inherit',
    color: 'var(--foreground)',
    cursor: 'pointer',
    position: 'absolute',
    inset: 0,
    zIndex: 10,
    outline: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'color-mix(in oklab, var(--foreground) 5%, transparent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
}

export const selectableCard = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    position: 'relative',
    isolation: 'isolate',
    minWidth: 0,
    borderRadius: 12,
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  control: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'inherit',
    color: 'var(--foreground)',
    cursor: 'pointer',
    position: 'absolute',
    inset: 0,
    zIndex: 10,
    outline: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'color-mix(in oklab, var(--foreground) 5%, transparent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.disabled, {
      cursor: 'default',
    }),
  ),
  content: Style.make({
    position: 'relative',
    minWidth: 0,
  }),
}

export const timestamp = {
  root: Style.make({
    display: 'inline-flex',
    flexShrink: 0,
  }),
  trigger: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 4,
    color: 'var(--foreground)',
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
  }).pipe(
    Style.when(When.hover, {
      textDecoration: 'underline',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  rows: Style.make({
    display: 'grid',
    gap: 4,
  }),
  row: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: '0.75rem',
  }),
  value: Style.make({
    minWidth: 0,
    overflowWrap: 'break-word',
  }),
  label: Style.make({
    display: 'block',
    fontWeight: 600,
  }),
  copy: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 4,
    color: 'var(--foreground)',
    cursor: 'pointer',
    display: 'inline-grid',
    width: 28,
    height: 28,
    flexShrink: 0,
    placeItems: 'center',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  feedback: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
}

export const banner = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'grid',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
    fontSize: '0.875rem',
  }).pipe(
    Style.when(When.pseudo(':is([data-container=section])'), {
      borderRadius: 0,
      borderInlineWidth: 0,
    }),
    Style.when(When.pseudo(':is([data-elevation=low])'), {
      boxShadow: '0 1px 2px rgb(0 0 0 / 8%)',
    }),
    Style.when(When.pseudo(':is([data-elevation=med])'), {
      boxShadow: '0 3px 8px rgb(0 0 0 / 10%)',
    }),
    Style.when(When.pseudo(':is([data-elevation=high])'), {
      boxShadow: '0 8px 16px rgb(0 0 0 / 14%)',
    }),
  ),
  header: Style.make({
    display: 'flex',
    minWidth: 0,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
  }).pipe(
    Style.when(When.pseudo(':is([data-status=info])'), {
      backgroundColor: 'color-mix(in oklab, var(--primary) 20%, transparent)',
    }),
    Style.when(When.pseudo(':is([data-status=warning])'), {
      backgroundColor: 'color-mix(in oklab, var(--warning) 20%, transparent)',
    }),
    Style.when(When.pseudo(':is([data-status=error])'), {
      backgroundColor:
        'color-mix(in oklab, var(--destructive) 20%, transparent)',
    }),
    Style.when(When.pseudo(':is([data-status=success])'), {
      backgroundColor: 'color-mix(in oklab, var(--success) 20%, transparent)',
    }),
  ),
  icon: Style.make({
    marginBlockStart: 2,
    flexShrink: 0,
  }).pipe(
    Style.when(When.pseudo(':is([data-status=info])'), {
      color: 'var(--primary)',
    }),
    Style.when(When.pseudo(':is([data-status=warning])'), {
      color: 'var(--warning)',
    }),
    Style.when(When.pseudo(':is([data-status=error])'), {
      color: 'var(--destructive)',
    }),
    Style.when(When.pseudo(':is([data-status=success])'), {
      color: 'var(--success)',
    }),
  ),
  body: Style.make({
    display: 'grid',
    minWidth: 136,
    flexGrow: 1,
    gap: 2,
  }),
  title: Style.make({
    fontWeight: 600,
  }),
  description: Style.make({
    color: 'var(--muted-foreground)',
  }),
  end: Style.make({
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: 4,
  }),
  action: Style.make({
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 4,
    color: 'var(--foreground)',
    cursor: 'pointer',
    display: 'inline-grid',
    width: 28,
    height: 28,
    placeItems: 'center',
    outline: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor:
        'color-mix(in oklab, var(--foreground) 10%, transparent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  panel: Style.make({
    minWidth: 0,
    padding: 12,
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
}

export const carousel = {
  root: Style.make({
    position: 'relative',
    minHeight: 0,
    minWidth: 0,
  }),
  viewport: Style.make({
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 'inherit',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      height: '100%',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: -2,
    }),
  ),
  rail: Style.make({
    display: 'flex',
    minHeight: 0,
    touchAction: 'pan-y',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      height: '100%',
      flexDirection: 'column',
      touchAction: 'pan-x',
    }),
  ),
  slide: Style.make({
    boxSizing: 'border-box',
    minHeight: 0,
    minWidth: 0,
    flexShrink: 0,
    flexGrow: 0,
    paddingInlineStart: 16,
  }).pipe(
    Style.when(When.pseudo(':first-child'), {
      paddingInlineStart: 0,
    }),
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      paddingInlineStart: 0,
      paddingBlockStart: 16,
    }),
    Style.when(When.pseudo(':is([data-orientation=vertical]:first-child)'), {
      paddingBlockStart: 0,
    }),
  ),
  controls: Style.make({
    display: 'flex',
    marginBlockStart: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  }),
  button: Style.make({
    display: 'inline-grid',
    height: 32,
    width: 32,
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--foreground)',
    backgroundColor: 'var(--background)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
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
  status: Style.make({
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  }),
}

export const resizable = {
  root: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'grid',
    height: '100%',
    minHeight: 0,
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
  }).pipe(
    Style.when(When.pseudo(':is([data-dragging])'), {
      userSelect: 'none',
    }),
  ),
  panel: Style.make({
    minHeight: 0,
    minWidth: 0,
    overflow: 'auto',
    overscrollBehavior: 'contain',
  }),
  handle: Style.make({
    display: 'grid',
    position: 'relative',
    minHeight: 0,
    minWidth: 0,
    placeItems: 'center',
    touchAction: 'none',
    backgroundColor: 'var(--border)',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-direction=horizontal])'), {
      cursor: 'col-resize',
    }),
    Style.when(When.pseudo(':is([data-direction=vertical])'), {
      cursor: 'row-resize',
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      cursor: 'default',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  grip: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'grid',
    zIndex: 1,
    width: 12,
    height: 20,
    placeItems: 'center',
    borderRadius: 4,
    backgroundColor: 'var(--background)',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-direction=vertical])'), {
      width: 20,
      height: 12,
    }),
  ),
}

export const stepper = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 8,
  }),
  list: Style.make({
    display: 'flex',
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    gap: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      flexDirection: 'column',
    }),
  ),
  item: Style.make({
    display: 'flex',
    minWidth: 0,
    flex: '1 1 0%',
    flexDirection: 'column',
    gap: 4,
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      flexDirection: 'row',
    }),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  track: Style.make({
    position: 'relative',
    height: 4,
    width: '100%',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'var(--border)',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      height: 'auto',
      width: 4,
    }),
  ),
  onTrack: Style.make({
    position: 'relative',
    display: 'flex',
    minHeight: 16,
    minWidth: 16,
    alignItems: 'center',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      alignItems: 'stretch',
      justifyContent: 'center',
    }),
  ),
  trackMarker: Style.make({
    position: 'absolute',
    insetInlineStart: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    borderRadius: 999,
    backgroundColor: 'var(--background)',
  }).pipe(
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      insetInlineStart: '50%',
      top: 0,
      transform: 'translateX(-50%)',
    }),
  ),
  fill: Style.make({
    position: 'absolute',
    inset: 0,
    transformOrigin: 'left',
    transform: 'scaleX(0)',
    borderRadius: 'inherit',
    backgroundColor: 'var(--primary)',
    transition:
      'transform var(--step-duration, 0ms) linear var(--step-delay, 0ms)',
  }).pipe(
    Style.when(When.pseudo(':is([data-filled])'), {
      transform: 'scaleX(1)',
    }),
    Style.when(When.pseudo(':is([data-orientation=vertical])'), {
      transformOrigin: 'top',
      transform: 'scaleY(0)',
    }),
    Style.when(When.pseudo(':is([data-orientation=vertical][data-filled])'), {
      transform: 'scaleY(1)',
    }),
    Style.when(When.pseudo(':is([data-orientation=horizontal]:dir(rtl))'), {
      transformOrigin: 'right',
    }),
    Style.when(When.pseudo(':is([data-status=success])'), {
      backgroundColor: 'var(--success)',
    }),
    Style.when(When.pseudo(':is([data-status=warning])'), {
      backgroundColor: 'var(--warning)',
    }),
    Style.when(When.pseudo(':is([data-status=error])'), {
      backgroundColor: 'var(--destructive)',
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transition: 'none',
    }),
  ),
  step: Style.make({
    display: 'flex',
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 4,
    textAlign: 'start',
    fontSize: '0.875rem',
    color: 'var(--foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-density=balanced])'), {
      padding: 8,
    }),
    Style.when(When.pseudo(':is([data-density=spacious])'), {
      padding: 12,
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is(button:hover)'), {
      backgroundColor: 'var(--muted)',
    }),
  ),
  indicator: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    display: 'grid',
    height: 16,
    width: 16,
    flexShrink: 0,
    placeItems: 'center',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 600,
  }).pipe(
    Style.when(When.pseudo(':is([data-progress=completed])'), {
      borderColor: 'var(--primary)',
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    }),
    Style.when(When.pseudo(':is([data-progress=in-progress])'), {
      borderColor: 'var(--primary)',
      color: 'var(--primary)',
    }),
  ),
  text: Style.make({
    minWidth: 0,
    flexGrow: 1,
  }),
  title: Style.make({
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  description: Style.make({
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
  content: Style.make({
    minWidth: 0,
    paddingInline: 8,
    paddingBlockEnd: 8,
    fontSize: '0.875rem',
  }),
  compact: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 4,
    fontSize: '0.875rem',
  }),
  control: Style.make({
    display: 'inline-grid',
    height: 24,
    width: 24,
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--foreground)',
    backgroundColor: 'var(--background)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
}

export const colorPicker = {
  root: Style.make({
    position: 'relative',
    display: 'inline-flex',
    minWidth: 0,
  }),
  trigger: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    display: 'flex',
    minHeight: 36,
    alignItems: 'center',
    gap: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    paddingInline: 10,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--foreground)',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  triggerSwatch: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    height: 20,
    width: 20,
    flexShrink: 0,
    borderRadius: 4,
    overflow: 'hidden',
  }),
  swatch: Style.make({
    display: 'block',
    height: '100%',
    width: '100%',
  }),
  panel: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'grid',
    width: 288,
    maxWidth: 'min(var(--available-width, 100vw), calc(100vw - 2rem))',
    maxHeight: 'var(--available-height)',
    overflow: 'auto',
    gap: 12,
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    padding: 12,
    fontSize: '0.875rem',
    boxShadow: '0 8px 20px rgb(0 0 0 / 14%)',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
    Style.when(When.pseudo(':is([data-inline])'), {
      boxShadow: 'none',
    }),
  ),
  area: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    position: 'relative',
    height: 176,
    width: '100%',
    cursor: 'crosshair',
    touchAction: 'none',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    outline: 'none',
    userSelect: 'none',
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      cursor: 'default',
      opacity: 0.5,
    }),
  ),
  handle: Style.make({
    position: 'absolute',
    pointerEvents: 'none',
    width: 16,
    height: 16,
    transform: 'translate(-50%, -50%)',
    border: '2px solid white',
    borderRadius: 999,
    boxShadow: '0 1px 4px rgb(0 0 0 / 20%)',
  }),
  slider: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 4,
  }),
  sliderLabel: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
  sliderControl: Style.make({
    position: 'relative',
    display: 'flex',
    height: 20,
    alignItems: 'center',
    touchAction: 'none',
  }),
  track: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    height: 16,
    width: '100%',
    borderRadius: 999,
  }),
  thumb: Style.make({
    width: 14,
    height: 14,
    border: '1px solid rgb(0 0 0 / 25%)',
    borderRadius: 999,
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgb(0 0 0 / 20%)',
  }).pipe(
    Style.when(When.pseudo(':focus-within'), {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  inputs: Style.make({
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 8,
  }),
  input: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    minWidth: 0,
    height: 32,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    paddingInline: 8,
    fontSize: '0.75rem',
    color: 'var(--foreground)',
    outline: 'none',
    flexGrow: 1,
    fontFamily: 'var(--font-mono, monospace)',
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([aria-invalid=true])'), {
      borderColor: 'var(--destructive)',
    }),
  ),
  format: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    minWidth: 0,
    height: 32,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    paddingInline: 4,
    fontSize: '0.75rem',
    color: 'var(--foreground)',
    outline: 'none',
    fontWeight: 500,
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  sample: Style.make({
    display: 'inline-grid',
    height: 32,
    width: 32,
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--foreground)',
    backgroundColor: 'var(--background)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  presets: Style.make({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  }),
  preset: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    display: 'block',
    height: 24,
    width: 24,
    borderRadius: 4,
    overflow: 'hidden',
    padding: 0,
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([aria-pressed=true])'), {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  error: Style.make({
    fontSize: '0.75rem',
    color: 'var(--destructive)',
  }),
}

export const sidebar = {
  root: Style.make({
    display: 'flex',
    width: '100%',
    minWidth: 0,
    alignItems: 'stretch',
    gap: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-side=right])'), {
      flexDirection: 'row-reverse',
    }),
    Style.when(When.pseudo(':is([data-variant=inset])'), {
      backgroundColor: 'var(--sidebar)',
    }),
  ),
  panel: Style.make({
    display: 'flex',
    position: 'relative',
    minWidth: 0,
    flexShrink: 0,
    flexDirection: 'column',
    width: 'var(--sidebar-width)',
    backgroundColor: 'var(--sidebar)',
    color: 'var(--sidebar-foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-side=left])'), {
      borderInlineEnd: '1px solid var(--sidebar-border)',
    }),
    Style.when(When.pseudo(':is([data-side=right])'), {
      borderInlineStart: '1px solid var(--sidebar-border)',
    }),
    Style.when(When.pseudo(':is([data-icon-only])'), {
      width: 'var(--sidebar-icon-width)',
    }),
    Style.when(When.pseudo(':is([data-variant=floating])'), {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'var(--sidebar-border)',
      margin: 8,
      borderRadius: 'var(--radius)',
    }),
    Style.when(When.pseudo(':is([data-variant=inset])'), {
      margin: 8,
      borderRadius: 'var(--radius)',
    }),
    Style.when(When.pseudo(':is([data-presentation=application])'), {
      minHeight: '100svh',
    }),
  ),
  inset: Style.make({
    display: 'flex',
    position: 'relative',
    minWidth: 0,
    flexGrow: 1,
    flexDirection: 'column',
    gap: 8,
    padding: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-variant=inset])'), {
      marginBlock: 8,
      borderRadius: 'var(--radius)',
      backgroundColor: 'var(--background)',
    }),
  ),
  header: Style.make({
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    gap: 8,
    padding: 8,
  }),
  footer: Style.make({
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    gap: 8,
    padding: 8,
    marginBlockStart: 'auto',
  }),
  content: Style.make({
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    gap: 8,
    padding: 8,
    minHeight: 0,
    flexGrow: 1,
    overflow: 'auto',
  }),
  group: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 4,
  }),
  groupLabel: Style.make({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    paddingInline: 8,
    paddingBlock: 4,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--sidebar-foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-icon-only])'), {
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
      clipPath: 'inset(50%)',
      whiteSpace: 'nowrap',
    }),
  ),
  menu: Style.make({
    display: 'grid',
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    gap: 2,
  }),
  menuItem: Style.make({
    position: 'relative',
    minWidth: 0,
  }),
  menuButton: Style.make({
    display: 'flex',
    height: 'auto',
    minHeight: 32,
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingInline: 8,
    paddingBlock: 4,
    textAlign: 'start',
    fontSize: '0.875rem',
    color: 'inherit',
    textDecoration: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--sidebar-accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--sidebar-ring)',
      outlineOffset: 2,
    }),
    Style.when(When.pseudo(':is([data-active])'), {
      backgroundColor: 'var(--sidebar-accent)',
      fontWeight: 500,
    }),
    Style.when(When.pseudo(':is([data-variant=outline])'), {
      boxShadow: 'inset 0 0 0 1px var(--sidebar-border)',
    }),
    Style.when(When.pseudo(':is([data-variant=primary])'), {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    }),
    Style.when(When.pseudo(':is([data-size=sm])'), {
      minHeight: 28,
    }),
    Style.when(When.pseudo(':is([data-size=lg])'), {
      minHeight: 40,
    }),
    Style.when(When.pseudo(':is([data-icon-only])'), {
      justifyContent: 'center',
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      opacity: 0.5,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  menuText: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }).pipe(
    Style.when(When.pseudo(':is([data-icon-only])'), {
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
      clipPath: 'inset(50%)',
      whiteSpace: 'nowrap',
    }),
  ),
  menuIcon: Style.make({
    display: 'inline-grid',
    width: 16,
    height: 16,
    flexShrink: 0,
    placeItems: 'center',
  }),
  menuBadge: Style.make({
    marginInlineStart: 'auto',
    flexShrink: 0,
    paddingInline: 4,
    fontSize: '0.75rem',
    fontVariantNumeric: 'tabular-nums',
  }).pipe(
    Style.when(When.pseudo(':is([data-icon-only])'), {
      display: 'none',
    }),
  ),
  menuAction: Style.make({
    display: 'inline-grid',
    height: 28,
    width: 28,
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'inherit',
    backgroundColor: 'transparent',
    borderWidth: 0,
  }).pipe(
    Style.when(When.pseudo(':is([data-icon-only])'), {
      display: 'none',
    }),
    Style.when(When.hover, {
      backgroundColor: 'var(--sidebar-accent)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--sidebar-ring)',
      outlineOffset: 2,
    }),
  ),
  menuSub: Style.make({
    display: 'grid',
    minWidth: 0,
    margin: 0,
    marginInlineStart: 12,
    padding: 0,
    paddingInlineStart: 8,
    listStyle: 'none',
    gap: 2,
    borderInlineStart: '1px solid var(--sidebar-border)',
  }).pipe(
    Style.when(When.pseudo(':is([data-icon-only])'), {
      display: 'none',
    }),
  ),
  separator: Style.make({
    marginBlock: 4,
    height: 1,
    backgroundColor: 'var(--sidebar-border)',
  }),
  input: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--sidebar-border)',
    minWidth: 0,
    height: 32,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    paddingInline: 8,
    fontSize: '0.875rem',
    color: 'var(--foreground)',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-icon-only])'), {
      display: 'none',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--sidebar-ring)',
      outlineOffset: 2,
    }),
  ),
  skeleton: Style.make({
    height: 12,
    borderRadius: 4,
    backgroundColor: 'var(--sidebar-accent)',
  }),
  toggle: Style.make({
    display: 'inline-grid',
    height: 32,
    width: 32,
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--foreground)',
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignSelf: 'flex-start',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  rail: Style.make({
    position: 'absolute',
    insetBlock: 0,
    zIndex: 1,
    width: 8,
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
  }).pipe(
    Style.when(When.pseudo(':is([data-side=left])'), {
      insetInlineEnd: -4,
      cursor: 'w-resize',
    }),
    Style.when(When.pseudo(':is([data-side=right])'), {
      insetInlineStart: -4,
      cursor: 'e-resize',
    }),
    Style.when(When.hover, {
      backgroundColor: 'var(--sidebar-border)',
    }),
  ),
  backdrop: Style.make({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / 50%)',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
  viewport: Style.make({
    display: 'flex',
    position: 'fixed',
    inset: 0,
  }).pipe(
    Style.when(When.pseudo(':is([data-side=right])'), {
      justifyContent: 'flex-end',
    }),
  ),
  drawer: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'flex',
    position: 'relative',
    height: '100%',
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    maxWidth: 'var(--sidebar-mobile-width)',
    flexDirection: 'column',
    gap: 8,
    overflow: 'hidden',
    backgroundColor: 'var(--sidebar)',
    padding: 8,
    color: 'var(--sidebar-foreground)',
    boxShadow: '0 8px 24px rgb(0 0 0 / 16%)',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
  drawerHeader: Style.make({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 8,
  }),
  drawerTitle: Style.make({
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
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

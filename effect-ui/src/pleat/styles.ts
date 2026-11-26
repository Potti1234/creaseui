import { Style, When } from '@pleat/core'
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
  group: Style.make({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    height: 36,
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
    Style.when(When.data('outside'), { color: 'var(--muted-foreground)' }),
    Style.when(When.data('selected'), {
      color: 'var(--primary-foreground)',
      backgroundColor: 'var(--primary)',
    }),
    Style.when(When.hover, { backgroundColor: 'var(--muted)' }),
    Style.when(When.data('disabled'), { opacity: 0.5 }),
  ),
}

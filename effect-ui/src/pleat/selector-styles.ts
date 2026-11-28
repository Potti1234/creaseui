import { Style, When } from '@pleat/core'

export const command = {
  root: Style.make({
    display: 'flex',
    width: '100%',
    minWidth: 0,
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
  }),
  inputGroup: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    gap: 8,
    paddingInline: 12,
    borderBottom: '1px solid var(--border)',
  }),
  input: Style.make({
    fontSize: '0.875rem',
    outline: 'none',
    height: 44,
    width: '100%',
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    paddingBlock: 12,
  }).pipe(
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([aria-disabled=true])'), {
      opacity: 0.5,
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  searchIcon: Style.make({
    flexShrink: 0,
    color: 'var(--muted-foreground)',
    width: 16,
    height: 16,
  }),
  list: Style.make({
    maxHeight: 300,
    overflowX: 'hidden',
    overflowY: 'auto',
    padding: 4,
  }),
  group: Style.make({
    overflow: 'hidden',
    color: 'var(--foreground)',
  }),
  groupHeading: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
    paddingBlock: 6,
    paddingInline: 8,
  }),
  separator: Style.make({
    height: 1,
    marginInline: -4,
    backgroundColor: 'var(--border)',
  }),
  item: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    fontSize: '0.875rem',
    gap: 8,
    borderRadius: 'calc(var(--radius) - 4px)',
    cursor: 'default',
    outline: 'none',
    userSelect: 'none',
    paddingBlock: 6,
    paddingInline: 8,
    position: 'relative',
  }).pipe(
    Style.when(When.pseudo(':is([data-highlighted])'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    }),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  label: Style.make({
    minWidth: 0,
    flexGrow: 1,
  }),
  match: Style.make({
    backgroundColor: 'transparent',
    color: 'inherit',
    fontWeight: 600,
  }),
  shortcut: Style.make({
    marginInlineStart: 'auto',
    flexShrink: 0,
    letterSpacing: '0.08em',
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
  }),
  empty: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    paddingBlock: 24,
    paddingInline: 8,
    textAlign: 'center',
  }),
  more: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    paddingBlock: 8,
    paddingInline: 12,
  }),
  live: Style.make({
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
}

export const multiSelector = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    fontSize: '0.875rem',
    gap: 6,
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
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  }),
  row: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    gap: 2,
  }),
  trigger: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    fontSize: '0.875rem',
    minHeight: 36,
    flexGrow: 1,
    gap: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    paddingInline: 10,
    paddingBlock: 4,
    textAlign: 'start',
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':is([data-variant=ghost])'), {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    }),
    Style.when(When.pseudo(':is([aria-invalid=true])'), {
      borderColor: 'var(--destructive)',
    }),
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 40%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  triggerContent: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexGrow: 1,
    flexWrap: 'wrap',
    gap: 4,
  }),
  text: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
  badge: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontSize: '0.75rem',
    display: 'inline-flex',
    maxWidth: '100%',
    borderRadius: 'calc(var(--radius) - 4px)',
    backgroundColor: 'var(--muted)',
    paddingInline: 6,
    paddingBlock: 2,
  }),
  icon: Style.make({
    flexShrink: 0,
    color: 'var(--muted-foreground)',
  }),
  clear: Style.make({
    display: 'inline-grid',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 4px)',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    justifyContent: 'center',
    placeItems: 'center',
    width: 32,
    height: 32,
    flexShrink: 0,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
  positioner: Style.make({
    margin: 0,
    minWidth: 'var(--anchor-width)',
    maxWidth: 'calc(100vw - 1rem)',
    overflow: 'visible',
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
  }),
  popup: Style.make({
    display: 'grid',
    minWidth: 176,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    borderRadius: 'calc(var(--radius) - 2px)',
    padding: 4,
    marginBlockStart: 4,
    maxHeight: 'var(--available-height)',
    overflow: 'auto',
    boxShadow: '0 4px 12px rgb(0 0 0 / .14)',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
  input: Style.make({
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    minWidth: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border)',
    backgroundColor: 'transparent',
    paddingBlock: 8,
    paddingInline: 8,
    color: 'var(--foreground)',
  }).pipe(
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
    }),
  ),
  list: Style.make({
    display: 'grid',
    minWidth: 0,
    overflowY: 'auto',
    padding: 4,
  }),
  item: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    fontSize: '0.875rem',
    gap: 8,
    borderRadius: 'calc(var(--radius) - 4px)',
    cursor: 'default',
    outline: 'none',
    userSelect: 'none',
    paddingBlock: 6,
    paddingInline: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-highlighted])'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    }),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  check: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'inline-grid',
    placeItems: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
    borderRadius: 'calc(var(--radius) - 4px)',
  }),
  groupLabel: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
    paddingBlock: 6,
    paddingInline: 8,
  }),
  empty: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    paddingBlock: 8,
    paddingInline: 8,
  }).pipe(
    Style.when(When.pseudo(':empty'), {
      display: 'none',
    }),
  ),
  status: Style.make({
    fontSize: '0.75rem',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingBlock: 4,
    paddingInline: 8,
    margin: 0,
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
    Style.when(When.pseudo(':is([data-variant=attached])'), {
      backgroundColor: 'var(--muted)',
    }),
  ),
  overlay: Style.make({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / .5)',
    opacity: 'calc(1 - var(--drawer-swipe-progress, 0))',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      opacity: 0,
    }),
  ),
  viewport: Style.make({
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'flex-end',
  }),
  sheet: Style.make({
    display: 'grid',
    minWidth: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    maxHeight: '80dvh',
    minHeight: 0,
    width: '100%',
    gap: 8,
    overflow: 'auto',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    padding: 16,
    boxShadow: '0 -8px 24px rgb(0 0 0 / .18)',
    outline: 'none',
    translate:
      '0 calc(var(--drawer-swipe-movement-y, 0px) + var(--drawer-snap-point-offset, 0px))',
    transitionProperty: 'translate',
    transitionDuration: '320ms',
  }).pipe(
    Style.when(When.pseudo(':is([data-starting-style],[data-ending-style])'), {
      translate: '0 100%',
    }),
    Style.when(When.pseudo(':is([data-swiping])'), {
      transitionDuration: '0ms',
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transitionDuration: '0ms',
    }),
  ),
  sheetTitle: Style.make({
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
  }),
  done: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 1,
    backgroundColor: 'var(--background)',
    borderRadius: 'calc(var(--radius) - 4px)',
    color: 'var(--foreground)',
    cursor: 'pointer',
    justifyContent: 'center',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    justifySelf: 'end',
    paddingInline: 12,
    paddingBlock: 6,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
}

export const tokenizer = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    fontSize: '0.875rem',
    gap: 6,
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
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  }),
  group: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--input)',
    gap: 4,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    paddingInline: 8,
    paddingBlock: 4,
    outline: 'none',
  }).pipe(
    Style.when(When.pseudo(':focus-within'), {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    }),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([data-invalid])'), {
      borderColor: 'var(--destructive)',
    }),
    Style.when(When.pseudo(':is([data-size=sm])'), {
      minHeight: 32,
    }),
    Style.when(When.pseudo(':is([data-size=md])'), {
      minHeight: 36,
    }),
    Style.when(When.pseudo(':is([data-size=lg])'), {
      minHeight: 40,
    }),
  ),
  chips: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexGrow: 1,
    flexWrap: 'wrap',
    gap: 4,
  }).pipe(
    Style.when(When.pseudo(':is([data-overflow]:not(:focus-within))'), {
      flexWrap: 'nowrap',
      overflow: 'hidden',
    }),
  ),
  chip: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    fontSize: '0.75rem',
    maxWidth: '100%',
    flexShrink: 0,
    gap: 2,
    borderRadius: 'calc(var(--radius) - 4px)',
    backgroundColor: 'var(--muted)',
    color: 'var(--foreground)',
    paddingInline: 6,
    paddingBlock: 2,
  }),
  chipText: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
  chipRemove: Style.make({
    display: 'inline-grid',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 4px)',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    justifyContent: 'center',
    placeItems: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
  input: Style.make({
    fontSize: '0.875rem',
    outline: 'none',
    minWidth: 48,
    flexGrow: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    paddingBlock: 2,
  }),
  icon: Style.make({
    flexShrink: 0,
    color: 'var(--muted-foreground)',
  }),
  clear: Style.make({
    display: 'inline-grid',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 4px)',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    justifyContent: 'center',
    placeItems: 'center',
    width: 24,
    height: 24,
    flexShrink: 0,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
  resultCount: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    flexShrink: 0,
  }),
  positioner: Style.make({
    margin: 0,
    minWidth: 'var(--anchor-width)',
    maxWidth: 'calc(100vw - 1rem)',
    overflow: 'visible',
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
  }),
  popup: Style.make({
    display: 'grid',
    minWidth: 176,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    borderRadius: 'calc(var(--radius) - 2px)',
    padding: 4,
    marginBlockStart: 4,
    maxHeight: 'var(--available-height)',
    overflow: 'auto',
    boxShadow: '0 4px 12px rgb(0 0 0 / .14)',
  }).pipe(
    Style.when(When.pseudo(':is([data-ending-style])'), {
      visibility: 'hidden',
    }),
  ),
  list: Style.make({
    display: 'grid',
    minWidth: 0,
    overflowY: 'auto',
  }),
  item: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    fontSize: '0.875rem',
    gap: 8,
    borderRadius: 'calc(var(--radius) - 4px)',
    cursor: 'default',
    outline: 'none',
    userSelect: 'none',
    paddingBlock: 6,
    paddingInline: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-highlighted])'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    }),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
  ),
  empty: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    paddingBlock: 8,
    paddingInline: 8,
  }).pipe(
    Style.when(When.pseudo(':empty'), {
      display: 'none',
    }),
  ),
  status: Style.make({
    fontSize: '0.75rem',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingBlock: 4,
    paddingInline: 8,
    margin: 0,
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
    Style.when(When.pseudo(':is([data-variant=attached])'), {
      backgroundColor: 'var(--muted)',
    }),
  ),
}

export const listInput = {
  root: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 8,
    containerType: 'inline-size',
    containerName: 'list-input',
  }),
  label: Style.make({
    fontSize: '0.875rem',
    fontWeight: 500,
  }),
  hidden: Style.make({
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
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  }),
  headers: Style.make({
    display: 'grid',
    minWidth: 0,
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    gridTemplateColumns: 'var(--list-input-columns)',
    alignItems: 'center',
    gap: 8,
    fontWeight: 500,
  }).pipe(
    Style.when(When.container('(max-width: 640px)', 'list-input'), {
      display: 'none',
    }),
  ),
  list: Style.make({
    display: 'flex',
    margin: 0,
    listStyleType: 'none',
    padding: 0,
    flexDirection: 'column',
    gap: 8,
  }),
  row: Style.make({
    display: 'grid',
    minWidth: 0,
    gridTemplateColumns: 'var(--list-input-columns)',
    alignItems: 'start',
    gap: 8,
    borderRadius: 'calc(var(--radius) - 2px)',
  }).pipe(
    Style.when(When.pseudo(':is([data-grabbed])'), {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.container('(max-width: 640px)', 'list-input'), {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'var(--border)',
      gridTemplateColumns: 'minmax(0,1fr)',
      padding: 8,
    }),
  ),
  field: Style.make({
    minWidth: 0,
  }),
  fieldLabel: Style.make({
    fontSize: '0.75rem',
    display: 'none',
    marginBlockEnd: 4,
    fontWeight: 500,
  }).pipe(
    Style.when(When.container('(max-width: 640px)', 'list-input'), {
      display: 'block',
    }),
  ),
  actions: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    justifyContent: 'flex-end',
    gap: 4,
  }),
  iconButton: Style.make({
    display: 'inline-grid',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 4px)',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    justifyContent: 'center',
    placeItems: 'center',
    width: 28,
    height: 28,
    flexShrink: 0,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
  add: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 1,
    backgroundColor: 'var(--background)',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--foreground)',
    cursor: 'pointer',
    justifyContent: 'center',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    fontSize: '0.875rem',
    minHeight: 32,
    width: 'fit-content',
    gap: 6,
    paddingBlock: 4,
    paddingInline: 10,
    fontWeight: 500,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
  status: Style.make({
    fontSize: '0.75rem',
    margin: 0,
    gridColumn: '1 / -1',
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
    Style.when(When.pseudo(':is([data-variant=attached])'), {
      backgroundColor: 'var(--muted)',
    }),
  ),
}

export const transferList = {
  root: Style.make({
    display: 'grid',
    width: '100%',
    minWidth: 0,
    fontSize: '0.875rem',
    gap: 8,
    containerType: 'inline-size',
    containerName: 'transfer',
  }),
  hidden: Style.make({
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
  label: Style.make({
    fontWeight: 500,
  }),
  description: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    margin: 0,
  }),
  searchWrap: Style.make({
    position: 'relative',
    minWidth: 0,
  }),
  search: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    fontSize: '0.875rem',
    outline: 'none',
    height: 36,
    width: '100%',
    minWidth: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    paddingInline: 32,
  }).pipe(
    Style.when(When.focusVisible, {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 40%, transparent)',
    }),
    Style.when(When.disabled, {
      opacity: 0.5,
    }),
  ),
  searchIcon: Style.make({
    pointerEvents: 'none',
    position: 'absolute',
    insetInlineStart: 10,
    top: '50%',
    translate: '0 -50%',
    color: 'var(--muted-foreground)',
  }),
  clearSearch: Style.make({
    position: 'absolute',
    insetInlineEnd: 4,
    top: '50%',
    translate: '0 -50%',
    display: 'inline-grid',
    width: 28,
    height: 28,
    placeItems: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    outline: 'none',
  }).pipe(
    Style.when(When.hover, { backgroundColor: 'var(--muted)' }),
    Style.when(When.focusVisible, { outline: '2px solid var(--ring)' }),
  ),
  panels: Style.make({
    display: 'grid',
    minWidth: 0,
    gridTemplateColumns: 'minmax(0,1fr)',
    gap: 12,
  }).pipe(
    Style.when(When.container('(min-width: 40rem)', 'transfer'), {
      gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    }),
  ),
  panel: Style.make({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
  }),
  header: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    minHeight: 36,
    justifyContent: 'space-between',
    gap: 8,
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    paddingInline: 12,
    paddingBlock: 6,
  }),
  heading: Style.make({
    fontSize: '0.875rem',
    fontWeight: 500,
    margin: 0,
  }),
  bulk: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 4px)',
    color: 'var(--primary)',
    cursor: 'pointer',
    justifyContent: 'center',
    fontSize: '0.75rem',
    paddingInline: 6,
    paddingBlock: 4,
    fontWeight: 500,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
  list: Style.make({
    display: 'flex',
    margin: 0,
    minHeight: 96,
    maxHeight: 288,
    listStyleType: 'none',
    padding: 4,
    flexDirection: 'column',
    overflowY: 'auto',
  }),
  groupLabel: Style.make({
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
    paddingBlock: 6,
    paddingInline: 8,
  }),
  row: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    gap: 8,
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingBlock: 6,
    paddingInline: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-drop=before])'), {
      boxShadow: 'inset 0 2px var(--ring)',
    }),
    Style.when(When.pseudo(':is([data-drop=after])'), {
      boxShadow: 'inset 0 -2px var(--ring)',
    }),
    Style.when(When.pseudo(':is([data-grabbed])'), {
      backgroundColor: 'var(--accent)',
    }),
  ),
  option: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flexGrow: 1,
  }),
  action: Style.make({
    display: 'inline-grid',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 4px)',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    justifyContent: 'center',
    placeItems: 'center',
    width: 28,
    height: 28,
    flexShrink: 0,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
  empty: Style.make({
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    paddingInline: 12,
    paddingBlock: 16,
    margin: 0,
  }),
}

export const treeList = {
  shell: Style.make({
    display: 'grid',
    minWidth: 0,
    gap: 8,
  }),
  header: Style.make({
    fontSize: '0.875rem',
    fontWeight: 500,
  }),
  root: Style.make({
    margin: 0,
    minWidth: 0,
    listStyleType: 'none',
    padding: 0,
  }),
  item: Style.make({
    position: 'relative',
    outline: 'none',
  }).pipe(
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
  ),
  row: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    fontSize: '0.875rem',
    position: 'relative',
    gap: 6,
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingInline: 6,
    color: 'var(--foreground)',
  }).pipe(
    Style.when(When.pseudo(':is([data-density=compact])'), {
      minHeight: 28,
    }),
    Style.when(When.pseudo(':is([data-density=balanced])'), {
      minHeight: 36,
    }),
    Style.when(When.pseudo(':is([data-density=spacious])'), {
      minHeight: 44,
    }),
    Style.when(When.pseudo(':is([data-disabled])'), {
      opacity: 0.5,
    }),
    Style.when(When.pseudo(':is([data-selected])'), {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.pseudo(':is([data-drop=inside])'), {
      boxShadow: 'inset 0 0 0 1px var(--ring)',
    }),
    Style.when(When.pseudo(':is([data-drop=before])'), {
      boxShadow: 'inset 0 2px var(--ring)',
    }),
    Style.when(When.pseudo(':is([data-drop=after])'), {
      boxShadow: 'inset 0 -2px var(--ring)',
    }),
    Style.when(When.pseudo(':is([data-grabbed])'), {
      backgroundColor: 'var(--accent)',
    }),
  ),
  children: Style.make({
    margin: 0,
    marginInlineStart: 12,
    listStyleType: 'none',
    padding: 0,
    paddingInlineStart: 8,
  }).pipe(
    Style.when(When.pseudo(':is([data-guides])'), {
      borderInlineStart: '1px solid var(--border)',
    }),
  ),
  expand: Style.make({
    display: 'inline-grid',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 4px)',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    justifyContent: 'center',
    placeItems: 'center',
    width: 24,
    height: 24,
    flexShrink: 0,
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
  spacer: Style.make({
    width: 24,
    height: 24,
    flexShrink: 0,
  }),
  action: Style.make({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 'calc(var(--radius) - 4px)',
    color: 'inherit',
    cursor: 'pointer',
    justifyContent: 'flex-start',
    flexGrow: 1,
    gap: 6,
    paddingBlock: 4,
    paddingInline: 4,
    textAlign: 'start',
    textDecoration: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--muted)',
    }),
    Style.when(When.focusVisible, {
      outline: '2px solid var(--ring)',
      outlineOffset: 1,
    }),
    Style.when(When.disabled, {
      opacity: 0.4,
    }),
  ),
  content: Style.make({
    display: 'grid',
    minWidth: 0,
    flexGrow: 1,
    textAlign: 'start',
  }),
  title: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
  description: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
  prefix: Style.make({
    display: 'inline-flex',
    flexShrink: 0,
    color: 'var(--muted-foreground)',
  }),
  end: Style.make({
    marginInlineStart: 'auto',
    flexShrink: 0,
  }),
  grip: Style.make({
    display: 'inline-grid',
    placeItems: 'center',
    width: 20,
    height: 20,
    flexShrink: 0,
    cursor: 'grab',
    color: 'var(--muted-foreground)',
  }),
  hidden: Style.make({
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
}

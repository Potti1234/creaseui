import { Style, When } from '@pleat/core'

export const codeBlock = {
  root: Style.make({
    position: 'relative',
    isolation: 'isolate',
    display: 'flex',
    minWidth: 0,
    maxWidth: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderColor: 'var(--border)',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: 'var(--muted)',
    color: 'var(--foreground)',
  }).pipe(
    Style.when(When.data('container', 'section'), {
      borderRadius: 0,
      borderWidth: 0,
      backgroundColor: 'transparent',
    }),
  ),
  header: Style.make({
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'var(--muted)',
    paddingInline: 16,
    paddingBlock: 8,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
    color: 'var(--muted-foreground)',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border)',
    borderBottomWidth: 0,
  }).pipe(
    Style.when(When.data('numbered'), {
      borderBottomWidth: 1,
    }),
  ),
  title: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 500,
  }),
  controls: Style.make({
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: 8,
  }),
  control: Style.make({
    display: 'inline-flex',
    minHeight: 24,
    alignItems: 'center',
    gap: 4,
    borderRadius: 'calc(var(--radius) - 4px)',
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingInline: 4,
    fontWeight: 500,
    color: 'var(--muted-foreground)',
    outlineStyle: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
    }),
    Style.when(When.focusVisible, {
      boxShadow: '0 0 0 2px var(--ring)',
    }),
    Style.when(When.data('overlay'), {
      position: 'absolute',
      insetInlineEnd: 8,
      top: 8,
    }),
  ),
  disclosure: Style.make({
    display: 'inline-flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
    borderRadius: 'calc(var(--radius) - 4px)',
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    textAlign: 'start',
    padding: 0,
  }).pipe(
    Style.when(When.focusVisible, {
      boxShadow: '0 0 0 2px var(--ring)',
    }),
  ),
  region: Style.make({
    display: 'grid',
    gridTemplateRows: '1fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: '300ms',
  }).pipe(
    Style.when(When.data('collapsed'), {
      gridTemplateRows: '0fr',
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transitionDuration: '0ms',
    }),
  ),
  clip: Style.make({
    minHeight: 0,
    overflow: 'hidden',
  }),
  viewport: Style.make({
    margin: 0,
    minWidth: 0,
    overflow: 'auto',
    paddingInline: 16,
    paddingBlock: 12,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.875rem',
    tabSize: 2,
  }).pipe(
    Style.when(When.focusVisible, {
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineColor: 'var(--ring)',
    }),
    Style.when(When.data('size', 'sm'), {
      fontSize: '0.75rem',
    }),
    Style.when(When.data('overlay'), {
      paddingInlineEnd: 40,
    }),
  ),
  line: Style.make({
    display: 'flex',
    minWidth: 0,
    gap: 12,
    lineHeight: 1.4286,
  }).pipe(
    Style.when(When.data('highlighted'), {
      marginInline: -16,
      backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
      paddingInline: 16,
    }),
  ),
  number: Style.make({
    flexShrink: 0,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'var(--border)',
    paddingInlineEnd: 12,
    textAlign: 'end',
    color: 'var(--muted-foreground)',
    userSelect: 'none',
  }),
  body: Style.make({
    minWidth: 0,
    whiteSpace: 'pre',
  }).pipe(
    Style.when(When.data('wrapped'), {
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap',
    }),
  ),
  footer: Style.make({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'var(--border)',
    paddingInline: 12,
    paddingBlock: 6,
    fontSize: '0.75rem',
  }),
  feedback: Style.make({
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

export const markdown = {
  root: Style.make({
    minWidth: 0,
    width: '100%',
    overflowWrap: 'break-word',
    color: 'var(--foreground)',
  }),
  block: Style.make({
    minWidth: 0,
  }),
  heading: Style.make({
    margin: 0,
  }),
  paragraph: Style.make({
    margin: 0,
    minWidth: 0,
    overflowWrap: 'break-word',
  }),
  strong: Style.make({
    fontWeight: 600,
  }),
  deleted: Style.make({
    color: 'var(--muted-foreground)',
    textDecorationLine: 'line-through',
  }),
  inlineCode: Style.make({
    borderRadius: 'calc(var(--radius) - 4px)',
    backgroundColor: 'var(--muted)',
    paddingInline: 4,
    paddingBlock: 2,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.9em',
    color: 'var(--foreground)',
  }),
  image: Style.make({
    height: 'auto',
    maxWidth: '100%',
    borderRadius: 'calc(var(--radius) - 2px)',
  }),
  list: Style.make({
    margin: 0,
    paddingInlineStart: 24,
    listStyleType: 'disc',
  }).pipe(
    Style.when(When.data('ordered'), {
      listStyleType: 'decimal',
    }),
  ),
  listItem: Style.make({
    minWidth: 0,
    paddingBlock: 4,
  }),
  task: Style.make({
    display: 'flex',
    listStyleType: 'none',
    alignItems: 'flex-start',
    gap: 8,
  }),
  taskList: Style.make({
    margin: 0,
    listStyleType: 'none',
    padding: 0,
  }),
  taskMarker: Style.make({
    marginTop: 4,
    display: 'inline-flex',
    width: 16,
    height: 16,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderColor: 'var(--input)',
    borderStyle: 'solid',
    borderWidth: 1,
  }).pipe(
    Style.when(When.data('checked'), {
      borderColor: 'var(--primary)',
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    }),
  ),
  quote: Style.make({
    margin: 0,
    borderInlineStartWidth: 2,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'var(--border)',
    paddingInlineStart: 16,
    color: 'var(--muted-foreground)',
  }),
  tableBox: Style.make({
    minWidth: 0,
    overflow: 'auto',
  }),
  table: Style.make({
    width: '100%',
    minWidth: 'max-content',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  }),
  tableRow: Style.make({
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border)',
  }).pipe(
    Style.when(When.pseudo(':last-child'), {
      borderBottomWidth: 0,
    }),
  ),
  tableHeader: Style.make({
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border)',
  }),
  cell: Style.make({
    height: 40,
    paddingInline: 8,
    textAlign: 'start',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  }).pipe(
    Style.when(When.data('heading'), {
      fontWeight: 500,
    }),
  ),
  line: Style.make({
    margin: 0,
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'var(--border)',
  }),
  link: Style.make({
    color: 'var(--primary)',
    textDecorationLine: 'underline',
    textUnderlineOffset: 2,
  }).pipe(
    Style.when(When.focusVisible, {
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineColor: 'var(--ring)',
    }),
  ),
  citation: Style.make({
    marginInlineStart: 2,
    display: 'inline-flex',
    height: 20,
    maxWidth: '15em',
    alignItems: 'center',
    gap: 4,
    borderRadius: 'calc(var(--radius) - 2px)',
    borderColor: 'var(--border)',
    borderStyle: 'solid',
    borderWidth: 1,
    paddingInline: 8,
    verticalAlign: 'super',
    fontSize: '0.75rem',
    lineHeight: 1.25,
    color: 'var(--muted-foreground)',
    textDecorationLine: 'none',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'var(--accent)',
      color: 'var(--foreground)',
    }),
    Style.when(When.focusVisible, {
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineColor: 'var(--ring)',
    }),
    Style.when(When.data('numbered'), {
      minWidth: 20,
      justifyContent: 'center',
      borderRadius: 999,
      borderWidth: 0,
      backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
      paddingInline: 4,
      fontSize: '0.625rem',
      lineHeight: 1.6,
      fontWeight: 600,
    }),
    Style.when(When.all(When.data('numbered'), When.hover), {
      backgroundColor: 'color-mix(in oklab, var(--primary) 20%, transparent)',
    }),
  ),
  citationIcon: Style.make({
    width: 12,
    height: 12,
    flexShrink: 0,
    objectFit: 'contain',
  }),
  citationLabel: Style.make({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
}

export const overflowList = {
  root: Style.make({
    position: 'relative',
    display: 'flex',
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }).pipe(
    Style.when(When.data('multiline'), {
      flexWrap: 'wrap',
      alignContent: 'flex-start',
    }),
  ),
  item: Style.make({
    display: 'inline-flex',
    width: 'max-content',
    flex: 'none',
  }),
  indicator: Style.make({
    display: 'inline-flex',
    width: 'max-content',
    flex: 'none',
  }),
  hidden: Style.make({
    position: 'absolute',
    insetInlineStart: 0,
    top: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
  }),
}

export const lightbox = {
  root: Style.make({
    backgroundColor: 'transparent',
    padding: 0,
  }),
  backdrop: Style.make({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / 50%)',
    backdropFilter: 'blur(2px)',
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: '200ms',
  }).pipe(
    Style.when(When.pseudo(':is([data-starting-style],[data-ending-style])'), {
      opacity: 0,
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transitionDuration: '0ms',
    }),
  ),
  viewport: Style.make({
    pointerEvents: 'none',
    position: 'fixed',
    inset: 0,
  }),
  popup: Style.make({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    outlineStyle: 'none',
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: '200ms',
  }).pipe(
    Style.when(When.pseudo(':is([data-starting-style],[data-ending-style])'), {
      opacity: 0,
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transitionDuration: '0ms',
    }),
  ),
  title: Style.make({
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
    pointerEvents: 'auto',
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    maxHeight: '100%',
    maxWidth: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 12,
  }),
  frame: Style.make({
    position: 'relative',
    display: 'flex',
    maxHeight: '100%',
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    outlineStyle: 'none',
  }).pipe(
    Style.when(When.data('zoomable'), {
      cursor: 'zoom-in',
      touchAction: 'none',
      userSelect: 'none',
    }),
    Style.when(When.data('zoomed'), {
      cursor: 'grab',
    }),
    Style.when(When.data('panning'), {
      cursor: 'grabbing',
    }),
    Style.when(When.focusVisible, {
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineOffset: 2,
      outlineColor: '#fff',
    }),
  ),
  image: Style.make({
    pointerEvents: 'none',
    maxHeight: 'calc(100dvh - 6rem)',
    maxWidth: '100%',
    flexShrink: 0,
    objectFit: 'contain',
    userSelect: 'none',
    transitionProperty: 'transform',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-out',
  }).pipe(
    Style.when(When.data('panning'), {
      transitionDuration: '0ms',
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transitionDuration: '0ms',
    }),
  ),
  video: Style.make({
    maxHeight: 'calc(100dvh - 6rem)',
    maxWidth: '100%',
  }),
  caption: Style.make({
    width: '100%',
    maxWidth: 600,
    paddingInline: 12,
    paddingTop: 8,
    fontSize: '1rem',
    lineHeight: 1.5,
    color: '#fff',
    margin: 0,
  }),
  counter: Style.make({
    position: 'absolute',
    insetInlineStart: 12,
    top: 12,
    zIndex: 10,
    fontSize: '0.875rem',
    lineHeight: 1.4286,
    color: '#fff',
  }),
  control: Style.make({
    pointerEvents: 'auto',
    position: 'absolute',
    zIndex: 10,
    display: 'inline-flex',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 0,
    backgroundColor: 'rgb(0 0 0 / 40%)',
    color: '#fff',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
  }).pipe(
    Style.when(When.hover, {
      backgroundColor: 'rgb(0 0 0 / 60%)',
    }),
    Style.when(When.focusVisible, {
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineOffset: 2,
      outlineColor: '#fff',
    }),
    Style.when(When.disabled, {
      pointerEvents: 'none',
      opacity: 0.4,
    }),
    Style.when(When.media('(prefers-reduced-motion: reduce)'), {
      transitionDuration: '0ms',
    }),
  ),
  previous: Style.make({
    top: '50%',
    transform: 'translateY(-50%)',
    insetInlineStart: 12,
  }),
  next: Style.make({
    top: '50%',
    transform: 'translateY(-50%)',
    insetInlineEnd: 12,
  }),
  close: Style.make({
    insetInlineEnd: 12,
    top: 12,
  }),
}

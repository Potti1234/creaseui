import * as stylex from '@stylexjs/stylex'

export const codeBlock = stylex.create({
  root: {
    position: 'relative',
    isolation: 'isolate',
    display: 'flex',
    minWidth: 0,
    maxWidth: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: {
      default: 'calc(var(--radius) - 2px)',
      ':is([data-container="section"])': 0,
    },
    borderColor: 'var(--border)',
    borderStyle: 'solid',
    borderWidth: {
      default: 1,
      ':is([data-container="section"])': 0,
    },
    backgroundColor: {
      default: 'var(--muted)',
      ':is([data-container="section"])': 'transparent',
    },
    color: 'var(--foreground)',
  },
  header: {
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
    borderBottomWidth: {
      default: 0,
      ':is([data-numbered])': 1,
    },
  },
  title: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 500,
  },
  controls: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: 8,
  },
  control: {
    display: 'inline-flex',
    minHeight: 24,
    alignItems: 'center',
    gap: 4,
    borderRadius: 'calc(var(--radius) - 4px)',
    borderWidth: 0,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--accent)',
    },
    paddingInline: 4,
    fontWeight: 500,
    color: 'var(--muted-foreground)',
    outlineStyle: 'none',
    boxShadow: {
      default: null,
      ':focus-visible': '0 0 0 2px var(--ring)',
    },
    position: {
      default: null,
      ':is([data-overlay])': 'absolute',
    },
    insetInlineEnd: {
      default: null,
      ':is([data-overlay])': 8,
    },
    top: {
      default: null,
      ':is([data-overlay])': 8,
    },
  },
  disclosure: {
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
    boxShadow: {
      default: null,
      ':focus-visible': '0 0 0 2px var(--ring)',
    },
  },
  region: {
    display: 'grid',
    gridTemplateRows: {
      default: '1fr',
      ':is([data-collapsed])': '0fr',
    },
    transitionProperty: 'grid-template-rows',
    transitionDuration: {
      default: '300ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
  clip: {
    minHeight: 0,
    overflow: 'hidden',
  },
  viewport: {
    margin: 0,
    minWidth: 0,
    overflow: 'auto',
    paddingInline: 16,
    paddingBlock: 12,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: {
      default: '0.875rem',
      ':is([data-size="sm"])': '0.75rem',
    },
    tabSize: 2,
    outlineWidth: {
      default: null,
      ':focus-visible': 2,
    },
    outlineStyle: {
      default: null,
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: null,
      ':focus-visible': 'var(--ring)',
    },
    paddingInlineEnd: {
      default: null,
      ':is([data-overlay])': 40,
    },
  },
  line: {
    display: 'flex',
    minWidth: 0,
    gap: 12,
    lineHeight: 1.4286,
    marginInline: {
      default: null,
      ':is([data-highlighted])': -16,
    },
    backgroundColor: {
      default: null,
      ':is([data-highlighted])':
        'color-mix(in oklab, var(--primary) 10%, transparent)',
    },
    paddingInline: {
      default: null,
      ':is([data-highlighted])': 16,
    },
  },
  number: {
    flexShrink: 0,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'var(--border)',
    paddingInlineEnd: 12,
    textAlign: 'end',
    color: 'var(--muted-foreground)',
    userSelect: 'none',
  },
  body: {
    minWidth: 0,
    whiteSpace: {
      default: 'pre',
      ':is([data-wrapped])': 'pre-wrap',
    },
    wordBreak: {
      default: null,
      ':is([data-wrapped])': 'break-all',
    },
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'var(--border)',
    paddingInline: 12,
    paddingBlock: 6,
    fontSize: '0.75rem',
  },
  feedback: {
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
})

export const markdown = stylex.create({
  root: {
    minWidth: 0,
    width: '100%',
    overflowWrap: 'break-word',
    color: 'var(--foreground)',
  },
  block: {
    minWidth: 0,
  },
  heading: {
    margin: 0,
  },
  paragraph: {
    margin: 0,
    minWidth: 0,
    overflowWrap: 'break-word',
  },
  strong: {
    fontWeight: 600,
  },
  deleted: {
    color: 'var(--muted-foreground)',
    textDecorationLine: 'line-through',
  },
  inlineCode: {
    borderRadius: 'calc(var(--radius) - 4px)',
    backgroundColor: 'var(--muted)',
    paddingInline: 4,
    paddingBlock: 2,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.9em',
    color: 'var(--foreground)',
  },
  image: {
    height: 'auto',
    maxWidth: '100%',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  list: {
    margin: 0,
    paddingInlineStart: 24,
    listStyleType: {
      default: 'disc',
      ':is([data-ordered])': 'decimal',
    },
  },
  listItem: {
    minWidth: 0,
    paddingBlock: 4,
  },
  task: {
    display: 'flex',
    listStyleType: 'none',
    alignItems: 'flex-start',
    gap: 8,
  },
  taskList: {
    margin: 0,
    listStyleType: 'none',
    padding: 0,
  },
  taskMarker: {
    marginTop: 4,
    display: 'inline-flex',
    width: 16,
    height: 16,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderColor: {
      default: 'var(--input)',
      ':is([data-checked])': 'var(--primary)',
    },
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: {
      default: null,
      ':is([data-checked])': 'var(--primary)',
    },
    color: {
      default: null,
      ':is([data-checked])': 'var(--primary-foreground)',
    },
  },
  quote: {
    margin: 0,
    borderInlineStartWidth: 2,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'var(--border)',
    paddingInlineStart: 16,
    color: 'var(--muted-foreground)',
  },
  tableBox: {
    minWidth: 0,
    overflow: 'auto',
  },
  table: {
    width: '100%',
    minWidth: 'max-content',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  tableRow: {
    borderBottomWidth: {
      default: 1,
      ':last-child': 0,
    },
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border)',
  },
  tableHeader: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border)',
  },
  cell: {
    height: 40,
    paddingInline: 8,
    textAlign: 'start',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    fontWeight: {
      default: null,
      ':is([data-heading])': 500,
    },
  },
  line: {
    margin: 0,
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'var(--border)',
  },
  link: {
    color: 'var(--primary)',
    textDecorationLine: 'underline',
    textUnderlineOffset: 2,
    outlineWidth: {
      default: null,
      ':focus-visible': 2,
    },
    outlineStyle: {
      default: null,
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: null,
      ':focus-visible': 'var(--ring)',
    },
  },
  citation: {
    marginInlineStart: 2,
    display: 'inline-flex',
    height: 20,
    maxWidth: '15em',
    alignItems: 'center',
    gap: 4,
    borderRadius: {
      default: 'calc(var(--radius) - 2px)',
      ':is([data-numbered])': 999,
    },
    borderColor: 'var(--border)',
    borderStyle: 'solid',
    borderWidth: {
      default: 1,
      ':is([data-numbered])': 0,
    },
    paddingInline: {
      default: 8,
      ':is([data-numbered])': 4,
    },
    verticalAlign: 'super',
    fontSize: {
      default: '0.75rem',
      ':is([data-numbered])': '0.625rem',
    },
    lineHeight: {
      default: 1.25,
      ':is([data-numbered])': 1.6,
    },
    color: {
      default: 'var(--muted-foreground)',
      ':hover': 'var(--foreground)',
    },
    textDecorationLine: 'none',
    backgroundColor: {
      default: null,
      ':hover': 'var(--accent)',
      ':is([data-numbered])':
        'color-mix(in oklab, var(--primary) 10%, transparent)',
      ':is([data-numbered]):hover':
        'color-mix(in oklab, var(--primary) 20%, transparent)',
    },
    outlineWidth: {
      default: null,
      ':focus-visible': 2,
    },
    outlineStyle: {
      default: null,
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: null,
      ':focus-visible': 'var(--ring)',
    },
    minWidth: {
      default: null,
      ':is([data-numbered])': 20,
    },
    justifyContent: {
      default: null,
      ':is([data-numbered])': 'center',
    },
    fontWeight: {
      default: null,
      ':is([data-numbered])': 600,
    },
  },
  citationIcon: {
    width: 12,
    height: 12,
    flexShrink: 0,
    objectFit: 'contain',
  },
  citationLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})

export const overflowList = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    flexWrap: {
      default: null,
      ':is([data-multiline])': 'wrap',
    },
    alignContent: {
      default: null,
      ':is([data-multiline])': 'flex-start',
    },
  },
  item: {
    display: 'inline-flex',
    width: 'max-content',
    flex: 'none',
  },
  indicator: {
    display: 'inline-flex',
    width: 'max-content',
    flex: 'none',
  },
  hidden: {
    position: 'absolute',
    insetInlineStart: 0,
    top: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
  },
})

export const lightbox = stylex.create({
  root: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / 50%)',
    backdropFilter: 'blur(2px)',
    opacity: {
      default: 1,
      ':is([data-starting-style],[data-ending-style])': 0,
    },
    transitionProperty: 'opacity',
    transitionDuration: {
      default: '200ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
  viewport: {
    pointerEvents: 'none',
    position: 'fixed',
    inset: 0,
  },
  popup: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    outlineStyle: 'none',
    opacity: {
      default: 1,
      ':is([data-starting-style],[data-ending-style])': 0,
    },
    transitionProperty: 'opacity',
    transitionDuration: {
      default: '200ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
  title: {
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
  },
  frame: {
    position: 'relative',
    display: 'flex',
    maxHeight: '100%',
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    cursor: {
      default: null,
      ':is([data-zoomable])': 'zoom-in',
      ':is([data-zoomed])': 'grab',
      ':is([data-panning])': 'grabbing',
    },
    touchAction: {
      default: null,
      ':is([data-zoomable])': 'none',
    },
    userSelect: {
      default: null,
      ':is([data-zoomable])': 'none',
    },
    outlineWidth: {
      default: null,
      ':focus-visible': 2,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': 2,
    },
    outlineColor: {
      default: null,
      ':focus-visible': '#fff',
    },
  },
  image: {
    pointerEvents: 'none',
    maxHeight: 'calc(100dvh - 6rem)',
    maxWidth: '100%',
    flexShrink: 0,
    objectFit: 'contain',
    userSelect: 'none',
    transitionProperty: 'transform',
    transitionDuration: {
      default: '200ms',
      ':is([data-panning])': '0ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
    transitionTimingFunction: 'ease-out',
  },
  video: {
    maxHeight: 'calc(100dvh - 6rem)',
    maxWidth: '100%',
  },
  caption: {
    width: '100%',
    maxWidth: 600,
    paddingInline: 12,
    paddingTop: 8,
    fontSize: '1rem',
    lineHeight: 1.5,
    color: '#fff',
    margin: 0,
  },
  counter: {
    position: 'absolute',
    insetInlineStart: 12,
    top: 12,
    zIndex: 10,
    fontSize: '0.875rem',
    lineHeight: 1.4286,
    color: '#fff',
  },
  control: {
    pointerEvents: {
      default: 'auto',
      ':disabled': 'none',
    },
    position: 'absolute',
    zIndex: 10,
    display: 'inline-flex',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 0,
    backgroundColor: {
      default: 'rgb(0 0 0 / 40%)',
      ':hover': 'rgb(0 0 0 / 60%)',
    },
    color: '#fff',
    transitionProperty: 'background-color',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
    outlineWidth: {
      default: null,
      ':focus-visible': 2,
    },
    outlineStyle: {
      default: null,
      ':focus-visible': 'solid',
    },
    outlineOffset: {
      default: null,
      ':focus-visible': 2,
    },
    outlineColor: {
      default: null,
      ':focus-visible': '#fff',
    },
    opacity: {
      default: null,
      ':disabled': 0.4,
    },
  },
  previous: {
    top: '50%',
    transform: 'translateY(-50%)',
    insetInlineStart: 12,
  },
  next: {
    top: '50%',
    transform: 'translateY(-50%)',
    insetInlineEnd: 12,
  },
  close: {
    insetInlineEnd: 12,
    top: 12,
  },
})

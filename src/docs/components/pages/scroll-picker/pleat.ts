import { Style, When } from '@pleat/core'
import { className } from '@/pleat/style'
import { createPreview } from './shared'

const styles = {
  shell: Style.make({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid var(--border)',
    borderRadius: '1rem',
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
    padding: '1.5rem 2rem',
    boxShadow: '0 1px 3px #0001',
  }),
  caption: Style.make({
    margin: 0,
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.1em',
    color: 'var(--muted-foreground)',
  }),
  time: Style.make({
    margin: 0,
    fontSize: '2.25rem',
    lineHeight: 1,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.025em',
  }),
  wheels: Style.make({ display: 'flex', gap: '1.25rem' }),
  column: Style.make({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  label: Style.make({
    margin: 0,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  }),
  list: Style.make({
    boxSizing: 'border-box',
    height: 180,
    width: 96,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    borderRadius: '0.75rem',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--muted)',
    paddingBlock: 71,
    scrollSnapType: 'y mandatory',
    scrollbarWidth: 'none',
    perspective: 600,
  }),
  option: Style.make({
    display: 'flex',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.25rem',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    outline: 'none',
    scrollSnapAlign: 'center',
    opacity: 'calc(1 - min(1, abs(var(--picker-offset, 0)) * .3))',
    transform: 'rotateX(calc(var(--picker-offset, 0) * -18deg))',
  }),
  hint: Style.make({
    margin: 0,
    maxWidth: '16rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  }),
}

export const scrollPickerPleatPreviewProgram = createPreview({
  shell: className(styles.shell),
  caption: className(styles.caption),
  time: className(styles.time),
  wheels: className(styles.wheels),
  column: className(styles.column),
  label: className(styles.label),
  list: className(
    Style.when(styles.list, When.focusWithin, {
      outline: '2px solid var(--ring)',
      outlineOffset: 2,
    }),
  ),
  option: className(
    Style.when(styles.option, When.aria('selected', 'true'), {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    }),
  ),
  hint: className(styles.hint),
})

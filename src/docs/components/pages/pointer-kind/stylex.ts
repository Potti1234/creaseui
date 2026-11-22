import * as stylex from '@stylexjs/stylex'
import type { ExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  renderPointerKind,
  type Model,
} from '@/docs/components/pages/pointer-kind/shared'

const styles = stylex.create({
  panel: {
    gap: '1rem',
    display: 'grid',
    maxWidth: '24rem',
    width: '100%',
  },
  heading: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
  },
  grid: {
    gap: '0.5rem',
    display: 'grid',
  },
  row: {
    gap: '1rem',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  value: {
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
    backgroundColor: 'var(--muted)',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  policy: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    borderTopColor: 'var(--border)',
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    paddingTop: '1rem',
  },
  note: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
})

export const pointerKindStyleXPreview: ExamplePreviewProvider = (
  index,
  model,
  onMessageJson,
  h,
) =>
  renderPointerKind(
    index,
    model as Model,
    message => onMessageJson(JSON.stringify(message)),
    {
      panel: stylex.props(styles.panel).className ?? '',
      heading: stylex.props(styles.heading).className ?? '',
      grid: stylex.props(styles.grid).className ?? '',
      row: stylex.props(styles.row).className ?? '',
      label: stylex.props(styles.label).className ?? '',
      value: stylex.props(styles.value).className ?? '',
      policy: stylex.props(styles.policy).className ?? '',
      note: stylex.props(styles.note).className ?? '',
    },
    h,
  )

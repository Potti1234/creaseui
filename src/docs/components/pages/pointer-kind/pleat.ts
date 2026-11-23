import { Style } from '@pleat/core'
import { className } from '@/pleat/style'
import type { ExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  renderPointerKind,
  type Model,
} from '@/docs/components/pages/pointer-kind/shared'

const styles = {
  panel: Style.make({
    display: 'grid',
    width: '100%',
    maxWidth: '24rem',
    gap: '1rem',
  }),
  heading: Style.make({
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
  }),
  grid: Style.make({
    display: 'grid',
    gap: '0.5rem',
  }),
  row: Style.make({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  }),
  label: Style.make({
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: 'var(--muted-foreground)',
  }),
  value: Style.make({
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--muted)',
    paddingInline: '0.5rem',
    paddingBlock: '0.25rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontFamily: 'var(--font-mono, monospace)',
  }),
  policy: Style.make({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'var(--border)',
    paddingTop: '1rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
  }),
  note: Style.make({
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: 'var(--muted-foreground)',
  }),
}

export const pointerKindPleatPreview: ExamplePreviewProvider = (
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
      panel: className(styles.panel),
      heading: className(styles.heading),
      grid: className(styles.grid),
      row: className(styles.row),
      label: className(styles.label),
      value: className(styles.value),
      policy: className(styles.policy),
      note: className(styles.note),
    },
    h,
  )

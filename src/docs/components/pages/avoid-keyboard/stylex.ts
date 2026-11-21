import * as stylex from '@stylexjs/stylex'
import type { ExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  renderAvoidKeyboard,
  type Model,
} from '@/docs/components/pages/avoid-keyboard/shared'
import * as Input from '@/stylex/input'

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
  note: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  footer: {
    paddingTop: '1rem',
  },
  padded: {
    paddingBottom: '1rem',
    paddingTop: '1rem',
  },
  bar: {
    padding: '0.75rem',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: 1,
    gap: '0.5rem',
    alignItems: 'center',
    backgroundColor: 'var(--background)',
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: '0.875rem',
    justifyContent: 'space-between',
    lineHeight: '1.25rem',
  },
  status: {
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
})

export const avoidKeyboardStyleXPreview: ExamplePreviewProvider = (
  index,
  model,
  onMessageJson,
  h,
) =>
  renderAvoidKeyboard(
    index,
    model as Model,
    message => onMessageJson(JSON.stringify(message)),
    {
      panel: stylex.props(styles.panel).className ?? '',
      heading: stylex.props(styles.heading).className ?? '',
      note: stylex.props(styles.note).className ?? '',
      footer: stylex.props(styles.footer).className ?? '',
      padded: stylex.props(styles.padded).className ?? '',
      bar: stylex.props(styles.bar).className ?? '',
      status: stylex.props(styles.status).className ?? '',
    },
    Input.input,
    h,
  )

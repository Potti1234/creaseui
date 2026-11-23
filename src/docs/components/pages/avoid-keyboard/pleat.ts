import { Style } from '@pleat/core'
import { className } from '@/pleat/style'
import type { ExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  renderAvoidKeyboard,
  type Model,
} from '@/docs/components/pages/avoid-keyboard/shared'
import * as Input from '@/pleat/input'

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
  note: Style.make({
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: 'var(--muted-foreground)',
  }),
  footer: Style.make({
    paddingTop: '1rem',
  }),
  padded: Style.make({
    paddingTop: '1rem',
    paddingBottom: '1rem',
  }),
  bar: Style.make({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    borderRadius: 'var(--radius)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    padding: '0.75rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  }),
  status: Style.make({
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--font-mono, monospace)',
  }),
}

export const avoidKeyboardPleatPreview: ExamplePreviewProvider = (
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
      panel: className(styles.panel),
      heading: className(styles.heading),
      note: className(styles.note),
      footer: className(styles.footer),
      padded: className(styles.padded),
      bar: className(styles.bar),
      status: className(styles.status),
    },
    Input.input,
    h,
  )

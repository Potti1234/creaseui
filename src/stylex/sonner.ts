import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { Activated, Dismissed, Paused, Resumed, type Entry, type Message, type Model, type Variant } from '@/lib/toast'
import type { ComponentLayoutStyle } from './contracts'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { className } from './style'
import { tokens } from './tokens.stylex'

export * from '@/lib/toast'

const styles = stylex.create({
  action: { borderColor: tokens.border, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, paddingInline: '0.75rem', alignItems: 'center', backgroundColor: { default: tokens.transparent, ':hover': tokens.secondary }, display: 'inline-flex', flexShrink: 0, fontSize: '0.875rem', fontWeight: 500, justifyContent: 'center', height: '2rem', },
  body: { gap: '0.25rem', display: 'grid', flexGrow: 1, },
  description: { color: tokens.mutedForeground, fontSize: '0.875rem' },
  dismiss: { padding: '0.25rem', borderColor: tokens.transparent, borderRadius: tokens.controlRadius, backgroundColor: tokens.transparent, color: { default: tokens.mutedForeground, ':hover': tokens.foreground }, opacity: { default: 0.7, ':focus': 1 }, position: 'absolute', right: '0.5rem', top: '0.5rem', },
  icon: { flexShrink: 0, height: '1rem', marginTop: '0.125rem', width: '1rem' },
  title: { fontSize: '0.875rem', fontWeight: 600 },
  toast: { padding: '1rem', borderColor: tokens.border, borderRadius: tokens.radius, borderStyle: 'solid', borderWidth: 1, gap: '0.75rem', overflow: 'hidden', alignItems: 'flex-start', backgroundColor: tokens.background, boxShadow: tokens.shadowCard, color: tokens.foreground, display: 'flex', pointerEvents: 'auto', position: 'relative', transitionDuration: { default: interactionTokens.motionFast, '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone }, transitionProperty: 'opacity, transform', paddingRight: '2rem', width: '100%', },
  viewport: { padding: '1rem', gap: '0.5rem', display: 'flex', flexDirection: { default: 'column-reverse', '@media (min-width: 640px)': 'column' }, pointerEvents: 'none', position: 'fixed', zIndex: 100, bottom: 0, maxHeight: '100vh', maxWidth: { default: '100%', '@media (min-width: 640px)': '26.25rem' }, right: 0, width: { default: '100%', '@media (min-width: 640px)': 'auto' }, },
})

const variantIcon = <Msg>(variant: Variant, h: HtmlBuilder<Msg>): Html => {
  const config = { class: className(styles.icon) }
  switch (variant) {
    case 'Success': return Icon.circleCheck<Msg>(config, h)
    case 'Error': return Icon.octagonX<Msg>(config, h)
    case 'Warning': return Icon.triangleAlert<Msg>(config, h)
    case 'Info': return Icon.info<Msg>(config, h)
  }
}

export type SonnerProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  ariaLabel?: string
  pausePolicy?: 'none' | 'pointer'
  layoutStyle?: ComponentLayoutStyle
  entryLayoutStyle?: ComponentLayoutStyle
}>

const entryView = <Msg>(entry: Entry, props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html => h.article([
  h.Key(entry.id), h.Role(entry.variant === 'Error' ? 'alert' : 'status'),
  h.DataAttribute('slot', 'sonner-toast'), h.DataAttribute('variant', entry.variant.toLowerCase()), h.DataAttribute('paused', String(entry.isPaused)),
  ...(props.pausePolicy === 'none' || entry.sticky ? [] : [h.OnMouseEnter(props.toParentMessage(Paused({ id: entry.id }))), h.OnMouseLeave(props.toParentMessage(Resumed({ id: entry.id })))]),
  h.Class(className(styles.toast, props.entryLayoutStyle)),
], [
  variantIcon(entry.variant, h),
  h.div([h.Class(className(styles.body))], [h.div([h.Class(className(styles.title))], [entry.payload.title]), ...(entry.payload.description === undefined ? [] : [h.div([h.Class(className(styles.description))], [entry.payload.description])])]),
  ...(entry.payload.actionLabel === undefined ? [] : [h.button([h.Type('button'), h.OnClick(props.toParentMessage(Activated({ id: entry.id }))), h.Class(className(styles.action))], [entry.payload.actionLabel])]),
  h.button([h.Type('button'), h.AriaLabel('Dismiss notification'), h.OnClick(props.toParentMessage(Dismissed({ id: entry.id }))), h.Class(className(styles.dismiss))], [Icon.x<Msg>({}, h)]),
])

export const sonner = <Msg>(props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html => h.section([
  h.AriaLabel(props.ariaLabel ?? 'Notifications'), h.AriaLive('polite'), h.DataAttribute('slot', 'sonner'), h.Class(className(styles.viewport, props.layoutStyle)),
], props.model.entries.map(entry => entryView(entry, props, h)))

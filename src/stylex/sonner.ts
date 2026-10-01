import * as stylex from '@stylexjs/stylex'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import { Option } from 'effect'

import * as Icon from '@/lib/icon'
import { ActivatedToastAction, type Entry, type Message, type Model, type Position, type Variant, Message as ToastMessages } from '@/lib/toast'
import type { StaticStyles } from '@stylexjs/stylex'

import { buttonVisualStyles } from './button'
import type { ComponentLayoutStyle } from './contracts'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { className } from './style'
import { tokens } from './tokens.stylex'

export * from '@/lib/toast'

const styles = stylex.create({
  action: { paddingInline: '0.75rem', backgroundColor: { default: tokens.transparent, ':hover': tokens.secondary }, flexShrink: 0, },
  body: { gap: '0.25rem', display: 'grid', flexGrow: 1, },
  description: { color: tokens.mutedForeground, fontSize: '0.875rem', lineHeight: '1.25rem' },
  dismiss: { padding: '0.25rem', color: { default: tokens.mutedForeground, ':hover': tokens.foreground }, opacity: { default: 0.7, ':focus': 1 }, position: 'absolute', right: '0.5rem', top: '0.5rem', },
  icon: { flexShrink: 0, height: '1rem', marginTop: '0.125rem', width: '1rem' },
  title: { fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.25rem', },
  toast: { padding: '1rem', borderColor: tokens.border, borderRadius: tokens.radius, borderStyle: 'solid', borderWidth: 1, gap: '0.75rem', overflow: 'hidden', alignItems: 'flex-start', backgroundColor: tokens.background, boxShadow: tokens.shadowCard, color: tokens.foreground, display: 'flex', pointerEvents: 'auto', position: 'relative', transitionDuration: { default: interactionTokens.motionFast, '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone }, transitionProperty: 'opacity, transform', paddingRight: '2rem', width: '100%', },
  viewport: { padding: '1rem', gap: '0.5rem', display: 'flex', flexDirection: 'column', pointerEvents: 'none', position: 'fixed', zIndex: 100, maxHeight: '100vh', maxWidth: { default: '100%', '@media (min-width: 640px)': '26.25rem' }, width: { default: '100%', '@media (min-width: 640px)': 'auto' }, },
  viewportBottom: { flexDirection: { default: 'column-reverse', '@media (min-width: 640px)': 'column' } },
  viewportLeft: { left: 0 },
  viewportCenter: { transform: 'translateX(-50%)', left: '50%', },
  viewportRight: { right: 0 },
  viewportTop: { top: 0 },
  viewportBottomEdge: { bottom: 0 },
  visuallyClosed: { opacity: 0 },
})

const variantIcon = <Msg>(variant: Variant, h: HtmlBuilder<Msg>): Html | undefined => {
  const config = { class: className(styles.icon) }
  switch (variant) {
    case 'Success': return Icon.circleCheck<Msg>(config, h)
    case 'Error': return Icon.octagonX<Msg>(config, h)
    case 'Warning': return Icon.triangleAlert<Msg>(config, h)
    case 'Info': return Icon.info<Msg>(config, h)
    case 'Default': return undefined
  }
}



const POSITION_ORDER: ReadonlyArray<Position> = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

const positionStyle = (position: Position): ReadonlyArray<StaticStyles> => {
  switch (position) {
    case 'top-left': return [styles.viewportLeft, styles.viewportTop]
    case 'top-center': return [styles.viewportCenter, styles.viewportTop]
    case 'top-right': return [styles.viewportRight, styles.viewportTop]
    case 'bottom-left': return [styles.viewportLeft, styles.viewportBottomEdge, styles.viewportBottom]
    case 'bottom-center': return [styles.viewportCenter, styles.viewportBottomEdge, styles.viewportBottom]
    case 'bottom-right': return [styles.viewportRight, styles.viewportBottomEdge, styles.viewportBottom]
  }
}

export type SonnerProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  ariaLabel?: string
  pausePolicy?: 'none' | 'pointer'
  layoutStyle?: ComponentLayoutStyle
  entryLayoutStyle?: ComponentLayoutStyle
  position?: Position
}>

/** Mirrors the upstream Toast view's animation attributes so the entry
 *  participates in the primitive's enter/leave lifecycle. */
const animationAttributes = <Msg>(entry: Entry, h: HtmlBuilder<Msg>): ReadonlyArray<Attribute<Msg>> => {
  switch (entry.animation.transitionState) {
    case 'EnterStart': return [
      h.DataAttribute('closed', ''), h.DataAttribute('enter', ''), h.DataAttribute('transition', ''),
    ]
    case 'EnterAnimating': return [h.DataAttribute('enter', ''), h.DataAttribute('transition', '')]
    case 'LeaveStart': return [h.DataAttribute('leave', ''), h.DataAttribute('transition', '')]
    case 'LeaveAnimating': return [
      h.DataAttribute('closed', ''), h.DataAttribute('leave', ''), h.DataAttribute('transition', ''),
    ]
    default: return []
  }
}

/** `data-closed` phases (enter start, leave end) fade the entry via the
 *  existing opacity/transform transition. */
const isVisuallyClosed = (entry: Entry): boolean =>
  entry.animation.transitionState === 'EnterStart' || entry.animation.transitionState === 'LeaveAnimating'

const entryView = <Msg>(entry: Entry, props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html => h.article([
  h.Key(entry.id), h.Id(entry.id), h.Role(entry.payload.variant === 'Error' ? 'alert' : 'status'),
  h.DataAttribute('slot', 'sonner-toast'), h.DataAttribute('variant', entry.payload.variant.toLowerCase()), h.DataAttribute('paused', String(entry.isHovered)),
  ...(props.pausePolicy === 'none' || Option.isNone(entry.maybeDuration) ? [] : [h.OnMouseEnter(props.toParentMessage(ToastMessages.HoveredEntry({ entryId: entry.id }))), h.OnMouseLeave(props.toParentMessage(ToastMessages.LeftEntry({ entryId: entry.id })))]),
  ...animationAttributes(entry, h),
  h.Class(className(styles.toast, isVisuallyClosed(entry) ? styles.visuallyClosed : undefined, props.entryLayoutStyle)),
], [
  ...(variantIcon(entry.payload.variant, h) === undefined ? [] : [variantIcon(entry.payload.variant, h)!]),
  h.div([h.Class(className(styles.body))], [h.div([h.Class(className(styles.title))], [entry.payload.title]), ...(entry.payload.description === undefined ? [] : [h.div([h.Class(className(styles.description))], [entry.payload.description])])]),
  ...(entry.payload.actionLabel === undefined ? [] : [h.button([h.Type('button'), h.OnClick(props.toParentMessage(ActivatedToastAction({ id: entry.id }))), h.Class(className(...buttonVisualStyles({ variant: 'outline', size: 'sm' }), styles.action))], [entry.payload.actionLabel])]),
  h.button([h.Type('button'), h.AriaLabel('Dismiss notification'), h.OnClick(props.toParentMessage(ToastMessages.Dismissed({ entryId: entry.id }))), h.Class(className(...buttonVisualStyles({ variant: 'ghost', size: 'icon-xs' }), styles.dismiss))], [Icon.x<Msg>({}, h)]),
])

export const sonner = <Msg>(props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  const fallback = props.position ?? 'bottom-right'
  const entryPosition = (entry: Entry): Position => entry.payload.position ?? fallback
  const positions = POSITION_ORDER.filter(position =>
    props.model.entries.some(entry => entryPosition(entry) === position))
  return h.div([h.DataAttribute('slot', 'sonner-root')],
    (positions.length === 0 ? [fallback] : positions).map(position =>
      h.section([
        h.AriaLabel(props.ariaLabel ?? 'Notifications'), h.AriaLive('polite'),
        h.DataAttribute('slot', 'sonner'), h.DataAttribute('position', position),
        h.Class(className(styles.viewport, ...positionStyle(position), props.layoutStyle)),
      ], props.model.entries
        .filter(entry => entryPosition(entry) === position)
        .map(entry => entryView(entry, props, h)))))
}

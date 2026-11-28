import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error'
export type AlertAnnouncement = 'static' | 'status' | 'alert'
type Classes = Partial<
  Record<'root' | 'icon' | 'title' | 'description', string>
>

export type AlertProps<Msg, R = never> = {
  readonly title?: View.Input<Msg, R>
  readonly description?: View.Input<Msg, R>
  readonly icon?: View.Input<Msg, R>
  readonly children?: View.Children<Msg, R>
  readonly variant?: 'default' | 'destructive'
  readonly severity?: AlertSeverity
  readonly announcement: AlertAnnouncement
  readonly className?: string
}

export const AlertBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    severity,
    variant,
    announcement,
    title,
    description,
    icon,
    children,
    className,
  }: AlertProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  h.div
    .class(styles.root, className)
    .attrs({
      'data-slot': 'alert',
      'data-severity':
        severity ?? (variant === 'destructive' ? 'error' : 'info'),
      'data-icon': icon === undefined ? undefined : '',
      role: announcement === 'static' ? undefined : announcement,
      'aria-live':
        announcement === 'alert'
          ? 'assertive'
          : announcement === 'status'
            ? 'polite'
            : undefined,
    })
    .children(
      icon === undefined
        ? undefined
        : h.div
            .class(styles.icon)
            .attrs({ 'data-slot': 'alert-icon', 'aria-hidden': 'true' })
            .children(icon),
      title === undefined
        ? undefined
        : h.div
            .class(styles.title)
            .attr('data-slot', 'alert-title')
            .children(title),
      description === undefined
        ? undefined
        : h.div
            .class(styles.description)
            .attr('data-slot', 'alert-description')
            .children(description),
      children,
    )

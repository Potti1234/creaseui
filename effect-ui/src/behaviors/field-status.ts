import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import { IconBehavior, type IconName } from './icon'

export type FieldStatusType = 'warning' | 'error' | 'success'
export type FieldStatusVariant = 'attached' | 'detached'
type Classes = Partial<Record<'root' | 'icon', string>>

export type FieldStatusProps<Msg, R = never> = {
  readonly type: FieldStatusType
  readonly message: View.Input<Msg, R>
  readonly variant?: FieldStatusVariant
  readonly id?: string
  readonly announcement?: 'static' | 'status' | 'alert'
  readonly className?: string
}

const icons = {
  warning: 'triangle-alert',
  error: 'circle-alert',
  success: 'circle-check',
} satisfies Record<FieldStatusType, IconName>

export const FieldStatusBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    type,
    message,
    variant = 'attached',
    id,
    announcement = 'static',
    className,
  }: FieldStatusProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  h.div
    .class(styles.root, className)
    .attrs({
      id,
      'data-slot': 'field-status',
      'data-type': type,
      'data-variant': variant,
      role: announcement === 'static' ? undefined : announcement,
    })
    .children(
      variant === 'detached'
        ? h.span
            .class(styles.icon)
            .attr('data-slot', 'field-status-icon')
            .children(IconBehavior(h, { name: icons[type], size: 'sm' }))
        : undefined,
      h.span.children(message),
    )

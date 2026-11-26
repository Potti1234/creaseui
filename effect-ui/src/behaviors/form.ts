import { Component, Mount, type View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import { Effect } from 'effect'

export { Form as FormBehavior } from '@effect/ui-kit'
export type { FormEvents } from '@effect/ui-kit'

export const formControlIds = (id: string) => ({
  descriptionId: `${id}-description`,
  messageId: `${id}-message`,
  describedBy: `${id}-description ${id}-message`,
})

const FocusSummary = Mount.make(
  'FocusFormErrorSummary',
  { args: {} },
  (node: HTMLDivElement) =>
    Effect.sync(() => {
      node.focus()
      return Component.noop
    }),
)

export type FormError<Msg, R = never> = {
  readonly controlId: string
  readonly message: View.Input<Msg, R>
}

export type ErrorSummaryProps<Msg, R = never> = {
  readonly id: string
  readonly title: View.Input<Msg, R>
  readonly errors: readonly FormError<Msg, R>[]
  readonly focusOnMount?: boolean
  readonly onErrorLink?: (id: string) => Msg
  readonly className?: string
}

type SummaryClasses = {
  readonly root?: string
  readonly title?: string
  readonly list?: string
  readonly link?: string
}

export const ErrorSummaryBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    title,
    errors,
    focusOnMount,
    onErrorLink,
    className,
  }: ErrorSummaryProps<NoInfer<Msg>, R>,
  styles: SummaryClasses = {},
) => {
  if (errors.length === 0) return undefined
  const titleId = `${id}-title`
  const summary = h.div.key(id).class(styles.root, className).attrs({
    id,
    role: 'alert',
    tabindex: '-1',
    'aria-labelledby': titleId,
    'data-slot': 'form-error-summary',
  })
  return (focusOnMount ? summary.onMount(FocusSummary()) : summary).children(
    h.p
      .class(styles.title)
      .attrs({ id: titleId, 'data-slot': 'form-error-summary-title' })
      .children(title),
    h.ul
      .class(styles.list)
      .attr('data-slot', 'form-error-summary-list')
      .children(
        errors.map(({ controlId, message }) => {
          const anchor = h.a.class(styles.link).attrs({
            href: '#' + encodeURIComponent(controlId),
            'data-slot': 'form-error-summary-link',
          })
          return h.li.children(
            (onErrorLink === undefined
              ? anchor
              : anchor.on('click', onErrorLink(controlId))
            ).children(message),
          )
        }),
      ),
  )
}

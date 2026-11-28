import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  ErrorSummaryBehavior,
  FormBehavior,
  type ErrorSummaryProps,
  type FormEvents,
} from '../behaviors/form'

export { formControlIds, type FormError } from '../behaviors/form'

const tailwind = {
  root: 'grid gap-6',
  summary:
    'rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm',
  title: 'font-medium text-foreground',
  list: 'mt-2 list-disc space-y-1 ps-5',
  link: 'text-foreground underline underline-offset-4',
}

export type FormProps<Msg, R = never> = {
  readonly onSubmit?: (event: FormEvents) => Msg | undefined
  readonly key?: string
  readonly validate?: boolean
  readonly className?: string
  readonly element?: Html.Element<
    Msg,
    R,
    Html.EventsOf<'form'>,
    HTMLFormElement,
    'form'
  >
  readonly children?: View.Children<Msg, R>
}

export const Form = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    onSubmit,
    key,
    validate,
    className,
    element = h.form,
    children,
  }: FormProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  const root = element
    .class(styles.root, className, element.elementAttrs.class)
    .attr('data-slot', 'form')
  return onSubmit === undefined
    ? root
        .attr(
          'novalidate',
          validate === undefined
            ? element.elementAttrs.novalidate
            : validate
              ? undefined
              : '',
        )
        .children(children)
    : FormBehavior(h, {
        key,
        props: {},
        onEmit: { Submitted: onSubmit },
        view: form =>
          form
            .root(root)
            .attr('novalidate', validate ? undefined : '')
            .children(children),
      })
}

export const ErrorSummary = <Msg, R = never>(
  h: Html.H<Msg>,
  options: ErrorSummaryProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  ErrorSummaryBehavior(h, options, {
    root: styles.summary,
    title: styles.title,
    list: styles.list,
    link: styles.link,
  })

import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type InputGroupAlignment =
  | 'inline-start'
  | 'inline-end'
  | 'block-start'
  | 'block-end'
type Classes = Partial<
  Record<'root' | 'row' | 'addon' | 'control' | 'text' | 'button', string>
>

type Input<Msg, R> = Html.VoidElement<
  Msg,
  R,
  Html.EventsOf<'input'>,
  HTMLInputElement,
  'input'
>
type Textarea<Msg, R> = Html.Element<
  Msg,
  R,
  Html.EventsOf<'textarea'>,
  HTMLTextAreaElement,
  'textarea'
>
type Button<Msg, R> = Html.Element<
  Msg,
  R,
  Html.EventsOf<'button'>,
  HTMLButtonElement,
  'button'
>

const parts = <Msg>(h: Html.H<Msg>, styles: Classes) => ({
  input: <R = never>(control: Input<NoInfer<Msg>, R>) =>
    control
      .class(styles.control, control.elementAttrs.class)
      .attr('data-slot', 'input-group-control'),
  textarea: <R = never>(control: Textarea<NoInfer<Msg>, R>) =>
    control
      .class(
        `${(styles.control ?? '').replace('h-8', 'min-h-16').replace('px-2.5 py-1', 'px-3 py-2')} field-sizing-content resize-none`,
        control.elementAttrs.class,
      )
      .attr('data-slot', 'input-group-control'),
  button: <R = never>(
    control: Button<NoInfer<Msg>, R>,
    size: 'xs' | 'sm' | 'icon-xs' | 'icon-sm' = 'xs',
  ) =>
    control
      .class(styles.button, control.elementAttrs.class)
      .attrs({ 'data-slot': 'input-group-button', 'data-size': size }),
  text: <R = never>(children: View.Children<NoInfer<Msg>, R>) =>
    h.span
      .class(styles.text)
      .attr('data-slot', 'input-group-text')
      .children(children),
})

export type InputGroupProps<Msg, R = never> = {
  readonly label?: string
  readonly radius?: 'xl' | 'full'
  readonly className?: string
  readonly disabled?: boolean
  readonly invalid?: boolean
  readonly direction?: 'ltr' | 'rtl'
  readonly focusControlId?: string
  readonly addOns?: Partial<Record<InputGroupAlignment, View.Input<Msg, R>>>
  readonly control: (group: ReturnType<typeof parts<Msg>>) => View.Input<Msg, R>
}

export const InputGroupBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    radius,
    className,
    disabled,
    invalid,
    direction,
    focusControlId,
    addOns,
    control,
  }: InputGroupProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const addOn = (align: InputGroupAlignment) => {
    const children = addOns?.[align]
    if (children === undefined) return undefined
    const attrs = { 'data-slot': 'input-group-addon', 'data-align': align }
    const alignment =
      align === 'inline-start'
        ? 'order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]'
        : align === 'inline-end'
          ? 'order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]'
          : align === 'block-start'
            ? 'order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3'
            : 'order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3'
    return focusControlId === undefined
      ? h.div.class(styles.addon, alignment).attrs(attrs).children(children)
      : h.label
          .class(styles.addon, alignment)
          .attrs({ ...attrs, for: focusControlId })
          .children(children)
  }
  return h.div
    .class(styles.root, className)
    .attrs({
      'data-slot': 'input-group',
      role: 'group',
      'aria-label': label,
      dir: direction,
      'data-radius': radius,
      'data-disabled': disabled ? '' : undefined,
      'data-invalid': invalid ? '' : undefined,
    })
    .children(
      control(parts(h, styles)),
      addOn('block-start'),
      addOn('inline-start'),
      addOn('inline-end'),
      addOn('block-end'),
    )
}

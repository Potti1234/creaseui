// @ts-nocheck: snapshot of creaseui-demo chapter-08:src/ui/button.ts
import { type VariantProps, cva } from 'class-variance-authority'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '../lib/utils'
import {
  type ButtonBehaviorProps,
  type ButtonLinkBehaviorProps,
  renderButton,
  renderButtonLink,
} from '../lib/button'

/* Ported from shadcn/ui button.tsx, then narrowed for Crease Tasks
   (design-system/principles.md, D4 and D5). Crease's version has six
   variants and eight sizes. This product has two intents, one height
   (28px), and an icon-only shape that cannot be used without a name.
   `disabled:` variants became `data-[disabled]:` + `aria-disabled:` because
   the foldkit Button primitive signals disabled state via aria-disabled and
   a data-disabled attribute rather than the native disabled attribute. */
export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px data-[disabled]:pointer-events-none data-[disabled]:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      intent: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
      },
      shape: {
        text: 'h-7 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-7 in-data-[slot=button-group]:rounded-md',
      },
    },
    defaultVariants: {
      intent: 'secondary',
      shape: 'text',
    },
  },
)

export type ButtonIntent = 'primary' | 'secondary'

/** A button shows its text, or only an icon. An icon-only button needs an
 *  accessible name, so `ariaLabel` is required for that shape (D5). */
export type ButtonShape =
  | Readonly<{ shape?: 'text' }>
  | Readonly<{ shape: 'icon'; ariaLabel: string }>

export type ButtonProps<Msg> = ButtonBehaviorProps<Msg> &
  ButtonShape &
  Readonly<{
    /** `primary` for the one main action of a region, `secondary` for everything else (D4). */
    intent?: ButtonIntent
    /** For a button that shows or hides something (a disclosure): whether it is shown. */
    ariaExpanded?: boolean
    class?: string
  }>

const dataSize = (shape: 'text' | 'icon'): string =>
  shape === 'icon' ? 'icon' : 'default'

export const button = <Msg>(
  props: ButtonProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const intent = props.intent ?? 'secondary'
  const shape = props.shape ?? 'text'
  return renderButton(
    props,
    [
      h.DataAttribute('intent', intent),
      ...(props.dataSize === undefined
        ? [h.DataAttribute('size', dataSize(shape))]
        : []),
      ...(props.ariaExpanded === undefined
        ? []
        : [h.AriaExpanded(props.ariaExpanded)]),
      h.Class(cn(buttonVariants({ intent, shape }), props.class)),
    ],
    h,
  )
}

export type ButtonLinkProps = ButtonLinkBehaviorProps &
  ButtonShape &
  Readonly<{
    intent?: ButtonIntent
    class?: string
  }>

export const buttonLink = <Msg>(
  props: ButtonLinkProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const intent = props.intent ?? 'secondary'
  const shape = props.shape ?? 'text'
  return renderButtonLink(
    props,
    [
      h.DataAttribute('intent', intent),
      ...(props.dataSize === undefined
        ? [h.DataAttribute('size', dataSize(shape))]
        : []),
      h.Class(cn(buttonVariants({ intent, shape }), props.class)),
    ],
    h,
  )
}

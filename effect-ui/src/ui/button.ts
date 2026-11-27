import type { Html } from '@effect/ui/html'

import {
  ButtonBehavior,
  type ButtonBehaviorProps,
  type ButtonElement,
} from '../behaviors/button'

const base =
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[background-color,color,border-color,box-shadow,translate] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px data-disabled:pointer-events-none data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  outline:
    'border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
  ghost:
    'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
  destructive:
    'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30',
  link: 'text-primary underline-offset-4 hover:underline',
}

const sizes = {
  default:
    'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
  xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
  lg: 'h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
  icon: 'size-9',
  'icon-xs':
    "size-6 rounded-[min(var(--radius-md),8px)] [&_svg:not([class*='size-'])]:size-3",
  'icon-sm': 'size-8 rounded-[min(var(--radius-md),10px)]',
  'icon-lg': 'size-10',
}

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes
type Appearance = {
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
}

export const buttonClasses = ({
  variant = 'default',
  size = 'default',
}: Appearance = {}): string => [base, variants[variant], sizes[size]].join(' ')

export const Button = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    element,
    variant = 'default',
    size = 'default',
    isLoading = false,
    onPress,
    ...props
  }: Appearance &
    ButtonBehaviorProps & {
      readonly element?: ButtonElement<Msg, R>
      readonly isLoading?: boolean
      readonly onPress?: Msg
    } = {},
  classes: (
    appearance: Required<Appearance>,
    disabled: boolean,
  ) => string = buttonClasses,
) =>
  ButtonBehavior(h, {
    element: (element ?? h.button).class(
      classes({ variant, size }, isLoading || props.disabled === true),
    ),
    onPress,
    props: { ...props, disabled: isLoading || props.disabled === true },
  }).attrs({
    'aria-busy': isLoading ? 'true' : undefined,
    'data-slot': 'button',
    'data-size': size,
    'data-state': isLoading ? 'loading' : 'idle',
    'data-variant': variant,
  })

export const ButtonLink = <Msg>(
  h: Html.H<Msg>,
  {
    href,
    variant = 'default',
    size = 'default',
  }: Appearance & { readonly href: string },
  classes: (
    appearance: Required<Appearance>,
    disabled: boolean,
  ) => string = buttonClasses,
) =>
  h.a.class(classes({ variant, size }, false)).attrs({
    href,
    'data-slot': 'button',
    'data-variant': variant,
    'data-size': size,
  })

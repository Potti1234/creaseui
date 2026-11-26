import type { Html } from '@effect/ui/html'

import {
  AvatarGroupBehavior,
  AvatarGroupOverflowBehavior,
  AvatarStatusDotBehavior,
  type AvatarGroupProps,
  type AvatarGroupOverflowProps,
  type AvatarStatusDotProps,
} from '../behaviors/avatar-group'

const tailwind = {
  root: 'inline-flex items-center',
  member:
    'relative inline-flex rounded-(--avatar-group-radius) bg-background shadow-[0_0_0_2px_var(--background)]',
  overflow:
    'inline-flex shrink-0 items-center justify-center border-2 border-background bg-muted px-2 font-medium text-muted-foreground select-none focus-visible:outline-2 focus-visible:outline-ring',
  status:
    'absolute end-0 bottom-0 z-10 grid place-items-center rounded-full border-solid border-background bg-success text-background data-[variant=neutral]:bg-background data-[variant=neutral]:text-muted-foreground data-[variant=error]:bg-destructive',
  glyph:
    'rounded-full data-[variant=neutral]:border data-[variant=error]:bg-current',
}

export const AvatarGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: AvatarGroupProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => AvatarGroupBehavior(h, options, styles)

export const AvatarGroupOverflow = <Msg, R = never>(
  h: Html.H<Msg>,
  options: AvatarGroupOverflowProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => AvatarGroupOverflowBehavior(h, options, styles)

export const AvatarStatusDot = <Msg>(
  h: Html.H<Msg>,
  options: AvatarStatusDotProps,
  styles: typeof tailwind = tailwind,
) => AvatarStatusDotBehavior(h, options, styles)

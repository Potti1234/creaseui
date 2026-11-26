import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { InputOtpBehavior } from '../behaviors/input-otp'

type Options<Msg> = Parameters<typeof InputOtpBehavior<Msg>>[1]

const tailwind = {
  root: 'inline-flex items-center',
  group: 'flex items-center gap-1',
  slot: 'size-9 rounded-md border border-input bg-background text-center text-sm tabular-nums shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive',
}

export const InputOtp = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    ariaLabel = 'One-time password',
    invalid = false,
    className,
    groupClassName,
    slotClassName,
    separator,
    pattern,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly ariaLabel?: string
    readonly invalid?: boolean
    readonly className?: string
    readonly groupClassName?: string
    readonly slotClassName?: string
    readonly pattern?: RegExp
    readonly separator?: (
      index: number,
    ) => View.Content<NoInfer<Msg>, R> | undefined
  },
  styles: typeof tailwind = tailwind,
) =>
  InputOtpBehavior(h, {
    ...options,
    props:
      pattern === undefined
        ? options.props
        : {
            ...options.props,
            pattern: { source: pattern.source, flags: pattern.flags },
          },
    view: otp => {
      const slots = otp
        .root(
          h.div.class(styles.root, className).attrs({
            'data-slot': 'input-otp',
            role: 'group',
            'aria-label': ariaLabel,
          }),
        )
        .children(
          h.div.class(styles.group, groupClassName).children(
            Array.from({ length: otp.length }, (_, index) => [
              index === 0 ? undefined : separator?.(index),
              otp.input({
                index,
                element: h.input
                  .key(String(index))
                  .class(styles.slot, slotClassName)
                  .attrs({
                    'data-slot': 'input-otp-slot',
                    'aria-label': `${ariaLabel}, character ${index + 1} of ${otp.length}`,
                    'aria-invalid': invalid ? 'true' : undefined,
                  }),
              }),
            ]).flat(),
          ),
        )
      return otp.guard === null
        ? slots
        : otp.guard(h.div.style({ display: 'contents' })).children(slots)
    },
  })

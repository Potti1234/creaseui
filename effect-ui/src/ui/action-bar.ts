import { Mount, type View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  ActionBarBehavior,
  ObserveActionBarEscape,
} from '../behaviors/action-bar'
import { IconBehavior } from '../behaviors/icon'

export type ActionBarSide = 'top' | 'bottom'
export type ActionBarAlign = 'start' | 'center' | 'end'

export type ActionBarProps<Msg, R = never> = {
  readonly key?: string
  readonly open: boolean
  readonly label: string
  readonly side?: ActionBarSide
  readonly align?: ActionBarAlign
  readonly alignOffset?: number
  readonly sideOffset?: number
  readonly selection?: View.Input<Msg, R>
  readonly direction?: 'ltr' | 'rtl'
  readonly onClose?: Msg
  readonly closeLabel?: string
  readonly className?: string
  readonly items: readonly {
    readonly value: string
    readonly label: View.Input<Msg, R>
    readonly ariaLabel?: string
    readonly variant?: 'default' | 'destructive'
    readonly separatorBefore?: boolean
    readonly disabled?: boolean
    readonly onSelect?: Msg
  }[]
}
const tailwind = {
  root: 'fixed z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-lg border bg-card px-2 py-1.5 text-sm text-card-foreground shadow-lg outline-none',
  selection:
    'flex items-center gap-1 rounded-sm border px-2 py-1 font-medium tabular-nums',
  group: 'flex flex-wrap items-center gap-2 outline-none',
  item: 'inline-flex min-h-8 items-center rounded-sm border-0 bg-secondary px-2 text-secondary-foreground outline-none hover:bg-accent data-[variant=destructive]:text-destructive focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
  close:
    'inline-grid size-8 place-items-center rounded-sm border-0 bg-transparent text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
  separator: 'h-6 w-px bg-border',
}

export const ActionBar = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    key,
    open,
    label,
    side = 'bottom',
    align = 'center',
    alignOffset = 0,
    sideOffset = 16,
    selection,
    direction,
    onClose,
    closeLabel = 'Close selection actions',
    className,
    items,
  }: ActionBarProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  if (!open) return undefined
  const occupied = new Set(items.map(item => item.value))
  let closeValue = 'close'
  while (occupied.has(closeValue)) closeValue += '-'
  const observer = h.div.attr('data-slot', 'action-bar-host')
  const shell =
    onClose === undefined
      ? observer
      : observer.onMount(Mount.map(ObserveActionBarEscape(), () => onClose))
  return shell.children(
    ActionBarBehavior(h, {
      key: key ?? label,
      props: {
        items: [
          ...items.map(({ value, disabled }) => ({
            value,
            disabled: disabled === true,
            focusableWhenDisabled: false,
          })),
          ...(onClose === undefined ? [] : [{ value: closeValue }]),
        ],
      },
      view: bar =>
        bar
          .root(
            h.div
              .class(styles.root, className)
              .attrs({
                'data-slot': 'action-bar',
                'data-side': side,
                'data-align': align,
                'aria-label': label,
                dir: direction,
              })
              .style({
                [side]: `${sideOffset}px`,
                insetInlineStart:
                  align === 'start' ? `${alignOffset}px` : undefined,
                insetInlineEnd:
                  align === 'end' ? `${alignOffset}px` : undefined,
                left: align === 'center' ? '50%' : undefined,
                translate:
                  align === 'center'
                    ? `calc(-50% + ${alignOffset}px) 0`
                    : undefined,
              }),
          )
          .children(
            selection === undefined
              ? undefined
              : h.div
                  .class(styles.selection)
                  .attr('data-slot', 'action-bar-selection')
                  .children(selection),
            h.div
              .class(styles.group)
              .attrs({ role: 'group', 'data-slot': 'action-bar-group' })
              .children(
                items.map(
                  ({
                    value,
                    label,
                    ariaLabel,
                    variant,
                    separatorBefore,
                    onSelect,
                  }) =>
                    h.div
                      .key(value)
                      .class(styles.group)
                      .children(
                        separatorBefore
                          ? h.div
                              .class(styles.separator)
                              .attrs({
                                'data-slot': 'action-bar-separator',
                                'aria-hidden': 'true',
                              })
                          : undefined,
                        bar
                          .button({
                            value,
                            element: h.button
                              .class(styles.item)
                              .attrs({
                                'data-slot': 'action-bar-item',
                                'data-variant': variant ?? 'default',
                                'aria-label': ariaLabel,
                                type: 'button',
                              })
                              .on('click', () => onSelect),
                          })
                          .children(label),
                      ),
                ),
                onClose === undefined
                  ? undefined
                  : bar
                      .button({
                        value: closeValue,
                        element: h.button
                          .class(styles.close)
                          .attrs({
                            'data-slot': 'action-bar-close',
                            'aria-label': closeLabel,
                            type: 'button',
                          })
                          .on('click', onClose),
                      })
                      .children(IconBehavior(h, { name: 'x', size: 'sm' })),
              ),
          ),
    }),
  )
}

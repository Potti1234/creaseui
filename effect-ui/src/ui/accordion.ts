import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  AccordionBehavior,
  AccordionItemBehavior,
  type AccordionItemProps,
} from '../behaviors/accordion'

type AccordionOptions<Msg> = Parameters<typeof AccordionBehavior<Msg>>[1]

const tailwind = {
  item: 'border-b last:border-b-0',
  header: 'm-0 flex',
  trigger:
    'flex min-h-10 flex-1 items-start justify-between gap-4 rounded-md bg-transparent py-2.5 text-start text-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
  icon: 'mt-0.5 shrink-0 text-muted-foreground transition-transform data-open:rotate-180 motion-reduce:transition-none',
  panel:
    'h-(--accordion-panel-height) text-sm transition-[height] duration-200 data-starting-style:h-0 data-starting-style:overflow-hidden data-ending-style:h-0 data-ending-style:overflow-hidden motion-reduce:transition-none',
  content: 'pb-2.5',
}

export type AccordionContent<Msg, R = never> = AccordionItemProps & {
  readonly trigger: View.Input<Msg, R>
  readonly content: View.Input<Msg, R> | View.Children<Msg, R>
}

export const Accordion = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    items,
    className,
    ...options
  }: Omit<AccordionOptions<Msg>, 'view' | 'fallback'> & {
    readonly items: ReadonlyArray<AccordionContent<NoInfer<Msg>, R>>
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  AccordionBehavior(h, {
    ...options,
    view: accordion =>
      accordion
        .root(h.div.class(className).attr('data-slot', 'accordion'))
        .children(
          ...items.map(({ trigger, content, ...props }) =>
            AccordionItemBehavior(h, {
              key: props.value,
              props,
              view: item =>
                item
                  .root(
                    h.div
                      .class(styles.item)
                      .attr('data-slot', 'accordion-item'),
                  )
                  .children(
                    item.header(h.h3.class(styles.header)).children(
                      item
                        .trigger(
                          h.button
                            .class(styles.trigger)
                            .attr('data-slot', 'accordion-trigger'),
                        )
                        .children(
                          trigger,
                          h
                            .el('svg')
                            .attrs({
                              class: styles.icon,
                              width: '16',
                              height: '16',
                              viewBox: '0 0 24 24',
                              fill: 'none',
                              stroke: 'currentColor',
                              'stroke-width': '2',
                              'aria-hidden': 'true',
                              'data-open': item.open ? '' : undefined,
                            })
                            .children(h.el('path').attr('d', 'm6 9 6 6 6-6')),
                        ),
                    ),
                    item
                      .panel(
                        h.div
                          .class(styles.panel)
                          .attr('data-slot', 'accordion-content'),
                      )
                      ?.children(h.div.class(styles.content).children(content)),
                  ),
            }),
          ),
        ),
  })

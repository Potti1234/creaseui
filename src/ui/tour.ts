/* Ported from Meta Astryx Tour (packages/lab/src/Tour/) — examples and visual spec adapted to Crease UI tokens. */

import { Option } from 'effect'
import * as Mount from 'foldkit/mount'
import type { Anchor } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import * as TourBehavior from '@/lib/tour'
import * as Button from '@/ui/button'
import { cn } from '@/lib/utils'

export const Model = TourBehavior.Model
export type Model = typeof Model.Type
export const Message = TourBehavior.Message
export type Message = typeof Message.Type
export const OutMessage = TourBehavior.OutMessage
export type OutMessage = typeof OutMessage.Type
export const TourDismissSource = TourBehavior.TourDismissSource
export type TourDismissSource = TourBehavior.TourDismissSource

export const init = TourBehavior.init
export const update = TourBehavior.update
export const activate = TourBehavior.activate
export const deactivate = TourBehavior.deactivate

export const HIGHLIGHT_PADDING = 4

const LAYER_CLASS = 'fixed inset-0 z-40'
const HIGHLIGHT_CLASS =
  'absolute transition-[top,left,width,height,border-radius] duration-200 motion-reduce:transition-none'
/* absolute + z-50: portaled under body — Floating UI's absolute strategy only
   supplies left/top, so the callout must carry its own position; and sitting
   outside tour-root's stacking context it needs z-50 above the z-40 scrim. */
const CALLOUT_CLASS =
  'absolute z-50 flex w-fit max-w-[280px] flex-col gap-1 rounded-lg border bg-card p-4 text-card-foreground shadow-md outline-none'
const HEADING_CLASS = 'text-sm font-semibold text-card-foreground'
const BODY_CLASS = 'text-sm text-muted-foreground'
const FOOTER_CLASS = 'mt-2 flex items-center justify-between gap-2'
const STEP_COUNT_CLASS = 'text-xs text-muted-foreground'
const CLOSE_CLASS =
  'absolute top-2 right-2 inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring'

export type TourStepPlacement = 'below' | 'above' | 'start' | 'end'
export type TourStepAlignment = 'start' | 'center' | 'end'

export type TourStepSpec = Readonly<{
  /** Stable step key — the callout is re-keyed per step to re-anchor. */
  id: string
  /** `id` of the element this step points at (astryx targetRef equivalent —
      must be interactive for aria, matching Popover's anchor contract). */
  targetId: string
  heading: string
  content: Html | string
  placement?: TourStepPlacement
  alignment?: TourStepAlignment
}>

export type TourProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  steps: ReadonlyArray<TourStepSpec>
  hasBackdrop?: boolean
  isStepCountShown?: boolean
  class?: string
}>

const placementFor = (
  placement: TourStepPlacement,
  alignment: TourStepAlignment,
): Anchor.Placement => {
  const side =
    placement === 'below'
      ? 'bottom'
      : placement === 'above'
        ? 'top'
        : placement === 'start'
          ? 'left'
          : 'right'
  return (
    alignment === 'center' ? side : `${side}-${alignment}`
  ) as Anchor.Placement
}

/** The anchored step-by-step tour: a fixed highlight ring glued to the
    target's measured rect (+ optional scrim cutout) and a floating callout
    placed against it. */
export const tour = <Msg>(props: TourProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  const model = props.model
  const send = props.toParentMessage
  if (!model.isActive || props.steps.length === 0) return h.empty
  const step = props.steps[model.activeStepIndex]
  if (step === undefined) return h.empty

  const hasBackdrop = props.hasBackdrop ?? false
  const isStepCountShown = props.isStepCountShown ?? false
  const stepCount = props.steps.length
  const isFirst = model.activeStepIndex <= 0
  const isLast = model.activeStepIndex >= stepCount - 1
  const rect = Option.getOrUndefined(model.targetRect)

  const highlight = h.div(
    [
      h.DataAttribute('slot', 'tour-highlight'),
      h.AriaHidden(true),
      h.Class(HIGHLIGHT_CLASS),
      /* Each OnMount gets its own element: foldkit keeps only the LAST OnMount
         on a vnode (hook.insert is overwritten per attribute), so the
         target observer lives here, the anchor on the callout, and the
         outside-press watcher on the tour-root. */
      h.OnMount(
        Mount.mapMessage(
          TourBehavior.ObserveTourTarget({ targetId: step.targetId }),
          message => send(message),
        ),
      ),
      ...(rect === undefined
        ? [h.Style({ opacity: '0' })]
        : [
            h.Style({
              top: `${String(rect.top - HIGHLIGHT_PADDING)}px`,
              left: `${String(rect.left - HIGHLIGHT_PADDING)}px`,
              width: `${String(rect.width + HIGHLIGHT_PADDING * 2)}px`,
              height: `${String(rect.height + HIGHLIGHT_PADDING * 2)}px`,
              borderRadius: rect.borderRadius,
              boxShadow: hasBackdrop
                ? '0 0 0 2px var(--background), 0 0 0 4px var(--primary), 0 0 0 9999px var(--backdrop)'
                : '0 0 0 2px var(--background), 0 0 0 4px var(--primary)',
            }),
          ]),
    ],
    [],
  )

  const callout = h.keyed('div')(
    `tour-step-${step.id}`,
    [
      h.DataAttribute('slot', 'tour-callout'),
      h.DataAttribute('step-index', String(model.activeStepIndex)),
      h.Role('dialog'),
      h.AriaLabel(step.heading),
      h.Attribute('tabindex', '-1'),
      h.Class(cn(CALLOUT_CLASS, props.class)),
      h.OnMount(
        Mount.mapMessage(
          TourBehavior.AnchorTourStep({
            targetId: step.targetId,
            /* portal: false — the callout stays a real child of tour-root.
               Portaling would detach it into #foldkit-portal-root, and the
               per-step re-key would then crash the keyed diff (removeChild
               on a node whose real parent is the portal root). tour-root is
               already `fixed inset-0`, so absolute coords resolve against
               the viewport — the same space the highlight measures in.
               z-50 on CALLOUT_CLASS keeps it above the z-40 scrim. */
            anchor: {
              portal: false,
              placement: placementFor(
                step.placement ?? 'below',
                step.alignment ?? 'start',
              ),
              gap: 8,
            },
          }),
          message => send(message),
        ),
      ),
      h.OnKeyDownPreventDefault(key =>
        key === 'Escape'
          ? Option.some(send(Message.RequestedDismiss({ source: 'close' })))
          : Option.none(),
      ),
    ],
    [
      h.h4(
        [h.DataAttribute('slot', 'tour-heading'), h.Class(HEADING_CLASS)],
        [step.heading],
      ),
      h.div(
        [h.DataAttribute('slot', 'tour-body'), h.Class(BODY_CLASS)],
        [step.content],
      ),
      h.div(
        [h.DataAttribute('slot', 'tour-footer'), h.Class(FOOTER_CLASS)],
        [
          isStepCountShown
            ? h.span(
                [
                  h.DataAttribute('slot', 'tour-step-count'),
                  h.Class(STEP_COUNT_CLASS),
                ],
                [
                  `${String(model.activeStepIndex + 1)} of ${String(stepCount)}`,
                ],
              )
            : h.span([], []),
          h.div(
            [h.Class('flex items-center gap-2')],
            [
              ...(isFirst
                ? []
                : [
                    Button.button(
                      {
                        variant: 'ghost',
                        size: 'sm',
                        onClick: send(Message.RequestedPrevious()),
                        children: ['Back'],
                      },
                      h,
                    ),
                  ]),
              Button.button(
                {
                  variant: 'default',
                  size: 'sm',
                  onClick: send(Message.RequestedNext({ stepCount })),
                  children: [isLast ? 'Done' : 'Next'],
                },
                h,
              ),
            ],
          ),
        ],
      ),
      h.button(
        [
          h.Type('button'),
          h.DataAttribute('slot', 'tour-close'),
          h.AriaLabel('Close tour'),
          h.OnClick(send(Message.RequestedDismiss({ source: 'close' }))),
          h.Class(CLOSE_CLASS),
        ],
        [Icon.x({ class: 'size-4' }, h)],
      ),
    ],
  )

  /* The dismiss surface is a dedicated scrim sibling — not the shared
     tour-root — so clicks on the callout's Next/Back/Close controls do not
     bubble up into a 'backdrop' dismissal (same split as bottom-sheet's
     scrim/panel). The dim itself is painted by the highlight's box-shadow. */
  const scrim = hasBackdrop
    ? [
        h.div(
          [
            h.DataAttribute('slot', 'tour-scrim'),
            h.AriaHidden(true),
            h.Class('absolute inset-0'),
            h.OnClick(send(Message.RequestedDismiss({ source: 'backdrop' }))),
          ],
          [],
        ),
      ]
    : []

  return h.div(
    [
      h.DataAttribute('slot', 'tour-root'),
      h.Class(LAYER_CLASS),
      h.Class(hasBackdrop ? 'pointer-events-auto' : 'pointer-events-none'),
      ...(hasBackdrop
        ? []
        : [
            h.OnMount(
              Mount.mapMessage(
                TourBehavior.ObserveOutsidePress({
                  calloutSlot: 'tour-callout',
                  targetId: step.targetId,
                }),
                message => send(message),
              ),
            ),
          ]),
    ],
    [...scrim, highlight, callout],
  )
}

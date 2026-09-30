/* Ported from Meta Astryx Tour (packages/lab/src/Tour/) — examples and visual spec adapted to Crease UI tokens. */

import * as stylex from '@stylexjs/stylex';
import { Option } from 'effect';
import * as Mount from 'foldkit/mount';
import type { Anchor } from '@foldkit/ui';
import type { Html, HtmlBuilder } from 'foldkit/html';

import * as Icon from '@/lib/icon';
import * as TourBehavior from '@/lib/tour';
import * as Button from '@/stylex/button';
import type { ComponentLayoutStyle } from './contracts';
import { foundationTokens } from './foundations-tokens.stylex';
import { interactionTokens } from './interaction-tokens.stylex.const';
import { themedAnchor } from './overlay-boundary';
import { className } from './style';
import { tokens } from './tokens.stylex';

export const Model = TourBehavior.Model;
export type Model = typeof Model.Type;
export const Message = TourBehavior.Message;
export type Message = typeof Message.Type;
export const OutMessage = TourBehavior.OutMessage;
export type OutMessage = typeof OutMessage.Type;
export const TourDismissSource = TourBehavior.TourDismissSource;
export type TourDismissSource = TourBehavior.TourDismissSource;

export const init = TourBehavior.init;
export const update = TourBehavior.update;
export const activate = TourBehavior.activate;
export const deactivate = TourBehavior.deactivate;

export const HIGHLIGHT_PADDING = 4;

const styles = stylex.create({
  body: {
    color: tokens.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  callout: {
    padding: '1rem',
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusLg,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    backgroundColor: tokens.card,
    boxShadow: tokens.shadowCard,
    boxSizing: 'border-box',
    color: tokens.cardForeground,
    display: 'flex',
    flexDirection: 'column',
    outlineStyle: 'none',
    position: 'absolute',
    maxWidth: '280px',
    width: 'fit-content',
  },
  close: {
    padding: 0,
    borderRadius: foundationTokens.radiusMd,
    borderWidth: 0,
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.mutedHover,
    },
    color: {
      default: tokens.mutedForeground,
      ':hover': tokens.foreground,
    },
    cursor: interactionTokens.cursorAction,
    display: 'inline-flex',
    justifyContent: 'center',
    position: 'absolute',
    height: '1.5rem',
    right: '0.5rem',
    top: '0.5rem',
    width: '1.5rem',
  },
  closeIcon: {
    height: '1rem',
    width: '1rem',
  },
  footer: {
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
  },
  footerButtons: {
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
  },
  heading: {
    marginBlock: 0,
    marginInline: 0,
    color: tokens.cardForeground,
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: '1.25rem',
  },
  highlight: {
    position: 'absolute',
    transitionDuration: {
      default: interactionTokens.motionModerate,
      '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone,
    },
    transitionProperty: 'top, left, width, height, border-radius',
  },
  layer: {
    position: 'fixed',
    zIndex: 40,
    height: '100%',
    left: 0,
    top: 0,
    width: '100%',
  },
  layerInteractive: {
    pointerEvents: 'auto',
  },
  scrim: {
    position: 'absolute',
    height: '100%',
    left: 0,
    top: 0,
    width: '100%',
  },
  layerPassive: {
    pointerEvents: 'none',
  },
  stepCount: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
})

export type TourStepPlacement = 'below' | 'above' | 'start' | 'end';
export type TourStepAlignment = 'start' | 'center' | 'end';

export type TourStepSpec = Readonly<{
  /** Stable step key — the callout is re-keyed per step to re-anchor. */
  id: string;
  /** `id` of the element this step points at (astryx targetRef equivalent —
      must be interactive for aria, matching Popover's anchor contract). */
  targetId: string;
  heading: string;
  content: Html | string;
  placement?: TourStepPlacement;
  alignment?: TourStepAlignment;
}>;

export type TourProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  steps: ReadonlyArray<TourStepSpec>;
  hasBackdrop?: boolean;
  isStepCountShown?: boolean;
  layoutStyle?: ComponentLayoutStyle;
}>;

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
          : 'right';
  return (
    alignment === 'center' ? side : `${side}-${alignment}`
  ) as Anchor.Placement;
};

/* The highlight ring uses a dynamic box-shadow (2px surface ring + 4px
   accent ring + optional 9999px scrim) positioned from the measured rect —
   driven through inline Style because no token expresses the layered ring. */

/** The anchored step-by-step tour: a fixed highlight ring glued to the
    target's measured rect (+ optional scrim cutout) and a floating callout
    placed against it. */
export const tour = <Msg>(
  props: TourProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const model = props.model;
  const send = props.toParentMessage;
  if (!model.isActive || props.steps.length === 0) return h.empty;
  const step = props.steps[model.activeStepIndex];
  if (step === undefined) return h.empty;

  const hasBackdrop = props.hasBackdrop ?? false;
  const isStepCountShown = props.isStepCountShown ?? false;
  const stepCount = props.steps.length;
  const isFirst = model.activeStepIndex <= 0;
  const isLast = model.activeStepIndex >= stepCount - 1;
  const rect = Option.getOrUndefined(model.targetRect);

  const highlight = h.div(
    [
      h.DataAttribute('slot', 'tour-highlight'),
      h.AriaHidden(true),
      h.Class(className(styles.highlight)),
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
  );

  const callout = h.keyed('div')(
    `tour-step-${step.id}`,
    [
      h.DataAttribute('slot', 'tour-callout'),
      h.DataAttribute('step-index', String(model.activeStepIndex)),
      h.Role('dialog'),
      h.AriaLabel(step.heading),
      h.Attribute('tabindex', '-1'),
      h.Class(className(styles.callout, props.layoutStyle)),
      h.OnMount(
        Mount.mapMessage(
          TourBehavior.AnchorTourStep({
            targetId: step.targetId,
            anchor: themedAnchor({
              placement: placementFor(
                step.placement ?? 'below',
                step.alignment ?? 'start',
              ),
              gap: 8,
            }),
          }),
          message => send(message),
        ),
      ),
      h.OnMount(
        Mount.mapMessage(
          TourBehavior.ObserveTourTarget({ targetId: step.targetId }),
          message => send(message),
        ),
      ),
      h.OnKeyDownPreventDefault(key =>
        key === 'Escape'
          ? Option.some(send(Message.RequestedDismiss({ source: 'close' })))
          : Option.none(),
      ),
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
    [
      h.h4(
        [
          h.DataAttribute('slot', 'tour-heading'),
          h.Class(className(styles.heading)),
        ],
        [step.heading],
      ),
      h.div(
        [h.DataAttribute('slot', 'tour-body'), h.Class(className(styles.body))],
        [step.content],
      ),
      h.div(
        [h.DataAttribute('slot', 'tour-footer'), h.Class(className(styles.footer))],
        [
          isStepCountShown
            ? h.span(
                [
                  h.DataAttribute('slot', 'tour-step-count'),
                  h.Class(className(styles.stepCount)),
                ],
                [`${String(model.activeStepIndex + 1)} of ${String(stepCount)}`],
              )
            : h.span([], []),
          h.div(
            [h.Class(className(styles.footerButtons))],
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
                  onClick: send(
                    Message.RequestedNext({ stepCount }),
                  ),
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
          h.Class(className(styles.close)),
        ],
        [Icon.x({ class: className(styles.closeIcon) }, h)],
      ),
    ],
  );

  /* The dismiss surface is a dedicated scrim sibling — not the shared
     tour-root — so clicks on the callout's Next/Back/Close controls do not
     bubble up into a 'backdrop' dismissal. The dim itself is painted by
     the highlight's box-shadow. */
  const scrim = hasBackdrop
    ? [
        h.div(
          [
            h.DataAttribute('slot', 'tour-scrim'),
            h.AriaHidden(true),
            h.Class(className(styles.scrim)),
            h.OnClick(send(Message.RequestedDismiss({ source: 'backdrop' }))),
          ],
          [],
        ),
      ]
    : [];

  return h.div(
    [
      h.DataAttribute('slot', 'tour-root'),
      h.Class(
        className(
          styles.layer,
          hasBackdrop ? styles.layerInteractive : styles.layerPassive,
        ),
      ),
    ],
    [...scrim, highlight, callout],
  );
};

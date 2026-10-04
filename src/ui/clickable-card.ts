import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  cardSurfaceClass,
  SR_ONLY_CLASS,
  type CardElevation,
  type CardPadding,
  type CardVariant,
} from '@/lib/card-surface'
import { pressableAttributes } from '@/lib/clickable-card'
import { cn } from '@/lib/utils'

/* Ported from Meta Astryx ClickableCard.tsx — an interactive card that acts as
   a single navigation or action target. Nested interactive elements work
   independently, a visually-hidden control owns the accessible role and label,
   and the hover/pressed overlay, border-inside-padding compensation, and
   two-layer card shadow are adapted to Crease UI tokens. */

export type {
  CardElevation,
  CardPadding,
  CardVariant,
} from '@/lib/card-surface'
export { Message } from '@/lib/clickable-card'

const HOVER_GUARD = '[@media(hover:hover)]:'

export type ClickableCardProps<Msg> = Readonly<{
  /** Accessibility label for the card. Applied to the hidden control that
     owns keyboard focus so the card surface itself stays a plain <div>. */
  label: string
  /** Message emitted when the card surface is clicked (not when nested
     interactive elements are clicked). */
  onClick?: Msg
  /** Navigation URL. Ctrl/Cmd and middle clicks open a new tab. */
  href?: string
  /** Link target for href navigation.
      @default '_self' */
  target?: string
  /** When true the card is inert: no press messages, no navigation. */
  isDisabled?: boolean
  children?: ReadonlyArray<Html | string>
  /** Internal padding on the astryx spacing scale.
      @default 4 (16px) */
  padding?: CardPadding
  /** Background color variant.
      @default 'default' */
  variant?: CardVariant
  /** Resting elevation — the shadow depth the card sits at.
      @default 'none' */
  elevation?: CardElevation
  width?: string
  height?: string
  maxWidth?: string
  minHeight?: string
  class?: string
}>

export const clickableCard = <Msg>(
  props: ClickableCardProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const variant = props.variant ?? 'default'
  const elevation = props.elevation ?? 'none'
  const padding = props.padding ?? 4
  const isDisabled = props.isDisabled === true
  const hasBorder = variant === 'default'
  const isLink = props.href !== undefined
  const onClick = props.onClick

  return h.div(
    [
      h.DataAttribute('slot', 'clickable-card'),
      h.DataAttribute('variant', variant),
      h.DataAttribute('pressable-container', 'true'),
      h.Class(
        cn(
          cardSurfaceClass({
            variant,
            elevation,
            padding,
            withBorder: hasBorder,
          }),
          // Interactive layer
          'text-inherit no-underline',
          isDisabled ? 'cursor-default opacity-50' : 'cursor-pointer',
          // Hover/pressed overlay, guarded for touch devices
          !isDisabled &&
            'after:absolute after:inset-0 after:pointer-events-none after:bg-transparent after:transition-[background-color] after:duration-150 after:ease-out',
          !isDisabled &&
            `${HOVER_GUARD}hover:after:bg-foreground/5 active:after:bg-foreground/10`,
          !isDisabled &&
            hasBorder &&
            `transition-[border-color] duration-150 ease-out ${HOVER_GUARD}hover:border-input`,
          // Keyboard-focus ring routed through the hidden control's
          // :focus-visible (astryx focusOutline.focusWithin)
          'has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring has-[:focus-visible]:outline-offset-3',
          props.class,
        ),
      ),
      ...(isDisabled ? [] : pressableAttributes(h, onClick)),
      ...(props.width === undefined ? [] : [h.Style({ width: props.width })]),
      ...(props.height === undefined
        ? []
        : [h.Style({ height: props.height })]),
      ...(props.maxWidth === undefined
        ? []
        : [h.Style({ maxWidth: props.maxWidth })]),
      ...(props.minHeight === undefined
        ? []
        : [h.Style({ minHeight: props.minHeight })]),
    ],
    [
      isLink
        ? h.a(
            [
              h.Class(SR_ONLY_CLASS),
              h.DataAttribute('pressable-control', 'true'),
              h.Href(props.href ?? ''),
              ...(props.target === undefined ? [] : [h.Target(props.target)]),
              h.AriaLabel(props.label),
              ...(isDisabled ? [h.AriaDisabled(true), h.Tabindex(-1)] : []),
            ],
            [],
          )
        : h.button(
            [
              h.Class(SR_ONLY_CLASS),
              h.DataAttribute('pressable-control', 'true'),
              h.Type('button'),
              h.AriaLabel(props.label),
              ...(isDisabled ? [h.Disabled(true)] : []),
              ...(onClick === undefined || isDisabled
                ? []
                : [h.OnClick(onClick)]),
            ],
            [],
          ),
      ...(props.children ?? []),
    ],
  )
}

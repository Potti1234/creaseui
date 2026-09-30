import * as stylex from "@stylexjs/stylex";
import type { StaticStyles } from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type {
  CardElevation,
  CardPadding,
  CardVariant,
} from "@/lib/card-surface";
import { pressableAttributes } from "@/lib/clickable-card";
import { clickableCardScope } from "./card.markers.stylex";
import type { ComponentLayoutStyle } from "./contracts";
import { interactionTokens } from "./interaction-tokens.stylex.const";
import { className } from "./style";
import { tokens } from "./tokens.stylex";

/* Ported from Meta Astryx ClickableCard.tsx — an interactive card that acts as
   a single navigation or action target. Nested interactive elements work
   independently, a visually-hidden control owns the accessible role and label,
   and the hover/pressed overlay, border-inside-padding compensation, and
   two-layer card shadow are adapted to Crease UI tokens. */

export type {
  CardElevation,
  CardPadding,
  CardVariant,
} from "@/lib/card-surface";
export { Message } from "@/lib/clickable-card";

/* Press/hover tint is painted by the overlay div, a child of the card:
   state arrives through when.ancestor on the component-scoped marker. */
const activeTint = stylex.when.ancestor(":active", clickableCardScope);
const hoverTint = stylex.when.ancestor(":hover", clickableCardScope);

const styles = stylex.create({
  surface: {
    borderRadius: tokens.cardRadius,
    overflow: "clip",
    color: tokens.cardForeground,
    position: "relative",
  },
  interactive: {
    textDecoration: "none",
    color: "inherit",
    cursor: interactionTokens.cursorAction,
  },
  disabled: {
    cursor: interactionTokens.cursorDefault,
    opacity: 0.5,
  },
  overlay: {
    inset: 0,
    backgroundColor: tokens.foreground,
    opacity: {
      [activeTint]: "0.1",
      default: "0",
      [hoverTint]: "0.05",
    },
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: "opacity",
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  bordered: {
    borderColor: {
      default: tokens.border,
      ":hover": tokens.input,
    },
    borderStyle: "solid",
    borderWidth: 1,
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: "border-color",
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  // Keyboard-focus ring routed through the hidden control's :focus-visible
  // (astryx focusOutline.focusWithin: 2px solid accent, offset 3px).
  // PORT-NOTE: astryx rings in accent; Crease has no accent token — 'ring'
  // is the standard focus hue.
  focusRing: {
    outlineColor: {
      default: tokens.transparent,
      ":has(:focus-visible)": tokens.ring,
    },
    outlineOffset: { default: "0px", ":has(:focus-visible)": "3px" },
    outlineStyle: { default: "none", ":has(:focus-visible)": "solid" },
    outlineWidth: { default: "0px", ":has(:focus-visible)": "2px" },
  },
  srOnly: {
    margin: "-1px",
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
});

const variantStyles = stylex.create({
  default: { backgroundColor: tokens.card },
  transparent: { backgroundColor: tokens.transparent },
  muted: { backgroundColor: tokens.muted },
});

/* astryx chromatic card backgrounds are 20% hue tints. Crease UI has no
   tokenized chart tints, so they are applied as inline color-mix values —
   they read the same CSS variables as the Tailwind `bg-chart-N/20` utilities
   in the sibling renderer.
   PORT-NOTE: tokenize chromatic card tints as 'softChart1..5' +
   'mutedForegroundSoft' (15%) + 'softAlertInfo'/'softAlertWarning' tints. */
const variantBackground: Partial<Record<CardVariant, string>> = {
  blue: "color-mix(in oklab, var(--chart-3) 20%, transparent)",
  cyan: "color-mix(in oklab, var(--chart-2) 20%, transparent)",
  gray: "color-mix(in oklab, var(--muted-foreground) 15%, transparent)",
  green: "color-mix(in oklab, var(--chart-2) 20%, transparent)",
  orange: "color-mix(in oklab, var(--chart-5) 20%, transparent)",
  pink: "color-mix(in oklab, var(--chart-1) 20%, transparent)",
  purple: "color-mix(in oklab, var(--chart-3) 20%, transparent)",
  red: "color-mix(in oklab, var(--destructive) 20%, transparent)",
  teal: "color-mix(in oklab, var(--chart-2) 20%, transparent)",
  yellow: "color-mix(in oklab, var(--chart-4) 20%, transparent)",
};

const ELEVATION_SHADOW: Readonly<Record<CardElevation, string>> = {
  none: "0 0 transparent",
  /* astryx --shadow-low/-med/-high values, carried verbatim */
  low: "0 1px 1px rgb(0 0 0 / 0.1), 0 2px 8px rgb(0 0 0 / 0.2)",
  med: "0 1px 2px rgb(0 0 0 / 0.1), 0 2px 12px rgb(0 0 0 / 0.2)",
  high: "0 2px 2px rgb(0 0 0 / 0.1), 0 8px 24px rgb(0 0 0 / 0.2)",
};

const PADDING: Readonly<Record<CardPadding, string>> = {
  0: "0rem",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
};

export type ClickableCardProps<Msg> = Readonly<{
  /** Accessibility label for the card. Applied to the hidden control that
     owns keyboard focus so the card surface itself stays a plain <div>. */
  label: string;
  /** Message emitted when the card surface is clicked (not when nested
     interactive elements are clicked). */
  onClick?: Msg;
  /** Navigation URL. Ctrl/Cmd and middle clicks open a new tab. */
  href?: string;
  /** Link target for href navigation.
      @default '_self' */
  target?: string;
  /** When true the card is inert: no press messages, no navigation. */
  isDisabled?: boolean;
  children?: ReadonlyArray<Html | string>;
  /** Internal padding on the astryx spacing scale.
      @default 4 (16px) */
  padding?: CardPadding;
  /** @default 'default' */
  variant?: CardVariant;
  /** @default 'none' */
  elevation?: CardElevation;
  width?: string;
  height?: string;
  maxWidth?: string;
  minHeight?: string;
  layoutStyle?: ComponentLayoutStyle;
}>;

export const clickableCard = <Msg>(
  props: ClickableCardProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const variant = props.variant ?? "default";
  const elevation = props.elevation ?? "none";
  const padding = props.padding ?? 4;
  const isDisabled = props.isDisabled === true;
  const hasBorder = variant === "default";
  const isLink = props.href !== undefined;
  const onClick = props.onClick;

  // The astryx border sits *inside* the padding — a bordered variant shrinks
  // each padding side by the 1px border so outer geometry matches borderless
  // variants exactly.
  const paddingValue = hasBorder
    ? `calc(${PADDING[padding]} - 1px)`
    : PADDING[padding];

  return h.div(
    [
      h.DataAttribute("slot", "clickable-card"),
      h.DataAttribute("variant", variant),
      h.DataAttribute("pressable-container", "true"),
      h.Class(
        className(
          styles.surface,
          styles.focusRing,
          variant === "default" || variant === "transparent" || variant === "muted"
            ? variantStyles[variant]
            : undefined,
          hasBorder && styles.bordered,
          isDisabled ? styles.disabled : styles.interactive,
          // eslint-disable-next-line no-restricted-syntax -- reason: defineMarker scopes are stylex.props-compatible but absent from the narrow StaticStyles surface.
          clickableCardScope as unknown as StaticStyles,
          props.layoutStyle,
        ),
      ),
      ...(isDisabled ? [] : pressableAttributes(h, onClick)),
      h.Style({
        padding: paddingValue,
        boxShadow: `0 0 transparent, ${ELEVATION_SHADOW[elevation]}`,
        ...(variantBackground[variant] === undefined
          ? {}
          : { backgroundColor: variantBackground[variant] }),
        ...(props.width === undefined ? {} : { width: props.width }),
        ...(props.height === undefined ? {} : { height: props.height }),
        ...(props.maxWidth === undefined ? {} : { maxWidth: props.maxWidth }),
        ...(props.minHeight === undefined
          ? {}
          : { minHeight: props.minHeight }),
      }),
    ],
    [
      isLink
        ? h.a(
            [
              h.Class(className(styles.srOnly)),
              h.DataAttribute("pressable-control", "true"),
              h.Href(props.href ?? ""),
              ...(props.target === undefined ? [] : [h.Target(props.target)]),
              h.AriaLabel(props.label),
              ...(isDisabled ? [h.AriaDisabled(true), h.Tabindex(-1)] : []),
            ],
            [],
          )
        : h.button(
            [
              h.Class(className(styles.srOnly)),
              h.DataAttribute("pressable-control", "true"),
              h.Type("button"),
              h.AriaLabel(props.label),
              ...(isDisabled ? [h.Disabled(true)] : []),
              ...(onClick === undefined || isDisabled
                ? []
                : [h.OnClick(onClick)]),
            ],
            [],
          ),
      ...(props.children ?? []),
      // Press/hover overlay, painted over the card content like astryx's
      // ::after layer. Inert: pointer-events none + aria-hidden.
      ...(isDisabled
        ? []
        : [
            h.div(
              [
                h.DataAttribute("slot", "clickable-card-overlay"),
                h.AriaHidden(true),
                h.Class(className(styles.overlay)),
              ],
              [],
            ),
          ]),
    ],
  );
};

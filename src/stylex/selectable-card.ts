import { Option } from "effect";
import * as stylex from "@stylexjs/stylex";
import type { StaticStyles } from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type {
  CardElevation,
  CardPadding,
  CardVariant,
} from "@/lib/card-surface";
import { pressableAttributes } from "@/lib/clickable-card";
import type { ComponentLayoutStyle } from "./contracts";
import { selectableCardScope } from "./card.markers.stylex";
import { interactionTokens } from "./interaction-tokens.stylex.const";
import { className } from "./style";
import { tokens } from "./tokens.stylex";

/* Ported from Meta Astryx SelectableCard.tsx — a card that toggles between
   selected and unselected states. Selection is parent-owned (isSelected +
   onChange); the selection indicator is an inset ring drawn through the
   card's --_card-ring shadow slot so it composes with resting elevation
   instead of clobbering it. A hidden checkbox owns the accessible role,
   label, and checked state. */

export type {
  CardElevation,
  CardPadding,
  CardVariant,
} from "@/lib/card-surface";
export { Message } from "@/lib/clickable-card";

/* Press/hover tint is painted by the overlay div, a child of the card:
   state arrives through when.ancestor on the component-scoped marker.
   The when.ancestor calls must stay inline inside stylex.create — the
   babel plugin does not compile them when hoisted to top-level consts
   and they throw at module evaluation. */
const styles = stylex.create({
  surface: {
    borderRadius: tokens.cardRadius,
    overflow: "clip",
    color: tokens.cardForeground,
    position: "relative",
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: "box-shadow, border-color, opacity",
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  interactive: {
    color: "inherit",
    cursor: interactionTokens.cursorAction,
  },
  disabled: {
    cursor: interactionTokens.cursorDefault,
    opacity: 0.5,
  },
  overlay: {
    inset: 0,
    borderRadius: "inherit",
    backgroundColor: tokens.foreground,
    opacity: {
      default: "0",
      [stylex.when.ancestor(":hover", selectableCardScope)]: "0.05",
      [stylex.when.ancestor(":active", selectableCardScope)]: "0.1",
    },
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: "opacity",
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  bordered: {
    borderColor: tokens.border,
    borderStyle: "solid",
    borderWidth: 1,
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

/* astryx chromatic card backgrounds are 20% hue tints; the selection ring
   uses the matching solid hue. Crease UI has no tokenized chart tints, so
   they are applied as inline color-mix values — they read the same CSS
   variables as the Tailwind `bg-chart-N/20` utilities in the sibling
   renderer.
   PORT-NOTE: tokenize chromatic card tints as 'softChart1..5' +
   'mutedForegroundSoft' (15%) and chromatic rings as 'chart1'..'chart5'. */
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

const variantRingColor: Readonly<Record<CardVariant, string>> = {
  default: "var(--ring)",
  transparent: "var(--ring)",
  muted: "var(--ring)",
  blue: "var(--chart-3)",
  cyan: "var(--chart-2)",
  gray: "var(--muted-foreground)",
  green: "var(--chart-2)",
  orange: "var(--chart-5)",
  pink: "var(--chart-1)",
  purple: "var(--chart-3)",
  red: "var(--destructive)",
  teal: "var(--chart-2)",
  yellow: "var(--chart-4)",
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

export type SelectableCardProps<Msg> = Readonly<{
  /** Accessibility label for the card, applied to the hidden checkbox. */
  label: string;
  /** Controlled selection state — the parent owns it. */
  isSelected: boolean;
  /** Message emitted when the card requests a toggle. */
  onChange?: Msg;
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

export const selectableCard = <Msg>(
  props: SelectableCardProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const variant = props.variant ?? "default";
  const elevation = props.elevation ?? "none";
  const padding = props.padding ?? 4;
  const isDisabled = props.isDisabled === true;
  const hasBorder = variant === "default";
  const onChange = props.onChange;

  const paddingValue = hasBorder
    ? `calc(${PADDING[padding]} - 1px)`
    : PADDING[padding];

  // The selection ring occupies the first shadow layer — astryx's
  // --_card-ring slot — so it composes with (not over) the resting elevation.
  const ringShadow = props.isSelected
    ? `inset 0 0 0 2px ${variantRingColor[variant]}`
    : "0 0 transparent";

  return h.div(
    [
      h.DataAttribute("slot", "selectable-card"),
      h.DataAttribute("variant", variant),
      h.DataAttribute("selected", props.isSelected ? "true" : "false"),
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
          selectableCardScope as unknown as StaticStyles,
          props.layoutStyle,
        ),
      ),
      ...(isDisabled ? [] : pressableAttributes(h, onChange)),
      h.Style({
        padding: paddingValue,
        boxShadow: `${ringShadow}, ${ELEVATION_SHADOW[elevation]}`,
        ...(props.isSelected && hasBorder
          ? { borderColor: variantRingColor[variant] }
          : {}),
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
      h.input([
        h.Class(className(styles.srOnly)),
        h.DataAttribute("pressable-control", "true"),
        h.Type("checkbox"),
        h.Checked(props.isSelected),
        h.AriaLabel(props.label),
        ...(isDisabled ? [h.Disabled(true)] : []),
        ...(onChange === undefined || isDisabled
          ? []
          : [
              h.OnChange(() => onChange),
              // Space toggles the checkbox natively; astryx adds Enter as an
              // extra toggle key — the mount stream's listeners do not cover
              // keydown, so it is wired here.
              h.OnKeyDownPreventDefault((key) =>
                key === "Enter" ? Option.some(onChange) : Option.none(),
              ),
            ]),
      ]),
      ...(props.children ?? []),
      // Press/hover overlay, painted over the card content like astryx's
      // ::after layer. Inert: pointer-events none + aria-hidden.
      ...(isDisabled
        ? []
        : [
            h.div(
              [
                h.DataAttribute("slot", "selectable-card-overlay"),
                h.AriaHidden(true),
                h.Class(className(styles.overlay)),
              ],
              [],
            ),
          ]),
    ],
  );
};

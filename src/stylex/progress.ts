import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import type { ComponentLayoutStyle } from "./contracts";
import { foundationTokens } from "./foundations-tokens.stylex";
import { className } from "./style";
import { tokens } from "./tokens.stylex";
import { interactionTokens } from './interaction-tokens.stylex.const'

const styles = stylex.create({
  root: {
    borderRadius: foundationTokens.radiusFull,
    overflow: "hidden",
    backgroundColor: foundationTokens.primarySoft,
    position: "relative",
    height: "0.5rem",
    width: "100%",
  },
  indicator: {
    flex: "1",
    backgroundColor: tokens.primary,
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: "transform",
    height: "100%",
    width: "100%",
  },
  indeterminate: {
    animationDuration: interactionTokens.motionLoopMedium,
    animationIterationCount: "infinite",
    animationName: stylex.keyframes({
      "0%": { transform: "translateX(-100%)" },
      "100%": { transform: "translateX(100%)" },
    }),
    animationTimingFunction: interactionTokens.easingStandard,
  },
});
export type ProgressProps = Readonly<{
  value: number | null;
  ariaLabel?: string;
  layoutStyle?: ComponentLayoutStyle;
}>;
export const progress = <Msg>(
  props: ProgressProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const value =
    props.value === null ? null : Math.min(100, Math.max(0, props.value));
  return h.div(
    [
      h.Role("progressbar"),
      h.AriaValuemin(0),
      h.AriaValuemax(100),
      ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]),
      ...(value === null ? [] : [h.AriaValuenow(value)]),
      h.DataAttribute(
        "state",
        value === null ? "indeterminate" : "determinate",
      ),
      h.DataAttribute("slot", "progress"),
      h.Class(className(styles.root, props.layoutStyle)),
    ],
    [
      h.div(
        [
          h.DataAttribute("slot", "progress-indicator"),
          h.Class(
            className(styles.indicator, value === null && styles.indeterminate),
          ),
          h.Style({
            transform:
              value === null
                ? "translateX(-60%)"
                : `translateX(-${100 - value}%)`,
          }),
        ],
        [],
      ),
    ],
  );
};



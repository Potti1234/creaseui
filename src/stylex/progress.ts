import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import type { ComponentLayoutStyle } from "./contracts";
import { foundationTokens } from "./foundations-tokens.stylex";
import { className } from "./style";
import { tokens } from "./tokens.stylex";
import { interactionTokens } from './interaction-tokens.stylex.const'
import { normalizeProgress } from '@/lib/progress'

const indeterminateFrames = stylex.keyframes({ "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } })

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
    transitionDuration: { default: interactionTokens.motionFast, '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone },
    transitionProperty: "transform",
    height: "100%",
    width: "100%",
  },
  indeterminate: {
    animationDuration: interactionTokens.motionLoopMedium,
    animationIterationCount: "infinite",
    animationName: { default: indeterminateFrames, '@media (prefers-reduced-motion: reduce)': 'none' },
    animationTimingFunction: interactionTokens.easingStandard,
  },
});
export type ProgressProps = Readonly<{
  value: number | null;
  max?: number;
  ariaLabel?: string;
  valueText?: string;
  id?: string;
  direction?: 'ltr' | 'rtl';
  layoutStyle?: ComponentLayoutStyle;
}>;
export const progress = <Msg>(
  props: ProgressProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const normalized = normalizeProgress(props.value, props.max);
  return h.div(
    [
      ...(props.id === undefined ? [] : [h.Id(props.id)]),
      ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
      h.Role("progressbar"),
      h.AriaValuemin(0),
      h.AriaValuemax(normalized.max),
      ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]),
      ...(props.valueText === undefined ? [] : [h.AriaValuetext(props.valueText)]),
      ...(normalized.value === null ? [] : [h.AriaValuenow(normalized.value)]),
      h.DataAttribute("state", normalized.state),
      h.DataAttribute("slot", "progress"),
      h.Class(className(styles.root, props.layoutStyle)),
    ],
    [
      h.div(
        [
          h.DataAttribute("slot", "progress-indicator"),
          h.Class(
            className(styles.indicator, normalized.value === null && styles.indeterminate),
          ),
          h.Style({
            transform:
              normalized.percentage === null
                ? "translateX(-60%)"
                : `translateX(${(props.direction === 'rtl' ? 1 : -1) * (100 - normalized.percentage)}%)`,
          }),
        ],
        [],
      ),
    ],
  );
};


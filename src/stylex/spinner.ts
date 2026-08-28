import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import * as Icon from "@/lib/icon";
import type { ComponentLayoutStyle } from "./contracts";
import { className } from "./style";
import { interactionTokens } from './interaction-tokens.stylex.const'

const styles = stylex.create({
  root: {
    animationDuration: interactionTokens.motionLoopFast,
    animationIterationCount: "infinite",
    animationName: stylex.keyframes({ to: { transform: "rotate(360deg)" } }),
    animationTimingFunction: interactionTokens.easingLinear,
    height: "1rem",
    width: "1rem",
  },
});
export type SpinnerProps = Readonly<{
  label?: string;
  layoutStyle?: ComponentLayoutStyle;
}>;
export const spinner = <Msg>(
  props: SpinnerProps = {},
  h: HtmlBuilder<Msg>,
): Html =>
  Icon.loaderCircle(
    {
      class: className(styles.root, props.layoutStyle),
      ariaLabel: props.label ?? "Loading",
    },
    h,
  );



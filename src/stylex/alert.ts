import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import type { ComponentLayoutStyle } from "./contracts";
import { className } from "./style";
import { tokens } from "./tokens.stylex";
import { foundationTokens } from "./foundations-tokens.stylex";

export type AlertVariants = Readonly<{
  variant?: "default" | "destructive" | null;
}>;
type Slot = Readonly<{
  layoutStyle?: ComponentLayoutStyle;
  children: ReadonlyArray<Html | string>;
}>;
const styles = stylex.create({
  root: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusLg,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    alignItems: "start",
    backgroundColor: tokens.card,
    columnGap: "0.75rem",
    display: "grid",
    fontSize: "0.875rem",
    gridTemplateColumns: "0 1fr",
    position: "relative",
    rowGap: "0.125rem",
    width: "100%",
  },
  default: { color: tokens.cardForeground },
  destructive: { color: tokens.destructive },
  title: {
    overflow: "hidden",
    fontWeight: 500,
    gridColumnStart: "2",
    letterSpacing: "-0.025em",
    minHeight: "1rem",
  },
  description: {
    gap: "0.25rem",
    color: tokens.mutedForeground,
    display: "grid",
    fontSize: "0.875rem",
    gridColumnStart: "2",
    justifyItems: "start",
  },
});
export const alertVariants = (options: AlertVariants = {}): string =>
  className(styles.root, styles[options.variant ?? "default"]);
export type AlertProps = Slot &
  Readonly<{ variant?: AlertVariants["variant"] }>;
export const alert = <Msg>(props: AlertProps, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      h.DataAttribute("slot", "alert"),
      h.Role("alert"),
      h.Class(
        className(
          styles.root,
          styles[props.variant ?? "default"],
          props.layoutStyle,
        ),
      ),
    ],
    [...props.children],
  );
export const alertTitle = <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      h.DataAttribute("slot", "alert-title"),
      h.Class(className(styles.title, props.layoutStyle)),
    ],
    [...props.children],
  );
export const alertDescription = <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      h.DataAttribute("slot", "alert-description"),
      h.Class(className(styles.description, props.layoutStyle)),
    ],
    [...props.children],
  );


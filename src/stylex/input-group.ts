import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";
import { Button as ButtonPrimitive } from "@foldkit/ui";
import type { ButtonProps } from "./button";
import type { ComponentLayoutStyle } from "./contracts";
import { foundationTokens } from "./foundations-tokens.stylex";
import { className } from "./style";
import { tokens } from "./tokens.stylex";
import { interactionTokens } from './interaction-tokens.stylex.const'
type SlotProps = Readonly<{
  children: ReadonlyArray<Html | string>;
  layoutStyle?: ComponentLayoutStyle;
  radius?: "xl" | "full";
}>;
type Align = "inline-start" | "inline-end" | "block-start" | "block-end";
type GroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm";
const styles = stylex.create({
  group: {
    borderColor: tokens.input,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    boxShadow: foundationTokens.shadowXs,
    display: "flex",
    flexDirection: {
      default: "row",
      ':has(> [data-align="block-end"])': "column",
      ':has(> [data-align="block-start"])': "column",
    },
    outlineStyle: "none",
    position: "relative",
    height: {
      default: "2rem",
      ':has(> [data-align="block-end"])': "auto",
      ':has(> [data-align="block-start"])': "auto",
      ':has(> textarea)': "auto",
    },
    minWidth: 0,
    width: "100%",
  },
  radiusXl: { borderRadius: foundationTokens.radiusXl },
  radiusFull: { borderRadius: foundationTokens.radiusFull },
  addon: {
    gap: "0.5rem",
    paddingBlock: "0.375rem",
    alignItems: "center",
    color: tokens.mutedForeground,
    cursor: interactionTokens.cursorText,
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    justifyContent: "center",
    userSelect: "none",
  },
  inlineStart: { order: -1, paddingInlineStart: "0.75rem" },
  inlineEnd: { order: 1, paddingInlineEnd: "0.75rem" },
  blockStart: {
    padding: "0.75rem",
    justifyContent: "start",
    order: -1,
    width: "100%",
  },
  blockEnd: {
    padding: "0.75rem",
    justifyContent: "start",
    order: 1,
    width: "100%",
  },
  button: {
    borderColor: foundationTokens.transparent,
    borderRadius: foundationTokens.radiusSm,
    borderStyle: "solid",
    borderWidth: 0,
    gap: "0.25rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: foundationTokens.transparent,
    color: tokens.foreground,
    display: "flex",
    fontSize: "0.875rem",
    height: "1.5rem",
  },
  buttonSm: { paddingInline: "0.625rem", height: "2rem" },
  buttonIcon: { padding: 0, width: "1.5rem" },
  buttonIconSm: { padding: 0, height: "2rem", width: "2rem" },
  text: {
    gap: "0.5rem",
    alignItems: "center",
    color: tokens.mutedForeground,
    display: "flex",
    fontSize: "0.875rem",
  },
  input: {
    borderColor: foundationTokens.transparent,
    borderRadius: "0px",
    borderStyle: "solid",
    borderWidth: 0,
    flex: "1",
    paddingBlock: "0.25rem",
    paddingInline: "0.625rem",
    backgroundColor: foundationTokens.transparent,
    boxShadow: foundationTokens.shadowNone,
    fontFamily: "inherit",
    fontSize: "0.875rem",
    outlineStyle: "none",
    height: "2rem",
    minWidth: 0,
  },
  textarea: {
    fieldSizing: "content",
    borderColor: foundationTokens.transparent,
    borderRadius: "0px",
    borderStyle: "solid",
    borderWidth: 0,
    flex: "1",
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    backgroundColor: foundationTokens.transparent,
    boxShadow: foundationTokens.shadowNone,
    fontFamily: "inherit",
    fontSize: "0.875rem",
    outlineStyle: "none",
    minHeight: "4rem",
    minWidth: 0,
    width: "100%",
  },
  invalid: { color: tokens.destructive },
  disabled: { cursor: interactionTokens.cursorDisabled, opacity: 0.5 },
  mono: { fontFamily: 'monospace' },
});
export const inputGroup = <Msg>(p: SlotProps, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      h.DataAttribute("slot", "input-group"),
      h.Role("group"),
      h.Class(
        className(
          styles.group,
          p.radius === "xl" && styles.radiusXl,
          p.radius === "full" && styles.radiusFull,
          p.layoutStyle,
        ),
      ),
    ],
    [...p.children],
  );
export type InputGroupAddonVariants = Readonly<{ align?: Align | null }>;
export const inputGroupAddonVariants = (
  o: InputGroupAddonVariants = {},
): string =>
  className(
    styles.addon,
    styles[
      (o.align ?? "inline-start").replace(/-([a-z])/g, (_, c: string) =>
        c.toUpperCase(),
      ) as "inlineStart"
    ],
  );
export type InputGroupAddonProps<Msg = never> = SlotProps &
  Readonly<{ align?: Align; focusControlId?: string; onFocus?: Msg }>;
export const inputGroupAddon = <Msg>(
  p: InputGroupAddonProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const align = p.align ?? "inline-start";
  const map = {
    "inline-start": styles.inlineStart,
    "inline-end": styles.inlineEnd,
    "block-start": styles.blockStart,
    "block-end": styles.blockEnd,
  };
  return h.div(
    [
      h.Role("group"),
      h.DataAttribute("slot", "input-group-addon"),
      h.DataAttribute("align", align),
      ...(p.focusControlId === undefined || p.onFocus === undefined
        ? []
        : [h.OnClick(p.onFocus, { focusSelector: `#${p.focusControlId}` })]),
      h.Class(className(styles.addon, map[align], p.layoutStyle)),
    ],
    [...p.children],
  );
};
export type InputGroupButtonVariants = Readonly<{
  size?: GroupButtonSize | null;
}>;
export const inputGroupButtonVariants = (
  o: InputGroupButtonVariants = {},
): string =>
  className(
    styles.button,
    o.size === "sm" && styles.buttonSm,
    o.size === "icon-xs" && styles.buttonIcon,
    o.size === "icon-sm" && styles.buttonIconSm,
  );
export type InputGroupButtonProps<Msg> = Omit<
  ButtonProps<Msg>,
  "size" | "layoutStyle"
> &
  Readonly<{ size?: GroupButtonSize; layoutStyle?: ComponentLayoutStyle }>;
export const inputGroupButton = <Msg>(
  p: InputGroupButtonProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html =>
  ButtonPrimitive.view(
    {
      ...(p.onClick === undefined ? {} : { onClick: p.onClick }),
      isDisabled: p.isDisabled ?? false,
      type: p.type ?? "button",
      toView: ({ button }) =>
        h.button(
          [
            ...button,
            h.DataAttribute("slot", "input-group-button"),
            h.DataAttribute("size", p.size ?? "xs"),
            h.Class(
              className(
                styles.button,
                p.size === "sm" && styles.buttonSm,
                p.size === "icon-xs" && styles.buttonIcon,
                p.size === "icon-sm" && styles.buttonIconSm,
                p.layoutStyle,
              ),
            ),
          ],
          [...p.children],
        ),
    },
    h,
  );
export const inputGroupText = <Msg>(p: SlotProps, h: HtmlBuilder<Msg>): Html =>
  h.span(
    [
      h.DataAttribute("slot", "input-group-text"),
      h.Class(className(styles.text, p.layoutStyle)),
    ],
    [...p.children],
  );
export type InputGroupInputProps<Msg> = Readonly<{
  id: string;
  value: string;
  onInput: (value: string) => Msg;
  placeholder?: string;
  type?: string;
  name?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  ariaLabel?: string;
  layoutStyle?: ComponentLayoutStyle;
}>;
export const inputGroupInput = <Msg>(
  p: InputGroupInputProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.input([
    h.Id(p.id),
    h.Value(p.value),
    h.OnInput(p.onInput),
    h.Type(p.type ?? "text"),
    ...(p.name === undefined ? [] : [h.Name(p.name)]),
    ...(p.placeholder === undefined ? [] : [h.Placeholder(p.placeholder)]),
    ...(p.ariaLabel === undefined ? [] : [h.AriaLabel(p.ariaLabel)]),
    ...(p.isDisabled ? [h.Disabled(true)] : []),
    ...(p.isInvalid ? [h.AriaInvalid(true)] : []),
    h.DataAttribute("slot", "input-group-control"),
    h.Class(
      className(
        styles.input,
        p.isInvalid && styles.invalid,
        p.isDisabled && styles.disabled,
        p.layoutStyle,
      ),
    ),
  ]);
export type InputGroupTextareaProps<Msg> = Readonly<{
  id: string;
  value: string;
  onInput: (value: string) => Msg;
  placeholder?: string;
  name?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  ariaLabel?: string;
  /** Monospace control text — upstream `font-mono` on the textarea example. */
  mono?: boolean;
  layoutStyle?: ComponentLayoutStyle;
}>;
export const inputGroupTextarea = <Msg>(
  p: InputGroupTextareaProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.textarea([
    h.Id(p.id),
    h.Value(p.value),
    h.OnInput(p.onInput),
    ...(p.name === undefined ? [] : [h.Name(p.name)]),
    ...(p.placeholder === undefined ? [] : [h.Placeholder(p.placeholder)]),
    ...(p.ariaLabel === undefined ? [] : [h.AriaLabel(p.ariaLabel)]),
    ...(p.isDisabled ? [h.Disabled(true)] : []),
    ...(p.isInvalid ? [h.AriaInvalid(true)] : []),
    h.DataAttribute("slot", "input-group-control"),
    h.Class(
      className(
        styles.textarea,
        p.isInvalid && styles.invalid,
        p.isDisabled && styles.disabled,
        p.mono === true && styles.mono,
        p.layoutStyle,
      ),
    ),
  ]);


